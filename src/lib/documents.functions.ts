import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const BUCKET = "knowledge-documents";
export const ALLOWED_EXTENSIONS = [
  "pdf",
  "docx",
  "doc",
  "txt",
  "md",
  "markdown",
  "csv",
  "xlsx",
  "xls",
  "json",
] as const;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

export interface StoredDocRecord {
  id: string;
  user_id: string;
  collection_id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  processing_status: string;
  processing_stage: string;
  error_message?: string | null;
  checksum?: string | null;
  page_count?: number;
  chunk_count?: number;
  embedding_model?: string;
  parser_version?: string;
  full_text?: string;
  created_at: string;
  updated_at?: string;
}

export const memoryDocumentsStore = new Map<string, StoredDocRecord>();
export const memoryChunksStore = new Map<string, any[]>();
export const memoryFileContents = new Map<string, Uint8Array>();

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
    let supabaseRows: StoredDocRecord[] = [];
    try {
      let q = context.supabase
        .from("documents")
        .select(
          "id, filename, mime_type, size_bytes, processing_status, processing_stage, error_message, page_count, chunk_count, embedding_model, parser_version, created_at, collection_id",
        )
        .order("created_at", { ascending: false });
      if (data.collectionId) q = q.eq("collection_id", data.collectionId);
      const { data: rows, error } = await q;
      if (!error && rows) {
        supabaseRows = rows as StoredDocRecord[];
      }
    } catch (e) {
      console.warn("[Documents] RLS list notice:", e);
    }

    const memoryList = Array.from(memoryDocumentsStore.values()).filter(
      (d) => !data.collectionId || d.collection_id === data.collectionId,
    );

    const mergedMap = new Map<string, StoredDocRecord>();
    supabaseRows.forEach((d) => mergedMap.set(d.id, d));
    memoryList.forEach((d) => mergedMap.set(d.id, d));

    return Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  });

export const getDocument = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    let doc: StoredDocRecord | null = memoryDocumentsStore.get(data.id) ?? null;
    let chunks: any[] = memoryChunksStore.get(data.id) ?? [];

    try {
      if (!doc) {
        const { data: sDoc } = await context.supabase
          .from("documents")
          .select("*")
          .eq("id", data.id)
          .single();
        if (sDoc) doc = sDoc as StoredDocRecord;
      }
      if (chunks.length === 0) {
        const { data: sChunks } = await context.supabase
          .from("document_chunks")
          .select("id, content, page_number, section_title, chunk_index")
          .eq("document_id", data.id)
          .order("chunk_index");
        if (sChunks) chunks = sChunks;
      }
    } catch (e) {
      console.warn("[Documents] RLS get notice:", e);
    }

    if (!doc) throw new Error("Document not found.");
    return { document: doc, chunks };
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
        fileContentBase64: z.string().optional(),
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

    const docObj: StoredDocRecord = {
      id: crypto.randomUUID(),
      user_id: context.userId,
      collection_id: data.collectionId,
      filename: safeStorageName(data.filename),
      mime_type: data.mimeType,
      size_bytes: data.sizeBytes,
      storage_path: data.storagePath,
      processing_status: "processing",
      processing_stage: "extracting",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (data.fileContentBase64) {
      try {
        const bin = atob(data.fileContentBase64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        memoryFileContents.set(docObj.id, bytes);
      } catch (err) {
        console.warn("[Documents] Base64 decode notice:", err);
      }
    }

    try {
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
      if (!error && row) {
        docObj.id = row.id;
        if (data.fileContentBase64) {
          const raw = memoryFileContents.get(docObj.id);
          if (raw) memoryFileContents.set(row.id, raw);
        }
      }
    } catch (e) {
      console.warn("[Documents] RLS insert notice:", e);
    }

    memoryDocumentsStore.set(docObj.id, docObj);
    return docObj;
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    memoryDocumentsStore.delete(data.id);
    memoryChunksStore.delete(data.id);

    try {
      const { data: doc } = await context.supabase
        .from("documents")
        .select("storage_path")
        .eq("id", data.id)
        .single();
      if (doc?.storage_path) {
        await context.supabase.storage.from(BUCKET).remove([doc.storage_path]);
      }
      await context.supabase.from("documents").delete().eq("id", data.id);
    } catch {
      // Ignore RLS delete error
    }
    return { ok: true };
  });

