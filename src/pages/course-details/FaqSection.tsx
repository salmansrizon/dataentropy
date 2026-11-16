import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useT } from "@/i18n/lang";
import SectionShell from "./SectionShell";
import { SECTION_IDS, type Course } from "./types";

interface Props {
  course: Course;
  isFree: boolean;
}

const T = {
  en: {
    eyebrow: "FAQ", title: "Frequently asked questions",
    q1: "How long will I have access?", a1: "Access terms are confirmed before a paid enrollment is submitted.",
    q2: "Do I get a certificate?", a2: "The course page and enrollment confirmation state whether this course includes a certificate and what completion requires.",
    q3: "Is there any support?", a3: (c: string) => `Course support: ${c}`, a3d: "Contact details are supplied with your enrollment confirmation.",
    q4: "Are there prerequisites?", a4: "Basic computer literacy and a passion for learning are all you need!",
    q5: "Access on mobile?", a5: "Yes! Our platform is fully responsive. You can learn on any device anytime.",
    before: "Before you pay", verification: "Verification:", refunds: "Refunds:", support: "Support:",
    vDef: "Ask support for the current verification time before submitting.",
    rDef: "No refund policy has been published for this course; contact support before paying.",
    sDef: "Use the contact information in your enrollment confirmation.",
  },
  bn: {
    eyebrow: "প্রশ্নোত্তর", title: "সচরাচর জিজ্ঞাসা",
    q1: "কতদিন কোর্সটি অ্যাক্সেস করতে পারব?", a1: "পেইড এনরোলমেন্ট জমা দেওয়ার আগে অ্যাক্সেসের শর্তাবলি নিশ্চিত করা হয়।",
    q2: "সার্টিফিকেট পাব কি?", a2: "কোর্সে সার্টিফিকেট আছে কি না এবং সম্পন্ন করতে কী লাগবে, তা কোর্স পেজ ও এনরোলমেন্ট নিশ্চিতকরণে জানানো হয়।",
    q3: "সাপোর্ট পাওয়া যাবে কি?", a3: (c: string) => `কোর্স সাপোর্ট: ${c}`, a3d: "এনরোলমেন্ট নিশ্চিতকরণের সঙ্গে যোগাযোগের তথ্য দেওয়া হবে।",
    q4: "কোনো পূর্বশর্ত আছে কি?", a4: "প্রাথমিক কম্পিউটার জ্ঞান আর শেখার আগ্রহ থাকলেই যথেষ্ট!",
    q5: "মোবাইলে দেখা যাবে?", a5: "অবশ্যই! আমাদের প্ল্যাটফর্ম সব ডিভাইসে চলে। যেকোনো সময় যেকোনো ডিভাইসে শিখতে পারবেন।",
    before: "পেমেন্টের আগে জেনে নিন", verification: "যাচাই:", refunds: "রিফান্ড:", support: "সাপোর্ট:",
    vDef: "জমা দেওয়ার আগে বর্তমান যাচাইয়ের সময় সম্পর্কে সাপোর্টকে জিজ্ঞাসা করুন।",
    rDef: "এই কোর্সের জন্য কোনো রিফান্ড নীতি প্রকাশ করা হয়নি; পেমেন্টের আগে সাপোর্টের সঙ্গে যোগাযোগ করুন।",
    sDef: "এনরোলমেন্ট নিশ্চিতকরণে দেওয়া যোগাযোগের তথ্য ব্যবহার করুন।",
  },
};

export default function FaqSection({ course, isFree }: Props) {
  const t = useT(T);
  const faqs: any[] = course.faqs && course.faqs.length > 0 ? course.faqs : [
    { question: t.q1, answer: course.access_terms || t.a1 },
    { question: t.q2, answer: t.a2 },
    { question: t.q3, answer: course.support_contact ? t.a3(course.support_contact) : t.a3d },
    { question: t.q4, answer: t.a4 },
    { question: t.q5, answer: t.a5 }
  ];

  return (
    <SectionShell id={SECTION_IDS.faq} eyebrow={t.eyebrow} title={t.title}>
      <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-6 shadow-card">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-base font-bold">{faq.question || faq.q}</AccordionTrigger>
            <AccordionContent className="leading-relaxed text-muted-foreground">{faq.answer || faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {!isFree && (
        <div className="mt-6 space-y-2 rounded-2xl border border-border bg-secondary/60 p-6 text-sm shadow-card">
          <p className="font-bold">{t.before}</p>
          <p><span className="font-semibold">{t.verification}</span> {course.payment_verification_time || t.vDef}</p>
          <p><span className="font-semibold">{t.refunds}</span> {course.refund_policy || t.rDef}</p>
          <p><span className="font-semibold">{t.support}</span> {course.support_contact || t.sDef}</p>
        </div>
      )}
    </SectionShell>
  );
}
