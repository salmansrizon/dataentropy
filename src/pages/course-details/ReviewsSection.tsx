import { useState } from "react";
import { Send, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLang, useT } from "@/i18n/lang";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SectionShell from "./SectionShell";
import { CountUp, RevealGroup, RevealItem } from "./motion";
import { SECTION_IDS, type CourseReview } from "./types";

interface Props {
  courseId: string;
  reviews: CourseReview[];
  reviewAverage: number | null;
}

const T = {
  en: {
    eyebrow: "Reviews", title: "What learners say", none: "No learner reviews yet",
    count: (one: boolean): string => (one ? "review" : "reviews"), showFewer: "Show fewer reviews", showAll: (n: string) => `Show all ${n} reviews`,
    write: "Write a review", name: "Your name", email: "Email", notPublished: "(not published)", rating: "Rating",
    star: (n: number) => `${n} star${n === 1 ? "" : "s"}`, outOf: (n: number) => `${n} out of 5 stars`,
    changed: "What changed for you?", placeholder: "Share a specific outcome or useful part of the course", submit: "Submit Review",
    error: "Error", missing: "Required fields missing", submitted: "Submitted!",
  },
  bn: {
    eyebrow: "রিভিউ", title: "শিক্ষার্থীরা যা বলছেন", none: "এখনও কোনো রিভিউ নেই",
    count: () => "টি রিভিউ", showFewer: "কম রিভিউ দেখান", showAll: (n: string) => `সব ${n}টি রিভিউ দেখুন`,
    write: "রিভিউ লিখুন", name: "আপনার নাম", email: "ইমেইল", notPublished: "(প্রকাশ করা হবে না)", rating: "রেটিং",
    star: (n: number) => `${n} স্টার`, outOf: (n: number) => `৫ স্টারের মধ্যে ${n}`,
    changed: "আপনার কী পরিবর্তন হয়েছে?", placeholder: "কোর্সের কোনো নির্দিষ্ট ফলাফল বা কাজের অংশ শেয়ার করুন", submit: "রিভিউ জমা দিন",
    error: "ত্রুটি", missing: "প্রয়োজনীয় ঘরগুলো পূরণ করুন", submitted: "জমা হয়েছে!",
  },
};

const Stars = ({ value, className = "h-4 w-4" }: { value: number; className?: string }) => (
  <span className="inline-flex gap-0.5" aria-hidden="true">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`${className} ${n <= Math.round(value) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
    ))}
  </span>
);

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

export default function ReviewsSection({ courseId, reviews, reviewAverage }: Props) {
  const { toast } = useToast();
  const t = useT(T);
  const { num, date } = useLang();
  const [reviewData, setReviewData] = useState({ student_name: "", student_email: "", rating: 5, review_text: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const visible = showAll ? reviews : reviews.slice(0, 6);

  return (
    <SectionShell id={SECTION_IDS.reviews} eyebrow={t.eyebrow} title={t.title}>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {reviewAverage !== null && reviews.length > 0 ? (
          <>
            <span className="text-4xl font-black text-foreground">{reviewAverage.toFixed(1)}</span>
            <Stars value={reviewAverage} className="h-5 w-5" />
            <span className="text-sm text-muted-foreground"><CountUp value={reviews.length} format={num} /> {t.count(reviews.length === 1)}</span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">{t.none}</span>
        )}
      </div>

      {reviews.length > 0 && (
        <RevealGroup className="grid gap-4 sm:grid-cols-2">
          {visible.map((r) => (
            <RevealItem key={r.id}><div className="h-full rounded-2xl border border-border bg-card p-5 shadow-card transition duration-200 hover:-translate-y-1">
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-blue/10 text-sm font-bold text-brand-blue">{initials(r.student_name)}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{r.student_name}</p>
                  <Stars value={r.rating} />
                  <span className="sr-only">{t.outOf(r.rating)}</span>
                </div>
              </div>
              {r.review_text && <p className="text-sm leading-relaxed text-muted-foreground">{r.review_text}</p>}
              <p className="mt-3 text-xs text-muted-foreground">{date(r.created_at)}</p>
            </div></RevealItem>
          ))}
        </RevealGroup>
      )}
      {reviews.length > 6 && (
        <Button variant="outline" className="mt-4" onClick={() => setShowAll((v) => !v)}>
          {showAll ? t.showFewer : t.showAll(num(reviews.length))}
        </Button>
      )}

      <div className="mt-8">
        <Button variant="outline" onClick={() => setFormOpen((v) => !v)} aria-expanded={formOpen} aria-controls="review-form">
          <Send className="mr-2 h-4 w-4" /> {t.write}
        </Button>
        {formOpen && (
          <div id="review-form" className="mt-4 rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label htmlFor="review-name" className="mb-2 block text-sm font-semibold">{t.name}</label><Input id="review-name" autoComplete="name" value={reviewData.student_name} onChange={(e) => setReviewData(p => ({...p, student_name: e.target.value}))} /></div>
                <div><label htmlFor="review-email" className="mb-2 block text-sm font-semibold">{t.email} <span className="font-normal text-muted-foreground">{t.notPublished}</span></label><Input id="review-email" type="email" autoComplete="email" value={reviewData.student_email} onChange={(e) => setReviewData(p => ({...p, student_email: e.target.value}))} /></div>
              </div>
              <fieldset><legend className="mb-2 text-sm font-semibold">{t.rating}</legend><div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" className="grid h-11 w-11 place-items-center rounded-lg border border-border hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setReviewData(p => ({ ...p, rating }))} aria-label={t.star(rating)} aria-pressed={reviewData.rating === rating}><Star className={`h-5 w-5 ${rating <= reviewData.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} aria-hidden="true" /></button>)}
              </div></fieldset>
              <div><label htmlFor="review-text" className="mb-2 block text-sm font-semibold">{t.changed}</label><Textarea id="review-text" value={reviewData.review_text} onChange={(e) => setReviewData(p => ({...p, review_text: e.target.value}))} placeholder={t.placeholder} rows={3} /></div>
              <Button onClick={async () => {
                if (!reviewData.student_name || !reviewData.student_email) { toast({ title: t.error, description: t.missing, variant: "destructive" }); return; }
                setSubmittingReview(true);
                try {
                  const { error } = await (supabase.from("course_reviews" as any).insert({ course_id: courseId, student_name: reviewData.student_name, student_email: reviewData.student_email, rating: reviewData.rating, review_text: reviewData.review_text }) as any);
                  if (error) throw error;
                  toast({ title: t.submitted });
                  setReviewData({ student_name: "", student_email: "", rating: 5, review_text: "" });
                } catch (err: any) { toast({ title: t.error, variant: "destructive" }); } finally { setSubmittingReview(false); }
              }} disabled={submittingReview}>{t.submit}</Button>
            </div>
          </div>
        )}
      </div>
    </SectionShell>
  );
}