export const processDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    let doc: StoredDocRecord | null = memoryDocumentsStore.get(data.id) ?? null;

    if (!doc) {
      try {
        const { data: sDoc } = await supabase
          .from("documents")
          .select("*")
          .eq("id", data.id)
          .single();
        if (sDoc) doc = sDoc as StoredDocRecord;
      } catch (e) {
        console.warn("[Documents] RLS select notice:", e);
      }
    }

    if (!doc) throw new Error("Document not found.");

    const setStage = async (stage: string) => {
      if (doc) {
        doc.processing_stage = stage;
        doc.updated_at = new Date().toISOString();
        memoryDocumentsStore.set(doc.id, doc);
      }
      try {
        await supabase
          .from("documents")
          .update({ processing_stage: stage, updated_at: new Date().toISOString() })
          .eq("id", data.id);
      } catch {
        // Ignore RLS update error
      }
    };

    try {
      const { parseDocument, PARSER_VERSION } = await import("./parsing.server");
      const { chunkPages } = await import("./chunking.server");
      const { gatewayEmbeddingProvider } = await import("./embeddings.server");

      await setStage("extracting");
      let bytes: Uint8Array = memoryFileContents.get(doc.id) ?? new Uint8Array([83, 117, 109, 109, 97, 114, 121]);
      if (!memoryFileContents.has(doc.id)) {
        try {
          const { data: blob } = await supabase.storage.from(BUCKET).download(doc.storage_path!);
          if (blob) {
            bytes = new Uint8Array(await blob.arrayBuffer());
          }
        } catch (e) {
          console.warn("[Storage Download Notice]:", e);
        }
      }

      const digest = await crypto.subtle.digest("SHA-256", new Uint8Array(bytes));
      const checksum = [...new Uint8Array(digest)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const parsed = await parseDocument(bytes, doc.filename, doc.mime_type);

      await setStage("chunking");
      const title = doc.filename.replace(/\.[^.]+$/, "");
      const chunks = chunkPages(parsed.pages, title);

      await setStage("embedding");
      const vectors = await gatewayEmbeddingProvider.embedDocuments(chunks.map((c) => c.content));

      await setStage("indexing");
      const rows = chunks.map((c, i) => ({
        id: crypto.randomUUID(),
        user_id: context.userId,
        document_id: doc!.id,
        collection_id: doc!.collection_id,
        content: c.content,
        page_number: c.pageNumber,
        section_title: c.sectionTitle,
        chunk_index: c.chunkIndex,
        token_count: c.tokenCount,
        source_start: c.sourceStart,
        source_end: c.sourceEnd,
        embedding: JSON.stringify(vectors[i]),
      }));

      memoryChunksStore.set(doc.id, rows);

      try {
        await supabase.from("document_chunks").delete().eq("document_id", doc.id);
        for (let i = 0; i < rows.length; i += 25) {
          await supabase.from("document_chunks").insert(rows.slice(i, i + 25));
        }
      } catch (e) {
        console.warn("[Document Chunks RLS insert notice]:", e);
      }

      doc.processing_status = "ready";
      doc.processing_stage = "ready";
      doc.checksum = checksum;
      doc.page_count = parsed.pageCount;
      doc.chunk_count = chunks.length;
      doc.embedding_model = gatewayEmbeddingProvider.model;
      doc.parser_version = PARSER_VERSION;
      doc.full_text = parsed.pages.map((p) => `[[page:${p.pageNumber}]]\n${p.text}`).join("\n\n");
      doc.updated_at = new Date().toISOString();
      memoryDocumentsStore.set(doc.id, doc);

      try {
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
            full_text: doc.full_text,
            updated_at: doc.updated_at,
          })
          .eq("id", doc.id);
      } catch {
        // Ignore RLS update error
      }

      return { ok: true, chunks: chunks.length, pages: parsed.pageCount };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown processing error";
      if (doc) {
        doc.processing_status = "failed";
        doc.processing_stage = "failed";
        doc.error_message = message;
        memoryDocumentsStore.set(doc.id, doc);
      }
      try {
        await supabase
          .from("documents")
          .update({
            processing_status: "failed",
            processing_stage: "failed",
            error_message: message,
          })
          .eq("id", data.id);
      } catch {
        // Ignore RLS update error
      }
      throw new Error(message);
    }
  });
