import { z } from "zod";

/**
 * courses.sales_page JSONB contract. Shared by the public page and the admin editor.
 * Every section is optional; parseSalesPage() drops invalid sections instead of
 * failing the page, so partial/bad admin data never breaks /course/:id.
 */

const bi = z.union([z.string(), z.object({ en: z.string().optional(), bn: z.string().optional() })]);
// Rendered into href/src: only http(s) or same-site paths (blocks javascript:, data:, etc.).
const url = z.string().trim().regex(/^(https?:\/\/|\/(?!\/))/i, "must start with http(s):// or /");
const list = <T extends z.ZodTypeAny>(item: T) => z.array(item).default([]);

export const salesPageSchema = {
  batch: z.object({
    name: bi.optional(), // e.g. "Batch 14"
    mode: bi.optional(), // e.g. "Live course"
    live_schedule: bi.optional(),
    support_schedule: bi.optional(),
    seats_total: z.number().int().nonnegative().optional(),
    seats_left: z.number().int().nonnegative().optional(),
  }),
  curriculum: z.object({
    summary: bi.optional(), // e.g. "28 modules · 49 live classes"
    phases: list(z.object({
      title: bi,
      weeks: list(z.object({
        label: bi, // "Week 1"
        title: bi,
        goal: bi.optional(),
        live_classes: z.number().int().nonnegative().optional(),
        quizzes: z.number().int().nonnegative().optional(),
        assignments: z.number().int().nonnegative().optional(),
        topics: list(bi),
        projects: list(bi),
      })),
    })),
  }),
  demo_classes: z.object({
    videos: list(z.object({ title: bi, instructor: bi.optional(), video_url: url })),
    live_demo: z.object({
      topic: bi,
      starts_at: z.string().optional(), // ISO datetime
      instructor: bi.optional(),
      booking_url: url.optional(),
    }).optional(),
  }),
  projects: list(z.object({ title: bi, description: bi.optional(), image_url: url.optional(), link: url.optional() })),
  teaching_assistants: list(z.object({ name: z.string().min(1), role: bi.optional(), avatar_url: url.optional(), bio: bi.optional() })),
  features: list(z.object({ title: bi, description: bi.optional(), icon: z.string().optional() })),
  career_support: list(z.object({ title: bi, items: list(bi) })),
  certificate: z.object({ image_url: url.optional(), points: list(bi) }),
  success_stories: list(z.object({ name: z.string().min(1), role: bi.optional(), company: z.string().optional(), avatar_url: url.optional(), quote: bi })),
  payment_faq: list(z.object({ question: bi, answer: bi })),
  community: z.object({ title: bi.optional(), members: z.number().int().nonnegative().optional(), url }),
  contact: z.object({ phone: z.string().optional(), whatsapp: z.string().optional(), hours: bi.optional() }),
  prerequisite_videos: z.object({ title: bi.optional(), videos: list(z.object({ title: bi, video_url: url })), view_all_url: url.optional() }),
};

type Schema = typeof salesPageSchema;
export type SalesPage = { [K in keyof Schema]?: z.infer<Schema[K]> };
export type SalesPageKey = keyof Schema;
export const SALES_PAGE_KEYS = Object.keys(salesPageSchema) as SalesPageKey[];

/** Lenient: keeps each valid section, drops each invalid one. Never throws. */
export function parseSalesPage(raw: unknown): SalesPage {
  const out: SalesPage = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  for (const key of SALES_PAGE_KEYS) {
    const value = (raw as Record<string, unknown>)[key];
    if (value == null) continue;
    const parsed = salesPageSchema[key].safeParse(value);
    if (parsed.success) (out as Record<string, unknown>)[key] = parsed.data;
  }
  return out;
}

/** Strict: for the admin save path. Returns per-section error messages. */
export function validateSalesPage(raw: unknown): { ok: true; value: SalesPage } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: true, value: {} };
  for (const key of SALES_PAGE_KEYS) {
    const value = (raw as Record<string, unknown>)[key];
    if (value == null) continue;
    const parsed = salesPageSchema[key].safeParse(value);
    if (!parsed.success) errors.push(`${key}: ${parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"} ${i.message}`).join("; ")}`);
  }
  return errors.length ? { ok: false, errors } : { ok: true, value: parseSalesPage(raw) };
}

/** Active promo from get_active_course_promo RPC (display only — no price math client-side). */
export interface CoursePromo {
  code: string;
  discount_type: string;
  discount_value: number;
  valid_until: string | null;
}
