import { describe, expect, it } from 'vitest';
import { hasCourseAccess } from './courseEnrollment';

describe('hasCourseAccess', () => {
  it.each(['active', 'completed', 'approved', 'confirmed'])('unlocks %s enrollment', (status) => {
    expect(hasCourseAccess(status)).toBe(true);
  });

  it.each(['pending', 'rejected', 'refunded', 'cancelled', undefined])('keeps %s enrollment locked', (status) => {
    expect(hasCourseAccess(status)).toBe(false);
  });
});
