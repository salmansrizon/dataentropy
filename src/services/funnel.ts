import { supabase } from '@/integrations/supabase/client';

/**
 * Funnel instrumentation — Phase 1 of the careerprep-edtech spec.
 *
 * Without this every later phase is unmeasurable: you cannot tell whether the
 * Journey, the daily challenge or the ebook moved enrolments. The stages are
 * `arrived → engaged → solved → identified → committed → returned → enrolled`.
 *
 * Deliberately forgeable — anyone can POST an event — and therefore **reporting
 * only**. Nothing may ever read `funnel_events` to grant an entitlement, unlock,
 * XP or certificate.
 *
 * Fire-and-forget: a failed analytics write must never break a learner's action,
 * so every call swallows its error.
 */

export type FunnelEvent =
  | 'landing_viewed'
  | 'arrived'
  | 'engaged'
  | 'diagnostic_started'
  | 'diagnostic_completed'
  | 'learning_attempted'
  | 'learning_item_started'
  | 'attempt_submitted'
  | 'learning_item_completed'
  | 'journey_selected'
  | 'review_due'
  | 'review_scheduled'
  | 'review_completed'
  | 'solved'
  | 'identified'
  | 'committed'
  | 'returned'
  | 'enrolled'
  | 'offer_shown'
  | 'offer_clicked'
  | 'checkout_started'
  | 'checkout_submitted'
  | 'payment_verified'
  | 'payment_refunded'
  | 'struggled'
  // Reporting only, like every other event here: whether the Concept Cards move
  // the retry pass rate is the one number that says if they work.
  | 'topic_viewed'
  // Sharing is the cheapest traffic here, so it is worth counting by network.
  | 'shared';

export type Surface =
  | 'lobby'
  | 'library'
  | 'workspace'
  | 'roadmap'
  | 'completion'
  | 'struggle_trigger'
  | 'certificate'
  | 'checkpoint_failure'
  | 'topic';

interface TrackArgs {
  event: FunnelEvent;
  surface?: Surface;
  subjectType?: 'question' | 'roadmap' | 'step' | 'course' | 'webinar' | 'ebook' | 'journey' | 'topic';
  subjectId?: string;
  journeyId?: string;
  metadata?: Record<string, unknown>;
}

const VISITOR_KEY = 'analytics_visitor_id';
const SESSION_KEY = 'careerprep_tab_session';

/** The one durable anonymous id, shared with the analytics service. */
export function visitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

/** Per-visit, so five short visits are distinguishable from one long one. */
function sessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function track({
  event, surface, subjectType, subjectId, journeyId, metadata,
}: TrackArgs): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();
    await (supabase as any).from('funnel_events').insert({
      visitor_id: visitorId(),
      user_id: data.session?.user?.id ?? null,
      session_id: sessionId(),
      event,
      surface: surface ?? null,
      subject_type: subjectType ?? null,
      subject_id: subjectId ?? null,
      journey_id: journeyId ?? null,
      metadata: metadata ?? null,
    });
  } catch {
    // Analytics must never break the thing being measured.
  }
}

/**
 * Fires once per visitor per event, using localStorage as the ledger. For
 * one-way funnel stages — "solved" means *first* solve, and counting it twice
 * would corrupt the conversion rate it exists to measure.
 */
export async function trackOnce(key: string, args: TrackArgs): Promise<void> {
  const k = `funnel_once_${key}`;
  if (localStorage.getItem(k)) return;
  localStorage.setItem(k, '1');
  await track(args);
}

export async function claimVisitorHistory(): Promise<void> {
  try {
    await (supabase as any).rpc('claim_visitor_history', { p_visitor_id: visitorId() });
  } catch {
    // Attribution repair is best-effort and must never block authentication.
  }
}

/**
 * A return is a visit on a later calendar day, not another render or another
 * tab in the same session. This keeps the retention event useful without
 * storing contact details or blocking anonymous learners.
 */
// D1/D7/D28 retention is derived from server-timestamped learning_activity rows.
// A browser-generated `returned` event would be forgeable and is intentionally absent.
