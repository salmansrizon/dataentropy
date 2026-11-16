import { useState } from "react";
import { LivePulse } from "@/components/LivePulse";
import { Check, Copy, X } from "lucide-react";
import { useLang, useT } from "@/i18n/lang";
import type { CoursePromo } from "./salesPage";
import { useCountdown } from "./useCountdown";

const T = {
  en: { off: "off", code: "Use code", copy: "Copy promo code", copied: "Copied", apply: "Apply", dismiss: "Dismiss offer", ends: "Ends in", d: "d", h: "h", m: "m", s: "s" },
  bn: { off: "ছাড়", code: "কোড", copy: "প্রোমো কোড কপি করুন", copied: "কপি হয়েছে", apply: "এখনই নিন", dismiss: "অফার বন্ধ করুন", ends: "শেষ হবে", d: "দিন", h: "ঘ", m: "মি", s: "সে" },
};

const PromoBar = ({ promo, onApply }: { promo: CoursePromo | null; onApply: () => void }) => {
  const t = useT(T);
  const { num } = useLang();
  const [hidden, setHidden] = useState(false);
  const [copied, setCopied] = useState(false);
  const left = useCountdown(promo?.valid_until);
  // Expired while open (or already expired): stop advertising it.
  if (!promo || hidden || (promo.valid_until && !left)) return null;

  const pct = promo.discount_type === "percentage" || promo.discount_type === "percent";
  const discount = pct ? `${num(promo.discount_value)}%` : `৳${num(promo.discount_value)}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(promo.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: code stays visible */
    }
  };
  const pad = (n: number) => (n < 10 ? num(0) : "") + num(n);

  return (
    <div className="w-full bg-brand-gradient text-primary-foreground text-sm">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-2 pr-12 relative">
        <span className="font-semibold">{discount} {t.off}</span>
        <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-primary-foreground/60 px-3 py-0.5">
          <span className="opacity-80">{t.code}</span>
          <span className="font-mono font-bold">{promo.code}</span>
          <button type="button" onClick={copy} aria-label={copied ? t.copied : t.copy} className="ml-1 rounded p-0.5 hover:bg-primary-foreground/20">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </span>
        {left && (
          <span className="inline-flex items-center gap-2 tabular-nums" role="timer" aria-live="off"><LivePulse />
            {t.ends} {num(left.days)}{t.d} {pad(left.hours)}:{pad(left.minutes)}:{pad(left.seconds)}
          </span>
        )}
        <button type="button" onClick={onApply} className="rounded-full bg-primary-foreground px-4 py-1 font-semibold text-brand-blue hover:opacity-90">
          {t.apply}
        </button>
        <button type="button" onClick={() => setHidden(true)} aria-label={t.dismiss} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-primary-foreground/20">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PromoBar;
