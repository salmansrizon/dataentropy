import { Facebook, Linkedin, Twitter, Youtube } from "lucide-react";
import Logo from "./Logo";
import { Link, useLocation } from "react-router-dom";
import BackToTop from "@/components/BackToTop";
import { useT } from "@/i18n/lang";
import { USE_SAMPLE, sampleSocial } from "@/content/sampleContent";

const T = {
  en: {
    tagline: "Growth with Data & AI",
    site: "Site footer",
    quick: "Quick links",
    courses: "Courses",
    resources: "Resources",
    community: "Community",
    about: "About us",
    support: "Support",
    contact: "Contact",
    blog: "Blog",
    social: "Social media",
    rights: "All rights reserved.",
    accept: "We accept",
  },
  bn: {
    tagline: "ডেটা ও এআই দিয়ে এগিয়ে চলুন",
    site: "সাইটের ফুটার",
    quick: "দ্রুত লিংক",
    courses: "কোর্সসমূহ",
    resources: "রিসোর্স",
    community: "কমিউনিটি",
    about: "আমাদের সম্পর্কে",
    support: "সাপোর্ট",
    contact: "যোগাযোগ",
    blog: "ব্লগ",
    social: "সোশ্যাল মিডিয়া",
    rights: "সর্বস্বত্ব সংরক্ষিত।",
    accept: "আমরা গ্রহণ করি",
  },
};

const ICONS = { Facebook, YouTube: Youtube, LinkedIn: Linkedin, X: Twitter };
const link =
  "inline-flex min-h-10 items-center sm:min-h-0 text-muted-foreground transition-colors hover:text-foreground rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const SiteFooter = () => {
  const t = useT(T);
  const { pathname } = useLocation();
  // Full-screen workspaces (same exclusions as FloatingContact).
  if (pathname.startsWith("/admin") || pathname.startsWith("/career-prep/solve/")) return null;

  const quick = [
    { to: "/courses", label: t.courses },
    { to: "/career-prep/library", label: t.resources },
    { to: "/career-prep", label: t.community },
    { to: "/portfolio", label: t.about },
  ];

  return (
    <footer className={`border-t border-border bg-card ${pathname.startsWith("/course/") ? "pb-24 lg:pb-0" : ""}`}>
      <h2 className="sr-only">{t.site}</h2>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <Link to="/" aria-label="DataEntropy" className={`inline-flex items-center ${link}`}>
            <Logo size="sm" />
          </Link>
          <p className="text-sm text-muted-foreground">{t.tagline}</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">{t.quick}</h3>
          <ul className="space-y-2 text-sm">
            {quick.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={link}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">{t.support}</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/book-session" className={link}>{t.contact}</Link></li>
            <li><Link to="/blog" className={link}>{t.blog}</Link></li>
            <li>
              <a href="https://wa.me/8801682359817" target="_blank" rel="noopener noreferrer" className={link}>WhatsApp</a>
            </li>
            <li>
              <a href="https://t.me/+8801682359817" target="_blank" rel="noopener noreferrer" className={link}>Telegram</a>
            </li>
          </ul>
        </div>

        {USE_SAMPLE && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">{t.social}</h3>
          {(
            <ul className="flex gap-3">
              {sampleSocial.map((s) => {
                const Icon = ICONS[s.name as keyof typeof ICONS];
                return Icon ? (
                  <li key={s.name}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name} className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-border ${link}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </li>
                ) : null;
              })}
            </ul>
          )}
        </div>
        )}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} DataEntropy. {t.rights}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/book-session" className={link}>{t.contact}</Link>
            <span>{t.accept}</span>
            <span className="rounded-md bg-brand-bkash-soft px-2 py-0.5 text-xs font-semibold text-brand-bkash-soft-foreground">bKash</span>
            <span className="rounded-md bg-brand-nagad-soft px-2 py-0.5 text-xs font-semibold text-brand-nagad-soft-foreground">Nagad</span>
          </div>
        </div>
      </div>
      <BackToTop className={pathname.startsWith("/course/") ? "bottom-24 lg:bottom-6" : "bottom-6"} />
    </footer>
  );
};

export default SiteFooter;
