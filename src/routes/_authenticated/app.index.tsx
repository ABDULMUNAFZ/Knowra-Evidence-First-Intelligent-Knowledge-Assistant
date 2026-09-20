import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderPlus, FileText, Layers, Trash2 } from "lucide-react";
import { createCollection, deleteCollection } from "@/lib/collections.functions";
import { useActiveCollection } from "@/hooks/use-active-collection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { triggerHaptic } from "@/lib/haptics";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({
    meta: [
      { title: "Workspace — Knowra" },
      { name: "description", content: "Your Knowra collections and knowledge base overview." },
      { property: "og:title", content: "Workspace — Knowra" },
      { property: "og:description", content: "Your Knowra collections and knowledge base overview." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { collections, isLoading, setActiveId, activeId } = useActiveCollection();
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (value: string) => createCollection({ data: { name: value } }),
    onSuccess: (collection) => {
      setName("");
      triggerHaptic("success");
      setActiveId(collection.id);
      void queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCollection({ data: { id } }),
    onSuccess: () => {
      toast.success("Collection deleted");
      void queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        A collection is an isolated knowledge base. Answers are only ever grounded in the collection
        you ask against.
      </p>

      <form
        className="mt-6 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim().length > 0) create.mutate(name.trim());
        }}
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New collection name"
          maxLength={80}
          className="min-h-11"
          aria-label="New collection name"
        />
        <Button type="submit" disabled={create.isPending || name.trim().length === 0} className="min-h-11">
          <FolderPlus className="size-4" /> Create
        </Button>
      </form>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {isLoading && <p className="text-muted-foreground text-sm">Loading collections…</p>}
        {!isLoading && collections.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No collections yet. Create one above, then upload documents to it.
          </p>
        )}
        {collections.map((c) => (
          <div key={c.id} className="panel p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{c.name}</p>
                <p className="text-muted-foreground mt-1 flex flex-wrap gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <FileText className="size-3" /> {c.documentCount} documents
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="size-3" /> {c.chunkCount} passages
                  </span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Delete ${c.name}`}
                onClick={() => remove.mutate(c.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant={activeId === c.id ? "secondary" : "outline"}
                size="sm"
                className="min-h-10"
                onClick={() => setActiveId(c.id)}
              >
                {activeId === c.id ? "Active" : "Set active"}
              </Button>
              <Button asChild size="sm" variant="ghost" className="min-h-10">
                <Link to="/app/documents" onClick={() => setActiveId(c.id)}>
                  Documents
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="min-h-10">
                <Link to="/app/ask" onClick={() => setActiveId(c.id)}>
                  Ask
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
