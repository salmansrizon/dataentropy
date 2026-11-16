import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { UserRound, ExternalLink } from 'lucide-react';
import { useOwnProfile } from '@/hooks/useProfile';
import { useT } from '@/i18n/lang';

const T = {
  en: {
    public: 'Public', view: 'View',
    badUsername: '3–24 characters: lowercase letters, numbers and hyphens.',
    taken: 'That username is taken.', couldNot: 'Could not save that.',
    title: 'Claim your public profile',
    desc: 'Your solves and certificates get a shareable page. Certificates are issued in this name.',
    username: 'username', displayName: 'Display name (optional)', claim: 'Claim',
  },
  bn: {
    public: 'পাবলিক', view: 'দেখুন',
    badUsername: '৩–২৪ অক্ষর: ইংরেজি ছোট হাতের অক্ষর, সংখ্যা ও হাইফেন।',
    taken: 'এই ইউজারনেমটি আগেই নেওয়া হয়েছে।', couldNot: 'সংরক্ষণ করা যায়নি।',
    title: 'আপনার পাবলিক প্রোফাইল তৈরি করুন',
    desc: 'আপনার সমাধান ও সার্টিফিকেট শেয়ার করার মতো একটি পেজ পাবে। সার্টিফিকেট এই নামেই দেওয়া হবে।',
    username: 'ইউজারনেম', displayName: 'প্রদর্শিত নাম (ঐচ্ছিক)', claim: 'তৈরি করুন',
  },
};

/**
 * Claiming a public profile.
 *
 * Certificates are issued in the name on the profile, so without this a
 * credential reads "Career Prep learner". Public by default, because the profile
 * is an acquisition surface — but the toggle is right there, not buried.
 */
const USERNAME_RE = /^[a-z0-9][a-z0-9-]{2,23}$/;

const ClaimProfileCard = () => {
  const t = useT(T);
  const { profile, save } = useOwnProfile();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (profile?.username) {
    return (
      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted">
            <UserRound className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">{profile.display_name || profile.username}</p>
            <p className="truncate text-xs text-muted-foreground">/u/{profile.username}</p>
          </div>

          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            {t.public}
            <Switch
              checked={profile.is_public}
              onCheckedChange={(v) => save.mutate({ is_public: v })}
            />
          </label>

          <Button asChild size="sm" variant="outline" className="gap-1.5 rounded-full">
            <Link to={`/u/${profile.username}`}>
              {t.view} <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const claim = () => {
    const u = username.trim().toLowerCase();
    if (!USERNAME_RE.test(u)) {
      setError(t.badUsername);
      return;
    }
    save.mutate(
      { username: u, display_name: displayName.trim() || u, is_public: true },
      {
        onError: (e: any) =>
          setError(
            e?.code === '23505' ? t.taken : e?.message ?? t.couldNot,
          ),
      },
    );
  };

  return (
    <Card className="mb-6 border-dashed">
      <CardContent className="p-4">
        <p className="mb-1 text-sm font-bold">{t.title}</p>
        <p className="mb-3 text-xs text-muted-foreground">
          {t.desc}
        </p>
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input
            placeholder={t.username}
            className="h-9"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(null); }}
          />
          <Input
            placeholder={t.displayName}
            className="h-9"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Button size="sm" className="h-9 rounded-full" disabled={save.isPending} onClick={claim}>
            {t.claim}
          </Button>
        </div>
        {error && <p className="mt-2 text-[11px] text-danger">{error}</p>}
      </CardContent>
    </Card>
  );
};

export default ClaimProfileCard;
