/**
 * SAMPLE / PLACEHOLDER CONTENT — not real data.
 *
 * Used only as a fallback where the database has nothing yet, so the redesigned
 * pages can be previewed fully. Enabled in dev, or in a build with
 * VITE_SAMPLE_CONTENT=true. Production builds without the flag never show it,
 * so invented stats/testimonials are never presented to real visitors as real.
 *
 * ponytail: one static file; delete it (and the USE_SAMPLE checks) once real data exists.
 */
import type { Bi } from "@/i18n/lang";
import type { SalesPage } from "@/pages/course-details/salesPage";

export const USE_SAMPLE = import.meta.env.DEV || import.meta.env.VITE_SAMPLE_CONTENT === "true";

export const sampleStats: { value: number; suffix: string; label: Bi }[] = [
  { value: 12000, suffix: "+", label: { en: "Learners", bn: "শিক্ষার্থী" } },
  { value: 1500, suffix: "+", label: { en: "Job placements", bn: "চাকরিতে যোগদান" } },
  { value: 92, suffix: "%", label: { en: "Course completion", bn: "কোর্স সম্পন্নের হার" } },
];

export const sampleSocial = [
  { name: "YouTube", url: "https://www.youtube.com/" },
  { name: "LinkedIn", url: "https://www.linkedin.com/" },
  { name: "Facebook", url: "https://www.facebook.com/" },
  { name: "X", url: "https://x.com/" },
];

/** Landing hero/stats bar (design mock numbers). */
export const sampleLandingStats: { value: number; suffix: string; label: Bi; icon: "learners" | "hours" | "satisfaction" | "support" }[] = [
  { value: 10000, suffix: "+", label: { en: "Learners", bn: "শিক্ষার্থী" }, icon: "learners" },
  { value: 3000, suffix: "+", label: { en: "Hours of learning", bn: "ঘণ্টা লার্নিং" }, icon: "hours" },
  { value: 98, suffix: "%", label: { en: "Satisfied learners", bn: "সন্তুষ্ট শিক্ষার্থী" }, icon: "satisfaction" },
  { value: 100, suffix: "%", label: { en: "Career support", bn: "ক্যারিয়ার সাপোর্ট" }, icon: "support" },
];

/** Hero "watch video" target. null = button hidden (no real intro video yet). */
export const landingVideoUrl: string | null = null;

export const sampleCategories = [
  { id: "sample-data", name: { en: "Data Analytics", bn: "ডেটা অ্যানালিটিক্স" } },
  { id: "sample-ai", name: { en: "AI & Machine Learning", bn: "এআই ও মেশিন লার্নিং" } },
  { id: "sample-eng", name: { en: "Data Engineering", bn: "ডেটা ইঞ্জিনিয়ারিং" } },
];

export interface SampleCourse {
  id: string;
  category_id: string;
  title: string;
  short_description: string;
  banner_image: string | null;
  price: number;
  discounted_price: number | null;
  discount_percentage: number | null;
  is_free: boolean;
  difficulty_level: string;
  duration_hours: number;
  student_count: number;
  start_date: string;
  sales_page: SalesPage;
}

const inDays = (d: number) => new Date(Date.now() + d * 86400000).toISOString();

export const sampleCourses: SampleCourse[] = [
  { id: "sample-da-python", category_id: "sample-data", title: "Data Analytics with Python", short_description: "ডেটা থেকে insight বের করুন", banner_image: null, price: 6000, discounted_price: 3900, discount_percentage: 35, is_free: false, difficulty_level: "beginner", duration_hours: 32, student_count: 820, start_date: inDays(12), sales_page: { batch: { name: { en: "Batch 7", bn: "ব্যাচ ৭" }, seats_total: 60, seats_left: 14 } } },
  { id: "sample-powerbi", category_id: "sample-data", title: "Power BI Mastery", short_description: "Data Visualization এ হয়ে উঠুন Pro", banner_image: null, price: 7000, discounted_price: 4550, discount_percentage: 35, is_free: false, difficulty_level: "beginner", duration_hours: 48, student_count: 640, start_date: inDays(20), sales_page: { batch: { name: { en: "Batch 4", bn: "ব্যাচ ৪" }, seats_total: 50, seats_left: 22 } } },
  { id: "sample-ds-python", category_id: "sample-ai", title: "Python for Data Science", short_description: "Analytics & Machine Learning", banner_image: null, price: 9000, discounted_price: 5850, discount_percentage: 35, is_free: false, difficulty_level: "intermediate", duration_hours: 80, student_count: 410, start_date: inDays(27), sales_page: { batch: { name: { en: "Batch 3", bn: "ব্যাচ ৩" }, seats_total: 40, seats_left: 9 } } },
  { id: "sample-bi-sql", category_id: "sample-eng", title: "Business Intelligence with SQL", short_description: "Data-Driven Decision নিন", banner_image: null, price: 9500, discounted_price: null, discount_percentage: null, is_free: false, difficulty_level: "intermediate", duration_hours: 32, student_count: 230, start_date: inDays(34), sales_page: { batch: { name: { en: "Batch 2", bn: "ব্যাচ ২" }, seats_total: 40, seats_left: 25 } } },
];

