import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
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

      <div className="relative overflow-hidden pb-8 pt-28 sm:pt-32">
        <main className="container max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col gap-4 mb-2">
            <Badge className="w-fit border-primary/20 bg-primary/10 px-4 py-1.5 font-semibold text-primary">
              Your learning workspace
            </Badge>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
              <span className="text-primary">Keep building evidence.</span>
              <br />
              <span className="text-foreground">One useful next step at a time.</span>
            </h1>
          </div>
        </main>
      </div>

      <JourneyPanel
        questions={questions}
        onOpenQuestion={(slug) => navigate(`/career-prep/solve/${slug}`)}
      />
    </div>
  );
};

export default CareerPrep;
