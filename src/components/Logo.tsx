import { useId } from "react";

/**
 * DataEntropy logo (vector redraw of the owner's logo): four rounded bars rising left → right in a
 * lavender → violet gradient, plus the wordmark with a gradient "E". Brand tokens only, so it
 * adapts to light/dark mode.
 */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 40 32" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-bars`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" style={{ stopColor: "hsl(var(--brand-purple) / 0.45)" }} />
          <stop offset="55%" style={{ stopColor: "hsl(var(--brand-purple))" }} />
          <stop offset="100%" style={{ stopColor: "hsl(var(--primary))" }} />
        </linearGradient>
      </defs>
      <rect x="1" y="20" width="7" height="11" rx="3.5" fill={`url(#${id}-bars)`} opacity="0.55" />
      <rect x="11" y="13.5" width="7" height="17.5" rx="3.5" fill={`url(#${id}-bars)`} opacity="0.75" />
      <rect x="21" y="7.5" width="7" height="23.5" rx="3.5" fill={`url(#${id}-bars)`} opacity="0.9" />
      <rect x="31" y="1" width="8" height="30" rx="4" fill={`url(#${id}-bars)`} />
    </svg>
  );
}

export default function Logo({ size = "md", className = "" }: { size?: "sm" | "md"; className?: string }) {
  const mark = size === "sm" ? "h-6 w-6" : "h-7 w-7";
  const text = size === "sm" ? "text-xl" : "text-xl sm:text-2xl";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={mark} />
      <span className={`font-display font-extrabold tracking-tight text-foreground ${text}`} lang="en">
        Data<span className="bg-gradient-to-br from-brand-purple to-primary bg-clip-text text-transparent">E</span>ntropy
      </span>
    </span>
  );
}
