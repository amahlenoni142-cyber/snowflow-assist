import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { summarizeMeeting } from "@/lib/ai.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList, Loader2, Sparkles } from "lucide-react";
import { FeatureShell, AIOutput } from "@/components/FeatureShell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/summarizer")({ component: Page });

function Page() {
  const fn = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState("");

  const run = async () => {
    if (notes.trim().length < 10) { toast.error("Paste meeting notes or transcript."); return; }
    setLoading(true); setOut("");
    try { setOut((await fn({ data: { notes } })).text); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <FeatureShell title="Meeting Notes Summarizer" description="Get decisions, action items, and owners." icon={<ClipboardList className="h-6 w-6 text-primary-foreground" />}>
      <Card className="shadow-card"><CardContent className="space-y-4 pt-6">
        <div>
          <Label>Meeting notes or transcript</Label>
          <Textarea rows={12} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste your raw notes, transcript, or discussion points here…" />
        </div>
        <Button onClick={run} disabled={loading} className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Summarize
        </Button>
      </CardContent></Card>
      <AIOutput text={out} loading={loading} />
    </FeatureShell>
  );
}
