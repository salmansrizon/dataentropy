import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookDown, CheckCircle2, ExternalLink, Map, PlayCircle, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import CheckpointDialog from '@/components/careerprep/CheckpointDialog';
import ShareBar from '@/components/careerprep/ShareBar';
import TopicLearningBoard from '@/components/careerprep/TopicLearningBoard';
import TopicQueries from '@/components/careerprep/TopicQueries';
import { CourseCountdown } from '@/components/CourseCountdown';
import { TopicSkeleton } from '@/components/ui/skeletons';
import { useCheckpoint } from '@/hooks/useCheckpoints';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { useTopic, useTopicNavigation, useTopicProgress } from '@/hooks/useTopics';
import { recordLearningActivity } from '@/services/learningActivity';
import { track } from '@/services/funnel';
import { motion, useReducedMotion } from 'framer-motion';
import { useLang, useT } from '@/i18n/lang';

const T = {
  en: { nf: 'Topic not found', nfD: 'It may not be published yet.', back: 'Back to Career Prep', cp: 'Career Prep', passed: 'Passed', refs: 'Trusted references', refsD: 'Primary sources and open courses selected for a clear reason.', paid: 'paid', deeper: 'Go deeper', rec: 'Recorded course', free: 'Free', mat: 'Study material', freeEmail: 'Free with your email', live: 'Live session', wider: 'Want the wider map?', follows: 'This stage follows the', roadmapW: 'roadmap. It is optional context.', readMap: 'Read the roadmap', suffix: 'Career Prep', route: (j: string, i: string, n: string) => `${j} · Topic ${i} of ${n}`, guided: 'Career Prep · Guided Topic' },
  bn: { nf: 'টপিক পাওয়া যায়নি', nfD: 'এটি হয়তো এখনও প্রকাশিত হয়নি।', back: 'Career Prep-এ ফিরুন', cp: 'Career Prep', passed: 'পাস', refs: 'নির্ভরযোগ্য রেফারেন্স', refsD: 'স্পষ্ট কারণে বাছাই করা প্রাইমারি সোর্স ও ওপেন কোর্স।', paid: 'পেইড', deeper: 'আরও গভীরে যান', rec: 'রেকর্ডেড কোর্স', free: 'ফ্রি', mat: 'স্টাডি ম্যাটেরিয়াল', freeEmail: 'ইমেইল দিলে ফ্রি', live: 'লাইভ সেশন', wider: 'বড় ম্যাপটি দেখতে চান?', follows: 'এই ধাপটি', roadmapW: 'রোডম্যাপ অনুসরণ করে। এটি ঐচ্ছিক প্রেক্ষাপট।', readMap: 'রোডম্যাপ পড়ুন', suffix: 'Career Prep', route: (j: string, i: string, n: string) => `${j} · ${n}টির মধ্যে টপিক ${i}`, guided: 'Career Prep · গাইডেড টপিক' },
};

const TopicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const t = useT(T);
  const { num } = useLang();
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const { data, loading } = useTopic(slug);
  const { passed } = useTopicProgress();
  const { checkpoint } = useCheckpoint(data?.checkpoint?.id);
  const { nav } = useTopicNavigation(slug);
  const [checkpointOpen, setCheckpointOpen] = useState(false);
  const [checkpointPassed, setCheckpointPassed] = useState(false);

  useDocumentMeta({
    title: data ? `${data.topic.title} — ${t.suffix}` : undefined,
    description: data ? `${data.topic.what_it_is} ${data.topic.why_it_matters}`.slice(0, 200) : undefined,
  });

  const trackedTopicId = data?.topic?.id;
  const trackedTopicSlug = data?.topic?.slug;
  const trackedTopicPassed = trackedTopicId ? passed.has(trackedTopicId) : false;

  useEffect(() => {
    if (!trackedTopicId) return;
    void track({ event: 'learning_item_started', surface: 'topic', subjectType: 'topic', subjectId: trackedTopicId });
    void recordLearningActivity({ type: 'topic', subjectId: trackedTopicId, successful: trackedTopicPassed, metadata: { slug: trackedTopicSlug } });
  }, [trackedTopicId, trackedTopicPassed, trackedTopicSlug]);

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><TopicSkeleton /></div>;

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 pt-32 text-center">
          <h1 className="text-2xl font-bold">{t.nf}</h1>
          <p className="mt-2 text-muted-foreground">{t.nfD}</p>
          <Button asChild className="mt-6 rounded-full"><Link to="/career-prep">{t.back}</Link></Button>
        </div>
      </div>
    );
  }

  const { topic, practice, caseStudies, sections, references, offers } = data;
  const isDone = passed.has(topic.id) || checkpointPassed;

  const toolkit = (
    <div className="space-y-6">
      <ShareBar title={topic.title} surface="topic" subjectId={topic.id} />

      {references.length > 0 ? (
        <section aria-labelledby="references-heading">
          <h4 id="references-heading" className="font-extrabold">{t.refs}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{t.refsD}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {references.map((reference) => (
              <a key={reference.id} href={reference.url} target="_blank" rel="noopener noreferrer"
                onClick={() => void track({ event: 'offer_clicked', surface: 'topic', subjectType: 'topic', subjectId: topic.id, metadata: { reference: reference.url } })}
                className="flex min-h-16 items-start gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{reference.label}</span>{reference.note ? <span className="mt-1 block text-xs leading-5 text-muted-foreground">{reference.note}</span> : null}</span>
                <Badge variant="outline" className="shrink-0 text-[10px]">{reference.is_free ? reference.kind : `${reference.kind} · ${t.paid}`}</Badge>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {(offers.course || offers.ebook || offers.webinar) ? (
        <section aria-labelledby="deeper-heading">
          <h4 id="deeper-heading" className="font-extrabold">{t.deeper}</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {offers.course ? (
              <button onClick={() => navigate(`/course/${offers.course!.id}`)} className="min-h-32 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary"><PlayCircle className="h-4 w-4" />{t.rec}</span>
                <span className="mt-2 block text-sm font-bold leading-snug">{offers.course.title}</span>
                <span className="mt-2 block text-xs text-muted-foreground">{offers.course.is_free ? t.free : `৳${num(Number(offers.course.price))}`}</span>
              </button>
            ) : offers.ebook ? (
              <button onClick={() => navigate('/career-prep')} className="min-h-32 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary"><BookDown className="h-4 w-4" />{t.mat}</span>
                <span className="mt-2 block text-sm font-bold leading-snug">{offers.ebook.title}</span>
                <span className="mt-2 block text-xs text-muted-foreground">{t.freeEmail}</span>
              </button>
            ) : offers.webinar ? (
              <button onClick={() => navigate('/webinars')} className="min-h-32 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary"><Video className="h-4 w-4" />{t.live}</span>
                <span className="mt-2 block text-sm font-bold leading-snug">{offers.webinar.title}</span>
                {offers.webinar.webinar_date ? <span className="mt-2 block"><CourseCountdown startDate={offers.webinar.webinar_date} /></span> : null}
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {nav?.roadmap ? (
        <section className="rounded-2xl border border-border bg-muted/30 p-4" aria-labelledby="roadmap-heading">
          <h4 id="roadmap-heading" className="font-extrabold">{t.wider}</h4>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{t.follows} <strong className="text-foreground">{nav.roadmap.title}</strong> {t.roadmapW}</p>
          <Button variant="outline" className="mt-3 min-h-11 gap-2 rounded-full" onClick={() => navigate(`/roadmaps/${nav.roadmap!.slug}`)}><Map className="h-4 w-4" />{t.readMap}</Button>
        </section>
      ) : null}

      <TopicQueries topicId={topic.id} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.08),transparent_34%),hsl(var(--background))]">
      <Navbar />
      <main className="mx-auto max-w-6xl px-3 pb-10 pt-28 sm:px-5 sm:pt-28">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" className="min-h-11 gap-1.5 rounded-full text-muted-foreground" onClick={() => navigate('/career-prep')}><ArrowLeft className="h-4 w-4" />{t.cp}</Button>

        </div>

        <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="page-heading flex flex-wrap items-center gap-3 px-1">
          <h1 className="max-w-4xl text-2xl font-black tracking-tight [overflow-wrap:anywhere] sm:text-3xl lg:text-4xl">{topic.title}</h1>
          {isDone ? <Badge className="border-0 bg-success-soft text-success-strong"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />{t.passed}</Badge> : null}
        </motion.div>

        <TopicLearningBoard topic={topic} sections={sections} practice={practice} caseStudies={caseStudies}
          isDone={isDone} hasCheckpoint={!!checkpoint} toolkit={toolkit} nextTopic={nav?.next}
          routeContext={nav?.journey && nav.index >= 0 ? t.route(nav.journey.title, num(nav.index + 1), num(nav.sequence.length)) : t.guided}
          onOpenQuestion={(questionSlug) => navigate(`/career-prep/solve/${questionSlug}`)}
          onOpenCheckpoint={() => setCheckpointOpen(true)}
          onOpenNext={() => nav?.next && navigate(`/career-prep/topic/${nav.next.slug}`)} />
      </main>

      {checkpointOpen && checkpoint ? (
        <CheckpointDialog topicId={topic.id} checkpoint={checkpoint} topicTitle={topic.title} topic={topic}
          onPassed={() => setCheckpointPassed(true)} onClose={() => setCheckpointOpen(false)} />
      ) : null}
    </div>
  );
};

export default TopicPage;
