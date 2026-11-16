import type { ReactNode } from "react";
import { Reveal } from "./motion";

interface SectionShellProps {
  id: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  className?: string;
}

const SectionShell = ({ id, eyebrow, title, children, className = "" }: SectionShellProps) => (
  <section id={id} className={`scroll-mt-40 py-8 ${className}`}>
    <Reveal>
      {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-blue">{eyebrow}</p>}
      <h2 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">{title}</h2>
      {children}
    </Reveal>
  </section>
);

export default SectionShell;
