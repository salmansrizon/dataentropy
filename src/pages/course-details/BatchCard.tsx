import { CalendarClock, CalendarDays, Clock, LifeBuoy } from "lucide-react";
import { LivePulse } from "@/components/LivePulse";
import { useLang, useT } from "@/i18n/lang";
import type { SalesPage } from "./salesPage";
import { CountUp, Reveal } from "./motion";
import { useCountdown } from "./useCountdown";

const T = {
  en: { starts: "Starts", live: "Live classes", support: "Support", seats: "Seats left", of: "of", filling: "Seats filled", begins: "Batch starts in", d: "Days", h: "Hours", m: "Min", s: "Sec", batch: "Next batch" },
  bn: { starts: "শুরু", live: "লাইভ ক্লাস", support: "সাপোর্ট", seats: "আসন বাকি", of: "মোট", filling: "আসন পূর্ণ", begins: "ব্যাচ শুরু হতে বাকি", d: "দিন", h: "ঘণ্টা", m: "মিনিট", s: "সেকেন্ড", batch: "পরবর্তী ব্যাচ" },
};

const BatchCard = ({ batch, startDate }: { batch?: SalesPage["batch"]; startDate?: string }) => {
  const t = useT(T);
  const { pick, num, date } = useLang();
  const left = useCountdown(startDate);
  if (!batch && !startDate) return null;

  const total = batch?.seats_total;
  const seats = batch?.seats_left;
  const filled = total ? Math.min(100, Math.max(0, Math.round(((total - (seats ?? total)) / total) * 100))) : 0;
  const rows = [
    startDate && { Icon: CalendarDays, label: t.starts, value: date(startDate) },
    batch?.live_schedule && { Icon: Clock, label: t.live, value: pick(batch.live_schedule) },
    batch?.support_schedule && { Icon: LifeBuoy, label: t.support, value: pick(batch.support_schedule) },
  ].filter(Boolean) as { Icon: typeof Clock; label: string; value: string }[];

  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card">
        <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-2 opacity-80">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary"><CalendarClock className="h-8 w-8" /></span>
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-2 pr-24">
          <h3 className="text-lg font-bold text-foreground">{pick(batch?.name) || t.batch}</h3>
          {batch?.mode && <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-brand-blue"><LivePulse />{pick(batch.mode)}</span>}
        </div>
        <ul className="space-y-3 text-sm">
          {rows.map(({ Icon, label, value }) => (
            <li key={label} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" aria-hidden="true" />
              <span><span className="text-muted-foreground">{label}: </span><span className="font-medium text-foreground">{value}</span></span>
            </li>
          ))}
        </ul>
        {total != null && seats != null && (
          <div className="mt-5">
            <div className="mb-2 flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">{t.seats}</span>
              <span className="font-semibold text-foreground">
                <CountUp value={seats} format={num} className="text-lg text-brand-blue" /> {t.of} {num(total)}
              </span>
            </div>
            <div role="progressbar" aria-label={t.filling} aria-valuemin={0} aria-valuemax={total} aria-valuenow={total - seats} className="h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-brand-gradient transition-all duration-700" style={{ width: `${filled}%` }} />
            </div>
          </div>
        )}
        {left && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.begins}</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {([[left.days, t.d], [left.hours, t.h], [left.minutes, t.m], [left.seconds, t.s]] as const).map(([v, l]) => (
                <div key={l} className="rounded-xl bg-brand-surface py-2">
                  <div className="text-xl font-bold tabular-nums text-brand-blue">{num(v)}</div>
                  <div className="text-[11px] text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Reveal>
  );
};

export default BatchCard;
