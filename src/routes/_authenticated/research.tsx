import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { research } from "@/lib/ai.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpenText, Loader2, Sparkles } from "lucide-react";
import { FeatureShell, AIOutput } from "@/components/FeatureShell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/research")({ component: Page });

function Page() {
  const fn = useServerFn(research);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState("");

  const run = async () => {
    if (topic.trim().length < 3) { toast.error("Provide a topic or paste an article."); return; }
    setLoading(true); setOut("");
    try { setOut((await fn({ data: { topic } })).text); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <FeatureShell title="AI Research Assistant" description="Distill any topic or article into clear insights." icon={<BookOpenText className="h-6 w-6 text-primary-foreground" />}>
      <Card className="shadow-card"><CardContent className="space-y-4 pt-6">
        <div>
          <Label>Topic, article, or report content</Label>
          <Textarea rows={12} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter a topic (e.g. 'Impact of remote work on productivity') or paste an article…" />
        </div>
        <Button onClick={run} disabled={loading} className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Research
        </Button>
      </CardContent></Card>
      <AIOutput text={out} loading={loading} />
    </FeatureShell>
  );
}
