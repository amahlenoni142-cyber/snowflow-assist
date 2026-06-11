import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Snowflake, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Snow Flow AI" },
      { name: "description", content: "Sign in or create your Snow Flow AI account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { display_name: name || email.split("@")[0] } },
        });
        if (error) throw error;
        toast.success("Account created!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    try {
      const { lovable } = await import("@/integrations/lovable/index");
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) { toast.error(result.error.message ?? "Google sign-in failed"); return; }
      if (result.redirected) return;
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-gradient-hero px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Snowflake className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-gradient">Snow Flow AI</span>
        </Link>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>{mode === "signin" ? "Welcome back" : "Create your account"}</CardTitle>
            <CardDescription>{mode === "signin" ? "Sign in to your workplace assistant." : "Start automating your workday."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={google} variant="outline" className="w-full" type="button">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .55 4.1 1.6l3-3C17.2 1.8 14.8 1 12 1 7.4 1 3.5 3.5 1.7 7.2l3.5 2.7C6.1 7 8.8 5 12 5z"/><path fill="#4285F4" d="M23 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h6.2c-.3 1.4-1.1 2.6-2.3 3.4l3.5 2.7c2-1.9 3.6-4.7 3.6-8.1z"/><path fill="#FBBC05" d="M5.2 14.1c-.2-.6-.4-1.4-.4-2.1s.1-1.5.4-2.1L1.7 7.2C.9 8.7.5 10.3.5 12s.4 3.3 1.2 4.8l3.5-2.7z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.4-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.9 1.1-3.2 0-5.9-2-6.8-4.8L1.7 16.8C3.5 20.5 7.4 23 12 23z"/></svg>
              Continue with Google
            </Button>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or with email</span></div>
            </div>
            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <div><Label htmlFor="name">Display name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Carter" /></div>
              )}
              <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label htmlFor="password">Password</Label><Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground">
              {mode === "signin" ? "New to Snow Flow AI? " : "Already have an account? "}
              <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary hover:underline">
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
