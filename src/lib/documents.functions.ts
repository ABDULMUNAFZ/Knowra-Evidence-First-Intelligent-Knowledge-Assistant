import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const BUCKET = "knowledge-documents";
export const ALLOWED_EXTENSIONS = ["pdf", "docx", "txt", "md", "markdown", "csv"] as const;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

export function safeStorageName(filename: string): string {
  const base = filename.split(/[\\/]/).pop() ?? "file";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
}

export const listDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ collectionId: z.string().uuid().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("documents")
      .select(
        "id, filename, mime_type, size_bytes, processing_status, processing_stage, error_message, page_count, chunk_count, embedding_model, parser_version, created_at, collection_id",
      )
      .order("created_at", { ascending: false });
    if (data.collectionId) q = q.eq("collection_id", data.collectionId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getDocument = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: doc, error } = await context.supabase
      .from("documents")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    const { data: chunks, error: chunkError } = await context.supabase
      .from("document_chunks")
      .select("id, content, page_number, section_title, chunk_index")
      .eq("document_id", data.id)
      .order("chunk_index");
    if (chunkError) throw new Error(chunkError.message);
    return { document: doc, chunks: chunks ?? [] };
  });

export const createDocumentRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        collectionId: z.string().uuid(),
        filename: z.string().min(1).max(255),
        mimeType: z.string().max(200),
        sizeBytes: z.number().int().positive().max(MAX_FILE_BYTES),
        storagePath: z.string().min(1),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const ext = data.filename.toLowerCase().split(".").pop() ?? "";
    if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
      throw new Error(`Unsupported file type: .${ext}`);
    }
    if (!data.storagePath || data.storagePath.includes("..")) {
      throw new Error("Invalid storage path.");
    }
    // ownership check on the collection (never trust the client id)
    const { data: collection, error: colError } = await context.supabase
      .from("collections")
      .select("id")
      .eq("id", data.collectionId)
      .single();
    if (colError || !collection) throw new Error("Collection not found.");

    const { data: row, error } = await context.supabase
      .from("documents")
      .insert({
        user_id: context.userId,
        collection_id: data.collectionId,
        filename: safeStorageName(data.filename),
        mime_type: data.mimeType,
        size_bytes: data.sizeBytes,
        storage_path: data.storagePath,
        processing_status: "processing",
        processing_stage: "extracting",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: doc } = await context.supabase
      .from("documents")
      .select("storage_path")
      .eq("id", data.id)
      .single();
    if (doc?.storage_path) {
      await context.supabase.storage.from(BUCKET).remove([doc.storage_path]);
    }
    const { error } = await context.supabase.from("documents").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Runs the real ingestion pipeline:
 * download -> extract -> normalize -> chunk -> embed -> index -> ready
 * Stage is written to the row at each step so the UI shows true progress.
 */
export const processDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const setStage = async (stage: string) => {
      await supabase
        .from("documents")
        .update({ processing_stage: stage, updated_at: new Date().toISOString() })
        .eq("id", data.id);
    };

    const { data: doc, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !doc) throw new Error("Document not found.");

    try {
      const { parseDocument, PARSER_VERSION } = await import("./parsing.server");
      const { chunkPages } = await import("./chunking.server");
      const { gatewayEmbeddingProvider } = await import("./embeddings.server");

      await setStage("extracting");
      const { data: blob, error: dlError } = await supabase.storage
        .from(BUCKET)
        .download(doc.storage_path!);
      if (dlError || !blob) throw new Error(`Could not read the stored file: ${dlError?.message}`);
      const bytes = new Uint8Array(await blob.arrayBuffer());

      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const checksum = [...new Uint8Array(digest)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const parsed = await parseDocument(bytes, doc.filename, doc.mime_type);

      await setStage("chunking");
      const title = doc.filename.replace(/\.[^.]+$/, "");
      const chunks = chunkPages(parsed.pages, title);
      if (chunks.length === 0) throw new Error("No text chunks could be produced from this file.");

      await setStage("embedding");
      const vectors = await gatewayEmbeddingProvider.embedDocuments(chunks.map((c) => c.content));

      await setStage("indexing");
      await supabase.from("document_chunks").delete().eq("document_id", doc.id);
      const rows = chunks.map((c, i) => ({
        user_id: context.userId,
        document_id: doc.id,
        collection_id: doc.collection_id,
        content: c.content,
        page_number: c.pageNumber,
        section_title: c.sectionTitle,
        chunk_index: c.chunkIndex,
        token_count: c.tokenCount,
        source_start: c.sourceStart,
        source_end: c.sourceEnd,
        embedding: JSON.stringify(vectors[i]),
      }));
      for (let i = 0; i < rows.length; i += 25) {
        const { error: insertError } = await supabase
          .from("document_chunks")
          .insert(rows.slice(i, i + 25));
        if (insertError) throw new Error(`Indexing could not be completed: ${insertError.message}`);
      }

      await supabase
        .from("documents")
        .update({
          processing_status: "ready",
          processing_stage: "ready",
          error_message: null,
          checksum,
          page_count: parsed.pageCount,
          chunk_count: chunks.length,
          embedding_model: gatewayEmbeddingProvider.model,
          parser_version: PARSER_VERSION,
          full_text: parsed.pages.map((p) => `[[page:${p.pageNumber}]]\n${p.text}`).join("\n\n"),
          updated_at: new Date().toISOString(),
        })
        .eq("id", doc.id);

      await supabase
        .from("collections")
        .update({ last_indexed_at: new Date().toISOString() })
        .eq("id", doc.collection_id);

      return { ok: true, chunks: chunks.length, pages: parsed.pageCount };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown processing error";
      await supabase
        .from("documents")
        .update({
          processing_status: "failed",
          processing_stage: "failed",
          error_message: message,
        })
        .eq("id", data.id);
      throw new Error(message);
    }
  });
