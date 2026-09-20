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
    <div className="mx-auto max-w-5xl py-4 sm:py-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3.5 py-1 text-xs font-bold tracking-widest text-[#ff4500] uppercase shadow-sm font-['Chakra_Petch',sans-serif] mb-2">
            <span>Document Ingestion Vault</span>
          </div>
          <h1 className="font-['Orbitron',sans-serif] text-3xl font-black text-neutral-950 tracking-tight">
            Document Storage
          </h1>
          <p className="text-neutral-600 mt-1 text-xs font-mono">
            Files are automatically extracted, chunked, and indexed into 3072D vector space.
          </p>
        </div>
        <Select value={activeId ?? ""} onValueChange={(v) => setActiveId(v)}>
          <SelectTrigger className="h-11 w-full sm:w-60 rounded-full border-neutral-300 bg-white text-xs font-bold font-['Chakra_Petch',sans-serif] uppercase tracking-wider shadow-sm" aria-label="Active collection">
            <SelectValue placeholder="Select collection" />
          </SelectTrigger>
          <SelectContent>
            {collections.map((c) => (
              <SelectItem key={c.id} value={c.id} className="font-mono text-xs">
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeId && (
        <div className="rounded-3xl bg-white border border-neutral-200 p-6 shadow-lg">
          <UploadZone collectionId={activeId} />
        </div>
      )}

      <div className="rounded-3xl bg-white border border-neutral-200 p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <h2 className="font-['Orbitron',sans-serif] text-lg font-bold text-neutral-950">Indexed Files</h2>
          <div className="relative w-full max-w-xs">
            <Search className="text-neutral-400 absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search files..."
              className="h-9 rounded-full pl-9 bg-neutral-50 border-neutral-200 text-xs font-mono"
              aria-label="Filter documents"
            />
          </div>
        </div>

        <ul className="space-y-2">
          {isLoading && <p className="text-neutral-500 font-mono text-xs">Loading documents database…</p>}
          {!isLoading && visible.length === 0 && (
            <p className="text-neutral-500 font-mono text-xs py-4 text-center">No documents indexed in this collection yet. Upload a document above.</p>
          )}
          {visible.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 p-4 rounded-2xl border border-neutral-100 bg-neutral-50/60 hover:bg-neutral-100/80 transition-all">
              <div className="size-10 rounded-xl bg-neutral-900 text-[#ff4500] flex items-center justify-center shrink-0 shadow-sm">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  to="/app/documents/$documentId"
                  params={{ documentId: doc.id }}
                  className="block truncate text-sm font-bold text-neutral-950 hover:text-[#ff4500] transition-colors"
                >
                  {doc.filename}
                </Link>
                <p className="text-neutral-500 mt-0.5 truncate text-xs font-mono flex items-center gap-2">
                  <span className={cn("font-bold uppercase", STATUS_STYLE[doc.processing_status] ?? "")}>
                    {doc.processing_status === "processing"
                      ? `${doc.processing_stage}…`
                      : doc.processing_status}
                  </span>
                  {doc.chunk_count ? <span>· {doc.chunk_count} vectors</span> : null}
                  {doc.page_count ? <span>· {doc.page_count} pages</span> : null}
                </p>
              </div>
              {doc.processing_status === "failed" && (
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Retry processing"
                  onClick={() => reprocess.mutate(doc.id)}
                  className="rounded-full text-amber-600 hover:bg-amber-50"
                >
                  <RefreshCw className="size-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Delete ${doc.filename}`}
                onClick={() => remove.mutate(doc.id)}
                className="rounded-full text-neutral-400 hover:text-red-600 hover:bg-red-50"
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
