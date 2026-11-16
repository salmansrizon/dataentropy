export interface CourseContent {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  content_data: any;
  is_free: boolean;
  duration_minutes?: number;
  topics?: string[];
  order_index: number;
}

export interface CourseSection {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  contents?: CourseContent[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  banner_image?: string;
  price?: number;
  discounted_price?: number;
  discount_percentage?: number;
  is_free: boolean;
  difficulty_level?: string;
  duration_hours?: number;
  learning_outcomes?: string[];
  requirements?: string[];
  target_audience?: string[];
  technologies: string[];
  category?: { name: string } | null;
  category_id?: string | null;
  rating?: number;
  student_count?: number;
  sections?: CourseSection[];
  start_date?: string;
  updated_at?: string;
  video_url?: string | null;
  faqs?: { question: string; answer: string }[];
  what_you_will_learn?: { title: string; description: string }[];
  course_includes?: string[] | null;
  course_type?: string;
  created_at?: string;
  access_terms?: string | null;
  refund_policy?: string | null;
  payment_verification_time?: string | null;
  support_contact?: string | null;
  sales_page?: unknown;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  bio?: string;
  specialization?: string;
  avatar_url?: string;
  website?: string;
  linkedin_url?: string;
}

export interface CourseReview {
  id: string;
  student_name: string;
  rating: number;
  review_text?: string;
  created_at: string;
}

/** Section anchor ids shared by JumpNav and the section components. */
export const SECTION_IDS = {
  overview: "overview",
  curriculum: "curriculum",
  instructor: "instructor",
  reviews: "reviews",
  faq: "faq",
  projects: "projects",
  demo: "demo",
  career: "career",
  certificate: "certificate",
} as const;
