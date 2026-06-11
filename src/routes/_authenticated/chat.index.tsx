import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createConversation } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/chat/")({ component: ChatIndex });

function ChatIndex() {
  const navigate = useNavigate();
  const create = useServerFn(createConversation);

  useEffect(() => {
    (async () => {
      // Prefer most recent conv; else create new
      const { data } = await (supabase as any).from("conversations").select("id").order("updated_at", { ascending: false }).limit(1);
      if (data && data.length > 0) {
        navigate({ to: "/chat/$threadId", params: { threadId: data[0].id }, replace: true });
      } else {
        const { id } = await create();
        navigate({ to: "/chat/$threadId", params: { threadId: id }, replace: true });
      }
    })();
  }, [create, navigate]);

  return (
    <div className="flex h-full items-center justify-center text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening chat…
      <MessageCircle className="ml-3 h-4 w-4" />
    </div>
  );
}
