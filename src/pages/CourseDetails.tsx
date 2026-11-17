import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageView } from "@/hooks/usePageView";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import PaymentModal, { PaymentModalData } from "@/components/PaymentModal";
import { Skeleton } from "@/components/ui/skeleton";
import { track } from "@/services/funnel";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { useAuth } from "@/contexts/AuthContext";
import { isFreeCourse as isFreeCoursePricing, priceCourse } from "@/domain/coursePricing";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadCoursePage } from "./course-details/loadCoursePage";
import type { Course, CourseContent, CourseReview, CourseSection, Instructor } from "./course-details/types";
import { SECTION_IDS } from "./course-details/types";
import CourseHero from "./course-details/CourseHero";
import { PriceCard, MobileEnrollBar } from "./course-details/PriceCard";
import JumpNav from "./course-details/JumpNav";
import SectionShell from "./course-details/SectionShell";
import LessonPlayer from "./course-details/LessonPlayer";
import OverviewSection from "./course-details/OverviewSection";
import InstructorSection from "./course-details/InstructorSection";
import TechRequirementsSection from "./course-details/TechRequirementsSection";
import ReviewsSection from "./course-details/ReviewsSection";
import FaqSection from "./course-details/FaqSection";
import FinalCta from "./course-details/FinalCta";
import RelatedCourses from "./course-details/RelatedCourses";
import PromoBar from "./course-details/PromoBar";
import BatchCard from "./course-details/BatchCard";
import WeeklyCurriculum from "./course-details/WeeklyCurriculum";
import DemoClasses from "./course-details/DemoClasses";
import ProjectsSection from "./course-details/ProjectsSection";
import TeamSection from "./course-details/TeamSection";
import FeatureGrid from "./course-details/FeatureGrid";
import CareerSupport from "./course-details/CareerSupport";
import CertificateSection from "./course-details/CertificateSection";
import SuccessStories from "./course-details/SuccessStories";
import PaymentFaq from "./course-details/PaymentFaq";
import CommunityContact from "./course-details/CommunityContact";
import PrerequisiteVideos from "./course-details/PrerequisiteVideos";
import { parseSalesPage, type CoursePromo } from "./course-details/salesPage";
import { useT } from "@/i18n/lang";
import { USE_SAMPLE, sampleSalesPage } from "@/content/sampleContent";

const T = {
  en: {
    overview: 'Overview', curriculum: 'Curriculum', instructor: 'Instructor', projects: 'Projects', reviews: 'Reviews', faq: 'FAQ',
    startFree: 'Start for free', enroll: 'Enroll now', continueLearning: 'Continue learning',
    lessonsComplete: (c: number, t: number) => `${c}/${t} lessons complete`,
    continueCourse: (c: number, t: number) => `Continue course · ${c}/${t}`, startFirst: 'Start first lesson',
    curriculumTitle: (s: number, l: number) => `${s} sections · ${l} lessons`, notFound: 'Course not found.',
  },
  bn: {
    overview: 'সারসংক্ষেপ', curriculum: 'কারিকুলাম', instructor: 'ইন্সট্রাক্টর', projects: 'প্রজেক্ট', reviews: 'রিভিউ', faq: 'প্রশ্নোত্তর',
    startFree: 'ফ্রিতে শুরু করুন', enroll: 'এখনই ভর্তি হন', continueLearning: 'শেখা চালিয়ে যান',
    lessonsComplete: (c: number, t: number) => `${t}টি লেসনের মধ্যে ${c}টি সম্পন্ন`,
    continueCourse: (c: number, t: number) => `কোর্স চালিয়ে যান · ${c}/${t}`, startFirst: 'প্রথম লেসন শুরু করুন',
    curriculumTitle: (s: number, l: number) => `${s}টি সেকশন · ${l}টি লেসন`, notFound: 'কোর্সটি পাওয়া যায়নি।',
  },
};

