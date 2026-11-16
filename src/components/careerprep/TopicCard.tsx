import { useState } from 'react';
import { ChevronDown, Lightbulb } from 'lucide-react';
import { track } from '@/services/funnel';
import { useT } from '@/i18n/lang';
import type { Topic } from '@/hooks/useTopics';
import type { Surface } from '@/services/funnel';

// The Topic Card: free help, never a gate. It awards no XP and marks no
// progress — a level never gates learning, and paying XP for reading turns the
// analogy into something to farm.
//
// `defaultOpen` is the difference between the Step (collapsed — the reading is
// the Step's job) and a failed Checkpoint (open — the learner just asked the
// question this answers by getting it wrong).

const T = {
  en: { sub: 'What it is, why it matters, and an analogy', what: 'What it is', why: 'Why it matters', how: 'How it works', plain: 'In plain terms' },
  bn: { sub: 'এটি কী, কেন গুরুত্বপূর্ণ, আর একটি উপমা', what: 'এটি কী', why: 'কেন গুরুত্বপূর্ণ', how: 'কীভাবে কাজ করে', plain: 'সহজ ভাষায়' },
};

interface Props {
  topic: Topic;
  surface: Surface;
  defaultOpen?: boolean;
}

const TopicCard = ({ topic, surface, defaultOpen = false }: Props) => {
  const t = useT(T);
  const [open, setOpen] = useState(defaultOpen);
  const [tracked, setTracked] = useState(false);

  const reveal = (next: boolean) => {
    setOpen(next);
    // Once per mount: a learner toggling the card twice is one view, and a
    // conversion rate computed over raw event counts flatters itself.
    if (next && !tracked) {
      setTracked(true);
      void track({ event: 'topic_viewed', surface, subjectType: 'topic', subjectId: topic.id });
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
      <button
        type="button"
        onClick={() => reveal(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
      >
        <Lightbulb className="w-4 h-4 text-primary shrink-0" />
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-bold text-foreground truncate">{topic.title}</span>
          <span className="block text-[11px] text-muted-foreground">{t.sub}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-border/60 pt-4">
          <Section label={t.what} body={topic.what_it_is} />
          <Section label={t.why} body={topic.why_it_matters} />
          <Section label={t.how} body={topic.how_it_works} />
          <Section label={t.plain} body={topic.analogy} accent />
        </div>
      )}
    </div>
  );
};

const Section = ({ label, body, accent = false }: { label: string; body: string; accent?: boolean }) => (
  <div className={accent ? 'rounded-xl bg-primary/5 border border-primary/20 p-3' : undefined}>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1.5">{label}</p>
    <p className="text-[13px] leading-relaxed text-foreground/90 whitespace-pre-line">{body}</p>
  </div>
);

export default TopicCard;
