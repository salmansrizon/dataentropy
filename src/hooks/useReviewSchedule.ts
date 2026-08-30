import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { loadDueReviews, postponeReview, type ScheduledReview } from '@/services/reviewSchedule';

export function useDueReviews() {
  const query = useQuery({ queryKey: ['review-schedule', 'due'], queryFn: () => loadDueReviews(), staleTime: 60_000 });
  return { reviews: query.data ?? [], loading: query.isLoading };
}

export function usePostponeReview() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (review: ScheduledReview) => postponeReview(review), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['review-schedule'] }) });
}
