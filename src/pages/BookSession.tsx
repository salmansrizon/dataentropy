import { useState, useEffect } from "react";
import { format, addMinutes } from "date-fns";
import Navbar from "@/components/Navbar";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLang, useT } from "@/i18n/lang";
import { LivePulse } from "@/components/LivePulse";
import PageIntro from "@/components/PageIntro";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon, Clock, Phone, Mail, User, CreditCard, CheckCircle2, Timer, ArrowRight, Smartphone, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookingData } from "@/hooks/useBookingData";
import { usePageView } from "@/hooks/usePageView";



type Step = 'details' | 'confirmed';

const T = {
  en: {
    eyebrow: "Consultation · Work with a practitioner", title: "Leave with a clear next move.",
    desc: "Bring a project blocker, interview plan, or career decision. Choose a focused session and leave with an actionable plan.",
    selectSession: "Select Session", min: "min", free: "Free", expand: "Toggle description",
    yourDetails: "Your Details", fillInfo: "Fill in your information and pick a slot",
    name: "Name *", namePh: "Your full name", email: "Email *", whatsapp: "WhatsApp Number", phone: "Phone Number",
    date: "Select Date *", pickDate: "Pick a date", timeSlot: "Time Slot *", selectTime: "Select time", booked: "(Booked)", noSlots: "No available slots",
    payMethod: "Payment Method *", bkash: "bKash", nagad: "Nagad", expired: "Expired",
    left: "left to pay", fee: "Fee:", qrAlt: "QR Code", scan: "Scan the QR code or send money directly with proper details as a reference.",
    txnLabel: "Enter Transaction ID", txnPh: "e.g., 9F8G7H6A5B",
    freeTitle: "This is a Free Session", freeBody: "No payment required. Your booking will be confirmed immediately.",
    winExpired: "Payment window expired.", reload: "Reload Page to Try Again",
    confirmFree: "Confirm Free Booking", confirm: "Confirm Booking",
    sessionConfirmed: "Session Confirmed!", submitted: "Booking Submitted!",
    freeDone1: "Your free session has been booked and confirmed. We'll send a reminder to ", paidDone1: "Your session booking has been submitted. We'll verify your payment and send a confirmation to ",
    bookingId: "Booking ID", txnId: "Transaction ID", status: "Status", confirmedBadge: "Confirmed", pendingBadge: "Pending Verification", home: "Back to Home",
    errTitle: "Error", errFill: "Please fill in all required fields", errMethod: "Please select a payment method.",
    errTxn: "Transaction ID is strictly required for paid bookings. Check your SMS.", errExpired: "Payment window has expired. Please reload to try again.", errFail: "Failed to create booking",
    okTitle: "Booking Confirmed!", okFree: "Your free session has been booked successfully.", okPaid: "Your session booking has been submitted. We'll verify your payment and confirm shortly.",
  },
  bn: {
    eyebrow: "কনসাল্টেশন · প্র্যাকটিশনারের সাথে কাজ করুন", title: "পরের ধাপটা স্পষ্ট করে নিয়ে ফিরুন।",
    desc: "প্রজেক্টের সমস্যা, ইন্টারভিউ প্ল্যান বা ক্যারিয়ারের সিদ্ধান্ত নিয়ে আসুন। একটি ফোকাসড সেশন বেছে নিন এবং একটি কাজের পরিকল্পনা নিয়ে ফিরুন।",
    selectSession: "সেশন বেছে নিন", min: "মিনিট", free: "ফ্রি", expand: "বিবরণ দেখান/লুকান",
    yourDetails: "আপনার তথ্য", fillInfo: "তথ্য দিন এবং একটি স্লট বেছে নিন",
    name: "নাম *", namePh: "আপনার পুরো নাম", email: "ইমেইল *", whatsapp: "হোয়াটসঅ্যাপ নম্বর", phone: "ফোন নম্বর",
    date: "তারিখ বেছে নিন *", pickDate: "তারিখ নির্বাচন করুন", timeSlot: "সময় *", selectTime: "সময় বেছে নিন", booked: "(বুকড)", noSlots: "কোনো স্লট খালি নেই",
    payMethod: "পেমেন্ট মাধ্যম *", bkash: "বিকাশ", nagad: "নগদ", expired: "শেষ",
    left: "বাকি পেমেন্টের জন্য", fee: "ফি:", qrAlt: "QR কোড", scan: "QR কোড স্ক্যান করুন অথবা সঠিক তথ্যসহ সরাসরি টাকা পাঠান।",
    txnLabel: "ট্রানজ্যাকশন আইডি দিন", txnPh: "যেমন, 9F8G7H6A5B",
    freeTitle: "এটি একটি ফ্রি সেশন", freeBody: "কোনো পেমেন্ট লাগবে না। আপনার বুকিং সঙ্গে সঙ্গে নিশ্চিত হবে।",
    winExpired: "পেমেন্টের সময় শেষ হয়ে গেছে।", reload: "আবার চেষ্টা করতে পেজ রিলোড করুন",
    confirmFree: "ফ্রি বুকিং নিশ্চিত করুন", confirm: "বুকিং নিশ্চিত করুন",
    sessionConfirmed: "সেশন নিশ্চিত হয়েছে!", submitted: "বুকিং জমা হয়েছে!",
    freeDone1: "আপনার ফ্রি সেশন বুক ও নিশ্চিত হয়েছে। রিমাইন্ডার পাঠানো হবে ", paidDone1: "আপনার সেশন বুকিং জমা হয়েছে। আমরা পেমেন্ট যাচাই করে নিশ্চিতকরণ পাঠাব ",
    bookingId: "বুকিং আইডি", txnId: "ট্রানজ্যাকশন আইডি", status: "অবস্থা", confirmedBadge: "নিশ্চিত", pendingBadge: "যাচাই চলছে", home: "হোমে ফিরে যান",
    errTitle: "ত্রুটি", errFill: "অনুগ্রহ করে সব আবশ্যক ঘর পূরণ করুন", errMethod: "অনুগ্রহ করে পেমেন্ট মাধ্যম বেছে নিন।",
    errTxn: "পেইড বুকিংয়ে ট্রানজ্যাকশন আইডি আবশ্যক। আপনার SMS দেখুন।", errExpired: "পেমেন্টের সময় শেষ। আবার চেষ্টা করতে পেজ রিলোড করুন।", errFail: "বুকিং তৈরি করা যায়নি",
    okTitle: "বুকিং নিশ্চিত হয়েছে!", okFree: "আপনার ফ্রি সেশন সফলভাবে বুক হয়েছে।", okPaid: "আপনার সেশন বুকিং জমা হয়েছে। আমরা পেমেন্ট যাচাই করে শীঘ্রই নিশ্চিত করব।",
  },
};