export interface SampleWebinar {
  id: string;
  title: string;
  description: string;
  banner_url: string | null;
  webinar_date: string;
  booked_count: number;
  category_id: string;
}

export const sampleWebinars: SampleWebinar[] = [
  { id: "sample-w1", title: "SQL interview warm-up", description: "Solve 5 real interview questions live.", banner_url: null, webinar_date: inDays(3), booked_count: 146, category_id: "sample-data" },
  { id: "sample-w2", title: "Your first ML model in 60 minutes", description: "Train, evaluate and explain a model.", banner_url: null, webinar_date: inDays(6), booked_count: 98, category_id: "sample-ai" },
  { id: "sample-w3", title: "How data pipelines really work", description: "A tour of a production pipeline.", banner_url: null, webinar_date: inDays(9), booked_count: 61, category_id: "sample-eng" },
  { id: "sample-w4", title: "Dashboard storytelling", description: "Turn numbers into decisions.", banner_url: null, webinar_date: inDays(-7), booked_count: 210, category_id: "sample-data" },
  { id: "sample-w5", title: "Prompting for analysts", description: "Use LLMs safely in analysis work.", banner_url: null, webinar_date: inDays(-14), booked_count: 175, category_id: "sample-ai" },
];

export const sampleTestimonials = [
  { name: "Sample Learner A", role: { en: "Business Analyst", bn: "বিজনেস অ্যানালিস্ট" }, quote: { en: "DataEntropy prepared me properly for a Data Analytics career.", bn: "DataEntropy আমাকে Data Analytics-এ ক্যারিয়ারের জন্য সঠিক প্রস্তুতি দিয়েছে।" } },
  { name: "Sample Learner B", role: { en: "Data Analyst", bn: "ডেটা অ্যানালিস্ট" }, quote: { en: "The course content is great, and the mentorship even better.", bn: "কোর্সের কনটেন্ট দারুণ, আর মেন্টরশিপ আরও অসাধারণ।" } },
  { name: "Sample Learner C", role: { en: "BI Developer", bn: "বিআই ডেভেলপার" }, quote: { en: "Now I work confidently with Power BI.", bn: "এখন আমি আত্মবিশ্বাসের সাথে Power BI নিয়ে কাজ করতে পারছি।" } },
];

export const samplePartners = ["Sample Co", "Acme Analytics", "Northwind", "Contoso", "Globex"];

