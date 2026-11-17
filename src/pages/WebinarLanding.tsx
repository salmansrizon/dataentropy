import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { createRepository } from "@/integrations/supabase/repository";
import { webinarConfig, instructorConfig } from "@/adapters/entityConfigs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, useReducedMotion } from "framer-motion";
import { useLang, useT } from "@/i18n/lang";
import { LivePulse } from "@/components/LivePulse";
import {
    Calendar,
    Clock,
    Users,
    CheckCircle2,
    ChevronRight,
    PlayCircle,
    MessageCircle,
    CreditCard,
    Plus,
    Zap,
    ShieldCheck,
    Quote,
    HelpCircle,
    Smartphone,
    MapPin,
    Mail,
    ArrowRight,
    Timer,
    Linkedin,
    ExternalLink
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useBookingData } from "@/hooks/useBookingData";
import { cn } from "@/lib/utils";
import PaymentModal, { PaymentModalData } from "@/components/PaymentModal";

const T = {
  en: {
    notFoundToast: "Webinar not found", success: "Success!", regDone: "Registration confirmed!", payDone: "Payment submitted for verification.",
    nfTitle: "Webinar Not Found", nfBody: "This webinar may have expired, been removed, or is currently in draft mode. Please check back later or contact us.", home: "Back to Home",
    freeLive: "Free Live Session", masterclass: "Exclusive Masterclass", days: "Days", hours: "Hours", mins: "Mins", secs: "Secs", meet: "Google Meet",
    fallbackDesc: "Join this transformative session designed to upgrade your skills and give you the competitive edge in the modern tech landscape.",
    less: "Show Less", more: "Show More", joinFree: "Join for Free", claim: "Claim My Seat Now",
    preview: "Webinar Preview", presentation: "Presentation", registered: "Registered", joined: "people joined",
    benefitsSub: "Curated curriculum and takeaways from this session.", takeaway: "Key Takeaway", meetInstructors: "Meet Your Instructors", bestSub: "Learn from the best in the industry.",
    mentor: "Mentor Kami", expert: "Industry Expert", bio: "Data is not just numbers; it's the story of your business waiting to be told correctly.",
    viewProfile: "VIEW PROFILE", lead: "Lead Instructor", theHost: "The Host", years: "Years Experience", guided: "Guided Success",
    faq: "Frequently Asked Questions", faqSub: "Everything you need to know about the webinar.",
    ctaTitle: "Ready to transform your career?", ctaBody: "Don't miss out on this live session. Reserve your spot today before it's too late.",
    roleLabel: "Role / Profession", rolePh: "e.g. Student, UX Designer", complete: "Complete Registration",
  },
  bn: {
    notFoundToast: "ওয়েবিনার পাওয়া যায়নি", success: "সফল!", regDone: "রেজিস্ট্রেশন নিশ্চিত হয়েছে!", payDone: "পেমেন্ট যাচাইয়ের জন্য জমা হয়েছে।",
    nfTitle: "ওয়েবিনার পাওয়া যায়নি", nfBody: "ওয়েবিনারটির মেয়াদ শেষ হয়ে থাকতে পারে, সরানো হয়েছে বা এখনো ড্রাফট অবস্থায় আছে। পরে আবার দেখুন বা আমাদের সাথে যোগাযোগ করুন।", home: "হোমে ফিরে যান",
    freeLive: "ফ্রি লাইভ সেশন", masterclass: "এক্সক্লুসিভ মাস্টারক্লাস", days: "দিন", hours: "ঘণ্টা", mins: "মিনিট", secs: "সেকেন্ড", meet: "গুগল মিট",
    fallbackDesc: "আপনার দক্ষতা বাড়াতে এবং আধুনিক টেক দুনিয়ায় এগিয়ে থাকতে সাজানো এই রূপান্তরমূলক সেশনে যোগ দিন।",
    less: "কম দেখান", more: "আরও দেখুন", joinFree: "ফ্রিতে যোগ দিন", claim: "এখনই আমার সিট নিন",
    preview: "ওয়েবিনার প্রিভিউ", presentation: "প্রেজেন্টেশন", registered: "রেজিস্টার্ড", joined: "জন যোগ দিয়েছেন",
    benefitsSub: "এই সেশনের সাজানো কারিকুলাম ও প্রাপ্তি।", takeaway: "মূল শিক্ষণীয়", meetInstructors: "আপনার ইনস্ট্রাক্টরদের সাথে পরিচিত হন", bestSub: "ইন্ডাস্ট্রির সেরাদের কাছ থেকে শিখুন।",
    mentor: "মেন্টর কামি", expert: "ইন্ডাস্ট্রি এক্সপার্ট", bio: "ডেটা শুধু সংখ্যা নয়; এটি আপনার ব্যবসার গল্প, যা সঠিকভাবে বলার অপেক্ষায় আছে।",
    viewProfile: "প্রোফাইল দেখুন", lead: "লিড ইনস্ট্রাক্টর", theHost: "হোস্ট", years: "বছরের অভিজ্ঞতা", guided: "সফল গাইডেড",
    faq: "সচরাচর জিজ্ঞাসা", faqSub: "ওয়েবিনার সম্পর্কে যা কিছু জানা দরকার।",
    ctaTitle: "ক্যারিয়ার বদলাতে প্রস্তুত?", ctaBody: "এই লাইভ সেশন মিস করবেন না। দেরি হওয়ার আগেই আজ আপনার সিট নিশ্চিত করুন।",
    roleLabel: "পেশা / ভূমিকা", rolePh: "যেমন, শিক্ষার্থী, UX ডিজাইনার", complete: "রেজিস্ট্রেশন সম্পন্ন করুন",
  },
};

