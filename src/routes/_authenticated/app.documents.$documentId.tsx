import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { getDocument } from "@/lib/documents.functions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/documents/$documentId")({
  validateSearch: z.object({
    page: z.number().optional(),
    chunk: z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Document — Knowra" },
      { name: "description", content: "Read the source document behind a Knowra citation." },
      { property: "og:title", content: "Document — Knowra" },
      { property: "og:description", content: "Read the source document behind a Knowra citation." },
    ],
  }),
  component: DocumentViewer,
});

function DocumentViewer() {
  const { documentId } = Route.useParams();
  const { chunk } = Route.useSearch();
  const targetRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => getDocument({ data: { id: documentId } }),
  });

  useEffect(() => {
    if (chunk && targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [chunk, data]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-4 min-h-11">
        <Link to="/app/documents">
          <ArrowLeft className="size-4" /> Back to documents
        </Link>
      </Button>

      {isLoading && <p className="text-muted-foreground text-sm">Loading document…</p>}
      {error && <p className="text-destructive text-sm">{(error as Error).message}</p>}

      {data && (
        <>
          <h1 className="text-xl font-semibold tracking-tight break-words">
            {data.document.filename}
          </h1>
          <p className="text-muted-foreground mt-1 text-xs">
            {data.document.page_count ?? 0} pages · {data.chunks.length} passages ·{" "}
            {data.document.embedding_model ?? "not embedded"} · parser{" "}
            {data.document.parser_version ?? "n/a"}
          </p>

          <div className="mt-6 space-y-3">
            {data.chunks.map((c) => {
              const active = chunk === c.id;
              return (
                <div
                  key={c.id}
                  ref={active ? targetRef : undefined}
                  className={cn(
                    "panel p-4 transition-colors",
                    active && "border-[var(--primary)] bg-[color-mix(in_oklch,var(--primary)_8%,transparent)]",
                  )}
                >
                  <p className="text-muted-foreground text-[11px]">
                    Passage {c.chunk_index + 1}
                    {c.page_number != null ? ` · Page ${c.page_number}` : ""}
                    {c.section_title ? ` · ${c.section_title}` : ""}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{c.content}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
