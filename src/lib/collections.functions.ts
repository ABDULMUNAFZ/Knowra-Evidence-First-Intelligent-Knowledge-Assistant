import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listCollections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("collections")
      .select("*, documents(id, chunk_count, processing_status)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    return (data ?? []).map((c) => {
      const docs = (c.documents ?? []) as {
        id: string;
        chunk_count: number;
        processing_status: string;
      }[];
      return {
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
    });
  });

export const createCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ name: z.string().min(1).max(120), description: z.string().max(500).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("collections")
      .insert({
        user_id: context.userId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("collections").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
