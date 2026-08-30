import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { weeklyConsistency } from '@/domain/weeklyConsistency';

export function useWeeklyConsistency(defaultGoal = 2) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const query = useQuery({
    queryKey: ['weekly-consistency', userId], enabled: !!userId,
    queryFn: async () => {
      const since = new Date(); since.setUTCDate(since.getUTCDate() - 8);
      const [{ data: activities }, { data: profile }] = await Promise.all([
        (supabase as any).from('learning_activity').select('created_at').eq('user_id', userId).eq('successful', true).in('activity_type', ['attempt', 'review', 'assessment', 'lesson']).gte('created_at', since.toISOString()),
        (supabase as any).from('profiles').select('weekly_session_goal, timezone').eq('id', userId).maybeSingle(),
      ]);
      return weeklyConsistency((activities ?? []).map((row: any) => row.created_at), profile?.weekly_session_goal ?? defaultGoal, new Date(), profile?.timezone ?? 'Asia/Dhaka');
    },
  });
  return query.data ?? weeklyConsistency([], defaultGoal);
}
