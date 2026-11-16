import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/lang";
import { Reveal } from "./motion";

const T = {
  en: { ready: (title: string) => `Ready to start ${title}?`, body: "Pick up the first lesson today and build real skills at your own pace.", questions: "Questions?" },
  bn: { ready: (title: string) => `${title} শুরু করতে প্রস্তুত?`, body: "আজই প্রথম পাঠটি শুরু করুন এবং নিজের গতিতে বাস্তব দক্ষতা গড়ে তুলুন।", questions: "প্রশ্ন আছে?" },
};

interface Props {
  title: string;
  ctaLabel: string;
  onCta: () => void;
  supportContact?: string | null;
}

export default function FinalCta({ title, ctaLabel, onCta, supportContact }: Props) {
  const t = useT(T);
  return (
    <Reveal>
    <div className="rounded-3xl bg-brand-gradient p-8 text-center text-primary-foreground sm:p-12">
      <h2 className="text-2xl font-black sm:text-4xl">{t.ready(title)}</h2>
      <p className="mx-auto mt-3 max-w-xl text-primary-foreground">{t.body}</p>
      <Button size="lg" className="mt-6 rounded-full bg-card text-brand-blue hover:bg-card/90" onClick={onCta}>{ctaLabel}</Button>
      {supportContact && <p className="mt-4 text-sm text-primary-foreground">{t.questions} {supportContact}</p>}
    </div>
    </Reveal>
  );
}
