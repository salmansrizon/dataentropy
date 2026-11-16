import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Bell, Check, CalendarRange, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useWeeklyConsistency } from '@/hooks/useWeeklyConsistency';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLang, useT } from '@/i18n/lang';

const T = {
  en: {
    title: 'Your week, without streak pressure',
    done: 'Weekly goal complete. Any extra practice is optional.',
    fresh: 'A fresh week is a clean start—one useful session is enough today.',
    left: (n: string, one: boolean) => `${n} session${one ? '' : 's'} left this week. Missing a day never resets your progress.`,
    remTitle: 'Due-review reminders', remSub: 'Opt in; no guilt messages', remAria: 'Enable due-review reminders',
    notifTitle: 'A quick review is ready',
    notifBody: (n: string, one: boolean) => `${n} item${one ? '' : 's'} due. A short retrieval now will make the learning stick.`,
    enabled: 'Gentle reminders enabled', paused: 'Reminders paused',
    enabledDesc: 'We will only remind you about due learning while DataEntropy is open.',
    pausedDesc: 'Your schedule and progress stay unchanged.',
    days: 'Study days', dayLetters: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    time: 'Reminder time', quiet: 'Quiet hours', quietStart: 'Quiet hours start', quietEnd: 'Quiet hours end',
    save: 'Save schedule',
  },
  bn: {
    title: 'আপনার সপ্তাহ, স্ট্রিকের চাপ ছাড়া',
    done: 'সাপ্তাহিক লক্ষ্য পূর্ণ হয়েছে। বাড়তি অনুশীলন ঐচ্ছিক।',
    fresh: 'নতুন সপ্তাহ মানেই নতুন শুরু—আজ একটি কাজের সেশনই যথেষ্ট।',
    left: (n: string) => `এই সপ্তাহে আর ${n}টি সেশন বাকি। একদিন বাদ পড়লেও আপনার অগ্রগতি রিসেট হয় না।`,
    remTitle: 'রিভিউ রিমাইন্ডার', remSub: 'ইচ্ছা হলে চালু করুন; কোনো অপরাধবোধের বার্তা নেই', remAria: 'রিভিউ রিমাইন্ডার চালু করুন',
    notifTitle: 'একটি দ্রুত রিভিউ প্রস্তুত',
    notifBody: (n: string) => `${n}টি আইটেম রিভিউর অপেক্ষায়। এখন একটু মনে করার চেষ্টা শেখাটা পাকা করবে।`,
    enabled: 'নরম রিমাইন্ডার চালু হয়েছে', paused: 'রিমাইন্ডার বন্ধ আছে',
    enabledDesc: 'DataEntropy খোলা থাকলেই কেবল আমরা রিভিউর কথা মনে করিয়ে দেব।',
    pausedDesc: 'আপনার সূচি ও অগ্রগতি অপরিবর্তিত থাকবে।',
    days: 'পড়ার দিন', dayLetters: ['সো', 'মং', 'বু', 'বৃ', 'শু', 'শ', 'র'],
    time: 'রিমাইন্ডারের সময়', quiet: 'নীরব সময়', quietStart: 'নীরব সময় শুরু', quietEnd: 'নীরব সময় শেষ',
    save: 'সূচি সংরক্ষণ করুন',
  },
};

