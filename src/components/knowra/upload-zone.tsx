import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { UploadCloud, File as FileIcon, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createDocumentRecord, processDocument } from "@/lib/documents.functions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptics";
import { toast } from "sonner";

const ACCEPT = ".pdf,.docx,.txt,.md,.markdown,.csv";
const MAX_BYTES = 25 * 1024 * 1024;

type Stage = "uploading" | "extracting" | "chunking" | "embedding" | "indexing" | "ready" | "failed";

const STAGES: Stage[] = ["uploading", "extracting", "chunking", "embedding", "indexing", "ready"];

interface Item {
  id: string;
  name: string;
  stage: Stage;
  error?: string;
  documentId?: string;
}

export function UploadZone({ collectionId }: { collectionId: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const update = (id: string, patch: Partial<Item>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const { data: sessionData } = await supabase.auth.getUser();
    const userId = sessionData.user?.id;
    if (!userId) {
      toast.error("Your session expired. Sign in again.");
      return;
    }

    for (const file of Array.from(files)) {
      const localId = crypto.randomUUID();
      setItems((prev) => [...prev, { id: localId, name: file.name, stage: "uploading" }]);

      if (file.size > MAX_BYTES) {
        update(localId, { stage: "failed", error: "File is larger than 25 MB." });
        triggerHaptic("error");
        continue;
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${userId}/${collectionId}/${crypto.randomUUID()}-${safeName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from("knowledge-documents")
          .upload(path, file, { contentType: file.type || "application/octet-stream" });
        if (uploadError) throw new Error(uploadError.message);

        const doc = await createDocumentRecord({
          data: {
            collectionId,
            filename: file.name,
            mimeType: file.type || "application/octet-stream",
            sizeBytes: file.size,
            storagePath: path,
          },
        });
        update(localId, { documentId: doc.id, stage: "extracting" });

        // Poll the real backend stage while processing runs.
        const poll = window.setInterval(async () => {
          const { data } = await supabase
            .from("documents")
            .select("processing_stage, processing_status, error_message")
            .eq("id", doc.id)
            .single();
          if (data?.processing_stage) {
            update(localId, { stage: data.processing_stage as Stage });
          }
        }, 900);

        try {
          await processDocument({ data: { id: doc.id } });
          update(localId, { stage: "ready" });
          triggerHaptic("success");
        } finally {
          window.clearInterval(poll);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Processing failed";
        update(localId, { stage: "failed", error: message });
        triggerHaptic("error");
        toast.error(message);
      } finally {
        void queryClient.invalidateQueries({ queryKey: ["documents"] });
        void queryClient.invalidateQueries({ queryKey: ["collections"] });
      }
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "panel flex flex-col items-center justify-center gap-3 px-6 py-10 text-center transition-colors",
          dragging && "border-[var(--primary)] bg-[color-mix(in_oklch,var(--primary)_10%,transparent)]",
        )}
      >
        <UploadCloud className={cn("size-8", dragging ? "text-primary" : "text-muted-foreground")} />
        <div>
          <p className="text-sm font-medium">
            <span className="hidden sm:inline">Drag documents here, or </span>choose files
          </p>
          <p className="text-muted-foreground mt-1 text-xs">PDF, DOCX, TXT, MD, CSV · up to 25 MB</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => inputRef.current?.click()}
        >
          Choose files
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="panel p-3">
              <div className="flex items-center gap-3">
                <FileIcon className="text-muted-foreground size-4 shrink-0" />
                <span className="truncate text-sm">{item.name}</span>
                <span className="ml-auto shrink-0">
                  {item.stage === "ready" ? (
                    <CheckCircle2 className="size-4 text-[var(--success)]" />
                  ) : item.stage === "failed" ? (
                    <AlertCircle className="text-destructive size-4" />
                  ) : (
                    <Loader2 className="text-primary size-4 animate-spin" />
                  )}
                </span>
              </div>
              {item.stage === "failed" ? (
                <p className="text-destructive mt-2 text-xs">{item.error}</p>
              ) : (
                <ol className="text-muted-foreground mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                  {STAGES.map((s) => {
                    const done = STAGES.indexOf(item.stage) > STAGES.indexOf(s);
                    const current = item.stage === s;
                    return (
                      <li
                        key={s}
                        className={cn(
                          "capitalize",
                          done && "text-foreground/70",
                          current && "text-primary font-medium",
                        )}
                      >
                        {current && <span className="pipeline-dot mr-1">●</span>}
                        {s}
                      </li>
                    );
                  })}
                </ol>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
