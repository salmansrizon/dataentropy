import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/lang";

export function LangToggle() {
  const { lang, setLang } = useLang();
  const next = lang === "en" ? "bn" : "en";
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLang(next)}
      aria-label={next === "bn" ? "বাংলায় দেখুন" : "Switch to English"}
      className="h-9 gap-1.5 rounded-full px-3 font-semibold"
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      <span lang={next}>{next === "bn" ? "বাং" : "EN"}</span>
    </Button>
  );
}
