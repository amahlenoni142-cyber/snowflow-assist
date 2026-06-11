import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DISCLAIMER =
  "\n\n---\n*This response was generated using AI and should be reviewed for accuracy and suitability before professional use.*";

async function ai(messages: { role: "system" | "user" | "assistant"; content: string }[]) {
  const { generateCompletion } = await import("./ai-gateway.server");
  return generateCompletion({ messages });
}

// ─── Email Generator ──────────────────────────────────────────────────────
export const generateEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      recipient: z.string().min(1).max(100),
      tone: z.enum(["formal", "friendly", "persuasive"]),
      purpose: z.string().min(3).max(2000),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const system = `You are Snow Flow AI's professional email writer. Produce a complete email with:
SUBJECT: <subject line>
BODY:
<greeting>
<2-4 short paragraphs>
<clear call-to-action>
<professional closing>
Tone: ${data.tone}. Recipient type: ${data.recipient}. Be concise, specific, and workplace-appropriate.`;
    const out = await ai([
      { role: "system", content: system },
      { role: "user", content: data.purpose },
    ]);
    return { text: out + DISCLAIMER };
  });

// ─── Meeting Summarizer ───────────────────────────────────────────────────
export const summarizeMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ notes: z.string().min(10).max(20000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const system = `You summarize meeting notes/transcripts. Output markdown with these exact sections:
## Summary
1-3 sentence overview.
## Key Discussion Points
- bullets
## Decisions Made
- bullets (or "None recorded")
## Action Items
| Action | Owner | Deadline |
|---|---|---|
If owner or deadline is unclear, write "TBD — verify". Never invent names or dates.`;
    const out = await ai([
      { role: "system", content: system },
      { role: "user", content: data.notes },
    ]);
    return { text: out + DISCLAIMER };
  });

// ─── Task Planner ─────────────────────────────────────────────────────────
export const planTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      tasks: z.string().min(5).max(5000),
      horizon: z.enum(["day", "week"]),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const system = `You are a productivity planner. Build a ${data.horizon === "day" ? "daily" : "weekly"} schedule from the user's tasks.
Output markdown:
## Eisenhower Matrix
**Do First (Urgent + Important)** — list
**Schedule (Important, Not Urgent)** — list
**Delegate (Urgent, Not Important)** — list
**Eliminate (Neither)** — list
## Time-Blocked ${data.horizon === "day" ? "Day" : "Week"}
${data.horizon === "day" ? "Block by hour (e.g. 09:00–10:30)." : "Block by day + time range."}
Include estimated completion time per task. Flag anything ambiguous as "verify scope".`;
    const out = await ai([
      { role: "system", content: system },
      { role: "user", content: data.tasks },
    ]);
    return { text: out + DISCLAIMER };
  });

// ─── Research Assistant ───────────────────────────────────────────────────
export const research = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ topic: z.string().min(3).max(10000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const system = `You are a research assistant. Summarize the topic/article below in markdown:
## Overview (plain-language)
## Key Insights
- bullets
## Important Statistics
- bullets (only if present in source; otherwise write "No statistics provided — verify externally")
## Recommendations
- bullets
Do not invent facts. If information is missing, say so.`;
    const out = await ai([
      { role: "system", content: system },
      { role: "user", content: data.topic },
    ]);
    return { text: out + DISCLAIMER };
  });

// ─── Chat ─────────────────────────────────────────────────────────────────
export const chatSend = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      conversationId: z.string().uuid(),
      message: z.string().min(1).max(8000),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Verify conversation belongs to user
    const { data: conv, error: convErr } = await supabase
      .from("conversations" as never)
      .select("id, title")
      .eq("id", data.conversationId)
      .maybeSingle();
    if (convErr || !conv) throw new Error("Conversation not found");

    // Load history
    const { data: history } = await supabase
      .from("messages" as never)
      .select("role, content")
      .eq("conversation_id", data.conversationId)
      .order("created_at", { ascending: true });

    // Insert user message
    await supabase.from("messages" as never).insert({
      conversation_id: data.conversationId,
      user_id: userId,
      role: "user",
      content: data.message,
    });

    const systemPrompt = `You are Snow Flow AI, a friendly, professional workplace productivity assistant. Help with productivity, planning, communication, and research. Be concise, actionable, and solution-oriented. When data is incomplete, ask for clarification or note what needs verification. Never invent facts.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...((history ?? []) as { role: "user" | "assistant" | "system"; content: string }[]).map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
      { role: "user" as const, content: data.message },
    ];

    const { generateCompletion } = await import("./ai-gateway.server");
    const reply = await generateCompletion({ messages });

    // Save assistant reply
    await supabase.from("messages" as never).insert({
      conversation_id: data.conversationId,
      user_id: userId,
      role: "assistant",
      content: reply,
    });

    // Auto-title on first exchange
    const title = (conv as { title: string }).title;
    if (title === "New conversation") {
      const newTitle = data.message.slice(0, 60).replace(/\s+/g, " ").trim();
      await supabase.from("conversations" as never).update({ title: newTitle, updated_at: new Date().toISOString() }).eq("id", data.conversationId);
    } else {
      await supabase.from("conversations" as never).update({ updated_at: new Date().toISOString() }).eq("id", data.conversationId);
    }

    return { reply };
  });

export const createConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("conversations" as never)
      .insert({ user_id: userId, title: "New conversation" })
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Could not create conversation");
    return { id: (data as { id: string }).id };
  });
