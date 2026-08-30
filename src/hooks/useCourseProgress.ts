import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { recordLearningActivity } from '@/services/learningActivity';

export interface LessonProgress { contentId: string; completed: boolean; progressSeconds: number; lastOpenedAt: string }

export function useCourseProgress(courseId?: string, orderedContentIds: string[] = []) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['course-progress', userId, courseId], enabled: !!userId && !!courseId,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('course_lesson_progress')
        .select('content_id, completed, progress_seconds, last_opened_at').eq('user_id', userId).eq('course_id', courseId).order('last_opened_at', { ascending: false });
      if (error) return [] as LessonProgress[];
      return (data ?? []).map((row: any) => ({ contentId: row.content_id, completed: row.completed, progressSeconds: row.progress_seconds, lastOpenedAt: row.last_opened_at }));
    },
  });
  const save = useMutation({
    mutationFn: async ({ contentId, completed, recordCompletion }: { contentId: string; completed: boolean; recordCompletion: boolean }) => {
      if (!userId || !courseId) return;
      const now = new Date().toISOString();
      const { error } = await (supabase as any).from('course_lesson_progress').upsert({
        user_id: userId, course_id: courseId, content_id: contentId, completed, last_opened_at: now,
        ...(recordCompletion ? { completed_at: completed ? now : null } : {}),
      }, { onConflict: 'user_id,content_id' });
      if (error) throw error;
      if (completed && recordCompletion) void recordLearningActivity({ type: 'lesson', subjectId: contentId, successful: true, metadata: { course_id: courseId } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course-progress', userId, courseId] }),
  });
  const progress = query.data ?? [];
  const latestIncomplete = progress.find((item) => !item.completed)?.contentId;
  const nextIncomplete = orderedContentIds.find((contentId) => !progress.some((item) => item.contentId === contentId && item.completed));
  return {
    progress, completedIds: new Set(progress.filter((item) => item.completed).map((item) => item.contentId)),
    resumeContentId: latestIncomplete ?? nextIncomplete ?? null, hasStarted: progress.length > 0, loading: query.isLoading,
    markOpened: (contentId: string) => save.mutate({ contentId, completed: progress.find((item) => item.contentId === contentId)?.completed ?? false, recordCompletion: false }),
    setCompleted: (contentId: string, completed: boolean) => save.mutate({ contentId, completed, recordCompletion: true }), saving: save.isPending,
  };
}
