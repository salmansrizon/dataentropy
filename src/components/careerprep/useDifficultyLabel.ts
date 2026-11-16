import { useLang } from '@/i18n/lang';

const BN: Record<string, string> = { easy: 'সহজ', medium: 'মাঝারি', hard: 'কঠিন' };

/** Display-only difficulty label; the underlying value stays English for logic/filters. */
export function useDifficultyLabel() {
  const { lang } = useLang();
  return (d?: string | null) => (lang === 'bn' && d ? BN[d.toLowerCase()] ?? d : d ?? '');
}
