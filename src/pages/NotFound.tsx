import { useLocation } from "react-router-dom"
import { useEffect } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Home, ArrowLeft, RefreshCw } from "lucide-react"
import LottieAnimation from "@/components/LottieAnimation"
import { useT } from "@/i18n/lang"
import { RevealGroup, RevealItem } from "@/pages/course-details/motion"

const T = {
  en: {
    title: "Oops! Page not found",
    body: "The page you're looking for doesn't exist or has been moved.",
    path: "Requested path:",
    home: "Return to Home", back: "Go Back", refresh: "Refresh",
    help: "Need help? Here are some suggestions:",
    h1: "Check the URL", b1: "Make sure the web address is correct",
    h2: "Try Again Later", b2: "The page might be temporarily unavailable",
    h3: "Contact Support", b3: "If the problem persists, let us know",
  },
  bn: {
    title: "ইশ! পেজটি পাওয়া যায়নি",
    body: "আপনি যে পেজটি খুঁজছেন সেটি নেই, অথবা অন্য জায়গায় সরানো হয়েছে।",
    path: "অনুরোধ করা পাথ:",
    home: "হোমে ফিরুন", back: "পেছনে যান", refresh: "রিফ্রেশ",
    help: "সাহায্য লাগবে? কিছু পরামর্শ:",
    h1: "URL দেখে নিন", b1: "ওয়েব ঠিকানাটি ঠিক আছে কি না যাচাই করুন",
    h2: "পরে আবার চেষ্টা করুন", b2: "পেজটি সাময়িকভাবে বন্ধ থাকতে পারে",
    h3: "সাপোর্টে জানান", b3: "সমস্যা থেকে গেলে আমাদের জানান",
  },
}

const NotFound = () => {
  const location = useLocation()
  const t = useT(T)
  const reduce = useReducedMotion()

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname)
  }, [location.pathname])

  const handleGoBack = () => {
    window.history.back()
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const rise = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: [0.24, 1, 0.4, 1] as const } }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="text-center max-w-2xl mx-auto">
        <motion.div className="relative mb-8" {...rise(0)}>
          <h1 className="text-7xl md:text-8xl font-bold text-primary">404</h1>
        </motion.div>

        <motion.div className="mb-8 space-y-4" {...rise(0.1)}>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t.title}</h2>
          <p className="text-lg text-muted-foreground mb-2">{t.body}</p>
          <div className="bg-card rounded-lg p-4 border border-border inline-block">
            <p className="text-sm text-muted-foreground font-mono">
              {t.path} <span className="text-destructive font-semibold">{location.pathname}</span>
            </p>
          </div>
        </motion.div>

        <div className="mb-8 flex justify-center" aria-hidden="true">
          <LottieAnimation
            src="/animations/roadmap-journey.json" loop={false}
            className="w-72 h-72"
          />
        </div>

        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center" {...rise(0.2)}>
          <a
            href="/"
            className="group inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105 motion-reduce:transform-none"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform motion-reduce:transform-none" />
            {t.home}
          </a>

          <button
            onClick={handleGoBack}
            className="group inline-flex items-center gap-2 bg-card hover:bg-muted text-foreground px-6 py-3 rounded-full font-semibold border border-input transition-all duration-200 hover:scale-105 motion-reduce:transform-none"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform motion-reduce:transform-none" />
            {t.back}
          </button>

          <button
            onClick={handleRefresh}
            className="group inline-flex items-center gap-2 bg-muted hover:bg-secondary text-foreground px-6 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105 motion-reduce:transform-none"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500 motion-reduce:transform-none" />
            {t.refresh}
          </button>
        </motion.div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">{t.help}</p>
          <RevealGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {[[t.h1, t.b1], [t.h2, t.b2], [t.h3, t.b3]].map(([h, b]) => (
              <RevealItem key={h} className="bg-card rounded-lg p-4 border border-border transition hover:-translate-y-1 motion-reduce:transform-none">
                <h3 className="font-semibold text-foreground mb-2">{h}</h3>
                <p className="text-muted-foreground">{b}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </div>
  )
}

export default NotFound
