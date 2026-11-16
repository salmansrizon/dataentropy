import { useState, useEffect, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useBookingData } from "@/hooks/useBookingData";
import { cn } from "@/lib/utils";
import { useT, useLang } from "@/i18n/lang";
import { supabase } from "@/integrations/supabase/client";
import {
  CreditCard,
  CheckCircle2,
  Tag,
  User,
  Mail,
  Smartphone,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────
export interface PaymentModalField {
  key: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

export interface PaymentModalData {
  name: string;
  email: string;
  whatsapp: string;
  paymentMethod: "bkash" | "nagad" | "";
  transactionId: string;
  /** Any extra field values keyed by PaymentModalField.key */
  extras: Record<string, string>;
  /** Uppercased, trimmed promo code; only set when collectPromoCode is on and non-empty. */
  promoCode?: string;
}

const DEFAULT_WINDOW_MINUTES = 30;

const T = {
  en: {
    promo: "Promo code (optional)",
    error: "Error",
    fullName: "Full Name *",
    fullNamePh: "Your full name",
    email: "Email *",
    whatsapp: "WhatsApp Number",
    paymentMethod: "Payment Method *",
    bkash: "bKash",
    nagad: "Nagad",
    qrAlt: (m: string) => `${m} QR code`,
    paymentDetails: "Payment details",
    fee: "Fee:",
    scanInstruction: "Scan the QR code or send money directly with proper details as a reference.",
    windowInstruction: (n: string) => `Please send the exact amount and provide the transaction ID within ${n} minutes.`,
    txnLabel: "Enter Transaction ID",
    txnPh: "e.g., 9F8G7H6A5B",
    freeTitle: "This is Free",
    freeDesc: "No payment required. Your booking will be confirmed immediately.",
    processing: "Processing...",
    timeLeft: "Time left",
    timeLeftSr: (n: string) => `${n} minutes left to pay`,
    expired: "Time is up. Start again.",
    restart: "Restart",
    fillNameEmail: "Please fill in Name and Email.",
    required: (l: string) => `${l} is required.`,
    selectMethod: "Please select a payment method.",
    txnRequired: "Transaction ID is strictly required. Check your SMS.",
    generic: "Something went wrong. Please try again.",
    okFreeEnroll: "Enrollment confirmed!",
    okFree: "Confirmed!",
    okPaidEnroll: "Enrollment submitted",
    okPaid: "Booking Submitted!",
    msgFreeEnroll: (e: ReactNode) => <>Course access is ready. We'll send details to {e}.</>,
    msgFree: (e: ReactNode) => <>Your spot has been confirmed. We'll send a reminder to {e}.</>,
    msgPaidEnroll: (e: ReactNode) => <>Payment is pending verification. We'll email access details to {e}.</>,
    msgPaid: (e: ReactNode) => <>Your booking has been submitted. We'll verify your payment and send a confirmation to {e}.</>,
    txnId: "Transaction ID",
    status: "Status",
    pending: "Pending Verification",
    close: "Close",
  },
  bn: {
    promo: "প্রোমো কোড (ঐচ্ছিক)",
    error: "ত্রুটি",
    fullName: "পূর্ণ নাম *",
    fullNamePh: "আপনার পূর্ণ নাম",
    email: "ইমেইল *",
    whatsapp: "হোয়াটসঅ্যাপ নম্বর",
    paymentMethod: "পেমেন্ট মাধ্যম *",
    bkash: "বিকাশ",
    nagad: "নগদ",
    qrAlt: (m: string) => `${m} কিউআর কোড`,
    paymentDetails: "পেমেন্টের তথ্য",
    fee: "ফি:",
    scanInstruction: "কিউআর কোড স্ক্যান করুন অথবা সঠিক রেফারেন্সসহ সরাসরি টাকা পাঠান।",
    windowInstruction: (n: string) => `অনুগ্রহ করে সঠিক পরিমাণ টাকা পাঠান এবং ${n} মিনিটের মধ্যে ট্রানজেকশন আইডি দিন।`,
    txnLabel: "ট্রানজেকশন আইডি দিন",
    txnPh: "যেমন, 9F8G7H6A5B",
    freeTitle: "এটি বিনামূল্যে",
    freeDesc: "কোনো পেমেন্ট লাগবে না। আপনার বুকিং সঙ্গে সঙ্গেই নিশ্চিত হবে।",
    processing: "প্রসেস হচ্ছে...",
    timeLeft: "সময় বাকি",
    timeLeftSr: (n: string) => `পেমেন্টের জন্য আর ${n} মিনিট বাকি`,
    expired: "সময় শেষ — আবার শুরু করুন",
    restart: "আবার শুরু করুন",
    fillNameEmail: "অনুগ্রহ করে নাম ও ইমেইল দিন।",
    required: (l: string) => `${l} আবশ্যক।`,
    selectMethod: "অনুগ্রহ করে একটি পেমেন্ট মাধ্যম বেছে নিন।",
    txnRequired: "ট্রানজেকশন আইডি অবশ্যই দিতে হবে। আপনার এসএমএস দেখুন।",
    generic: "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।",
    okFreeEnroll: "ভর্তি নিশ্চিত হয়েছে!",
    okFree: "নিশ্চিত হয়েছে!",
    okPaidEnroll: "ভর্তির আবেদন জমা হয়েছে",
    okPaid: "বুকিং জমা হয়েছে!",
    msgFreeEnroll: (e: ReactNode) => <>কোর্সে প্রবেশের সুযোগ প্রস্তুত। বিস্তারিত {e} ঠিকানায় পাঠানো হবে।</>,
    msgFree: (e: ReactNode) => <>আপনার সিট নিশ্চিত হয়েছে। {e} ঠিকানায় রিমাইন্ডার পাঠানো হবে।</>,
    msgPaidEnroll: (e: ReactNode) => <>পেমেন্ট যাচাইয়ের অপেক্ষায় আছে। প্রবেশের তথ্য {e} ঠিকানায় ইমেইল করা হবে।</>,
    msgPaid: (e: ReactNode) => <>আপনার বুকিং জমা হয়েছে। আমরা পেমেন্ট যাচাই করে {e} ঠিকানায় নিশ্চিতকরণ পাঠাব।</>,
    txnId: "ট্রানজেকশন আইডি",
    status: "স্ট্যাটাস",
    pending: "যাচাইয়ের অপেক্ষায়",
    close: "বন্ধ করুন",
  },
};

const mmss = (s: number) =>
  [Math.floor(s / 60), s % 60];

export interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog title, e.g. "Enroll in React Bootcamp" */
  title: string;
  /** Whether the item is free (skips payment step) */
  isFree: boolean;
  /** Price string to display, e.g. "৳499" or "Free" */
  priceLabel?: string;
  /** Extra form fields beyond Name / Email / WhatsApp */
  extraFields?: PaymentModalField[];
  /** Ask for WhatsApp only when fulfillment or support genuinely needs it. */
  collectWhatsapp?: boolean;
  /** Called with form data when user clicks submit.
   *  The consumer is responsible for the Supabase insert. */
  onSubmit: (data: PaymentModalData) => Promise<void>;
  /** Label for the submit button. Defaults to "Confirm" */
  submitLabel?: string;
  /** Label shown for free items. Defaults to "Confirm Free Booking" */
  freeSubmitLabel?: string;
  /** Changes generic booking copy for course enrollment flows. */
  confirmationType?: "booking" | "enrollment";
  /** Show an optional promo code input. Default false. */
  collectPromoCode?: boolean;
}

// ── Component ────────────────────────────────────────────────────
const PaymentModal = ({
  open,
  onOpenChange,
  title,
  isFree,
  priceLabel,
  extraFields = [],
  collectWhatsapp = true,
  onSubmit,
  submitLabel = "Confirm Booking",
  freeSubmitLabel = "Confirm Free Booking",
  confirmationType = "booking",
  collectPromoCode = false,
}: PaymentModalProps) => {
  const t = useT(T);
  const { num } = useLang();
  const { toast } = useToast();
  const { paymentSettings } = useBookingData();

  // ── Local state ──────────────────────────────────────────────
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "">("");
  const [transactionId, setTransactionId] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Payment window countdown ─────────────────────────────────
  const [fetchedWindow, setFetchedWindow] = useState<number | null>(null);
  const settingsWindow = paymentSettings?.payment_window_minutes;
  useEffect(() => {
    if (settingsWindow || fetchedWindow !== null || isFree || !open) return;
    let cancelled = false;
    supabase
      .from("payment_settings")
      .select("payment_window_minutes")
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!cancelled) setFetchedWindow(error || !data?.payment_window_minutes ? DEFAULT_WINDOW_MINUTES : data.payment_window_minutes);
      });
    return () => {
      cancelled = true;
    };
  }, [settingsWindow, fetchedWindow, isFree, open]);
  const windowMins = settingsWindow || fetchedWindow || DEFAULT_WINDOW_MINUTES;
  const totalSeconds = windowMins * 60;

  const timerActive = open && !isFree && !!paymentMethod && !success;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [timerRun, setTimerRun] = useState(0);
  useEffect(() => {
    if (!timerActive) {
      setRemaining(totalSeconds);
      return;
    }
    const end = Date.now() + totalSeconds * 1000;
    setRemaining(totalSeconds);
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [timerActive, totalSeconds, timerRun]);
  const expired = timerActive && remaining === 0;
  const [mm, ss] = mmss(remaining);
  const clock = `${num(mm).padStart(2, num(0))}:${num(ss).padStart(2, num(0))}`;
  const lowTime = remaining < 300;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      // Delay reset so closing animation finishes
      const t = setTimeout(() => {
        setName("");
        setEmail("");
        setWhatsapp("");
        setExtras({});
        setPaymentMethod("");
        setTransactionId("");
        setPromoCode("");
        setSubmitting(false);
        setSuccess(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ── Helpers ──────────────────────────────────────────────────
  const handleSelectPaymentMethod = (method: "bkash" | "nagad") => {
    setPaymentMethod(method);
  };

  const handleSubmit = async () => {
    // Validate base fields
    if (!name || !email) {
      toast({ title: t.error, description: t.fillNameEmail, variant: "destructive" });
      return;
    }

    // Validate required extras
    for (const field of extraFields) {
      if (field.required && !extras[field.key]?.trim()) {
        toast({ title: t.error, description: t.required(field.label), variant: "destructive" });
        return;
      }
    }

    // Validate payment for paid items
    if (!isFree) {
      if (!paymentMethod) {
        toast({ title: t.error, description: t.selectMethod, variant: "destructive" });
        return;
      }
      if (!transactionId.trim()) {
        toast({ title: t.error, description: t.txnRequired, variant: "destructive" });
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name,
        email,
        whatsapp,
        paymentMethod,
        transactionId,
        extras,
        ...(collectPromoCode && promoCode.trim() ? { promoCode: promoCode.trim().toUpperCase() } : {}),
      });
      setSuccess(true);
    } catch (err: any) {
      toast({
        title: t.error,
        description: err?.message || t.generic,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitDisabled =
    submitting ||
    expired ||
    !name ||
    !email ||
    (!isFree && (!paymentMethod || !transactionId.trim()));

  // ── Render ───────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        {success ? (
          /* ── Success View ─────────────────────────────────── */
          <div className="py-10 text-center space-y-6">
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mx-auto",
              isFree ? "bg-success-soft" : "bg-primary/10"
            )}>
              <CheckCircle2 className={cn("h-10 w-10", isFree ? "text-success" : "text-primary")} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {isFree
                  ? confirmationType === "enrollment" ? t.okFreeEnroll : t.okFree
                  : confirmationType === "enrollment" ? t.okPaidEnroll : t.okPaid}
              </h2>
              <p className="text-muted-foreground">
                {isFree
                  ? confirmationType === "enrollment"
                    ? t.msgFreeEnroll(<strong>{email}</strong>)
                    : t.msgFree(<strong>{email}</strong>)
                  : confirmationType === "enrollment"
                    ? t.msgPaidEnroll(<strong>{email}</strong>)
                    : t.msgPaid(<strong>{email}</strong>)
                }
              </p>
            </div>
            {!isFree && transactionId && (
              <div className="bg-muted rounded-lg p-4 text-sm text-left space-y-2 max-w-xs mx-auto">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.txnId}</span>
                  <span className="font-mono text-foreground">{transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.status}</span>
                  <Badge className="bg-primary/10 text-primary">{t.pending}</Badge>
                </div>
              </div>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t.close}
            </Button>
          </div>
        ) : (
          /* ── Form View ──────────────────────────────────── */
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Base fields */}
              <div className="space-y-1.5">
                <Label htmlFor="payment-name" className="text-sm font-semibold">{t.fullName}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="payment-name"
                    autoComplete="name"
                    className="pl-9"
                    placeholder={t.fullNamePh}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="payment-email" className="text-sm font-semibold">{t.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="payment-email"
                    autoComplete="email"
                    className="pl-9"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {collectWhatsapp && <div className="space-y-1.5">
                <Label htmlFor="payment-whatsapp" className="text-sm font-semibold">{t.whatsapp}</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="payment-whatsapp"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    className="pl-9"
                    placeholder="01XXXXXXXXX"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
              </div>}

              {/* Extra fields */}
              {extraFields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={`payment-extra-${field.key}`} className="text-sm font-semibold">
                    {field.label} {field.required && "*"}
                  </Label>
                  <Input
                    id={`payment-extra-${field.key}`}
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    value={extras[field.key] || ""}
                    onChange={(e) =>
                      setExtras((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                  />
                </div>
              ))}

              {collectPromoCode && (
                <div className="space-y-1.5">
                  <Label htmlFor="payment-promo" className="text-sm font-semibold">{t.promo}</Label>
                  <Input
                    id="payment-promo"
                    maxLength={40}
                    className="font-mono uppercase"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  />
                </div>
              )}

              {/* ── Payment Section (paid only) ─────────────── */}
              {!isFree && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{t.paymentMethod}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["bkash", "nagad"] as const).map((method) => (
                      <Button
                        key={method}
                        type="button"
                        variant="outline"
                        className={cn(
                          "h-14 text-base font-semibold transition-all",
                          paymentMethod === method
                            ? method === "bkash"
                              ? "border-brand-bkash bg-brand-bkash-soft text-brand-bkash-soft-foreground"
                              : "border-brand-nagad bg-brand-nagad-soft text-brand-nagad-soft-foreground"
                            : "hover:border-primary/40"
                        )}
                        onClick={() => handleSelectPaymentMethod(method)}
                      >
                        <CreditCard className="h-5 w-5 mr-2" />
                        {method === "bkash" ? t.bkash : t.nagad}
                      </Button>
                    ))}
                  </div>

                  {/* QR / account / txn input */}
                  {paymentMethod && (
                    <div
                      className={cn(
                        "rounded-xl p-5 border-2 text-center space-y-4 mt-4 animate-in fade-in slide-in-from-top-4",
                        paymentMethod === "bkash"
                          ? "border-brand-bkash/60 bg-brand-bkash-soft"
                          : "border-brand-nagad/60 bg-brand-nagad-soft"
                      )}
                    >
                      <div className="flex justify-between items-center bg-background/60 p-2 rounded-lg backdrop-blur-sm">
                        <div className="text-left text-sm font-semibold text-foreground">{t.paymentDetails}</div>
                        {priceLabel && (
                          <h4 className="font-semibold text-foreground text-sm">
                            {t.fee}{" "}
                            <span className="font-bold text-lg text-primary">
                              {priceLabel}
                            </span>
                          </h4>
                        )}
                      </div>

                      <div className="space-y-1.5 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums",
                              lowTime ? "bg-destructive/10 text-destructive" : "bg-background/60 text-foreground"
                            )}
                          >
                            {expired ? t.expired : `${t.timeLeft} ${clock}`}
                          </span>
                          {expired && (
                            <Button type="button" size="sm" variant="outline" onClick={() => setTimerRun((n) => n + 1)}>
                              {t.restart}
                            </Button>
                          )}
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/60">
                          <div
                            className={cn("h-full rounded-full transition-[width] duration-1000 ease-linear", lowTime ? "bg-destructive" : "bg-primary")}
                            style={{ width: `${(remaining / totalSeconds) * 100}%` }}
                          />
                        </div>
                        <span className="sr-only" aria-live="polite">
                          {t.timeLeftSr(num(Math.ceil(remaining / 60)))}
                        </span>
                      </div>

                      <p className="text-2xl font-mono font-bold text-foreground">
                        {paymentMethod === "bkash"
                          ? paymentSettings?.bkash_number
                          : paymentSettings?.nagad_number}
                      </p>

                      {(paymentMethod === "bkash"
                        ? paymentSettings?.bkash_qr_code
                        : paymentSettings?.nagad_qr_code) && (
                        <div className="mx-auto w-44 h-44 bg-scan rounded-xl shadow-sm my-4 overflow-hidden border border-border/50">
                          <img
                            src={
                              paymentMethod === "bkash"
                                ? paymentSettings?.bkash_qr_code!
                                : paymentSettings?.nagad_qr_code!
                            }
                            alt={t.qrAlt(paymentMethod === "bkash" ? t.bkash : t.nagad)}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      )}

                      <p className="text-sm font-medium opacity-80 max-w-[280px] mx-auto">
                        {t.scanInstruction} {t.windowInstruction(num(windowMins))}
                      </p>

                      {paymentSettings?.additional_instructions && (
                        <p className="text-sm text-muted-foreground pt-2 border-t border-border">
                          {paymentSettings.additional_instructions}
                        </p>
                      )}

                      <div className="space-y-1.5 pt-4 text-left">
                        <Label htmlFor="pm-txnId" className="font-semibold text-sm">
                          {t.txnLabel}{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="pm-txnId"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder={t.txnPh}
                          className="font-mono h-11 uppercase bg-background"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Free banner ─────────────────────────────── */}
              {isFree && (
                <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success-soft p-4">
                  <Tag className="h-5 w-5 text-success flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-success-foreground text-sm">
                      {t.freeTitle}
                    </p>
                    <p className="text-xs text-success/80 mt-0.5">
                      {t.freeDesc}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Submit ──────────────────────────────────── */}
              <div className="pt-2">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {submitting
                    ? t.processing
                    : isFree
                    ? freeSubmitLabel
                    : submitLabel}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
