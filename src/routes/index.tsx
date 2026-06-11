import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Snowflake, Mail, ClipboardList, CalendarClock, BookOpenText, MessageCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Snow Flow AI — Workplace Productivity Assistant" },
      { name: "description", content: "An AI-powered workplace assistant for emails, meeting notes, task planning, research, and chat." },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: Landing,
});

const features = [
  { icon: Mail, title: "Smart Email Generator", desc: "Draft polished emails in seconds." },
  { icon: ClipboardList, title: "Meeting Summarizer", desc: "Turn notes into action items." },
  { icon: CalendarClock, title: "Task Planner", desc: "Eisenhower matrix + time blocks." },
  { icon: BookOpenText, title: "Research Assistant", desc: "Distill articles into insights." },
  { icon: MessageCircle, title: "AI Chat", desc: "Threaded workplace conversations." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background bg-gradient-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Snowflake className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-gradient">Snow Flow AI</span>
        </div>
        <Link to="/auth"><Button variant="outline" size="sm">Sign in</Button></Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" />
            Powered by Lovable AI
          </div>
          <h1 className="font-display text-5xl font-bold tracking-tight md:text-7xl">
            Your AI <span className="text-gradient">workplace assistant</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Snow Flow AI helps professionals draft emails, summarize meetings, plan tasks, research topics, and chat — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/auth"><Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">Get started free</Button></Link>
            <a href="#features"><Button size="lg" variant="outline">Explore features</Button></a>
          </div>
        </div>

        <div id="features" className="mt-24 grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card/60 p-6 shadow-card backdrop-blur transition hover:border-primary/50">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <footer className="mt-24 text-center text-xs text-muted-foreground">
          Responses are AI-generated. Review for accuracy before professional use.
        </footer>
      </main>
    </div>
  );
}
