import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Search, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useT } from "@/i18n/lang";
import { USE_SAMPLE, sampleCourses } from "@/content/sampleContent";

const T = {
  en: {
    label: "Search courses", placeholder: "Search a course — SQL, Python, analytics…", popular: "Popular courses",
    results: "Courses", none: "No course found", loading: "Searching…", all: (q: string) => `See all results for “${q}”`, browse: "Browse all courses",
  },
  bn: {
    label: "কোর্স খুঁজুন", placeholder: "কোর্স খুঁজুন — SQL, Python, অ্যানালিটিক্স…", popular: "জনপ্রিয় কোর্স",
    results: "কোর্স", none: "কোনো কোর্স পাওয়া যায়নি", loading: "খোঁজা হচ্ছে…", all: (q: string) => `“${q}” এর সব ফলাফল দেখুন`, browse: "সব কোর্স দেখুন",
  },
};

interface Hit { id: string; title: string; short_description: string | null }

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
// PostgREST `or()` uses , ( ) as syntax — strip them (and %/_) from user input.
const clean = (q: string) => q.replace(/[,()%_\\]/g, " ").trim().slice(0, 80);

/** Course-only command palette: live results from published courses, ↑↓ + Enter to open. */
function CoursePalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const t = useT(T);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const query = clean(q);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    const timer = window.setTimeout(() => {
      let req = supabase.from("courses").select("id,title,short_description").eq("status", "published").limit(8);
      req = query.length >= 2
        ? req.or(`title.ilike.%${query}%,short_description.ilike.%${query}%`)
        : req.order("student_count", { ascending: false, nullsFirst: false });
      void req.then(
        ({ data, error }) => {
          if (!alive) return;
          let rows = (error ? [] : data ?? []) as Hit[];
          if (!rows.length && USE_SAMPLE) {
            const needle = query.toLowerCase();
            rows = sampleCourses
              .filter((c) => !needle || `${c.title} ${c.short_description}`.toLowerCase().includes(needle))
              .slice(0, 8);
          }
          setHits(rows);
          setLoading(false);
        },
        () => { if (alive) { setHits([]); setLoading(false); } },
      );
    }, query ? 220 : 0);
    return () => { alive = false; window.clearTimeout(timer); };
  }, [open, query]);

  const go = (path: string) => { onOpenChange(false); setQ(""); navigate(path); };
  const hrefFor = (h: Hit) => (h.id.startsWith("sample-") ? `/courses?q=${encodeURIComponent(h.title)}` : `/course/${h.id}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[18%] max-w-xl translate-y-0 overflow-hidden rounded-2xl p-0 shadow-pop">
        <DialogTitle className="sr-only">{t.label}</DialogTitle>
        <Command shouldFilter={false} className="[&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-14 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-3">
          <CommandInput value={q} onValueChange={setQ} placeholder={t.placeholder} className="outline-none focus-visible:outline-none focus-visible:ring-0" />
          <CommandList className="max-h-[60vh]">
            {!loading && <CommandEmpty>{t.none}</CommandEmpty>}
            {loading && hits.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">{t.loading}</p>}
            {hits.length > 0 && (
              <CommandGroup heading={query.length >= 2 ? t.results : t.popular}>
                {hits.map((h) => (
                  <CommandItem key={h.id} value={h.id} onSelect={() => go(hrefFor(h))} className="gap-3 rounded-xl">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      {query.length >= 2 ? <BookOpen className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-foreground">{h.title}</span>
                      {h.short_description && <span className="block truncate text-xs text-muted-foreground">{h.short_description}</span>}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandGroup>
              <CommandItem value="__all__" onSelect={() => go(query ? `/courses?q=${encodeURIComponent(query)}` : "/courses")} className="gap-3 rounded-xl text-primary">
                <ArrowRight className="h-4 w-4" />
                <span className="font-semibold">{query ? t.all(query) : t.browse}</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

/** Open the palette with ⌘K / Ctrl+K from anywhere. */
function usePaletteShortcut(setOpen: (fn: (v: boolean) => boolean) => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);
}

/** Desktop topbar: pill search field (icon + label + ⌘K) that opens the palette. */
export function CourseSearchButton() {
  const t = useT(T);
  const [open, setOpen] = useState(false);
  usePaletteShortcut(setOpen);
  return (
    <>
      <button
        type="button"
        aria-label={t.label}
        aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
        onClick={() => setOpen(true)}
        className="relative flex h-10 w-56 cursor-text items-center rounded-full border border-border bg-secondary/60 pl-10 pr-3 text-left text-sm text-muted-foreground transition hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 2xl:w-64"
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" aria-hidden="true" />
        <span className="truncate">{t.label}</span>
        <kbd className="ml-auto shrink-0 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-semibold">{isMac ? "⌘K" : "Ctrl K"}</kbd>
      </button>
      <CoursePalette open={open} onOpenChange={setOpen} />
    </>
  );
}

/** Mobile menu: full-width pill that opens the same palette. */
export function CourseSearchInline({ onDone }: { onDone?: () => void }) {
  const t = useT(T);
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex h-11 w-full items-center rounded-full border border-border bg-secondary/60 pl-11 pr-4 text-left text-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" aria-hidden="true" />
        {t.label}
      </button>
      <CoursePalette open={open} onOpenChange={(v) => { setOpen(v); if (!v) onDone?.(); }} />
    </>
  );
}
