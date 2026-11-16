import { useEffect, useState } from "react";

/** Remaining time until `iso`, ticking each second. null when past/invalid. */
export function useCountdown(iso: string | null | undefined) {
  const target = iso ? new Date(iso).getTime() : NaN;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    if (Number.isNaN(target) || target <= Date.now()) return;
    const id = window.setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= target) window.clearInterval(id); // stop ticking once expired
    }, 1000);
    return () => window.clearInterval(id);
  }, [target]);
  const ms = target - now;
  if (Number.isNaN(target) || ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}
