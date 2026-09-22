import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TopicLearningBoard from './TopicLearningBoard';
import type { Topic, TopicSection } from '@/hooks/useTopics';

const topic: Topic = {
  id: 'topic-1',
  slug: 'joins',
  title: 'SQL joins',
  what_it_is: 'A way to combine related rows.',
  why_it_matters: 'It lets you answer questions spread across tables.',
  how_it_works: 'Rows are matched using a shared key.',
  analogy: 'Match two guest lists using email addresses.',
};

const sections: TopicSection[] = [{
  id: 'section-1',
  title: 'Choose the relationship',
  body: 'Start from the result you need and identify the matching key.',
  takeaway: 'The relationship determines the join.',
  section_type: 'mental_model',
  diagram: null,
  order_index: 0,
}];

const props = {
  topic,
  sections,
  practice: [],
  caseStudies: [],
  isDone: false,
  hasCheckpoint: true,
  toolkit: <p>Reference toolkit</p>,
  nextTopic: null,
  routeContext: 'Data Analyst · Topic 1 of 8',
  onOpenQuestion: vi.fn(),
  onOpenCheckpoint: vi.fn(),
  onOpenNext: vi.fn(),
};

describe('TopicLearningBoard', () => {
  beforeEach(() => {
    let saved: string | null = null;
    vi.mocked(window.localStorage.getItem).mockImplementation(() => saved);
    vi.mocked(window.localStorage.setItem).mockImplementation((_key, value) => { saved = value; });
    window.localStorage.clear();
  });

  it('advances to and highlights the next step when a step is completed', async () => {
    const user = userEvent.setup();
    render(<TopicLearningBoard {...props} />);

    await user.click(screen.getByRole('button', { name: /I understand the idea/i }));

    expect(screen.getByRole('heading', { name: 'Explore' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /17% of reading sequence complete/i })).toBeInTheDocument();
    expect(window.localStorage.getItem('dataentropy:learning-board:topic-1:v1')).toContain('learn');
  });

  it('keeps route context and the guided step rail visible from the start', () => {
    render(<TopicLearningBoard {...props} />);
    expect(screen.getByRole('heading', { name: 'Learn' })).toBeInTheDocument();
    expect(screen.getByText('Data Analyst · Topic 1 of 8')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Explore/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Recall/i })).toBeInTheDocument();
  });
});
