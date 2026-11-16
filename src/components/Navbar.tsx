import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChartNoAxesColumnIncreasing, ChevronDown, Menu, X } from "lucide-react"
import { CourseSearchButton, CourseSearchInline } from "./CourseSearch"
import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { ThemeToggle } from "./ThemeToggle"
import { LangToggle } from "./LangToggle"
import { useT } from "@/i18n/lang"

const T = {
  en: {
    courses: "Courses", allCourses: "All courses", selfLearn: "Self-learning", roadmaps: "Roadmaps",
    resources: "Resources", library: "Career Prep library", portfolio: "Portfolio", book: "Book a session",
    community: "Community", blog: "Blog",
    signIn: "Sign in", start: "Start now", menu: "Toggle menu", main: "Main navigation",
  },
  bn: {
    courses: "কোর্সসমূহ", allCourses: "সব কোর্স", selfLearn: "নিজে শিখুন", roadmaps: "রোডম্যাপ",
    resources: "রিসোর্স", library: "ক্যারিয়ার প্রস্তুতি লাইব্রেরি", portfolio: "পোর্টফোলিও", book: "সেশন বুক করুন",
    community: "কমিউনিটি", blog: "ব্লগ",
    signIn: "সাইন ইন", start: "এখনই শুরু করুন", menu: "মেনু খুলুন/বন্ধ করুন", main: "প্রধান মেনু",
  },
}

type Item = { name: string; href: string }
type Group = { name: string; href?: string; items?: Item[]; match: string[] }

const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const t = useT(T)
  const reduce = useReducedMotion()
  const path = location.pathname

  const groups: Group[] = [
    {
      name: t.courses, match: ["/courses", "/course/", "/roadmaps"],
      items: [
        { name: t.allCourses, href: "/courses" },
        { name: t.selfLearn, href: "/career-prep" },
        { name: t.roadmaps, href: "/roadmaps" },
      ],
    },
    {
      name: t.resources, match: ["/career-prep/library", "/portfolio", "/book-session"],
      items: [
        { name: t.library, href: "/career-prep/library" },
        { name: t.portfolio, href: "/portfolio" },
        { name: t.book, href: "/book-session" },
      ],
    },
    { name: t.community, href: "/career-prep", match: [] },
    { name: t.blog, href: "/blog", match: ["/blog"] },
  ]

  const isActive = (g: Group) => g.match.some((m) => path === m || path.startsWith(m.endsWith("/") ? m : m + "/"))
  const close = () => setIsOpen(false)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false)
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen])

  return (
    <nav aria-label={t.main} className="site-nav fixed top-0 left-0 right-0 z-50 bg-panel/80 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className={`inline-flex items-center gap-2 rounded-sm font-display text-xl sm:text-2xl font-bold text-primary hover:text-primary/80 transition-colors ${focus}`}>
            <ChartNoAxesColumnIncreasing className="h-7 w-7 text-primary" aria-hidden="true" />DataEntropy
          </Link>

          {/* Desktop navigation */}
          <div className="hidden xl:flex items-center gap-2 xl:gap-4 whitespace-nowrap">
            {groups.map((g) => {
              const cls = `inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${focus} ${
                isActive(g) ? "text-primary" : "text-foreground hover:text-primary"
              }`
              return g.items ? (
                <DropdownMenu key={g.name}>
                  <DropdownMenuTrigger className={`${cls} data-[state=open]:text-primary`}>
                    {g.name}
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {g.items.map((i) => (
                      <DropdownMenuItem key={i.href} asChild>
                        <Link to={i.href}>{i.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link key={g.name} to={g.href!} className={cls}>{g.name}</Link>
              )
            })}
          </div>

          {/* Actions */}
          <div className="hidden xl:flex items-center gap-2 xl:gap-3 shrink-0">
            <CourseSearchButton />
            <LangToggle />
            <ThemeToggle />
            <Link to="/auth" className={`rounded-sm px-2 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors ${focus}`}>{t.signIn}</Link>
            <motion.div whileHover={reduce ? undefined : { scale: 1.04 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
              <Button className="rounded-full bg-primary font-semibold text-primary-foreground shadow-card transition-colors hover:bg-primary-hover" asChild>
                <Link to="/courses">{t.start} →</Link>
              </Button>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <div className="xl:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} aria-label={t.menu} aria-expanded={isOpen} aria-controls="mobile-menu">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {isOpen && (
        <div id="mobile-menu" className="xl:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background/80 backdrop-blur-xl border-b border-primary/10">
            {groups.map((g) => (
              <div key={g.name}>
                {g.items ? (
                  <>
                    <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g.name}</p>
                    {g.items.map((i) => (
                      <Link
                        key={i.href}
                        to={i.href}
                        onClick={close}
                        className={`block px-3 py-2 text-base font-medium transition-colors ${path === i.href ? "text-primary bg-primary/10" : "text-foreground hover:text-primary"}`}
                      >
                        {i.name}
                      </Link>
                    ))}
                  </>
                ) : (
                  <Link
                    to={g.href!}
                    onClick={close}
                    className={`block px-3 py-2 text-base font-medium transition-colors ${path === g.href ? "text-primary bg-primary/10" : "text-foreground hover:text-primary"}`}
                  >
                    {g.name}
                  </Link>
                )}
              </div>
            ))}
            <div className="pt-2 space-y-2">
              <CourseSearchInline onDone={close} />
              <div className="flex justify-center gap-2">
                <LangToggle />
                <ThemeToggle />
              </div>
              <Link to="/auth" onClick={close} className="block py-2 text-center text-sm font-semibold text-foreground hover:text-primary">{t.signIn}</Link>
              <Button className="w-full rounded-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold" asChild>
                <Link to="/courses" onClick={close}>{t.start} →</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
