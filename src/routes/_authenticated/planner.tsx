import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { planTasks } from "@/lib/ai.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarClock, Loader2, Sparkles } from "lucide-react";
import { FeatureShell, AIOutput } from "@/components/FeatureShell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/planner")({ component: Page });

function Page() {
  const fn = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState<"day" | "week">("day");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState("");

  const run = async () => {
    if (tasks.trim().length < 5) { toast.error("List a few tasks first."); return; }
    setLoading(true); setOut("");
    try { setOut((await fn({ data: { tasks, horizon } })).text); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <FeatureShell title="AI Task Planner & Scheduler" description="Prioritize with Eisenhower; block your time." icon={<CalendarClock className="h-6 w-6 text-primary-foreground" />}>
      <Card className="shadow-card"><CardContent className="space-y-4 pt-6">
        <div>
          <Label>Horizon</Label>
          <Select value={horizon} onValueChange={(v) => setHorizon(v as "day" | "week")}>
            <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily plan</SelectItem>
              <SelectItem value="week">Weekly plan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Your tasks</Label>
          <Textarea rows={10} value={tasks} onChange={(e) => setTasks(e.target.value)} placeholder="- Finalize Q3 report (due Friday)&#10;- Call supplier about delayed order&#10;- Onboard new hire&#10;- Review pull requests…" />
        </div>
        <Button onClick={run} disabled={loading} className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Build my plan
        </Button>
      </CardContent></Card>
      <AIOutput text={out} loading={loading} />
    </FeatureShell>
  );
}
