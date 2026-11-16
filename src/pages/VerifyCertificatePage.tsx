import { Link, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, XCircle, Loader2, Link2 } from 'lucide-react';
import { useCertificate } from '@/hooks/useAssessment';
import { useLang, useT } from '@/i18n/lang';
import { Reveal } from '@/pages/course-details/motion';

const T = {
  en: {
    none: 'No such credential', noneBody: 'This verification link does not match any certificate we have issued.',
    valid: 'Valid credential', justNow: 'Verified just now', revoked: 'Revoked', revokedOn: 'Revoked', noLonger: 'This credential is no longer valid',
    issuedTo: 'Issued to', credential: 'Credential', issued: 'Issued', credId: 'Credential ID',
    questions: 'Questions assessed', score: 'Score', of: (a: string, b: string) => `${a} of ${b}`, conditions: 'Conditions',
    timed: (m: string) => `Timed, ${m} minutes`,
    scope: 'Covers only the portion of this Journey the platform assesses.',
    copy: 'Copy verification link', about: 'About Career Prep',
  },
  bn: {
    none: 'এমন কোনো সনদ নেই', noneBody: 'এই ভেরিফিকেশন লিংকটি আমাদের ইস্যু করা কোনো সার্টিফিকেটের সাথে মেলে না।',
    valid: 'বৈধ সনদ', justNow: 'এইমাত্র যাচাই হয়েছে', revoked: 'বাতিল', revokedOn: 'বাতিল হয়েছে', noLonger: 'এই সনদটি আর বৈধ নয়',
    issuedTo: 'যাকে দেওয়া হয়েছে', credential: 'সনদ', issued: 'ইস্যুর তারিখ', credId: 'সনদ আইডি',
    questions: 'মূল্যায়িত প্রশ্ন', score: 'স্কোর', of: (a: string, b: string) => `${b}-এর মধ্যে ${a}`, conditions: 'শর্ত',
    timed: (m: string) => `সময়সীমা সহ, ${m} মিনিট`,
    scope: 'প্ল্যাটফর্ম এই Journey-র যে অংশটুকু মূল্যায়ন করে, শুধু সেটুকুই এখানে ধরা হয়েছে।',
    copy: 'ভেরিফিকেশন লিংক কপি করুন', about: 'Career Prep সম্পর্কে',
  },
};

/**
 * Public certificate verification.
 *
 * A stranger lands here with no other context, so the page states what was
 * assessed *and* what was not. A credential that overclaims gets discounted
 * entirely; naming the scope is what makes it worth checking.
 *
 * Readable without signing in, by design — `certificates` has a public SELECT
 * policy for exactly this.
 */
const VerifyCertificatePage = () => {
  const { id } = useParams<{ id: string }>();
  const t = useT(T);
  const { num, date } = useLang();
  const { certificate, loading } = useCertificate(id);

  const summary = (certificate?.assessed_summary ?? {}) as Record<string, unknown>;
  const valid = certificate?.status === 'valid';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-xl px-4 pb-20 pt-28">
        {loading ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary opacity-40" />
        ) : !certificate ? (
          <Card>
            <CardContent className="p-8 text-center">
              <XCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <h1 className="text-xl font-bold">{t.none}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.noneBody}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Reveal>
            <Card className={valid ? 'border-success/40' : 'border-danger/40'}>
              <CardContent className="p-8">
                <div className="page-heading flex items-center gap-3">
                  {valid ? (
                    <>
                      <ShieldCheck className="h-8 w-8 text-success" />
                      <div>
                        <p className="text-lg font-bold text-success">{t.valid}</p>
                        <p className="text-xs text-muted-foreground">{t.justNow}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-8 w-8 text-danger" />
                      <div>
                        <p className="text-lg font-bold text-danger">{t.revoked}</p>
                        <p className="text-xs text-muted-foreground">
                          {certificate.revoked_at
                            ? `${t.revokedOn} ${date(certificate.revoked_at)}`
                            : t.noLonger}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <dl className="space-y-3 text-sm">
                  {[
                    [t.issuedTo, certificate.holder_name],
                    [t.credential, certificate.credential_title],
                    [t.issued, date(certificate.issued_at)],
                    [t.credId, certificate.id],
                    [t.questions, summary.questions !== undefined ? num(Number(summary.questions)) : '—'],
                    [t.score, summary.score !== undefined ? t.of(num(Number(summary.score)), num(Number(summary.questions))) : '—'],
                    [t.conditions, summary.timed_minutes ? t.timed(num(Number(summary.timed_minutes))) : '—'],
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between gap-4 border-b pb-2 last:border-0">
                      <dt className="shrink-0 text-muted-foreground">{k}</dt>
                      <dd className="break-all text-right font-medium">{v as string}</dd>
                    </div>
                  ))}
                </dl>

                {/* The scope statement is the point of the page. */}
                <p className="mt-6 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
                  {(summary.scope as string) ??
                    t.scope}
                </p>
              </CardContent>
            </Card>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="gap-1.5 rounded-full"
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
              >
                <Link2 className="h-4 w-4" /> {t.copy}
              </Button>
              <Button asChild variant="ghost" className="rounded-full">
                <Link to="/career-prep">{t.about}</Link>
              </Button>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificatePage;
