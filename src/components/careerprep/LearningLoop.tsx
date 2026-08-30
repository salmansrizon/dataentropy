import { motion, useReducedMotion } from 'framer-motion';
import { Brain, Eye, Footprints, Lightbulb, RotateCcw, Target } from 'lucide-react';
import type { TopicSection } from '@/hooks/useTopics';

const steps = [
  { type: 'outcome', label: 'Outcome', icon: Target },
  { type: 'mental_model', label: 'Mental model', icon: Brain },
  { type: 'worked_example', label: 'Worked example', icon: Eye },
  { type: 'faded_example', label: 'Complete a step', icon: Footprints },
  { type: 'independent_attempt', label: 'Independent attempt', icon: Lightbulb },
  { type: 'later_review', label: 'Later review', icon: RotateCcw },
] as const;

export default function LearningLoop({ sections, topicTitle }: { sections: TopicSection[]; topicTitle: string }) {
  const reduceMotion = useReducedMotion();
  const covered = new Set(sections.map((section) => section.section_type));
  return (
    <section className="mt-6 rounded-2xl border border-primary/20 bg-card p-5 shadow-card" aria-labelledby="learning-loop-heading">
      <p className="text-sm font-bold text-primary">Your learning loop</p>
      <h2 id="learning-loop-heading" className="mt-1 text-xl font-extrabold">Understand it, prove it, remember it</h2>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {steps.map(({ type, label, icon: Icon }, index) => {
          const available = covered.has(type);
          return (
            <motion.div key={type} initial={reduceMotion ? false : { opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.22, delay: index * 0.035 }}
              className={`rounded-xl border p-3 ${available ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/30'}`}>
              <Icon className={`h-4 w-4 ${available ? 'text-primary' : 'text-muted-foreground'}`} aria-hidden="true" />
              <p className="mt-2 text-sm font-bold">{label}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{available ? 'Included in this Topic' : 'Coming in a future Topic update'}</p>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-5 rounded-xl bg-secondary/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-extrabold">Retrieve it before you reread</h3><a href="#independent-practice" className="inline-flex min-h-11 items-center text-sm font-bold text-primary underline underline-offset-4">Already know it? Prove it</a></div>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
          <li>Explain {topicTitle} in your own words without notes.</li>
          <li>Name one situation where it is the right tool and why.</li>
          <li>Predict one common mistake, then check your explanation.</li>
        </ol>
      </div>
    </section>
  );
}
