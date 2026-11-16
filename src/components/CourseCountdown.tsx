import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { calculateCountdown } from "@/utils/countdown";
import { useLang, useT } from "@/i18n/lang";

const T = {
  en: { started: "Started", days: (n: string, many: boolean) => `${n} day${many ? "s" : ""} left`, left: (s: string) => `${s} left` },
  bn: { started: "শুরু হয়েছে", days: (n: string) => `আর ${n} দিন বাকি`, left: (s: string) => `আর ${s} বাকি` },
};

interface CourseCountdownProps {
  startDate: string | Date | null;
  className?: string;
  showIcon?: boolean;
}

export function CourseCountdown({ startDate, className = "", showIcon = true }: CourseCountdownProps) {
  const t = useT(T);
  const { num } = useLang();
  const [countdown, setCountdown] = useState(() => 
    startDate ? calculateCountdown(startDate) : null
  );

  useEffect(() => {
    if (!startDate) return;

    const interval = setInterval(() => {
      setCountdown(calculateCountdown(startDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate]);

  if (!startDate || !countdown) return null;

  if (countdown.isExpired) {
    return (
      <Badge variant="secondary" className={`${className} bg-success-strong text-success-strong-foreground`}>
        {showIcon && <Clock className="w-3 h-3 mr-1" />}
        {t.started}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={`${className} bg-warning-soft text-warning-foreground`}>
      {showIcon && <Clock className="w-3 h-3 mr-1" />}
      {countdown.days > 0 ? t.days(num(countdown.days), countdown.days > 1) : t.left([countdown.hours, countdown.minutes, countdown.seconds].map((v) => (v < 10 ? num(0) : "") + num(v)).join(":"))}
    </Badge>
  );
}