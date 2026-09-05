import LottieAnimation from '@/components/LottieAnimation';
import ScrollReveal from '@/components/ScrollReveal';
import { useReducedMotion } from 'framer-motion';
import { ChartNoAxesColumnIncreasing, CalendarCheck, Map } from 'lucide-react';

export default function PageIntro({ eyebrow, title, description, animation = '/animations/data-insights.json' }: {
  eyebrow: string;
  title: string;
  description: string;
  animation?: string;
}) {
  const reducedMotion = useReducedMotion();
  const Icon = animation.includes('booking') ? CalendarCheck : animation.includes('roadmap') ? Map : ChartNoAxesColumnIncreasing;
  return (
    <ScrollReveal className="page-intro" duration={0.3}>
      <div className="min-w-0">
        <p className="page-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      <div className="page-intro-visual grid place-items-center" aria-hidden="true">
        {reducedMotion
          ? <Icon className="h-24 w-24 rounded-3xl bg-primary/10 p-6 text-primary" strokeWidth={1.5} />
          : <LottieAnimation src={animation} loop={false} className="h-full w-full" />}
      </div>
    </ScrollReveal>
  );
}
