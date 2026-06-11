import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function FeatureShell({ title, description, icon, children }: {
  title: string; description: string; icon: ReactNode; children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-10">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          {icon}
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function AIOutput({ text, loading }: { text: string; loading: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">AI output</CardTitle>
          <CardDescription>Editable — review before professional use</CardDescription>
        </div>
        {text && !loading && (
          <Button onClick={copy} variant="outline" size="sm" className="gap-2">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Snow Flow AI is thinking…</span>
          </div>
        ) : text ? (
          <textarea
            className="w-full min-h-[320px] resize-y rounded-md border border-border bg-input/30 px-4 py-3 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary"
            value={text}
            onChange={() => {}}
            readOnly={false}
            defaultValue={text}
            key={text}
          />
        ) : (
          <div className="text-center text-muted-foreground py-12">Output will appear here.</div>
        )}
      </CardContent>
    </Card>
  );
}
