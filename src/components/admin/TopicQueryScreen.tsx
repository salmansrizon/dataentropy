import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircleQuestion, Send, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RowSkeleton } from '@/components/ui/skeletons';
import { useToast } from '@/hooks/use-toast';

export default function TopicQueryScreen() {
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const query = useQuery({ queryKey: ['admin-topic-queries'], queryFn: async () => { const { data, error } = await (supabase as any).from('topic_queries').select('id, query_text, answer, status, created_at, topic:topics(title)').order('created_at', { ascending: false }); if (error) throw error; return data ?? []; } });
  if (query.isLoading) return <RowSkeleton count={5} />;
  const update = async (id: string, status: 'answered' | 'hidden') => {
    const answer = answers[id]?.trim();
    if (status === 'answered' && !answer) return;
    const { error } = await (supabase as any).from('topic_queries').update({ status, answer: status === 'answered' ? answer : null, answered_at: status === 'answered' ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return toast({ title: 'Could not update', description: error.message, variant: 'destructive' });
    queryClient.invalidateQueries({ queryKey: ['admin-topic-queries'] });
  };
  return <div className="space-y-4"><div><h2 className="text-2xl font-extrabold">Learner queries</h2><p className="text-sm text-muted-foreground">Answer concrete learner blocks; publish only responses useful to future learners.</p></div>{(query.data ?? []).map((item: any) => <Card key={item.id}><CardContent className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><Badge variant="outline">{item.status}</Badge><p className="mt-2 text-xs text-primary">{item.topic?.title ?? 'Topic'}</p><p className="mt-1 font-semibold"><MessageCircleQuestion className="mr-2 inline h-4 w-4" />{item.query_text}</p></div></div>{item.status === 'pending' ? <div className="mt-4"><label htmlFor={`answer-${item.id}`} className="text-sm font-bold">Mentor answer</label><Textarea id={`answer-${item.id}`} className="mt-2 min-h-28 text-base" value={answers[item.id] ?? ''} onChange={(event) => setAnswers((current) => ({ ...current, [item.id]: event.target.value }))} /><div className="mt-3 flex gap-2"><Button className="rounded-full" disabled={!answers[item.id]?.trim()} onClick={() => update(item.id,'answered')}><Send className="mr-2 h-4 w-4" />Publish answer</Button><Button variant="outline" className="rounded-full" onClick={() => update(item.id,'hidden')}><EyeOff className="mr-2 h-4 w-4" />Hide</Button></div></div> : item.answer && <p className="mt-4 rounded-xl bg-secondary p-4 text-sm leading-6">{item.answer}</p>}</CardContent></Card>)}</div>;
}
