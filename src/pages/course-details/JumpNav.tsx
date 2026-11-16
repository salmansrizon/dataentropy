import { useEffect, useState } from "react";
import { useT } from "@/i18n/lang";

const T = { en: { sections: "Course sections" }, bn: { sections: "কোর্সের অংশসমূহ" } };

interface JumpNavProps {
  items: { id: string; label: string }[];
}

const JumpNav = ({ items }: JumpNavProps) => {
  const t = useT(T);
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label={t.sections}
      className="sticky top-[5.5rem] z-30 -mx-4 overflow-x-auto rounded-2xl bg-background/90 px-4 py-2 backdrop-blur no-scrollbar"
    >
      <ul className="flex gap-1">
        {items.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={isActive ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(id);
                  if (!el) return;
                  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
                  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
                  el.focus({ preventScroll: true });
                  history.replaceState(null, "", `#${id}`);
                }}
                className={`block whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default JumpNav;
