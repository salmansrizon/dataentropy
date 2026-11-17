import type { SupabaseClient } from "@supabase/supabase-js";
import { COURSE_ACCESS_STATUSES } from "@/domain/courseEnrollment";
import { isFreeCourse } from "@/domain/coursePricing";
import type { Course, CourseContent, CourseReview, CourseSection, Instructor } from "./types";

export interface CoursePage {
  course: Course;
  /** Learner holds an enrollment with an access status (paid courses only). */
  paidAccess: boolean;
  sections: CourseSection[];
  instructor: Instructor | null;
  reviews: CourseReview[];
  related: Course[];
}

const OUTLINE_COLUMNS = "id,course_id,section_id,title,description,content_type,is_free,duration_minutes,topics,order_index";

/**
 * Everything the course page shows, in one call. Owns the access rule:
 * full lesson payloads (`content_data`) only reach free courses or entitled
 * learners; everyone else gets the outline plus free sample lessons.
 */
export async function loadCoursePage(db: SupabaseClient, courseId: string, userId: string | null): Promise<CoursePage> {
  const { data: course, error } = await db
    .from("courses")
    .select("*, category:course_categories(name)")
    .eq("id", courseId)
    .single();
  if (error) throw error;

  const free = isFreeCourse(course);
  let paidAccess = false;
  if (!free && userId) {
    const { data: enrollment, error: enrollmentError } = await db
      .from("course_enrollments")
      .select("id")
      .eq("course_id", courseId)
      .eq("user_id", userId)
      .in("status", [...COURSE_ACCESS_STATUSES])
      .maybeSingle();
    if (enrollmentError) throw enrollmentError;
    paidAccess = Boolean(enrollment);
  }

  const [content, sectionsResult, instructor, reviewsResult, related] = await Promise.all([
    free || paidAccess ? fullContent(db, courseId) : lockedContent(db, courseId),
    db.from("course_sections").select("*").eq("course_id", courseId).order("order_index"),
    loadInstructor(db, courseId, course.instructor_id),
    db.from("course_reviews").select("*").eq("course_id", courseId).eq("is_approved", true).order("created_at", { ascending: false }),
    loadRelated(db, course),
  ]);

  return {
    course,
    paidAccess,
    sections: groupIntoSections(sectionsResult.data ?? [], content),
    instructor,
    reviews: (reviewsResult.data ?? []) as CourseReview[],
    related,
  };
}

async function fullContent(db: SupabaseClient, courseId: string): Promise<CourseContent[]> {
  const { data, error } = await db.from("course_content").select("*").eq("course_id", courseId).order("order_index");
  if (error) throw error;
  return data ?? [];
}

async function lockedContent(db: SupabaseClient, courseId: string): Promise<CourseContent[]> {
  const [outline, samples] = await Promise.all([
    db.from("course_content_outline").select(OUTLINE_COLUMNS).eq("course_id", courseId).order("order_index"),
    db.from("course_content").select("*").eq("course_id", courseId).eq("is_free", true).order("order_index"),
  ]);
  let rows = outline.data ?? [];
  if (outline.error) {
    // Outline view not deployed: same columns straight from the table.
    const fallback = await db.from("course_content").select(OUTLINE_COLUMNS).eq("course_id", courseId).order("order_index");
    if (fallback.error) throw fallback.error;
    rows = fallback.data ?? [];
  }
  // Free samples replace their outline row so they carry content_data.
  return Array.from(new Map([...rows, ...(samples.data ?? [])].map((item) => [item.id, item])).values());
}

async function loadInstructor(db: SupabaseClient, courseId: string, instructorId: string | null): Promise<Instructor | null> {
  if (instructorId) {
    const { data } = await db.from("instructors").select("*").eq("id", instructorId).single();
    return data ?? null;
  }
  const { data } = await db.from("instructors").select("*").contains("assigned_courses", [courseId]);
  return data?.[0] ?? null;
}

async function loadRelated(db: SupabaseClient, course: Course): Promise<Course[]> {
  const [byCategory, byTech] = await Promise.all([
    db.from("courses").select("*").eq("category_id", course.category_id).neq("id", course.id).limit(6),
    db.from("courses").select("*").overlaps("technologies", course.technologies || []).neq("id", course.id).limit(6),
  ]);
  const unique = Array.from(new Map([...(byCategory.data ?? []), ...(byTech.data ?? [])].map((c) => [c.id, c])).values())
    .filter((c) => c.id !== course.id)
    .slice(0, 3);
  if (unique.length) return unique;
  const { data } = await db.from("courses").select("*").neq("id", course.id).limit(3);
  return data ?? [];
}

function groupIntoSections(sectionRows: CourseSection[], content: CourseContent[]): CourseSection[] {
  const byId = new Map(sectionRows.map((s) => [s.id, { ...s, contents: [] as CourseContent[] }]));
  const loose: CourseContent[] = [];
  for (const item of content) {
    const section = (item as CourseContent & { section_id?: string | null }).section_id;
    if (section && byId.has(section)) byId.get(section)!.contents.push(item);
    else loose.push(item);
  }
  const sections: CourseSection[] = Array.from(byId.values());
  if (loose.length) {
    sections.push({
      id: "uncategorized",
      title: sections.length ? "Additional Materials" : "Course Modules",
      order_index: 999,
      contents: loose,
    });
  }
  return sections;
}
