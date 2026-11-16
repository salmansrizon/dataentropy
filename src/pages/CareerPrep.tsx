import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, BookOpen, CheckCircle2 } from 'lucide-react';
import '@/learning-paths.css';
import Navbar from '@/components/Navbar';
import WorkflowAnimation from '@/components/home/WorkflowAnimation';
import { motion, useReducedMotion } from 'framer-motion';
import { useLang, useT } from '@/i18n/lang';
import { RevealGroup, RevealItem } from '@/pages/course-details/motion';
import { useQuestions } from '@/hooks/useCareerPrep';
import JourneyPanel from '@/components/careerprep/JourneyPanel';
import { trackOnce } from '@/services/funnel';

const T = {
  en: {
    eyebrow: 'Learning paths · Built around your goal', h1a: 'A clear path to your ', h1b: 'next role.',
    sub: 'Choose a direction. Build the skills through focused lessons and real practice. Pick up where you left off, one useful step at a time.',
    alt: 'Data analytics workspace with a visual learning path',
    caption: 'Choose a direction. Build practical skills. Keep moving.',
    routeLabel: 'How learning paths work',
    steps: [
      ['Choose your direction', 'Find a path that fits the work you want to do.'],
      ['Learn by doing', 'Connect each concept to practical problems.'],
      ['See your progress', 'Complete checkpoints and keep moving forward.'],
    ],
  },
  bn: {
    eyebrow: 'লার্নিং পাথ · আপনার লক্ষ্য ঘিরে সাজানো', h1a: 'আপনার পরবর্তী ', h1b: 'ক্যারিয়ারের স্পষ্ট পথ।',
    sub: 'একটি দিক বেছে নিন। ফোকাসড লেসন ও বাস্তব প্র্যাকটিসের মাধ্যমে দক্ষতা গড়ুন। যেখানে থেমেছিলেন সেখান থেকেই শুরু করুন, প্রতিবার একটি কাজের ধাপ।',
    alt: 'ভিজ্যুয়াল লার্নিং পাথসহ ডেটা অ্যানালিটিক্স ওয়ার্কস্পেস',
    caption: 'একটি দিক বেছে নিন। বাস্তব দক্ষতা গড়ুন। এগিয়ে চলুন।',
    routeLabel: 'লার্নিং পাথ যেভাবে কাজ করে',
    steps: [
      ['আপনার দিক বেছে নিন', 'যে কাজটি করতে চান, তার সাথে মানানসই পথ খুঁজে নিন।'],
      ['করে শিখুন', 'প্রতিটি ধারণাকে বাস্তব সমস্যার সাথে যুক্ত করুন।'],
      ['অগ্রগতি দেখুন', 'চেকপয়েন্ট সম্পন্ন করুন এবং এগিয়ে যান।'],
    ],
  },
};
const ICONS = [Compass, BookOpen, CheckCircle2];
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const rise = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } } };

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
  const t = useT(T);
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const { questions } = useQuestions();

  useEffect(() => {
    void trackOnce('arrived', { event: 'arrived', surface: 'lobby' });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main>
        <header className="learning-paths-hero">
          <motion.div variants={stagger} initial={reduce ? false : 'hidden'} animate="show">
            <motion.p variants={rise} className="page-eyebrow" style={lang === 'bn' ? { textTransform: 'none', letterSpacing: 'normal' } : undefined}>{t.eyebrow}</motion.p>
            <motion.h1 variants={rise}>{t.h1a}<span className="whitespace-nowrap text-primary">{t.h1b}</span></motion.h1>
            <motion.p variants={rise}>{t.sub}</motion.p>
          </motion.div>
          <motion.figure className="learning-paths-banner" initial={reduce ? false : { opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
            <img src="/images/data-career-learning-banner.jpg" alt={t.alt} width={1672} height={941} fetchPriority="high" />
            <figcaption>{t.caption}</figcaption>
          </motion.figure>
          <div className="col-span-full"><WorkflowAnimation /></div>
          <div role="group" aria-label={t.routeLabel} className="col-span-full">
            <RevealGroup role="list" className="learning-paths-route">
              {t.steps.map(([title, desc], i) => {
                const Icon = ICONS[i];
                return (
                  <RevealItem key={title} role="listitem">
                    <div className="flex items-center gap-[18px] py-3.5 transition-transform hover:-translate-y-1 motion-reduce:transform-none">
                      <Icon aria-hidden="true" /><div><strong>{title}</strong><small>{desc}</small></div>
                    </div>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </div>
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
