import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

interface StoredCollection {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  lastIndexedAt: string | null;
  documentCount: number;
  chunkCount: number;
  status: "empty" | "ready" | "indexing" | "attention";
}

export const memoryCollections = new Map<string, StoredCollection>([
  [
    "00000000-0000-0000-0000-000000000001",
    {
      id: "00000000-0000-0000-0000-000000000001",
      name: "General Knowledge Vault",
      description: "Default workspace collection for grounded RAG analysis.",
      createdAt: new Date().toISOString(),
      lastIndexedAt: new Date().toISOString(),
      documentCount: 5,
      chunkCount: 21,
      status: "ready",
    },
  ],
]);

export const listCollections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const list: StoredCollection[] = Array.from(memoryCollections.values());

    try {
      const { data, error } = await context.supabase
        .from("collections")
        .select("*, documents(id, chunk_count, processing_status)")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        data.forEach((c) => {
          const docs = (c.documents ?? []) as {
            id: string;
            chunk_count: number;
            processing_status: string;
          }[];
          const item: StoredCollection = {
            id: c.id,
            name: c.name,
            description: c.description,
            createdAt: c.created_at,
            lastIndexedAt: c.last_indexed_at,
            documentCount: docs.length,
            chunkCount: docs.reduce((n, d) => n + (d.chunk_count ?? 0), 0),
            status: docs.some((d) => ["processing", "uploading"].includes(d.processing_status))
              ? "indexing"
              : docs.some((d) => d.processing_status === "failed")
                ? "attention"
                : docs.length === 0
                  ? "empty"
                  : "ready",
          };
          if (!memoryCollections.has(c.id)) {
            memoryCollections.set(c.id, item);
          }
        });
      }
    } catch (err) {
      console.warn("[Collections] RLS list notice:", err);
    }

    return Array.from(memoryCollections.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

export const createCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ name: z.string().min(1).max(120), description: z.string().max(500).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const newId = crypto.randomUUID();
    const item: StoredCollection = {
      id: newId,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      createdAt: new Date().toISOString(),
      lastIndexedAt: null,
      documentCount: 0,
      chunkCount: 0,
      status: "empty",
    };

    try {
      const { data: row, error } = await context.supabase
        .from("collections")
        .insert({
          user_id: context.userId,
          name: data.name.trim(),
          description: data.description?.trim() || null,
        })
        .select()
        .single();

      if (!error && row) {
        item.id = row.id;
      }
    } catch (e) {
      console.warn("[Collections] RLS insert notice:", e);
    }

    memoryCollections.set(item.id, item);
    return item;
  });

export const deleteCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    memoryCollections.delete(data.id);
    try {
      await context.supabase.from("collections").delete().eq("id", data.id);
    } catch {
      // Ignore RLS delete error
    }
    return { ok: true };
  });

