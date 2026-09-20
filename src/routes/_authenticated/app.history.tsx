import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { getConversation, listConversations } from "@/lib/rag.functions";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/app/history")({
  head: () => ({
    meta: [
      { title: "History — Knowra" },
      { name: "description", content: "Revisit past grounded answers and their citations." },
      { property: "og:title", content: "History — Knowra" },
      { property: "og:description", content: "Revisit past grounded answers and their citations." },
    ],
  }),
  component: History,
});

function History() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => listConversations(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["conversation", openId],
    queryFn: () => getConversation({ data: { id: openId! } }),
    enabled: Boolean(openId),
  });

  const visible = conversations.filter((c) =>
    (c.title ?? "").toLowerCase().includes(filter.trim().toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">History</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Every answer is stored with the passages it was grounded in.
      </p>

      <Input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search questions"
        className="mt-6 min-h-11"
        aria-label="Search questions"
      />

      <div className="mt-4 space-y-2">
        {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
        {!isLoading && visible.length === 0 && (
          <p className="text-muted-foreground text-sm">No conversations yet.</p>
        )}
        {visible.map((c) => (
          <div key={c.id} className="panel overflow-hidden">
            <button
              className="flex min-h-14 w-full items-center gap-3 px-4 text-left"
              onClick={() => setOpenId(openId === c.id ? null : c.id)}
              aria-expanded={openId === c.id}
            >
              <MessageSquare className="text-muted-foreground size-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-sm">{c.title ?? "Untitled"}</span>
              <span className="text-muted-foreground shrink-0 text-xs">
                {new Date(c.created_at).toLocaleDateString()}
              </span>
            </button>
            {openId === c.id && (
              <div className="space-y-3 border-t p-4">
                {messages.map((m) => (
                  <div key={m.id} className="text-sm">
                    <p className="text-muted-foreground text-[10px] tracking-[0.18em] uppercase">
                      {m.role}
                    </p>
                    <p className="mt-1 leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
