import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { getSystemStatus } from "@/lib/rag.functions";

export const Route = createFileRoute("/_authenticated/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Knowra" },
      { name: "description", content: "Knowra system status, models and retrieval configuration." },
      { property: "og:title", content: "Settings — Knowra" },
      {
        property: "og:description",
        content: "Knowra system status, models and retrieval configuration.",
      },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { data, isLoading } = useQuery({
    queryKey: ["system-status"],
    queryFn: () => getSystemStatus(),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Live configuration of the retrieval and generation pipeline.
      </p>

      {isLoading && <p className="text-muted-foreground mt-6 text-sm">Checking system…</p>}

      {data && (
        <div className="mt-6 space-y-3">
          <div className="panel flex items-center gap-3 p-4">
            {data.aiConfigured ? (
              <CheckCircle2 className="size-5 text-[var(--success)]" />
            ) : (
              <AlertCircle className="text-destructive size-5" />
            )}
            <div>
              <p className="text-sm font-medium">
                {data.aiConfigured ? "AI provider connected" : "AI provider not configured"}
              </p>
              <p className="text-muted-foreground text-xs">
                {data.aiConfigured
                  ? "Generation and embeddings are live."
                  : "Answers and processing will fail until the AI key is available."}
              </p>
            </div>
          </div>

          <dl className="panel divide-y p-0 text-sm">
            {[
              ["Answer model", data.chatModel ?? "—"],
              ["Embedding model", data.embeddingModel ?? "—"],
              ["Vector store", data.vectorStore],
              ["Retrieval", "Hybrid: semantic + full-text, then lexical-coverage reranking"],
              ["Documents indexed", String(data.documents)],
              ["Passages indexed", String(data.chunks)],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-mono text-xs">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="panel p-4 text-sm">
            <p className="font-medium">Privacy</p>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              Documents are stored privately and readable only by your account. Retrieval and
              answers are always scoped to your own collections. Retrieved text is treated as
              untrusted data, never as instructions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
