import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateEmail } from "@/lib/ai.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Loader2, Sparkles } from "lucide-react";
import { FeatureShell, AIOutput } from "@/components/FeatureShell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/email")({ component: EmailPage });

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [recipient, setRecipient] = useState("Client");
  const [tone, setTone] = useState<"formal" | "friendly" | "persuasive">("formal");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");

  const generate = async () => {
    if (purpose.trim().length < 3) { toast.error("Describe what the email is about."); return; }
    setLoading(true); setOutput("");
    try {
      const res = await fn({ data: { recipient, tone, purpose } });
      setOutput(res.text);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <FeatureShell title="Smart Email Generator" description="Draft professional emails in seconds." icon={<Mail className="h-6 w-6 text-primary-foreground" />}>
      <Card className="shadow-card">
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Recipient</Label>
              <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Client, Manager, Colleague…" />
            </div>
            <div>
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as "formal" | "friendly" | "persuasive")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Purpose / key points</Label>
            <Textarea rows={5} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Follow up on yesterday's proposal, ask for a meeting next week to discuss pricing tier options…" />
          </div>
          <Button onClick={generate} disabled={loading} className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate email
          </Button>
        </CardContent>
      </Card>
      <AIOutput text={output} loading={loading} />
    </FeatureShell>
  );
}
