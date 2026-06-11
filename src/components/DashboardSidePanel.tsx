import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Calendar, Lightbulb, TrendingUp, Clock, ArrowRight, Sparkles } from "lucide-react";

type Conv = { id: string; title: string; updated_at: string };

export function DashboardSidePanel() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [convs, setConvs] = useState<Conv[]>([]);
  const [totalConvs, setTotalConvs] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email);
    });

    (async () => {
      const { data: c } = await (supabase as any)
        .from("conversations")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);
      setConvs((c ?? []) as Conv[]);
      setTotalConvs(c?.length ?? 0);

      const { count } = await (supabase as any)
        .from("messages")
        .select("*", { count: "exact", head: true });
      setTotalMessages(count ?? 0);
    })();
  }, []);

  const initials = userEmail
    .split("@")[0]
    .split(/[._-]/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const tips = [
    "Use the Task Planner to block your day by priority.",
    "Paste meeting notes into the Summarizer to extract action items.",
    "Ask the AI Chat for quick email rewrites on the fly.",
    "Research Assistant helps you verify facts before sending.",
  ];

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      {/* Profile Card */}
      <Card className="border-border/60 bg-card/60 backdrop-blur">
        <CardContent className="flex items-center gap-3 p-4">
          <Avatar className="h-10 w-10 border border-primary/30 shadow-glow">
            <AvatarFallback className="bg-gradient-primary text-sm font-bold text-primary-foreground">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{userEmail || "Welcome back"}</p>
            <p className="text-xs text-muted-foreground">{today}</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="border-border/60 bg-card/60 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 pb-4">
          <div className="rounded-lg bg-secondary/40 p-3 text-center">
            <div className="text-xl font-bold text-gradient">{totalConvs}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Chats</div>
          </div>
          <div className="rounded-lg bg-secondary/40 p-3 text-center">
            <div className="text-xl font-bold text-gradient">{totalMessages}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Messages</div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Conversations */}
      <Card className="flex flex-1 flex-col overflow-hidden border-border/60 bg-card/60 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MessageCircle className="h-4 w-4 text-primary" />
            Recent Chats
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 px-2 pb-2">
          <ScrollArea className="h-full pr-2">
            {convs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-muted-foreground">
                <Sparkles className="mb-2 h-5 w-5 text-primary/50" />
                <p>No conversations yet.</p>
                <p>Start a new chat to get help from Snow Flow AI.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {convs.map((c) => (
                  <Link
                    key={c.id}
                    to="/chat/$threadId"
                    params={{ threadId: c.id }}
                    className="group flex items-center gap-2 rounded-md px-2 py-2 text-sm transition hover:bg-sidebar-accent"
                  >
                    <MessageCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="line-clamp-1 flex-1 text-foreground/90">{c.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100 group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="border-border/60 bg-card/60 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Lightbulb className="h-4 w-4 text-primary" />
            Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-2">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
