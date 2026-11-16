import { MessageCircle, Phone, Users } from "lucide-react";
import { useLang, useT } from "@/i18n/lang";
import type { SalesPage } from "./salesPage";
import SectionShell from "./SectionShell";
import { CountUp, RevealGroup, RevealItem } from "./motion";

const T = {
  en: { title: "Community & contact", community: "Learner community", members: "members", join: "Join community", contact: "Talk to us", call: "Call", whatsapp: "WhatsApp" },
  bn: { title: "কমিউনিটি ও যোগাযোগ", community: "লার্নার কমিউনিটি", members: "জন সদস্য", join: "কমিউনিটিতে যোগ দিন", contact: "আমাদের সাথে কথা বলুন", call: "কল করুন", whatsapp: "হোয়াটসঅ্যাপ" },
};

const card = "h-full rounded-2xl border border-border bg-card p-6 shadow-card transition duration-200 hover:-translate-y-1";

const CommunityContact = ({ community, contact }: { community?: SalesPage["community"]; contact?: SalesPage["contact"] }) => {
  const t = useT(T);
  const { pick, num } = useLang();
  const hasContact = !!(contact && (contact.phone || contact.whatsapp));
  if (!community && !hasContact) return null;
  // wa.me needs the country code: local BD numbers (01XXXXXXXXX) become 8801XXXXXXXXX.
  const digits = contact?.whatsapp?.replace(/\D/g, "");
  const wa = digits && /^01\d{9}$/.test(digits) ? `88${digits}` : digits;
  return (
    <SectionShell id="community" title={t.title}>
      <RevealGroup className="grid gap-4 md:grid-cols-2">
        {community && (
          <RevealItem>
            <div className={card}>
              <Users aria-hidden className="mb-3 h-6 w-6 text-brand-blue" />
              <h3 className="font-semibold text-foreground">{community.title ? pick(community.title) : t.community}</h3>
              {community.members != null && (
                <p className="mt-2 text-sm text-muted-foreground">
                  <CountUp value={community.members} format={num} className="text-2xl font-bold text-foreground" /> {t.members}
                </p>
              )}
              <a
                href={community.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-brand-blue-hover"
              >
                {t.join}
              </a>
            </div>
          </RevealItem>
        )}
        {hasContact && (
          <RevealItem>
            <div className={card}>
              <Phone aria-hidden className="mb-3 h-6 w-6 text-brand-blue" />
              <h3 className="font-semibold text-foreground">{t.contact}</h3>
              {contact?.hours && <p className="mt-2 text-sm text-muted-foreground">{pick(contact.hours)}</p>}
              <div className="mt-4 flex flex-wrap gap-3">
                {contact?.phone && (
                  <a
                    href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                    aria-label={`${t.call} ${contact.phone}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary"
                  >
                    <Phone aria-hidden className="h-4 w-4" /> {contact.phone}
                  </a>
                )}
                {wa && (
                  <a
                    href={`https://wa.me/${wa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                  >
                    <MessageCircle aria-hidden className="h-4 w-4" /> {t.whatsapp}
                  </a>
                )}
              </div>
            </div>
          </RevealItem>
        )}
      </RevealGroup>
    </SectionShell>
  );
};

export default CommunityContact;
