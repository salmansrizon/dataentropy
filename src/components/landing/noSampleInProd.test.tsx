import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { setLang } from '@/i18n/lang';

// Production build without VITE_SAMPLE_CONTENT: USE_SAMPLE is false.
vi.mock('@/content/sampleContent', async (orig) => ({
  ...(await orig<typeof import('@/content/sampleContent')>()),
  USE_SAMPLE: false,
}));

// jsdom: no IntersectionObserver / Lottie player — stub them (visual-only).
vi.mock('@/components/LottieAnimation', () => ({ default: () => null }));
class IO { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
vi.stubGlobal('IntersectionObserver', IO);

import LandingHero from './LandingHero';
import StatsBar from './StatsBar';
import LandingCta from './LandingCta';

beforeAll(() => setLang('en'));

describe('landing in production (no sample data)', () => {
  it('renders no invented stats, learner counts, avatars or fake offer', () => {
    const { container } = render(
      <MemoryRouter>
        <LandingHero />
        <StatsBar />
        <LandingCta />
      </MemoryRouter>,
    );
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/10,000|3,000|98%|100%/);
    expect(text).not.toMatch(/learners love|limited-time offer/i);
    // hero headline + real CTA still render
    expect(container.querySelector('h1')).not.toBeNull();
    expect(container.querySelector('a[href="/courses"]')).not.toBeNull();
  });
});
