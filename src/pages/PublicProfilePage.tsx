import { Link, useParams } from 'react-router-dom';
import { RowSkeleton } from '@/components/ui/skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Zap, Trophy, ShieldCheck, Lock, Loader2, Link2, CheckCircle2 } from 'lucide-react';
import { usePublicProfile } from '@/hooks/useProfile';
import { levelFor, streakFrom } from '@/lib/levels';
import { useLang, useT } from '@/i18n/lang';
import { Reveal, RevealGroup, RevealItem } from '@/pages/course-details/motion';

const T = {
  en: {
    solvedTitle: (day: string, n: string) => `${day}: ${n} solved`,
    noProfile: 'No such profile', unclaimed: 'Nobody has claimed',
    priv: 'This profile is private',
    privBody: 'Certificates issued to this learner can still be verified directly with their credential link.',
    joined: 'joined', copy: 'Copy link', level: 'Level', xp: 'XP', longest: 'longest',
    solves: (n: string) => `${n} solves in the last 6 months`,
    issued: 'Issued', verify: 'Verify credential', solved: 'Solved', never: 'Submitted solutions are never shown publicly.',
    Easy: 'Easy', Medium: 'Medium', Hard: 'Hard',
  },
  bn: {
    solvedTitle: (day: string, n: string) => `${day}: ${n}টি সমাধান`,
    noProfile: 'এমন কোনো প্রোফাইল নেই', unclaimed: 'এই ইউজারনেম কেউ নেয়নি:',
    priv: 'এই প্রোফাইল প্রাইভেট',
    privBody: 'এই লার্নারকে দেওয়া সার্টিফিকেট তাদের সনদ লিংক দিয়ে সরাসরি যাচাই করা যায়।',
    joined: 'যোগ দিয়েছেন', copy: 'লিংক কপি', level: 'লেভেল', xp: 'XP', longest: 'সর্বোচ্চ',
    solves: (n: string) => `গত ৬ মাসে ${n}টি সমাধান`,
    issued: 'ইস্যু হয়েছে', verify: 'সনদ যাচাই করুন', solved: 'সমাধান করা', never: 'জমা দেওয়া সমাধান কখনো সবার সামনে দেখানো হয় না।',
    Easy: 'সহজ', Medium: 'মাঝারি', Hard: 'কঠিন',
  },
};

/**
 * `/u/:username` — the public profile.
 *
 * The bar this is designed against: does it read as credible to a hiring manager
 * who has never heard of this site? So it shows solved question *titles* and
 * verifiable certificates, and never submitted code, email or phone.
 */

const difficultyTone: Record<string, string> = {
  Easy: 'bg-success-soft text-success-strong',
  Medium: 'bg-warning-soft text-warning',
  Hard: 'bg-danger-soft text-danger',
};