export default function LearnerRhythmCard({ initialGoal = 2, dueReviewCount = 0 }: { initialGoal?: number; dueReviewCount?: number }) {
  const t = useT(T);
  const { num } = useLang();
  const consistency = useWeeklyConsistency(initialGoal);
  const message = consistency.remaining === 0 ? t.done : consistency.completedSessions === 0 ? t.fresh : t.left(num(consistency.remaining), consistency.remaining === 1);
  const { session } = useAuth();
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();
  const [reminders, setReminders] = useState(false);
  const [saving, setSaving] = useState(false);
  const [days, setDays] = useState([1, 4]);
  const [reminderTime, setReminderTime] = useState('19:00');
  const [quietStart, setQuietStart] = useState('21:00');
  const [quietEnd, setQuietEnd] = useState('08:00');

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    let cancelled = false;
    void (supabase as any).from('profiles')
      .select('reminder_enabled,reminder_days,reminder_time,quiet_hours_start,quiet_hours_end')
      .eq('id', userId).maybeSingle().then(({ data }: { data?: Record<string, unknown> }) => {
        if (cancelled || !data) return;
        setReminders(Boolean(data.reminder_enabled));
        if (Array.isArray(data.reminder_days)) setDays(data.reminder_days.filter((day): day is number => typeof day === 'number'));
        if (typeof data.reminder_time === 'string') setReminderTime(data.reminder_time.slice(0, 5));
        if (typeof data.quiet_hours_start === 'string') setQuietStart(data.quiet_hours_start.slice(0, 5));
        if (typeof data.quiet_hours_end === 'string') setQuietEnd(data.quiet_hours_end.slice(0, 5));
      });
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!reminders || dueReviewCount < 1 || !('Notification' in window) || Notification.permission !== 'granted') return;
    const now = new Date();
    const day = now.getDay() === 0 ? 7 : now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    const inQuietHours = quietStart <= quietEnd
      ? currentTime >= quietStart && currentTime < quietEnd
      : currentTime >= quietStart || currentTime < quietEnd;
    if (!days.includes(day) || inQuietHours || currentTime < reminderTime) return;
    const notificationKey = `dataentropy-reminder-${now.toISOString().slice(0, 10)}`;
    if (localStorage.getItem(notificationKey)) return;
    new Notification(t.notifTitle, { body: t.notifBody(num(dueReviewCount), dueReviewCount === 1) });
    localStorage.setItem(notificationKey, 'shown');
  }, [days, dueReviewCount, quietEnd, quietStart, reminderTime, reminders, t, num]);

  const toggleReminders = async (enabled: boolean) => {
    setSaving(true);
    try {
      if (enabled && 'Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
      const userId = session?.user?.id;
      if (userId) await (supabase as any).from('profiles').upsert({ id: userId, reminder_enabled: enabled, reminder_channel: 'browser', weekly_session_goal: consistency.goal, reminder_days: days, reminder_time: reminderTime, quiet_hours_start: quietStart, quiet_hours_end: quietEnd });
      setReminders(enabled);
      toast({ title: enabled ? t.enabled : t.paused, description: enabled ? t.enabledDesc : t.pausedDesc });
    } finally { setSaving(false); }
  };

  return (
    <motion.section initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}
      className="mb-6 overflow-hidden rounded-2xl border border-primary/15 bg-card shadow-card" aria-labelledby="weekly-rhythm-heading">
      <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="flex items-center gap-2"><CalendarRange className="h-5 w-5 text-primary" aria-hidden="true" /><h3 id="weekly-rhythm-heading" className="font-extrabold">{t.title}</h3></div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
          <div className="mt-4 flex items-center gap-3"><Progress className="h-2 flex-1" value={Math.min(100, consistency.completedSessions / consistency.goal * 100)} /><span className="text-sm font-bold tabular-nums">{num(consistency.completedSessions)}/{num(consistency.goal)}</span></div>
        </div>
        <div className="flex min-h-12 items-center gap-3 rounded-xl bg-secondary px-4 py-3">
          <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
          <div><Label htmlFor="due-reminders" className="text-sm font-bold">{t.remTitle}</Label><p className="text-xs text-muted-foreground">{t.remSub}</p></div>
          <Switch id="due-reminders" checked={reminders} disabled={saving} onCheckedChange={toggleReminders} aria-label={t.remAria} />
          {reminders && <Check className="h-4 w-4 text-success" aria-hidden="true" />}
        </div>
      </div>
      {reminders && <motion.div initial={reduceMotion ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="border-t bg-secondary/40 p-5"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_.7fr_1fr_auto] lg:items-end"><fieldset><legend className="text-sm font-bold">{t.days}</legend><div className="mt-2 flex flex-wrap gap-2">{t.dayLetters.map((label,index) => { const value = index + 1; return <button key={`${label}-${value}`} type="button" aria-pressed={days.includes(value)} onClick={() => setDays((current) => current.includes(value) ? current.filter((day) => day !== value) : [...current,value])} className={`grid h-11 w-11 place-items-center rounded-full border text-sm font-bold ${days.includes(value) ? 'border-primary bg-primary text-primary-foreground' : 'bg-card'}`}>{label}</button>; })}</div></fieldset><div><Label htmlFor="reminder-time">{t.time}</Label><input id="reminder-time" type="time" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} className="mt-2 min-h-11 w-full rounded-md border bg-card px-3" /></div><div><Label htmlFor="quiet-start">{t.quiet}</Label><div className="mt-2 flex items-center gap-2"><input id="quiet-start" aria-label={t.quietStart} type="time" value={quietStart} onChange={(event) => setQuietStart(event.target.value)} className="min-h-11 min-w-0 rounded-md border bg-card px-2" /><span>–</span><input aria-label={t.quietEnd} type="time" value={quietEnd} onChange={(event) => setQuietEnd(event.target.value)} className="min-h-11 min-w-0 rounded-md border bg-card px-2" /></div></div><Button variant="outline" className="min-h-11 rounded-full" disabled={saving || days.length === 0} onClick={() => toggleReminders(true)}><Clock3 className="mr-2 h-4 w-4" />{t.save}</Button></div></motion.div>}
    </motion.section>
  );
}
