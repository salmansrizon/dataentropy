import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { HelpCircle, MessageCircleQuestion, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useT } from '@/i18n/lang';

const T = {
  en: { short: 'Write at least 10 characters so a mentor can understand the block.', sent: 'Query sent', sentD: 'It is private until a mentor answers and publishes it.', fail: 'Could not send', ask: 'Ask about this Topic', scoped: 'Topic-scoped help, not a noisy public feed.', block: 'What is blocking you?', ph: 'Describe what you tried and where the result stopped making sense.', priv: 'Private until answered. Do not include personal or payment information.', send: 'Ask', wait: 'Waiting for a mentor response.' },
  bn: { short: 'অন্তত ১০টি অক্ষর লিখুন, যাতে মেন্টর আপনার সমস্যাটি বুঝতে পারেন।', sent: 'প্রশ্ন পাঠানো হয়েছে', sentD: 'মেন্টর উত্তর দিয়ে প্রকাশ না করা পর্যন্ত এটি প্রাইভেট থাকবে।', fail: 'পাঠানো যায়নি', ask: 'এই টপিক নিয়ে জিজ্ঞাসা করুন', scoped: 'শুধু এই টপিকের সাহায্য, কোলাহলপূর্ণ পাবলিক ফিড নয়।', block: 'কোথায় আটকে আছেন?', ph: 'কী চেষ্টা করেছেন আর ফলাফল কোথায় অসংগত মনে হয়েছে, লিখুন।', priv: 'উত্তর না আসা পর্যন্ত প্রাইভেট। ব্যক্তিগত বা পেমেন্ট তথ্য দেবেন না।', send: 'জিজ্ঞাসা', wait: 'মেন্টরের উত্তরের অপেক্ষায়।' },
};

export default function TopicQueries({ topicId }: { topicId: string }) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const t = useT(T);
  const reduceMotion = useReducedMotion();
  const [learnerQuery, setLearnerQuery] = useState('');
  const query = useQuery({
    queryKey: ['topic-queries', topicId],
    queryFn: async () => {
      const { data } = await (supabase as any).from('topic_queries').select('id, query_text, answer, status, created_at').eq('topic_id', topicId).order('created_at', { ascending: false });
      return data ?? [];
    },
  });
  const ask = useMutation({
    mutationFn: async () => {
      const userId = session?.user?.id;
      if (!userId || learnerQuery.trim().length < 10) throw new Error(t.short);
      const { error } = await (supabase as any).from('topic_queries').insert({ topic_id: topicId, user_id: userId, query_text: learnerQuery.trim() });
      if (error) throw error;
    },
    onSuccess: () => { setLearnerQuery(''); queryClient.invalidateQueries({ queryKey: ['topic-queries', topicId] }); toast({ title: t.sent, description: t.sentD }); },
    onError: (error) => toast({ title: t.fail, description: (error as Error).message, variant: 'destructive' }),
  });
  return (
    <section className="mt-8 rounded-2xl border bg-card p-5 shadow-card" aria-labelledby="topic-help-heading">
      <div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><MessageCircleQuestion className="h-5 w-5" aria-hidden="true" /></span><div><h2 id="topic-help-heading" className="text-lg font-extrabold">{t.ask}</h2><p className="text-sm text-muted-foreground">{t.scoped}</p></div></div>
      <div className="mt-5"><Label htmlFor="topic-query">{t.block}</Label><Textarea id="topic-query" className="mt-2 min-h-24 text-base" value={learnerQuery} onChange={(event) => setLearnerQuery(event.target.value)} placeholder={t.ph} maxLength={1000} /><div className="mt-2 flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">{t.priv}</p><Button className="rounded-full" disabled={ask.isPending || learnerQuery.trim().length < 10} onClick={() => ask.mutate()}><Send className="mr-2 h-4 w-4" />{t.send}</Button></div></div>
      {(query.data ?? []).length > 0 && <div className="mt-6 space-y-3">{query.data!.map((item: any, index: number) => <motion.article key={item.id} initial={reduceMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.03 }} className="rounded-xl border bg-secondary/50 p-4"><p className="font-semibold"><HelpCircle className="mr-2 inline h-4 w-4 text-primary" />{item.query_text}</p>{item.answer ? <p className="mt-3 border-l-2 border-primary pl-3 text-sm leading-6 text-muted-foreground">{item.answer}</p> : <p className="mt-2 text-xs text-muted-foreground">{t.wait}</p>}</motion.article>)}</div>}
    </section>
  );
}