const BookSession = () => {
  usePageView("/book-session");
  const { toast } = useToast();
  const t = useT(T);
  const { num, date: fmtDate } = useLang();
  const reduce = useReducedMotion();
  const fade = reduce
    ? {}
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.25 } };
  const { sessionTypes, paymentSettings, unavailableSlots, isDateUnavailable, getAllTimeSlotsWithAvailability, availabilitySettings } = useBookingData();
  const [step, setStep] = useState<Step>('details');
  const [selectedSessionType, setSelectedSessionType] = useState<string>('');
  const [paymentDeadline, setPaymentDeadline] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    phone: '',
    date: undefined as Date | undefined,
    time: '',
    paymentMethod: '' as 'bkash' | 'nagad' | '',
    transactionId: '',
  });

  // Countdown timer for payment window
  useEffect(() => {
    if (!paymentDeadline) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = paymentDeadline.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft('Expired');
        clearInterval(interval);
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentDeadline]);

  const selectedSession = sessionTypes.find(s => s.id === selectedSessionType);
  const isFree = selectedSession ? !selectedSession.is_paid : false;

  const handleBookingSubmit = async () => {
    const paymentMethodRequired = !isFree;
    if (!formData.name || !formData.email || !formData.date || !formData.time || !selectedSessionType || (paymentMethodRequired && !formData.paymentMethod)) {
      toast({ title: t.errTitle, description: t.errFill, variant: "destructive" });
      return;
    }

    if (!isFree) {
      if (!formData.paymentMethod) {
        toast({ title: t.errTitle, description: t.errMethod, variant: "destructive" });
        return;
      }
      if (!formData.transactionId || formData.transactionId.trim() === "") {
        toast({ title: t.errTitle, description: t.errTxn, variant: "destructive" });
        return;
      }
      if (timeLeft === 'Expired') {
        toast({ title: t.errTitle, description: t.errExpired, variant: "destructive" });
        return;
      }
    }

    try {
      const { data, error } = await supabase.from('session_bookings').insert({
        session_type_id: selectedSessionType,
        user_name: formData.name,
        user_email: formData.email,
        whatsapp_number: formData.whatsapp,
        phone_number: formData.phone,
        booking_date: format(formData.date, 'yyyy-MM-dd'),
        time_slot: formData.time,
        payment_method: isFree ? 'free' : formData.paymentMethod,
        fee_amount: isFree ? 0 : selectedSession.fee,
        payment_status: isFree ? 'not_required' : 'submitted',
        booking_status: isFree ? 'confirmed' : 'pending',
        transaction_id: isFree ? null : formData.transactionId,
        payment_deadline: paymentDeadline?.toISOString(),
      }).select().single();

      if (error) throw error;
      if (data) setBookingId(data.id);
      setStep('confirmed');
      toast({ title: t.okTitle, description: isFree ? t.okFree : t.okPaid });
    } catch (error: any) {
      toast({ title: t.errTitle, description: error.message || t.errFail, variant: "destructive" });
    }
  };

  const handleSelectPaymentMethod = (method: 'bkash' | 'nagad') => {
    setFormData(p => ({ ...p, paymentMethod: method }));
    if (!paymentDeadline) {
      const windowMins = paymentSettings?.payment_window_minutes || 30;
      setPaymentDeadline(addMinutes(new Date(), windowMins));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageIntro eyebrow={t.eyebrow} title={t.title} description={t.desc} animation="/animations/booking-schedule.json" />

        {/* Header omitted from steps rendering because it's a single form now */}

        {/* Step 1: Details */}
        <AnimatePresence mode="wait" initial={false}>
        {step === 'details' && (
          <motion.div key="details" {...fade}>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Session Types */}
              <div className="md:col-span-1 flex flex-col">
                <h3 className="text-lg font-semibold text-foreground mb-4">{t.selectSession}</h3>
                <div className="space-y-4 overflow-y-auto max-h-[650px] pr-2 pb-2 shrink-0">
                  {sessionTypes.map(st => (
                    <Card
                      key={st.id}
                      className={cn(
                        "cursor-pointer transition-all border-2 hover:-translate-y-0.5 motion-reduce:transform-none",
                        selectedSessionType === st.id ? "border-primary shadow-hover" : "border-border hover:border-primary/40"
                      )}
                      onClick={() => {
                        setSelectedSessionType(st.id);
                        // Reset payment method when switching session type
                        setFormData(p => ({ ...p, paymentMethod: '' }));
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2">
                             {selectedSessionType === st.id
                               ? <LivePulse live />
                               : <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-success" aria-hidden="true" />}
                             <h4 className="font-semibold text-foreground">{st.title}</h4>
                          </div>
                          <button 
                            type="button"
                            aria-label={t.expand}
                            aria-expanded={expandedCard === st.id}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-full transition-colors flex-shrink-0"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setExpandedCard(expandedCard === st.id ? null : st.id); 
                            }}
                          >
                             {expandedCard === st.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className={`text-sm text-muted-foreground mt-2 ${expandedCard === st.id ? '' : 'line-clamp-1'}`}>{st.description}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{num(st.duration_minutes)} {t.min}</Badge>
                          {st.is_paid ? (
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">৳{num(Number(st.fee))}</Badge>
                          ) : (
                            <Badge className="bg-success-strong text-success-strong-foreground hover:bg-success-strong/90">
                              <Tag className="h-3 w-3 mr-1" />{t.free}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Form */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>{t.yourDetails}</CardTitle>
                  <CardDescription>{t.fillInfo}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t.name}</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder={t.namePh} value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t.email}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" type="email" placeholder="your@email.com" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t.whatsapp}</Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder="01XXXXXXXXX" value={formData.whatsapp} onChange={e => setFormData(p => ({ ...p, whatsapp: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t.phone}</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder="01XXXXXXXXX" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t.date}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date ? fmtDate(formData.date.toISOString(), { day: "numeric", month: "long", year: "numeric" }) : t.pickDate}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.date}
                            onSelect={date => setFormData(p => ({ ...p, date, time: '' }))}
                            disabled={date => date < new Date() || !availabilitySettings.available_weekdays.includes(date.getDay()) || isDateUnavailable(date)}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>{t.timeSlot}</Label>
                      <Select value={formData.time} onValueChange={v => setFormData(p => ({ ...p, time: v }))}>
                        <SelectTrigger><SelectValue placeholder={t.selectTime} /></SelectTrigger>
                        <SelectContent>
                          {getAllTimeSlotsWithAvailability(formData.date).map(slot => (
                            <SelectItem key={slot.time} value={slot.time} disabled={!slot.available}>
                              {slot.time} (GMT+6) {!slot.available && t.booked}
                            </SelectItem>
                          ))}
                          {getAllTimeSlotsWithAvailability(formData.date).length === 0 && (
                            <SelectItem value="" disabled>{t.noSlots}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Only show payment method selector for paid sessions */}
                  {selectedSession && !isFree && (
                    <div className="space-y-2">
                      <Label>{t.payMethod}</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['bkash', 'nagad'] as const).map(method => (
                          <Button
                            key={method}
                            type="button"
                            variant="outline"
                            className={cn(
                              "h-14 text-base font-semibold transition-all",
                              formData.paymentMethod === method
                                ? method === 'bkash' ? "border-brand-bkash bg-brand-bkash-soft text-brand-bkash-soft-foreground" : "border-brand-nagad bg-brand-nagad-soft text-brand-nagad-soft-foreground"
                                : "hover:border-primary/40"
                            )}
                            onClick={() => handleSelectPaymentMethod(method)}
                          >
                            <CreditCard className="h-5 w-5 mr-2" />
                            {method === 'bkash' ? t.bkash : t.nagad}
                          </Button>
                        ))}
                      </div>

                      {/* Display QR & transaction input inline if selected and not expired */}
                      {formData.paymentMethod && timeLeft !== 'Expired' && (
                        <div className={cn(
                          "rounded-xl p-5 border-2 text-center space-y-4 mt-4 animate-in fade-in slide-in-from-top-4",
                          formData.paymentMethod === 'bkash' ? "border-brand-bkash/60 bg-brand-bkash-soft" : "border-brand-nagad/60 bg-brand-nagad-soft"
                        )}>
                          <div className="flex justify-between items-center bg-background/60 p-2 rounded-lg backdrop-blur-sm">
                             <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                                <Timer className="h-4 w-4" /> 
                                {timeLeft.replace(/\d/g, d => num(Number(d)))} {t.left}
                             </div>
                             <h4 className="font-semibold text-foreground text-sm">
                               {t.fee} <span className="font-bold text-lg text-primary">৳{num(Number(selectedSession.fee))}</span>
                             </h4>
                          </div>
                          
                          <p className="text-2xl font-mono font-bold text-foreground">
                            {formData.paymentMethod === 'bkash' ? paymentSettings?.bkash_number : paymentSettings?.nagad_number}
                          </p>

                          {(formData.paymentMethod === 'bkash' ? paymentSettings?.bkash_qr_code : paymentSettings?.nagad_qr_code) && (
                            <div className="mx-auto w-44 h-44 bg-scan p-2 rounded-xl shadow-sm my-4">
                              <img 
                                src={formData.paymentMethod === 'bkash' ? paymentSettings?.bkash_qr_code! : paymentSettings?.nagad_qr_code!} 
                                alt={`${formData.paymentMethod === 'bkash' ? t.bkash : t.nagad} ${t.qrAlt}`} 
                                className="w-full h-full object-contain"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                          )}
                          
                          <p className="text-sm font-medium opacity-80 max-w-[280px] mx-auto">
                            {t.scan}
                          </p>

                          {paymentSettings?.additional_instructions && (
                            <p className="text-sm text-muted-foreground pt-2 border-t border-border">
                              {paymentSettings.additional_instructions}
                            </p>
                          )}

                          <div className="space-y-1.5 pt-4 text-left">
                            <Label htmlFor="txnId" className="font-semibold text-sm">{t.txnLabel} <span className="text-destructive">*</span></Label>
                            <Input
                              id="txnId"
                              value={formData.transactionId}
                              onChange={e => setFormData(p => ({ ...p, transactionId: e.target.value }))}
                              placeholder={t.txnPh}
                              className="font-mono h-11 uppercase bg-background"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Free session info banner */}
                  {selectedSession && isFree && (
                    <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success-soft p-4">
                      <Tag className="h-5 w-5 text-success flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-success-foreground text-sm">{t.freeTitle}</p>
                        <p className="text-xs text-success/80 mt-0.5">{t.freeBody}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 space-y-3">
                    {timeLeft === 'Expired' && !isFree && (
                      <div className="bg-destructive/10 rounded-lg p-4 text-center">
                        <p className="text-destructive font-semibold">{t.winExpired}</p>
                        <Button className="mt-2" variant="outline" onClick={() => window.location.reload()}>{t.reload}</Button>
                      </div>
                    )}

                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      size="lg"
                      onClick={handleBookingSubmit}
                      disabled={
                        timeLeft === 'Expired' ||
                        !formData.name || !formData.email || !formData.date || !formData.time || !selectedSessionType ||
                        (!isFree && (!formData.paymentMethod || !formData.transactionId.trim()))
                      }
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />{isFree ? t.confirmFree : t.confirm}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Step 4: Confirmed */}
        {step === 'confirmed' && (
          <motion.div key="confirmed" {...fade}>
            <Card className="max-w-lg mx-auto text-center">
              <CardContent className="p-10 space-y-6">
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center mx-auto",
                  isFree ? "bg-success-soft" : "bg-primary/10"
                )}>
                  <CheckCircle2 className={cn("h-10 w-10", isFree ? "text-success" : "text-primary")} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {isFree ? t.sessionConfirmed : t.submitted}
                </h2>
                <p className="text-muted-foreground">
                  {isFree
                    ? <>{t.freeDone1}<strong>{formData.email}</strong>.</>
                    : <>{t.paidDone1}<strong>{formData.email}</strong>.</>
                  }
                </p>
                <div className="bg-muted rounded-lg p-4 text-sm text-left space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">{t.bookingId}</span><span className="font-mono text-foreground">{bookingId.slice(0, 8)}...</span></div>
                  {!isFree && formData.transactionId && (
                    <div className="flex justify-between"><span className="text-muted-foreground">{t.txnId}</span><span className="font-mono text-foreground">{formData.transactionId}</span></div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.status}</span>
                    {isFree
                      ? <Badge className="bg-success-strong text-success-strong-foreground">{t.confirmedBadge}</Badge>
                      : <Badge className="bg-primary/10 text-primary">{t.pendingBadge}</Badge>
                    }
                  </div>
                </div>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  {t.home}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookSession;
