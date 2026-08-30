import { supabase } from '@/integrations/supabase/client';

export type LearningActivityType = 'attempt' | 'topic' | 'lesson' | 'review' | 'assessment';

export async function recordLearningActivity(args: { type: LearningActivityType; subjectId?: string; successful?: boolean; durationSeconds?: number; metadata?: Record<string, unknown> }): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;
    if (!userId) return;
    await (supabase as any).from('learning_activity').insert({
      user_id: userId, activity_type: args.type, subject_id: args.subjectId ?? null,
      successful: args.successful ?? null, duration_seconds: args.durationSeconds ?? null, metadata: args.metadata ?? {},
    });
  } catch {
    // Measurement must never block learning.
  }
}