export default function CourseDetails() {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  usePageView(`/course/${courseId}`);
  const { toast } = useToast();
  const { session } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);

  // Enrollment Modal state
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [openLesson, setOpenLesson] = useState<string>(() => searchParams.get('lesson') ?? '');
  const orderedContentIds = sections.flatMap((section) => section.contents ?? []).map((content) => content.id);
  const courseProgress = useCourseProgress(courseId, orderedContentIds);
  const [freeUnlocked, setFreeUnlocked] = useState(false);
  const [paidUnlocked, setPaidUnlocked] = useState(false);
  useEffect(() => {
    if (courseProgress.resumeContentId && !openLesson) setOpenLesson(courseProgress.resumeContentId);
  }, [courseProgress.resumeContentId, openLesson]);

  // Cookie helpers for free course unlock tracking
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  };
  const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  };

  useEffect(() => {
    if (courseId && getCookie(`free_course_unlocked_${courseId}`) === '1') {
      setFreeUnlocked(true);
    }
  }, [courseId]);

  const [promo, setPromo] = useState<CoursePromo | null>(null);
  const t = useT(T);
  const salesPage = useMemo(() => {
    const parsed = parseSalesPage(course?.sales_page);
    // Dev/preview only: show sample sections until the admin fills sales_page.
    return USE_SAMPLE && Object.keys(parsed).length === 0 ? sampleSalesPage : parsed;
  }, [course]);
  const navItems = useMemo(() => [
    { id: SECTION_IDS.overview, label: t.overview },
    { id: SECTION_IDS.curriculum, label: t.curriculum },
    { id: SECTION_IDS.instructor, label: t.instructor },
    ...(salesPage.projects?.length ? [{ id: SECTION_IDS.projects, label: t.projects }] : []),
    { id: SECTION_IDS.reviews, label: t.reviews },
    { id: SECTION_IDS.faq, label: t.faq },
  ], [t, salesPage]);

  // Display-only promo (no client price math). Missing RPC/migration => no bar.
  useEffect(() => {
    if (!courseId) return;
    let alive = true;
    void (supabase as any).rpc('get_active_course_promo', { p_course_id: courseId }).then(({ data }: { data: CoursePromo[] | null }) => {
      if (alive) setPromo(data?.[0] ?? null);
    }, () => { /* RPC not deployed yet: no promo bar */ });
    return () => { alive = false; };
  }, [courseId]);

  const fetchCourseDetails = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const page = await loadCoursePage(supabase as unknown as SupabaseClient, courseId, session?.user?.id ?? null);
      setCourse(page.course);
      setPaidUnlocked(page.paidAccess);
      setSections(page.sections);
      if (page.instructor) setInstructor(page.instructor);
      setReviews(page.reviews);
      setRelatedCourses(page.related);
    } catch (error) {
      console.error("Error fetching course details:", error);
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [courseId, session?.user?.id, toast]);

  useEffect(() => {
    if (courseId) void fetchCourseDetails();
  }, [fetchCourseDetails, courseId]);


  const handleEnrollment = async (data: PaymentModalData) => {
    setEnrolling(true);
    try {
      void track({ event: 'checkout_submitted', surface: 'completion', subjectType: 'course', subjectId: courseId, metadata: { free: course?.is_free === true, payment_method: course?.is_free ? 'free' : data.paymentMethod } });
      const { error } = await supabase
        .from("course_enrollments")
        .insert({
          course_id: courseId,
          user_id: session?.user?.id ?? null,
          user_name: data.name,
          user_email: data.email,
          whatsapp_number: data.whatsapp,
          profession: data.extras.profession,
          institute_name: data.extras.institute_name,
          payment_method: course?.is_free ? 'free' : data.paymentMethod,
          transaction_id: course?.is_free ? null : data.transactionId,
          promo_code: course && priceCourse(course).acceptsPromo ? data.promoCode ?? null : null,
        });

      if (error) throw error;

      void track({ event: 'enrolled', surface: 'completion', subjectType: 'course', subjectId: courseId });

      toast({
        title: "Success",
        description: "Successfully enrolled in the course!",
      });

      if (course && isFreeCoursePricing(course)) {
        setCookie(`free_course_unlocked_${courseId}`, '1');
        setFreeUnlocked(true);
      }
      // Modal success state is handled internally by PaymentModal
    } catch (error) {
      console.error("Error enrolling in course:", error);
      throw error; // Rethrow so PaymentModal shows error
    } finally {
      setEnrolling(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: course?.title,
          text: `Check out this course: ${course?.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied!", description: "Course link copied to clipboard." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Navbar />
        <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-[65%]">
              <Skeleton className="h-4 w-32 mb-6" />
              <Skeleton className="h-10 w-full mb-6" />
              <div className="flex gap-4 mb-6">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-24 w-full mb-10" />
              <div className="flex gap-4 border-y py-4 mb-8">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                   <Skeleton className="h-4 w-32 mb-2" />
                   <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
            <div className="w-full lg:w-[35%]">
              <div className="sticky top-24 border border-border rounded-2xl overflow-hidden shadow-card">
                <Skeleton className="aspect-video w-full" />
                <div className="p-7 space-y-6">
                  <Skeleton className="h-10 w-1/2" />
                  <Skeleton className="h-14 w-full" />
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl font-medium text-destructive">{t.notFound}</div>
        </div>
      </div>
    );
  }

  const pricing = priceCourse(course);
  const isFree = pricing.kind === 'free';
  const totalLessons = sections.reduce((total, section) => total + (section.contents?.length ?? 0), 0);
  const completedLessons = sections.flatMap((section) => section.contents ?? []).filter((item) => courseProgress.completedIds.has(item.id)).length;
  const sampleContentId = sections.flatMap((section) => section.contents ?? []).find((content) => content.is_free)?.id ?? null;

  const reviewAverage = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : null;

  const isUnlocked = (item: CourseContent) => (isFree ? freeUnlocked : paidUnlocked || item.is_free || item.id === sampleContentId);
  const isEnrolled = (isFree && freeUnlocked) || paidUnlocked;
  const scrollTo = (id: string) => window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  const openLessonAndScroll = (id: string) => { setOpenLesson(id); scrollTo('course-content'); };
  const startCheckout = () => {
    void track({ event: 'checkout_started', surface: 'completion', subjectType: 'course', subjectId: course.id });
    setShowEnrollmentModal(true);
  };
  const ctaLabel = isFree ? t.startFree : t.enroll;

  const lessonPlayer = (
    <LessonPlayer
      sections={sections}
      openLesson={openLesson}
      onOpenLessonChange={setOpenLesson}
      isUnlocked={isUnlocked}
      completedIds={courseProgress.completedIds}
      saving={courseProgress.saving}
      markOpened={courseProgress.markOpened}
      setCompleted={courseProgress.setCompleted}
      showProgress={isEnrolled}
    />
  );

  const paymentModal = (
    <PaymentModal
      open={showEnrollmentModal}
      onOpenChange={setShowEnrollmentModal}
      title={`Enroll in ${course.title}`}
      isFree={isFree}
      collectWhatsapp={!isFree}
      priceLabel={pricing.kind === 'paid' ? `৳${pricing.charge}` : undefined}
      onSubmit={handleEnrollment}
      extraFields={isFree ? [] : [
        { key: 'profession', label: 'Profession', placeholder: 'e.g. Student, Engineer', required: true },
        { key: 'institute_name', label: 'Institute/Organization', placeholder: 'e.g. University/Company', required: true }
      ]}
      submitLabel="Confirm Enrollment"
      confirmationType="enrollment"
      collectPromoCode={pricing.acceptsPromo}
    />
  );

  const priceCardProps = {
    course, isFree, ctaLabel, onCta: startCheckout, onShare: handleShare,
    sampleAvailable: Boolean(sampleContentId),
    onTrySample: () => { if (sampleContentId) openLessonAndScroll(sampleContentId); },
  };
  const resumeId = courseProgress.resumeContentId;

  // One stable tree: PaymentModal keeps its position (and its success state)
  // when a free enrollment flips the page into the enrolled layout.
  return (
    <div className={isEnrolled ? "min-h-screen bg-background pb-20" : "min-h-screen bg-background pb-24 lg:pb-20"}>
      <Navbar />
      {isEnrolled ? (
        // Enrolled learners: compact header + the lesson player (unchanged behavior).
        <div className="pt-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="rounded-3xl border border-brand-border bg-brand-surface bg-brand-grid p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-blue mb-1">{t.continueLearning}</p>
              <h1 className="page-heading text-2xl md:text-3xl font-bold text-foreground leading-tight">{course.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{t.lessonsComplete(completedLessons, totalLessons)}</p>
            </div>
            {resumeId && (
              <Button size="lg" className="h-12 rounded-xl bg-brand-blue text-primary-foreground hover:bg-brand-blue-hover" onClick={() => openLessonAndScroll(resumeId)}>
                {courseProgress.hasStarted ? t.continueCourse(completedLessons, totalLessons) : t.startFirst}
              </Button>
            )}
          </div>
          {lessonPlayer}
          <ReviewsSection courseId={course.id} reviews={reviews} reviewAverage={reviewAverage} />
        </div>
      ) : (
        <div className="pt-16">
          <PromoBar promo={pricing.acceptsPromo ? promo : null} onApply={startCheckout} />
          <div className="pt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              <div className="w-full lg:w-[65%] min-w-0">
                <div className="mb-6">
                  <CourseHero
                    course={course}
                    totalLessons={totalLessons}
                    reviewAverage={reviewAverage}
                    reviewCount={reviews.length}
                    isFree={isFree}
                    onEnroll={startCheckout}
                    onSeeCurriculum={() => scrollTo(SECTION_IDS.curriculum)}
                  />
                </div>
                {/* Mobile: price + batch inline (sample, includes, start date, preview). */}
                <div className="mb-6 space-y-6 lg:hidden">
                  <PriceCard {...priceCardProps} />
                  <BatchCard batch={salesPage.batch} startDate={course.start_date} />
                </div>
                <JumpNav items={navItems} />
                <OverviewSection course={course} />
                <DemoClasses demo={salesPage.demo_classes} />
                <WeeklyCurriculum curriculum={salesPage.curriculum} />
                <SectionShell id={SECTION_IDS.curriculum} eyebrow={t.curriculum} title={t.curriculumTitle(sections.length, totalLessons)}>
                  {lessonPlayer}
                </SectionShell>
                <InstructorSection instructor={instructor} updatedAt={course.updated_at} />
                <TeamSection tas={salesPage.teaching_assistants} />
                <TechRequirementsSection technologies={course.technologies ?? []} requirements={course.requirements} />
                <FeatureGrid features={salesPage.features} />
                <PrerequisiteVideos data={salesPage.prerequisite_videos} />
                <CareerSupport groups={salesPage.career_support} />
                <ProjectsSection projects={salesPage.projects} />
                <ReviewsSection courseId={course.id} reviews={reviews} reviewAverage={reviewAverage} />
                <SuccessStories stories={salesPage.success_stories} />
                <CertificateSection certificate={salesPage.certificate} />
                <FaqSection course={course} isFree={isFree} />
                <PaymentFaq items={salesPage.payment_faq} />
                <CommunityContact community={salesPage.community} contact={salesPage.contact} />
              </div>
              <aside className="hidden lg:block w-full lg:w-[35%]">
                {/* full-height column so the sticky price card can follow the whole page */}
                <div className="flex h-full flex-col gap-6">
                  <BatchCard batch={salesPage.batch} startDate={course.start_date} />
                  <div className="sticky top-28"><PriceCard {...priceCardProps} /></div>
                </div>
              </aside>
            </div>
            <div className="mt-12 space-y-12">
              <FinalCta title={course.title} ctaLabel={ctaLabel} onCta={startCheckout} supportContact={course.support_contact} />
              <RelatedCourses courses={relatedCourses} />
            </div>
          </div>
        </div>
      )}
      {paymentModal}
      {!isEnrolled && <MobileEnrollBar {...priceCardProps} />}
    </div>
  );
}
