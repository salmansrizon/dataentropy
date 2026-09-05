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

const TopicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data, loading } = useTopic(slug);
  const { passed } = useTopicProgress();
  const { checkpoint } = useCheckpoint(data?.checkpoint?.id);
  const { nav } = useTopicNavigation(slug);
  const [checkpointOpen, setCheckpointOpen] = useState(false);
  const [checkpointPassed, setCheckpointPassed] = useState(false);

  useDocumentMeta({
    title: data ? `${data.topic.title} — Career Prep` : undefined,
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
          <h1 className="text-2xl font-bold">Topic not found</h1>
          <p className="mt-2 text-muted-foreground">It may not be published yet.</p>
          <Button asChild className="mt-6 rounded-full"><Link to="/career-prep">Back to Career Prep</Link></Button>
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
          <h4 id="references-heading" className="font-extrabold">Trusted references</h4>
          <p className="mt-1 text-sm text-muted-foreground">Primary sources and open courses selected for a clear reason.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {references.map((reference) => (
              <a key={reference.id} href={reference.url} target="_blank" rel="noopener noreferrer"
                onClick={() => void track({ event: 'offer_clicked', surface: 'topic', subjectType: 'topic', subjectId: topic.id, metadata: { reference: reference.url } })}
                className="flex min-h-16 items-start gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{reference.label}</span>{reference.note ? <span className="mt-1 block text-xs leading-5 text-muted-foreground">{reference.note}</span> : null}</span>
                <Badge variant="outline" className="shrink-0 text-[10px]">{reference.is_free ? reference.kind : `${reference.kind} · paid`}</Badge>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {(offers.course || offers.ebook || offers.webinar) ? (
        <section aria-labelledby="deeper-heading">
          <h4 id="deeper-heading" className="font-extrabold">Go deeper</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {offers.course ? (
              <button onClick={() => navigate(`/course/${offers.course!.id}`)} className="min-h-32 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary"><PlayCircle className="h-4 w-4" />Recorded course</span>
                <span className="mt-2 block text-sm font-bold leading-snug">{offers.course.title}</span>
                <span className="mt-2 block text-xs text-muted-foreground">{offers.course.is_free ? 'Free' : `৳${offers.course.price}`}</span>
              </button>
            ) : null}
            {offers.ebook ? (
              <button onClick={() => navigate('/career-prep')} className="min-h-32 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary"><BookDown className="h-4 w-4" />Study material</span>
                <span className="mt-2 block text-sm font-bold leading-snug">{offers.ebook.title}</span>
                <span className="mt-2 block text-xs text-muted-foreground">Free with your email</span>
              </button>
            ) : null}
            {offers.webinar ? (
              <button onClick={() => navigate('/webinars')} className="min-h-32 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary"><Video className="h-4 w-4" />Live session</span>
                <span className="mt-2 block text-sm font-bold leading-snug">{offers.webinar.title}</span>
                {offers.webinar.webinar_date ? <span className="mt-2 block"><CourseCountdown startDate={offers.webinar.webinar_date} /></span> : null}
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {nav?.roadmap ? (
        <section className="rounded-2xl border border-border bg-muted/30 p-4" aria-labelledby="roadmap-heading">
          <h4 id="roadmap-heading" className="font-extrabold">Want the wider map?</h4>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">This stage follows the <strong className="text-foreground">{nav.roadmap.title}</strong> roadmap. It is optional context.</p>
          <Button variant="outline" className="mt-3 min-h-11 gap-2 rounded-full" onClick={() => navigate(`/roadmaps/${nav.roadmap!.slug}`)}><Map className="h-4 w-4" />Read the roadmap</Button>
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
          <Button variant="ghost" size="sm" className="min-h-11 gap-1.5 rounded-full text-muted-foreground" onClick={() => navigate('/career-prep')}><ArrowLeft className="h-4 w-4" />Career Prep</Button>
          {nav?.journey && nav.index >= 0 ? <span className="text-xs text-muted-foreground">{nav.journey.title} · topic {nav.index + 1} of {nav.sequence.length}</span> : null}
        </div>

        <div className="page-heading flex flex-wrap items-center gap-3 px-1">
          <h1 className="max-w-4xl text-2xl font-black tracking-tight [overflow-wrap:anywhere] sm:text-3xl lg:text-4xl">{topic.title}</h1>
          {isDone ? <Badge className="border-0 bg-success-soft text-success-strong"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Passed</Badge> : null}
        </div>

        <TopicLearningBoard topic={topic} sections={sections} practice={practice} caseStudies={caseStudies}
          isDone={isDone} hasCheckpoint={!!checkpoint} toolkit={toolkit} nextTopic={nav?.next}
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
