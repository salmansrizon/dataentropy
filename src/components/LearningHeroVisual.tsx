import { useT } from "@/i18n/lang";

const T = {
  en: { alt: "Illustrative portrait of a data professional beside an analytics workspace" },
  bn: { alt: "অ্যানালিটিক্স ওয়ার্কস্পেসের পাশে একজন ডেটা প্রফেশনালের চিত্র" },
};

export default function LearningHeroVisual() {
  const t = useT(T);
  return (
    <div className="home-hero-portrait">
      <img src="/images/data-professional-hero.jpg" alt={t.alt} width={800} height={1200} fetchPriority="high" />
    </div>
  );
}
