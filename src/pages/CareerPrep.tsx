import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, BookOpen, CheckCircle2 } from 'lucide-react';
import '@/learning-paths.css';
import Navbar from '@/components/Navbar';
import LottieAnimation from '@/components/LottieAnimation';
import { useQuestions } from '@/hooks/useCareerPrep';
import JourneyPanel from '@/components/careerprep/JourneyPanel';
import { trackOnce } from '@/services/funnel';

/**
 * Career Prep is the Journey dashboard.
 *
 * The filterable Library table that used to fill this page is gone: questions
 * are now reached *through* the Journey — the daily challenge, the next-up
 * queue, and Step Checkpoints on a Roadmap. `/career-prep/solve/:slug` is
 * unchanged, so every existing link and bookmark still resolves.
 *
 * The old guest modal is gone with it. It asked for an email and a WhatsApp
 * number *before* letting anyone open a question, which contradicts the rule
 * that nothing blocks learning — and it is redundant now that every visitor is
 * signed in anonymously on arrival. Contact details are asked for once, at the
 * ebook, and progress is claimed at the soft wall after the first success.
 */
const CareerPrep = () => {
  const navigate = useNavigate();
  const { questions } = useQuestions();

  useEffect(() => {
    void trackOnce('arrived', { event: 'arrived', surface: 'lobby' });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main>
        <header className="learning-paths-hero">
          <div>
            <p className="page-eyebrow">Learning paths · Built around your goal</p>
            <h1>A clear path to your <span className="whitespace-nowrap text-primary">next role.</span></h1>
            <p>Choose a direction. Build the skills through focused lessons and real practice. Pick up where you left off, one useful step at a time.</p>
          </div>
          <figure className="learning-paths-banner">
            <img src="/images/data-career-learning-banner.jpg" alt="Data analytics workspace with a visual learning path" width={1672} height={941} fetchPriority="high" />
            <figcaption>Choose a direction. Build practical skills. Keep moving.</figcaption>
          </figure>
          <div className="learning-paths-animation" aria-hidden="true"><LottieAnimation src="/animations/learning-path-stages.json" loop={false} className="h-full w-full" /></div>
          <ol className="learning-paths-route" aria-label="How learning paths work">
            <li><Compass aria-hidden="true" /><div><strong>Choose your direction</strong><small>Find a path that fits the work you want to do.</small></div></li>
            <li><BookOpen aria-hidden="true" /><div><strong>Learn by doing</strong><small>Connect each concept to practical problems.</small></div></li>
            <li><CheckCircle2 aria-hidden="true" /><div><strong>See your progress</strong><small>Complete checkpoints and keep moving forward.</small></div></li>
          </ol>
        </header>
      <JourneyPanel
        questions={questions}
        onOpenQuestion={(slug) => navigate(`/career-prep/solve/${slug}`)}
      />
      </main>
    </div>
  );
};

export default CareerPrep;
