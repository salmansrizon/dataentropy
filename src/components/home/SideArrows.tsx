import { ChevronLeft, ChevronRight } from "lucide-react";

const btn =
  "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-foreground shadow-card transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid";

/** Prev/next buttons centred on the left/right edges of a horizontal scroll row. Parent must be `relative`. Hidden on mobile (swipe). */
export default function SideArrows({ onPrev, onNext, prevLabel, nextLabel }: { onPrev: () => void; onNext: () => void; prevLabel: string; nextLabel: string }) {
  return (
    <>
      <button type="button" aria-label={prevLabel} onClick={onPrev} className={`${btn} -left-4 lg:-left-5`}>
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button type="button" aria-label={nextLabel} onClick={onNext} className={`${btn} -right-4 lg:-right-5`}>
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </>
  );
}
