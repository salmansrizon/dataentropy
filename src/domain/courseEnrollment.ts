export const COURSE_ACCESS_STATUSES = ['active', 'completed', 'approved', 'confirmed'] as const;

export function hasCourseAccess(status: string | null | undefined) {
  return status ? COURSE_ACCESS_STATUSES.includes(status as typeof COURSE_ACCESS_STATUSES[number]) : false;
}
