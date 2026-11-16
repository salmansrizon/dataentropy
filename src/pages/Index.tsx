import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { usePageView } from "@/hooks/usePageView";
import { trackOnce } from "@/services/funnel";
import LandingHero from "@/components/landing/LandingHero";
import StatsBar from "@/components/landing/StatsBar";
import LandingCourses from "@/components/landing/LandingCourses";
import WhyDataEntropy from "@/components/landing/WhyDataEntropy";
import LearningRoadmap from "@/components/landing/LearningRoadmap";
import LandingTestimonials from "@/components/landing/LandingTestimonials";
import LandingCta from "@/components/landing/LandingCta";
import SelfLearningShowcase from "@/components/home/SelfLearningShowcase";
import DemoClassesHome from "@/components/home/DemoClassesHome";
import CourseBenefits from "@/components/home/CourseBenefits";

/** Landing page — section order follows the owner's design mock. */
const Index = () => {
  usePageView("/");
  useEffect(() => {
    void trackOnce("landing-viewed", { event: "landing_viewed", surface: "lobby" });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
        <LandingHero />
        <StatsBar />
        <LandingCourses />
        <WhyDataEntropy />
        {/* other platform features: self-paced tools, free demo classes, course benefits */}
        <SelfLearningShowcase />
        <LearningRoadmap />
        <DemoClassesHome />
        <CourseBenefits />
        <LandingTestimonials />
        <LandingCta />
      </main>
    </div>
  );
};

export default Index;
