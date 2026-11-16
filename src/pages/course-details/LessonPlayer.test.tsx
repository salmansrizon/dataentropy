import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LessonPlayer from './LessonPlayer';
import type { CourseSection } from './types';
import { setLang } from '@/i18n/lang';

// Bangla is the app default; these assertions use the English strings.
beforeAll(() => setLang('en'));

const sections: CourseSection[] = [{
  id: 's1', title: 'Basics', order_index: 0,
  contents: [
    { id: 'free', title: 'Free lesson', content_type: 'video', content_data: null, is_free: true, order_index: 0 },
    { id: 'paid', title: 'Paid lesson', content_type: 'video', content_data: null, is_free: false, order_index: 1 },
  ],
}];

function setup(showProgress: boolean) {
  const markOpened = vi.fn();
  render(
    <LessonPlayer
      sections={sections}
      openLesson=""
      onOpenLessonChange={() => {}}
      isUnlocked={(item) => item.is_free}
      completedIds={new Set()}
      saving={false}
      markOpened={markOpened}
      setCompleted={() => {}}
      showProgress={showProgress}
    />,
  );
  return { markOpened };
}

describe('LessonPlayer gating', () => {
  it('records opens only for unlocked lessons and hides completion on locked ones', async () => {
    const { markOpened } = setup(false);
    await userEvent.click(screen.getByText('Paid lesson'));
    expect(markOpened).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Mark lesson complete' })).toBeNull();

    await userEvent.click(screen.getByText('Free lesson'));
    expect(markOpened).toHaveBeenCalledWith('free');
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('shows progress only for enrolled learners', () => {
    setup(true);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '2');
    expect(screen.queryByText('Preview')).toBeNull();
  });
});
