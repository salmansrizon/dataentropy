export interface Category { id: string; name: string; slug?: string; parent_id?: string | null }

export interface Course {
  id: string; title: string; description: string; short_description?: string | null;
  banner_image: string | null; technologies?: string[]; price: number; is_free: boolean;
  duration_hours: number | null; difficulty_level?: string; discount_percentage?: number | null;
  discounted_price: number | null; category_id: string | null; start_date?: string;
  course_type?: string; student_count?: number | null;
}

export interface Webinar {
  id: string; title: string; description: string | null; webinar_date: string;
  banner_url: string | null; is_free: boolean | null; price: number | null;
  status: string | null; booked_count: number | null; content_blocks?: unknown;
}

export type Item =
  | { kind: "course"; id: string; title: string; desc: string; img: string | null; date?: string; price: number; free: boolean; c: Course }
  | { kind: "webinar"; id: string; title: string; desc: string; img: string | null; date: string; price: number; free: boolean; w: Webinar };

export const isFreeCourse = (c: Course) => c.is_free || (!c.price && !c.discounted_price);
export const isRecorded = (c: Course) => /record|self/i.test(c.course_type || "");
export const hasYouTube = (w: Webinar) =>
  Array.isArray(w.content_blocks) &&
  w.content_blocks.some((b: any) =>
    [b?.content?.videoUrl, b?.content?.video_url, b?.url, b?.video_url, b?.src, b?.href].some((u) => typeof u === "string" && /youtube\.com|youtu\.be/i.test(u)));
/** Sample ids have no real page; send them to the catalog. */
export const hrefFor = (kind: "course" | "webinar", id: string) =>
  id.startsWith("sample-") ? "/courses" : `/${kind}/${id}`;

export const toItems = (courses: Course[], webinars: Webinar[]): Item[] => [
  ...webinars.map((w): Item => ({ kind: "webinar", id: w.id, title: w.title, desc: w.description || "", img: w.banner_url, date: w.webinar_date, price: w.price || 0, free: !!w.is_free || !w.price, w })),
  ...courses.map((c): Item => ({ kind: "course", id: c.id, title: c.title, desc: c.short_description || c.description || "", img: c.banner_image, date: c.start_date, price: c.discounted_price || c.price || 0, free: isFreeCourse(c), c })),
];