const ContributionCalendar = ({ dates, timeZone }: { dates: string[]; timeZone: string }) => {
  const t = useT(T);
  const { num } = useLang();
  const dayKey = (d: Date) =>
    new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

  const counts = new Map<string, number>();
  for (const d of dates) {
    const k = dayKey(new Date(d));
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  const weeks = 26;
  const today = new Date();
  const cells: { key: string; n: number }[] = [];
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    cells.push({ key: k, n: counts.get(k) ?? 0 });
  }

  return (
    <div className="flex gap-[3px] overflow-x-auto pb-1">
      {Array.from({ length: weeks }, (_, w) => (
        <div key={w} className="flex flex-col gap-[3px]">
          {cells.slice(w * 7, w * 7 + 7).map((c) => (
            <div
              key={c.key}
              title={t.solvedTitle(c.key, num(c.n))}
              className={`h-[10px] w-[10px] rounded-[2px] ${
                c.n > 3 ? 'bg-success' : c.n > 1 ? 'bg-success/60' : c.n > 0 ? 'bg-success/30' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const PublicProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { profile, loading } = usePublicProfile(username);
  const t = useT(T);
  const { num, date } = useLang();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 pt-32">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="mt-8"><RowSkeleton count={4} /></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-md px-4 pb-20 pt-32 text-center">
          <h1 className="text-xl font-bold">{t.noProfile}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.unclaimed} <span className="font-mono">{username}</span>.
          </p>
        </div>
      </div>
    );
  }

  if (!profile.is_public) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-md px-4 pb-20 pt-32 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-muted">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-xl font-bold">{t.priv}</h1>
          <p className="text-sm text-muted-foreground">
            {t.privBody}
          </p>
        </div>
      </div>
    );
  }

  const dates = profile.solve_dates ?? [];
  const tz = 'Asia/Dhaka';
  const { current, longest } = streakFrom(dates, tz);
  const standing = levelFor(profile.xp ?? 0);
  const solved = profile.solved ?? [];
  const certificates = profile.certificates ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-3xl space-y-6 px-4 pb-20 pt-28">
        <Reveal className="page-heading flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">{profile.display_name}</h1>
            <p className="text-muted-foreground">
              /u/{profile.username}
              {profile.joined_at && ` · ${t.joined} ${date(profile.joined_at, { month: 'long', year: 'numeric' })}`}
            </p>
          </div>
          <Button
            variant="outline" size="sm" className="gap-1.5 rounded-full"
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
          >
            <Link2 className="h-3.5 w-3.5" /> {t.copy}
          </Button>
        </Reveal>

        <RevealGroup className="flex flex-wrap gap-3">
          <RevealItem className="min-w-[130px] flex-1"><Card className="h-full transition hover:-translate-y-1 motion-reduce:transform-none">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{num(standing.level)}</p>
              <p className="text-xs text-muted-foreground">{standing.name ?? t.level}</p>
            </CardContent>
          </Card></RevealItem>
          <RevealItem className="min-w-[130px] flex-1"><Card className="h-full transition hover:-translate-y-1 motion-reduce:transform-none">
            <CardContent className="p-4">
              <p className="inline-flex items-center gap-1.5 text-2xl font-bold">
                <Zap className="h-5 w-5 text-primary" />{num(profile.xp ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground">{t.xp}</p>
            </CardContent>
          </Card></RevealItem>
          <RevealItem className="min-w-[130px] flex-1"><Card className="h-full transition hover:-translate-y-1 motion-reduce:transform-none">
            <CardContent className="p-4">
              <p className="inline-flex items-center gap-1.5 text-2xl font-bold">
                <Flame className="h-5 w-5 text-warning" />{num(current)}
              </p>
              <p className="text-xs text-muted-foreground">{t.longest} {num(longest)}</p>
            </CardContent>
          </Card></RevealItem>
        </RevealGroup>

        <Card>
          <CardContent className="p-5">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {t.solves(num(dates.length))}
            </p>
            <ContributionCalendar dates={dates} timeZone={tz} />
          </CardContent>
        </Card>

        {certificates.map((c) => (
          <Reveal key={c.id}>
          <Card className="border-success/30">
            <CardContent className="flex items-start gap-3 p-5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{c.title}</p>
                <p className="mb-2 text-sm text-muted-foreground">
                  {t.issued} {date(c.issued_at)}
                </p>
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link to={`/verify/${c.id}`}>{t.verify}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          </Reveal>
        ))}

        {solved.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
              {t.solved}
            </h2>
            <RevealGroup className="space-y-2">
              {solved.slice(0, 20).map((s, i) => (
                <RevealItem key={`${s.title}-${i}`} className="flex items-center gap-3 rounded-xl border p-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  <span className="min-w-0 flex-1 truncate">{s.title}</span>
                  <Badge className={`${difficultyTone[s.difficulty] ?? ''} border-0 text-[10px]`}>
                    {t[s.difficulty as 'Easy' | 'Medium' | 'Hard'] ?? s.difficulty}
                  </Badge>
                  <Badge variant="outline" className="hidden text-[10px] sm:inline-flex">{s.industry}</Badge>
                </RevealItem>
              ))}
            </RevealGroup>
            <p className="mt-3 text-xs text-muted-foreground">
              {t.never}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfilePage;
