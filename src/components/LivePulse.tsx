import { cn } from "@/lib/utils";

/** Radar-style pulse dot. `live` = happening now (destructive), otherwise soon (inherits text color). Static under reduced motion. */
export function LivePulse({ live = false, className }: { live?: boolean; className?: string }) {
  const tone = live ? "bg-primary" : "bg-current";
  return (
    <span className={cn("relative inline-flex h-2 w-2 shrink-0", className)} aria-hidden="true">
      <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75 motion-safe:animate-ping", tone)} />
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", tone)} />
    </span>
  );
}
