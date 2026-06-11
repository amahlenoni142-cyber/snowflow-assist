import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { chatSend } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Snowflake, Send, Loader2, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({ component: ThreadView });

type Msg = { id: string; role: "user" | "assistant" | "system"; content: string };

function ThreadView() {
  const { threadId } = Route.useParams();
  const send = useServerFn(chatSend);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const load = async () => {
    const { data } = await (supabase as any).from("messages").select("id, role, content").eq("conversation_id", threadId).order("created_at", { ascending: true });
    setMessages((data ?? []) as Msg[]);
  };

  useEffect(() => { load(); inputRef.current?.focus(); }, [threadId]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, sending]);

  const onSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    const tempUser: Msg = { id: `tmp-${Date.now()}`, role: "user", content: text };
    setMessages((m) => [...m, tempUser]);
    setSending(true);
    try {
      await send({ data: { conversationId: threadId, message: text } });
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send");
      setMessages((m) => m.filter((x) => x.id !== tempUser.id));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-10">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && !sending && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
                <Snowflake className="h-7 w-7 text-primary-foreground" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold text-gradient">Snow Flow AI</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">Ask anything about productivity, planning, communication, or research. I'll keep responses concise and actionable.</p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role !== "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                  <Snowflake className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div className={m.role === "user"
                ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-primary px-4 py-2.5 text-sm text-primary-foreground shadow-glow"
                : "max-w-[80%] whitespace-pre-wrap text-sm leading-relaxed text-foreground"}>
                {m.content}
              </div>
              {m.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {sending && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                <Snowflake className="h-4 w-4 animate-pulse text-primary-foreground" />
              </div>
              <div className="text-sm text-muted-foreground">Thinking…</div>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-border bg-background/60 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask Snow Flow AI…"
            rows={1}
            className="max-h-40 min-h-[44px] resize-none"
          />
          <Button onClick={onSend} disabled={!input.trim() || sending} size="icon" className="h-11 w-11 shrink-0 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-muted-foreground">Responses are AI-generated. Review before professional use.</p>
      </div>
    </div>
  );
}