/** Full sales page so every course-page section can be previewed. */
export const sampleSalesPage: SalesPage = {
  batch: { name: { en: "Batch 7", bn: "ব্যাচ ৭" }, mode: { en: "Live course", bn: "লাইভ কোর্স" }, live_schedule: { en: "Sun & Tue, 9:00–10:30 PM", bn: "রবি ও মঙ্গল, রাত ৯:০০–১০:৩০" }, support_schedule: { en: "Daily, 3:00–4:00 PM", bn: "প্রতিদিন, বিকাল ৩:০০–৪:০০" }, seats_total: 60, seats_left: 14 },
  curriculum: {
    summary: { en: "12 weeks · 24 live classes", bn: "১২ সপ্তাহ · ২৪টি লাইভ ক্লাস" },
    phases: [
      { title: { en: "Foundations", bn: "ভিত্তি" }, weeks: [
        { label: { en: "Week 1", bn: "সপ্তাহ ১" }, title: { en: "SELECT, filtering and sorting", bn: "SELECT, ফিল্টারিং ও সর্টিং" }, goal: { en: "Read any single table confidently.", bn: "যেকোনো একটি টেবিল আত্মবিশ্বাসের সাথে পড়া।" }, live_classes: 2, quizzes: 1, assignments: 1, topics: ["SELECT", "WHERE", "ORDER BY"], projects: [] },
        { label: { en: "Week 2", bn: "সপ্তাহ ২" }, title: { en: "Joins and aggregation", bn: "জয়েন ও অ্যাগ্রিগেশন" }, live_classes: 2, quizzes: 1, assignments: 1, topics: ["JOIN", "GROUP BY", "HAVING"], projects: [{ en: "Sales summary report", bn: "সেলস সামারি রিপোর্ট" }] },
      ] },
      { title: { en: "Advanced analysis", bn: "অ্যাডভান্সড অ্যানালাইসিস" }, weeks: [
        { label: { en: "Week 3", bn: "সপ্তাহ ৩" }, title: { en: "Window functions and CTEs", bn: "উইন্ডো ফাংশন ও CTE" }, live_classes: 2, quizzes: 1, assignments: 2, topics: ["ROW_NUMBER", "LAG/LEAD", "WITH"], projects: [{ en: "Cohort retention analysis", bn: "কোহর্ট রিটেনশন অ্যানালাইসিস" }] },
      ] },
    ],
  },
  demo_classes: { videos: [], live_demo: { topic: { en: "SQL interview warm-up", bn: "SQL ইন্টারভিউ প্রস্তুতি" }, starts_at: inDays(3), instructor: { en: "Sample Instructor", bn: "স্যাম্পল ইন্সট্রাক্টর" } } },
  projects: [
    { title: { en: "E-commerce sales dashboard", bn: "ই-কমার্স সেলস ড্যাশবোর্ড" }, description: { en: "Revenue, cohorts and funnels from raw orders.", bn: "র অর্ডার থেকে রেভিনিউ, কোহর্ট ও ফানেল।" } },
    { title: { en: "Churn analysis", bn: "চার্ন অ্যানালাইসিস" }, description: { en: "Find who leaves and why.", bn: "কারা চলে যায় এবং কেন তা খুঁজে বের করা।" } },
  ],
  teaching_assistants: [{ name: "Sample TA", role: { en: "Teaching assistant", bn: "টিচিং অ্যাসিস্ট্যান্ট" } }],
  features: [
    { title: { en: "Live classes", bn: "লাইভ ক্লাস" }, icon: "video" },
    { title: { en: "Daily support", bn: "প্রতিদিন সাপোর্ট" }, icon: "life-buoy" },
    { title: { en: "Real projects", bn: "রিয়েল প্রজেক্ট" }, icon: "rocket" },
    { title: { en: "Progress tracking", bn: "প্রগ্রেস ট্র্যাকিং" }, icon: "chart" },
    { title: { en: "Community", bn: "কমিউনিটি" }, icon: "users" },
    { title: { en: "Certificate", bn: "সার্টিফিকেট" }, icon: "award" },
  ],
  career_support: [{ title: { en: "Interview readiness", bn: "ইন্টারভিউ প্রস্তুতি" }, items: [{ en: "Mock interviews", bn: "মক ইন্টারভিউ" }, { en: "CV review", bn: "সিভি রিভিউ" }] }],
  certificate: { points: [{ en: "Verifiable online", bn: "অনলাইনে যাচাইযোগ্য" }, { en: "Shareable on LinkedIn", bn: "লিংকডইনে শেয়ারযোগ্য" }] },
  success_stories: [{ name: "Sample Learner A", role: { en: "Data Analyst", bn: "ডেটা অ্যানালিস্ট" }, quote: { en: "This course got me my first analyst job.", bn: "এই কোর্স আমাকে প্রথম অ্যানালিস্ট চাকরি পেতে সাহায্য করেছে।" } }],
  payment_faq: [{ question: { en: "Which payment methods are accepted?", bn: "কোন কোন পেমেন্ট মাধ্যম গ্রহণ করা হয়?" }, answer: { en: "bKash and Nagad.", bn: "বিকাশ ও নগদ।" } }],
};
