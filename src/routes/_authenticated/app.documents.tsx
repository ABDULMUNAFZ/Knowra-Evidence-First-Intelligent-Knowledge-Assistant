import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Trash2, RefreshCw, Search } from "lucide-react";
import { deleteDocument, listDocuments, processDocument } from "@/lib/documents.functions";
import { useActiveCollection } from "@/hooks/use-active-collection";
import { UploadZone } from "@/components/knowra/upload-zone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Knowra" },
      { name: "description", content: "Upload and manage the documents Knowra grounds answers in." },
      { property: "og:title", content: "Documents — Knowra" },
      {
        property: "og:description",
        content: "Upload and manage the documents Knowra grounds answers in.",
      },
    ],
  }),
  component: Documents,
});

const STATUS_STYLE: Record<string, string> = {
  ready: "text-[var(--success)]",
  failed: "text-destructive",
  processing: "text-[var(--warning)]",
  queued: "text-muted-foreground",
};

function Documents() {
  const { collections, activeId, setActiveId } = useActiveCollection();
  const [filter, setFilter] = useState("");
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents", activeId],
    queryFn: () => listDocuments({ data: { collectionId: activeId! } }),
    enabled: Boolean(activeId),
    refetchInterval: (q) =>
      (q.state.data ?? []).some((d) => d.processing_status === "processing") ? 2000 : false,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteDocument({ data: { id } }),
    onSuccess: () => {
      toast.success("Document deleted");
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
      void queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reprocess = useMutation({
    mutationFn: (id: string) => processDocument({ data: { id } }),
    onSuccess: () => {
      toast.success("Reprocessed");
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const visible = documents.filter((d) =>
    d.filename.toLowerCase().includes(filter.trim().toLowerCase()),
  );

  if (collections.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">
          Create a collection first, then upload documents into it.
        </p>
        <Button asChild className="mt-4 min-h-11">
          <Link to="/app">Go to collections</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Every file is parsed, chunked and embedded for real retrieval.
          </p>
        </div>
        <Select value={activeId ?? ""} onValueChange={(v) => setActiveId(v)}>
          <SelectTrigger className="min-h-11 w-full sm:w-56" aria-label="Active collection">
            <SelectValue placeholder="Select collection" />
          </SelectTrigger>
          <SelectContent>
            {collections.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeId && (
        <div className="mt-6">
          <UploadZone collectionId={activeId} />
        </div>
      )}

      <div className="mt-8">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter documents"
            className="min-h-11 pl-9"
            aria-label="Filter documents"
          />
        </div>

        <ul className="mt-4 space-y-2">
          {isLoading && <p className="text-muted-foreground text-sm">Loading documents…</p>}
          {!isLoading && visible.length === 0 && (
            <p className="text-muted-foreground text-sm">No documents yet in this collection.</p>
          )}
          {visible.map((doc) => (
            <li key={doc.id} className="panel flex items-center gap-3 p-3">
              <FileText className="text-muted-foreground size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <Link
                  to="/app/documents/$documentId"
                  params={{ documentId: doc.id }}
                  className="block truncate text-sm font-medium hover:underline"
                >
                  {doc.filename}
                </Link>
                <p className="text-muted-foreground mt-0.5 truncate text-xs">
                  <span className={cn(STATUS_STYLE[doc.processing_status] ?? "")}>
                    {doc.processing_status === "processing"
                      ? `${doc.processing_stage}…`
                      : doc.processing_status}
                  </span>
                  {doc.chunk_count ? ` · ${doc.chunk_count} passages` : ""}
                  {doc.page_count ? ` · ${doc.page_count} pages` : ""}
                  {doc.error_message ? ` · ${doc.error_message}` : ""}
                </p>
              </div>
              {doc.processing_status === "failed" && (
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Retry processing"
                  onClick={() => reprocess.mutate(doc.id)}
                >
                  <RefreshCw className="size-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Delete ${doc.filename}`}
                onClick={() => remove.mutate(doc.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