const webinarRepository = createRepository(webinarConfig);
const instructorRepository = createRepository(instructorConfig);

const WebinarLanding = () => {
    const { id } = useParams();
    const t = useT(T);
    const { num, date: fmtDate } = useLang();
    const reduce = useReducedMotion();
    const [isRegistering, setIsRegistering] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    // Form loading and error handling
    const [formLoading, setFormLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number }>({ d: 0, h: 0, m: 0, s: 0 });
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const [expandedFaqIdx, setExpandedFaqIdx] = useState<number | null>(null);
    const [isHeroExpanded, setIsHeroExpanded] = useState(false);
    const { paymentSettings } = useBookingData();

    const { data: webinar, isLoading: loading, error: webinarError } = webinarRepository.useFindById(id || '');
    const { data: instructors = [] } = instructorRepository.useFindAll();

    useEffect(() => {
        if (!loading && id && (webinarError || !webinar)) {
            toast({ title: t.notFoundToast, variant: "destructive" });
            navigate('/');
        }
    }, [id, loading, webinar, webinarError, navigate, toast, t]);

    useEffect(() => {
        if (!webinar) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(webinar.webinar_date).getTime();
            const diff = target - now;

            if (diff <= 0) {
                clearInterval(timer);
                return;
            }

            setTimeLeft({
                d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((diff % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [webinar]);

    const handleRegister = async (data: PaymentModalData) => {
        setFormLoading(true);
        try {
            const bookingPayload = {
                webinar_id: id,
                student_name: data.name,
                student_email: data.email,
                student_whatsapp: data.whatsapp,
                student_role: data.extras.role,
                payment_status: webinar.is_free ? 'confirmed' : 'pending',
                payment_method: webinar.is_free ? 'free' : data.paymentMethod,
                payment_transaction_id: webinar.is_free ? null : data.transactionId,
                booking_date: new Date().toISOString()
            };

            const { error } = await (supabase.from('webinar_bookings' as any).insert([bookingPayload]) as any);

            if (error) {
                throw error;
            }

            toast({ title: t.success, description: webinar.is_free ? t.regDone : t.payDone });
        } catch (err: any) {
            console.error(err);
            throw err;
        } finally {
            setFormLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
    );

    if (!webinar) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
            <Navbar />
            <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-4">
                <HelpCircle className="h-10 w-10 text-primary opacity-40" />
            </div>
            <h1 className="text-3xl font-bold">{t.nfTitle}</h1>
            <p className="text-muted-foreground max-w-md">{t.nfBody}</p>
            <Button onClick={() => navigate('/')} variant="outline" className="rounded-full px-8">{t.home}</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            <Navbar />


            {/* Gradient overlay for depth */}

            <div className="relative z-10 pt-32 pb-20 max-w-6xl mx-auto px-6">

                {/* HERO SECTION - Aligned with Index Hero */}
                <section className="grid lg:grid-cols-2 gap-10 items-center mb-16">
                    <motion.div
                        initial={reduce ? false : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all px-4 py-1 flex items-center gap-2 w-fit">
                                <Zap className="h-3 w-3" />
                                {webinar.is_free ? t.freeLive : t.masterclass}
                            </Badge>
                            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black leading-[1.1] tracking-tight">
                                <span className="text-primary">
                                    {webinar.content_blocks?.find((b: any) => b.type === 'hero')?.title || webinar.title}
                                </span>
                            </h1>

                            {/* NEW COUNTDOWN COMPONENT */}
                            <div className="flex gap-4 py-4">
                                {[
                                    { label: t.days, value: timeLeft.d },
                                    { label: t.hours, value: timeLeft.h },
                                    { label: t.mins, value: timeLeft.m },
                                    { label: t.secs, value: timeLeft.s }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center bg-accent/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-primary/5 min-w-[70px]">
                                        <span className="text-2xl font-black text-foreground leading-none">{num(Math.floor(item.value / 10))}{num(item.value % 10)}</span>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em] mt-1 inline-flex items-center gap-1">{i === 3 && <LivePulse className="text-primary" />}{item.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 text-lg font-bold">
                                <Calendar className="h-5 w-5 text-primary" />
                                <span className="text-foreground/80">
                                    {fmtDate(webinar.webinar_date, { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                    <span className="ml-3 text-primary opacity-60"> • </span>
                                    <span className="text-primary font-black uppercase tracking-widest text-xs opacity-80">{t.meet}</span>
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <motion.div
                                animate={{ height: 'auto' }}
                                className="relative"
                            >
                                <p className={cn(
                                    "text-lg text-muted-foreground leading-relaxed max-w-xl transition-all duration-300",
                                    !isHeroExpanded && "line-clamp-3"
                                )}>
                                    {webinar.content_blocks?.find((b: any) => b.type === 'hero')?.content?.subtitle || 
                                     webinar.description || 
                                     t.fallbackDesc}
                                </p>
                            </motion.div>
                            
                            {(webinar.content_blocks?.find((b: any) => b.type === 'hero')?.content?.subtitle?.length > 180 || webinar.description?.length > 180) && (
                                <button 
                                    onClick={() => setIsHeroExpanded(!isHeroExpanded)}
                                    className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
                                >
                                    {isHeroExpanded ? t.less : t.more}
                                    <ChevronRight className={cn("h-4 w-4 transition-transform", isHeroExpanded && "rotate-90")} />
                                </button>
                            )}
                        </div>


                        <div className="flex gap-4 items-center">
                            <Button
                                size="lg"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground h-16 px-10 text-xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 group rounded-2xl"
                                onClick={() => setIsRegistering(true)}
                            >
                                {webinar.is_free ? t.joinFree : t.claim}
                                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={reduce ? false : { opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative group"
                    >
                        <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                        <Card className="relative overflow-hidden border-primary/20 bg-background/40 backdrop-blur-xl shadow-2xl rounded-[32px] p-1">
                            <div className="aspect-video rounded-[30px] overflow-hidden bg-accent/20 flex items-center justify-center border border-primary/5 relative group/media">
                                {webinar.content_blocks?.find((b: any) => b.type === 'hero')?.content?.videoUrl ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${webinar.content_blocks.find((b: any) => b.type === 'hero').content.videoUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1]}?autoplay=0&rel=0&modestbranding=1`}
                                        className="absolute inset-0 w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title={t.preview}
                                    />
                                ) : webinar.content_blocks?.find((b: any) => b.type === 'hero')?.content?.imageUrl ? (
                                    <img 
                                        src={webinar.content_blocks.find((b: any) => b.type === 'hero').content.imageUrl} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-110" 
                                        alt={t.presentation} 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center relative overflow-hidden group/fallback">
                                        <div className="absolute inset-0 bg-muted" />
                                        <PlayCircle className="h-20 w-20 text-primary/40 group-hover/fallback:scale-110 transition-transform cursor-pointer z-10" />
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Status Floaties */}
                        <Card className="absolute -top-3 right-1 sm:-top-6 sm:-right-6 bg-card border-border shadow-card p-4 rounded-2xl backdrop-blur-md z-30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-success-soft flex items-center justify-center">
                                    <Users className="h-5 w-5 text-success" />
                                </div>
                                <div className="pr-4">
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black leading-none mb-1">{t.registered}</p>
                                    <p className="text-sm font-black whitespace-nowrap">{num(webinar.booked_count || 0)} {t.joined}</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </section>

                {/* DYNAMIC BLOCKS RENDERING */}
                {webinar.content_blocks?.map((block: any) => (
                    <motion.section
                        key={block.id}
                        initial={reduce ? false : { opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-32 scroll-mt-32"
                        id={block.type}
                    >
                        {block.type === 'benefits' && (
                            <div className="space-y-16">
                                <div className="text-center max-w-2xl mx-auto space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold">{block.title}</h2>
                                    <p className="text-muted-foreground text-lg">{t.benefitsSub}</p>
                                </div>
                                <div className="max-w-4xl mx-auto space-y-6">
                                    {block.content.items?.map((item: any, i: number) => (
                                        <Card 
                                            key={i} 
                                            className={cn(
                                                "bg-accent/10 border-primary/5 p-3 px-5 rounded-xl hover:bg-accent/20 hover:-translate-y-0.5 motion-reduce:transform-none transition-all group flex flex-col cursor-pointer overflow-hidden backdrop-blur-sm",
                                                expandedIdx === i && "bg-accent/20 border-primary/20"
                                            )}
                                            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                                                    <CheckCircle2 className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                                                </div>
                                                <div className="flex-1 flex items-center justify-between">
                                                    <h4 className="text-lg font-bold">
                                                        {item.title || `${t.takeaway} #${num(i + 1)}`}
                                                    </h4>
                                                    <ChevronRight className={cn(
                                                        "h-5 w-5 text-muted-foreground transition-transform duration-300",
                                                        expandedIdx === i && "rotate-90"
                                                    )} />
                                                </div>
                                            </div>
                                            
                                            <motion.div
                                                initial={false}
                                                animate={{ height: expandedIdx === i ? 'auto' : 0, opacity: expandedIdx === i ? 1 : 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pl-12 pt-2 border-l-2 border-primary/10 ml-4 mb-2">
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        {item.description || item.text}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {block.type === 'host' && (
                            <div className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold">{block.title || t.meetInstructors}</h2>
                                    <p className="text-muted-foreground text-lg italic">{t.bestSub}</p>
                                </div>
                                <div className="grid grid-cols-1 gap-12">
                                    {((block.content.instructor_ids && block.content.instructor_ids.length > 0) ? block.content.instructor_ids : [null]).map((instId: string | null, i: number) => {
                                        const inst = instId ? instructors.find(ins => ins.id === instId) : null;
                                        const hostData = inst ? {
                                            name: inst.name,
                                            role: inst.specialization,
                                            avatar: inst.avatar_url,
                                            bio: inst.bio,
                                            linkedin: inst.linkedin_url
                                        } : {
                                            name: block.content.name || t.mentor,
                                            role: block.content.role || t.expert,
                                            avatar: block.content.image,
                                            bio: block.content.bio || t.bio,
                                            linkedin: null
                                        };

                                        return (
                                            <div key={i} className="relative group/card w-full overflow-hidden">
                                                {/* Ambient Background Glow - Blue Theme */}
                                                
                                                <div className="relative bg-primary/[0.03] dark:bg-primary/[0.05] backdrop-blur-2xl border border-primary/20 rounded-[40px] p-8 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-10 items-center w-full min-h-[200px] shadow-[0_8px_32px_0_rgba(59,130,246,0.05)]">
                                                    
                                                    <div className="md:col-span-3 flex justify-center md:justify-end">
                                                        <div className="relative group/avatar">
                                                            {/* Ring effect */}
                                                            
                                                            <div className="relative w-36 h-36 md:w-40 md:h-40">
                                                                <div className="w-full h-full rounded-full overflow-hidden bg-card border-4 border-border relative z-10">
                                                                    {hostData.avatar ? (
                                                                        <img src={hostData.avatar} className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-700" alt={hostData.name} />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-accent/20">
                                                                            <Users className="h-12 w-12 text-primary/20" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                
                                                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20">
                                                                    <div className="relative group/badge">
                                                                        <div className="absolute inset-0 bg-primary blur-md opacity-20 group-hover/badge:opacity-40 transition-opacity" />
                                                                        {hostData.linkedin ? (
                                                                            <a
                                                                                href={hostData.linkedin}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="relative px-5 py-2 bg-primary text-primary-foreground rounded-full flex items-center gap-2 shadow-lg border border-accent-foreground/20 transition-all duration-300 hover:scale-105 active:scale-95"
                                                                            >
                                                                                <Linkedin className="h-3 w-3" />
                                                                                <span className="text-[10px] font-black uppercase tracking-[0.1em]">{t.viewProfile}</span>
                                                                            </a>
                                                                        ) : (
                                                                            <div className="relative px-5 py-2 bg-primary text-primary-foreground rounded-full font-black text-[10px] uppercase tracking-[0.1em] shadow-lg border border-accent-foreground/20">
                                                                                {t.lead}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="md:col-span-9 flex flex-col justify-center space-y-6">
                                                        <div className="space-y-3 text-center md:text-left">
                                                            <div className="space-y-1">
                                                                <p className="text-primary font-black tracking-[0.3em] uppercase text-[10px] opacity-70">{t.theHost}</p>
                                                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-none">
                                                                    {hostData.name}
                                                                </h2>
                                                            </div>
                                                            
                                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                                                                <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                                                                    <p className="text-primary font-bold text-[9px] uppercase tracking-widest">{hostData.role}</p>
                                                                </div>
                                                                <div className="flex gap-6 items-center">
                                                                    <div className="group/stat">
                                                                        <div className="text-lg font-black text-foreground leading-none group-hover/stat:text-primary transition-colors">{num(7)}+</div>
                                                                        <div className="text-[8px] uppercase tracking-[0.15em] text-muted-foreground/60 font-bold">{t.years}</div>
                                                                    </div>
                                                                    <div className="w-px h-6 bg-primary/20" />
                                                                    <div className="group/stat">
                                                                        <div className="text-lg font-black text-foreground leading-none group-hover/stat:text-primary transition-colors">{num(100)}+</div>
                                                                        <div className="text-[8px] uppercase tracking-[0.15em] text-muted-foreground/60 font-bold">{t.guided}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="relative max-w-2xl">
                                                            <Quote className="absolute -top-4 -left-6 h-10 w-10 text-primary/10" />
                                                            <p className="text-base md:text-lg text-muted-foreground leading-relaxed italic relative z-10 px-2 md:px-0 font-medium">
                                                                "{hostData.bio}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {block.type === 'faq' && (
                            <div className="max-w-4xl mx-auto space-y-16">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold">{block.title === 'Faq' || block.title === 'FAQ' ? t.faq : (block.title || t.faq)}</h2>
                                    <p className="text-muted-foreground text-lg">{t.faqSub}</p>
                                </div>
                                <div className="space-y-6">
                                    {block.content.questions?.map((q: any, i: number) => (
                                        <Card 
                                            key={i} 
                                            className={cn(
                                                "bg-accent/10 border-primary/5 p-3 px-5 rounded-xl hover:bg-accent/20 hover:-translate-y-0.5 motion-reduce:transform-none transition-all group flex flex-col cursor-pointer overflow-hidden backdrop-blur-sm",
                                                expandedFaqIdx === i && "bg-accent/20 border-primary/20"
                                            )}
                                            onClick={() => setExpandedFaqIdx(expandedFaqIdx === i ? null : i)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                                                    <HelpCircle className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                                                </div>
                                                <div className="flex-1 flex items-center justify-between">
                                                    <h3 className="text-lg font-bold">{q.q}</h3>
                                                    <ChevronRight className={cn(
                                                        "h-5 w-5 text-muted-foreground transition-transform duration-300",
                                                        expandedFaqIdx === i && "rotate-90"
                                                    )} />
                                                </div>
                                            </div>
                                            
                                            <motion.div
                                                initial={false}
                                                animate={{ height: expandedFaqIdx === i ? 'auto' : 0, opacity: expandedFaqIdx === i ? 1 : 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pl-12 pt-2 border-l-2 border-primary/10 ml-4 mb-2">
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        {q.a}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.section>
                ))}

                {/* Final CTA Area */}
                <section className="relative rounded-3xl overflow-hidden bg-primary p-6 sm:p-12 md:p-16 text-center text-primary-foreground mb-32 group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-foreground/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight">{t.ctaTitle}</h2>
                        <p className="text-xl text-primary-foreground/80 font-medium leading-relaxed">
                            {t.ctaBody}
                        </p>
                        <Button
                            className="bg-card text-primary hover:bg-muted h-16 px-12 text-xl font-black rounded-full shadow-2xl transition-all hover:scale-105"
                            onClick={() => setIsRegistering(true)}
                        >
                            {webinar.is_free ? t.joinFree : t.claim} <ArrowRight className="ml-3 h-6 w-6" />
                        </Button>
                    </div>
                </section>

            </div>

            {/* Registration Dialog */}
            <PaymentModal
                open={isRegistering}
                onOpenChange={setIsRegistering}
                title={webinar.title}
                isFree={webinar.is_free}
                priceLabel={webinar.price != null ? `৳${num(Number(webinar.price))}` : undefined}
                onSubmit={handleRegister}
                extraFields={[
                    { key: 'role', label: t.roleLabel, placeholder: t.rolePh, required: true }
                ]}
                submitLabel={t.complete}
            />

        </div>
    );
};

export default WebinarLanding;
