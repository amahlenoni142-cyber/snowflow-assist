import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, MessageCircle, Trash2, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { createConversation } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat")({ component: ChatLayout });

type Conv = { id: string; title: string; updated_at: string };

function ChatLayout() {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const newConv = useServerFn(createConversation);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("conversations").select("id, title, updated_at").order("updated_at", { ascending: false });
    setConvs((data ?? []) as Conv[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, [pathname]);

  const create = async () => {
    setCreating(true);
    try {
      const { id } = await newConv();
      await load();
      navigate({ to: "/chat/$threadId", params: { threadId: id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create conversation");
    } finally { setCreating(false); }
  };

  const del = async (id: string) => {
    await (supabase as any).from("conversations").delete().eq("id", id);
    await load();
    if (pathname.includes(id)) navigate({ to: "/chat" });
    toast.success("Conversation deleted");
  };

  return (
    <div className="flex h-[calc(100vh-3rem)]">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-card/40 backdrop-blur md:flex">
        <div className="border-b border-border p-3">
          <Button onClick={create} disabled={creating} className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
            {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            New conversation
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="p-4 text-center text-xs text-muted-foreground">Loading…</div>
          ) : convs.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">No conversations yet.</div>
          ) : (
            <div className="space-y-1">
              {convs.map((c) => {
                const active = pathname.endsWith(c.id);
                return (
                  <div key={c.id} className={`group flex items-center gap-1 rounded-md ${active ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/50"}`}>
                    <Link to="/chat/$threadId" params={{ threadId: c.id }} className="flex flex-1 items-center gap-2 px-3 py-2 text-sm">
                      <MessageCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="line-clamp-1">{c.title}</span>
                    </Link>
                    <button onClick={() => del(c.id)} className="opacity-0 transition group-hover:opacity-100 mr-2 rounded p-1 hover:bg-destructive/20 text-muted-foreground hover:text-destructive" aria-label="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
      <div className="flex-1 overflow-hidden"><Outlet /></div>
    </div>
  );
}
