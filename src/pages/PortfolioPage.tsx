import PageIntro from '@/components/PageIntro';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Github, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import Navbar from "@/components/Navbar";
import { usePageView } from "@/hooks/usePageView";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/i18n/lang";
import { Reveal, RevealGroup, RevealItem } from "@/pages/course-details/motion";

const T = {
  en: {
    eyebrow: "From idea to implementation", title: "Practical work. Visible outcomes.",
    desc: "Explore projects in analytics, engineering, and software. See the tools, decisions, and implementations behind the work.",
    h1: "Portfolio", sub: "A showcase of my projects and technical implementations",
    less: "Show less", more: "Read more", demo: "Live Demo", src: "Source Code", empty: "No projects available yet.",
  },
  bn: {
    eyebrow: "আইডিয়া থেকে বাস্তবায়ন", title: "ব্যবহারিক কাজ। চোখে পড়ার মতো ফলাফল।",
    desc: "অ্যানালিটিক্স, ইঞ্জিনিয়ারিং ও সফটওয়্যারের প্রজেক্ট দেখুন। কাজের পেছনের টুল, সিদ্ধান্ত ও বাস্তবায়ন জানুন।",
    h1: "পোর্টফোলিও", sub: "আমার প্রজেক্ট ও টেকনিক্যাল বাস্তবায়নের সংগ্রহ",
    less: "কম দেখুন", more: "আরও পড়ুন", demo: "লাইভ ডেমো", src: "সোর্স কোড", empty: "এখনো কোনো প্রজেক্ট নেই।",
  },
};

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image_url?: string;
  demo_url?: string;
  github_url?: string;
  created_at: string;
}

const DESC_LIMIT = 120;

const PortfolioPage = () => {
  const t = useT(T);
  usePageView("/portfolio");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-32 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <PageIntro eyebrow={t.eyebrow} title={t.title} description={t.desc} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden border border-border/50">
                  <Skeleton className="aspect-video w-full" />
                  <CardHeader className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <div className="flex gap-2">
                       <Skeleton className="h-5 w-16" />
                       <Skeleton className="h-5 w-20" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-6" />
                    <div className="flex gap-3">
                       <Skeleton className="h-10 flex-1" />
                       <Skeleton className="h-10 flex-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section className="min-h-screen pt-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Reveal className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-4 text-primary">{t.h1}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t.sub}
            </p>
          </Reveal>

          <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => {
              const isExpanded = expandedIds.has(project.id);
              const isLong = project.description.length > DESC_LIMIT;

              return (
                <RevealItem key={project.id} className="h-full">
                <Card className="overflow-hidden hover:shadow-lg hover:-translate-y-1 transition duration-300 motion-reduce:transform-none flex flex-col h-full">
                  {project.image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  <CardHeader className="flex-none">
                    <CardTitle className="text-xl font-bold mb-2 text-primary">{project.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.technologies.map((tech, index) => (
                        <Badge key={index} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <div className="flex-1">
                      <p className="text-muted-foreground mb-2">
                        {isLong && !isExpanded
                          ? `${project.description.slice(0, DESC_LIMIT)}...`
                          : project.description}
                      </p>
                      {isLong && (
                        <button
                          onClick={() => toggleExpand(project.id)}
                          className="text-primary text-sm font-medium flex items-center gap-1 mb-4 hover:underline"
                        >
                          {isExpanded ? t.less : t.more}
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      )}
                      {!isLong && <div className="mb-4" />}
                    </div>
                    <div className="flex gap-3 mt-auto">
                      {project.demo_url && (
                        <Button variant="outline" className="flex-1" asChild>
                          <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {t.demo}
                          </a>
                        </Button>
                      )}
                      {project.github_url && (
                        <Button variant="outline" className="flex-1" asChild>
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-2" />
                            {t.src}
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                </RevealItem>
              );
            })}
          </RevealGroup>

          {projects.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <p>{t.empty}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default PortfolioPage;
