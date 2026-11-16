import { useMemo, useSyncExternalStore } from "react";

export type Lang = "en" | "bn";
/** Bilingual text from data: plain string (any language) or { en, bn }. */
export type Bi = string | { en?: string; bn?: string };

const KEY = "de-lang";
const subs = new Set<() => void>();

const read = (): Lang => {
  try {
    // Bangla is the default; English only when the visitor chose it.
    return localStorage.getItem(KEY) === "en" ? "en" : "bn";
  } catch {
    return "bn";
  }
};

let current: Lang = typeof window === "undefined" ? "bn" : read();
const apply = () => {
  if (typeof document !== "undefined") document.documentElement.lang = current;
};
apply();

export function setLang(lang: Lang) {
  current = lang;
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    /* private mode: keep in memory only */
  }
  apply();
  subs.forEach((fn) => fn());
}

const subscribe = (fn: () => void) => {
  subs.add(fn);
  return () => void subs.delete(fn);
};

export function pickText(value: Bi | null | undefined, lang: Lang): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.en || value.bn || "";
}

export function formatNumber(n: number, lang: Lang): string {
  return new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-US").format(n);
}

export function formatDate(iso: string, lang: Lang, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", opts);
}

export function useLang() {
  const lang = useSyncExternalStore(subscribe, () => current, () => "bn" as Lang);
  return {
    lang,
    setLang,
    pick: (value: Bi | null | undefined) => pickText(value, lang),
    num: (n: number) => formatNumber(n, lang),
    date: (iso: string, opts?: Intl.DateTimeFormatOptions) => formatDate(iso, lang, opts),
  };
}

/**
 * Component-local dictionaries: `const T = { en: {...}, bn: {...} }` then `const t = useT(T)`.
 * Missing bn keys fall back to en.
 */
export function useT<T extends Record<string, unknown>>(dict: { en: T; bn: Partial<T> }): T {
  const { lang } = useLang();
  // Stable per language so `t` is safe in hook deps.
  return useMemo(() => (lang === "bn" ? { ...dict.en, ...dict.bn } : dict.en), [lang, dict]);
}
