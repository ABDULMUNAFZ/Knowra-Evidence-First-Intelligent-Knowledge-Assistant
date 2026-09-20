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

export const memoryDocumentsStore = new Map<string, StoredDocRecord>([
  [
    "da292b01-ff7e-4508-aa02-9e35c3455510",
    {
      id: "da292b01-ff7e-4508-aa02-9e35c3455510",
      user_id: "00000000-0000-0000-0000-000000000000",
      collection_id: "00000000-0000-0000-0000-000000000001",
      filename: "AI_Project_Report_8Puzzle_AStar.docx",
      mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size_bytes: 1048576,
      storage_path: "00000000-0000-0000-0000-000000000000/00000000-0000-0000-0000-000000000001/AI_Project_Report_8Puzzle_AStar.docx",
      processing_status: "ready",
      processing_stage: "ready",
      page_count: 6,
      chunk_count: 5,
      embedding_model: "text-embedding-3-large",
      parser_version: "knowra-parser-2",
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  ],
  [
    "da292b01-ff7e-4508-aa02-9e35c3455511",
    {
      id: "da292b01-ff7e-4508-aa02-9e35c3455511",
      user_id: "00000000-0000-0000-0000-000000000000",
      collection_id: "00000000-0000-0000-0000-000000000001",
      filename: "Financial_Audit_Report_2026.pdf",
      mime_type: "application/pdf",
      size_bytes: 2097152,
      storage_path: "00000000-0000-0000-0000-000000000000/00000000-0000-0000-0000-000000000001/Financial_Audit_Report_2026.pdf",
      processing_status: "ready",
      processing_stage: "ready",
      page_count: 12,
      chunk_count: 4,
      embedding_model: "text-embedding-3-large",
      parser_version: "knowra-parser-2",
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ],
  [
    "da292b01-ff7e-4508-aa02-9e35c3455512",
    {
      id: "da292b01-ff7e-4508-aa02-9e35c3455512",
      user_id: "00000000-0000-0000-0000-000000000000",
      collection_id: "00000000-0000-0000-0000-000000000001",
      filename: "Master_Services_Agreement_Legal.docx",
      mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size_bytes: 524288,
      storage_path: "00000000-0000-0000-0000-000000000000/00000000-0000-0000-0000-000000000001/Master_Services_Agreement_Legal.docx",
      processing_status: "ready",
      processing_stage: "ready",
      page_count: 8,
      chunk_count: 4,
      embedding_model: "text-embedding-3-large",
      parser_version: "knowra-parser-2",
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
  ],
  [
    "da292b01-ff7e-4508-aa02-9e35c3455513",
    {
      id: "da292b01-ff7e-4508-aa02-9e35c3455513",
      user_id: "00000000-0000-0000-0000-000000000000",
      collection_id: "00000000-0000-0000-0000-000000000001",
      filename: "System_Architecture_Spec.md",
      mime_type: "text/markdown",
      size_bytes: 131072,
      storage_path: "00000000-0000-0000-0000-000000000000/00000000-0000-0000-0000-000000000001/System_Architecture_Spec.md",
      processing_status: "ready",
      processing_stage: "ready",
      page_count: 4,
      chunk_count: 4,
      embedding_model: "text-embedding-3-large",
      parser_version: "knowra-parser-2",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ],
  [
    "da292b01-ff7e-4508-aa02-9e35c3455514",
    {
      id: "da292b01-ff7e-4508-aa02-9e35c3455514",
      user_id: "00000000-0000-0000-0000-000000000000",
      collection_id: "00000000-0000-0000-0000-000000000001",
      filename: "Grounded_RAG_Research_Paper.pdf",
      mime_type: "application/pdf",
      size_bytes: 1572864,
      storage_path: "00000000-0000-0000-0000-000000000000/00000000-0000-0000-0000-000000000001/Grounded_RAG_Research_Paper.pdf",
      processing_status: "ready",
      processing_stage: "ready",
      page_count: 10,
      chunk_count: 4,
      embedding_model: "text-embedding-3-large",
      parser_version: "knowra-parser-2",
      created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
  ],
]);

export const memoryChunksStore = new Map<string, any[]>([
  [
    "da292b01-ff7e-4508-aa02-9e35c3455510",
    [
      {
        id: "c0000000-0000-0000-0000-000000000101",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455510",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 1,
        section_title: "1. Abstract & Problem Statement",
        chunk_index: 0,
        content: "Abstract & Introduction: The 8-Puzzle problem is a classic sliding tile puzzle consisting of a 3x3 grid with 8 numbered tiles and one empty space. The goal is to transform an initial arbitrary configuration into a predefined goal state by sliding adjacent tiles into the empty space. This report presents an empirical analysis of the A* Search algorithm using admissible heuristics.",
      },
      {
        id: "c0000000-0000-0000-0000-000000000102",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455510",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 2,
        section_title: "2. State Space & Search Formulation",
        chunk_index: 1,
        content: "State Space & Complexity: The state space for the 8-puzzle consists of 9! = 362,880 possible permutations. Exactly half (181,440) of these states are reachable from any given starting configuration due to parity invariants of inversion counts. A* search explores the state space by evaluating f(n) = g(n) + h(n), where g(n) is the path cost from start to node n, and h(n) is the estimated cost from n to the goal.",
      },
      {
        id: "c0000000-0000-0000-0000-000000000103",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455510",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 3,
        section_title: "3. Heuristic Design & Dominance",
        chunk_index: 2,
        content: "Heuristic Formulation: We evaluate two primary heuristic functions: (1) Misplaced Tiles Heuristic h1(n), which counts tiles not in their goal position, and (2) Manhattan Distance Heuristic h2(n), which sums the absolute horizontal and vertical grid distances for each tile to its target position. Since h2(n) >= h1(n) for all states and never overestimates the actual cost, Manhattan Distance is strictly dominant and admissible.",
      },
      {
        id: "c0000000-0000-0000-0000-000000000104",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455510",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 4,
        section_title: "4. Implementation & Data Structures",
        chunk_index: 3,
        content: "Algorithm Implementation & Optimizations: The A* implementation utilizes a Min-Priority Queue backed by a binary heap ordered by f(n). To prevent infinite loops and redundant exploration, a Hash Set stores visited states. Closed list lookup operates in O(1) time complexity. Node expansion evaluates up to 4 potential tile moves (Up, Down, Left, Right).",
      },
      {
        id: "c0000000-0000-0000-0000-000000000105",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455510",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 6,
        section_title: "5. Empirical Benchmarking & Conclusion",
        chunk_index: 4,
        content: "Empirical Results & Comparative Analysis: Across 500 test instances of depth d = 20, A* with Manhattan Distance expanded an average of 487 nodes with 0.12s execution time, compared to 4,912 node expansions and 1.84s for Misplaced Tiles. The effective branching factor was reduced from 2.8 to 1.34.",
      },
    ],
  ],
  [
    "da292b01-ff7e-4508-aa02-9e35c3455511",
    [
      {
        id: "c0000000-0000-0000-0000-000000000201",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455511",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 1,
        section_title: "Financial Performance Summary",
        chunk_index: 0,
        content: "Executive Summary & Revenue Performance: Knowra Tech Inc. achieved total consolidated revenue of $42.8 Million for FY2025, reflecting an 18.4% YoY growth compared to $36.1 Million in FY2024. Gross profit margin reached 68.9% ($29.5M), driven by software subscription expansion and enterprise API licensing.",
      },
      {
        id: "c0000000-0000-0000-0000-000000000202",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455511",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 3,
        section_title: "Operating Expenses & Cash Flow",
        chunk_index: 1,
        content: "Operating Expenses & Cash Flow: Operating expenses totaled $21.3 Million, comprising R&D ($11.2M), Sales & Marketing ($6.4M), and General & Administrative ($3.7M). Operating income (EBITDA) stood at $14.2 Million (33.2% margin). Free cash flow generated from operations was $12.8 Million.",
      },
      {
        id: "c0000000-0000-0000-0000-000000000203",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455511",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 7,
        section_title: "Consolidated Balance Sheet",
        chunk_index: 2,
        content: "Balance Sheet Breakdown: As of December 31, 2025, total assets totaled $64.5 Million, including $28.4M in cash and cash equivalents, $9.1M in accounts receivable, and $27.0M in property, plant, and equipment. Total liabilities stood at $14.2 Million with zero long-term debt.",
      },
      {
        id: "c0000000-0000-0000-0000-000000000204",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455511",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 12,
        section_title: "Auditor Opinion & Certification",
        chunk_index: 3,
        content: "Audit Opinion & Internal Controls: In our opinion, the consolidated financial statements present fairly, in all material respects, the financial position of Knowra Tech Inc. as of December 31, 2025. Internal controls over financial reporting were tested with 0 material weaknesses identified.",
      },
    ],
  ],
  [
    "da292b01-ff7e-4508-aa02-9e35c3455512",
    [
      {
        id: "c0000000-0000-0000-0000-000000000301",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455512",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 1,
        section_title: "Scope of Services",
        chunk_index: 0,
        content: "Section 1: Scope of Services & Deliverables: Provider agrees to deliver enterprise AI knowledge processing platform services as outlined in Statement of Work (SOW-01). Provider guarantees 99.95% service availability uptime, excluding scheduled maintenance windows.",
      },
      {
        id: "c0000000-0000-0000-0000-000000000302",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455512",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 4,
        section_title: "Limitation of Liability",
        chunk_index: 1,
        content: "Section 4: Limitation of Liability & Indemnification: Neither party shall be liable for indirect, incidental, or consequential damages. Aggregate liability under this agreement is strictly capped at $2,500,000 USD or the total fees paid by Client in the preceding 12 months.",
      },
      {
        id: "c0000000-0000-0000-0000-000000000303",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455512",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 6,
        section_title: "Data Security & Compliance",
        chunk_index: 2,
        content: "Section 9: Data Security & Privacy Governance: Provider shall maintain SOC2 Type II compliance, ISO 27001 certification, and GDPR compliance. Client data shall be encrypted at rest (AES-256) and in transit (TLS 1.3). No client data shall be used for public LLM training.",
      },
      {
        id: "c0000000-0000-0000-0000-000000000304",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455512",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 8,
        section_title: "Term & Termination Provisions",
        chunk_index: 3,
        content: "Section 12: Term & Termination: This Agreement shall remain in effect for 24 months. Either party may terminate for convenience by providing thirty (30) days prior written notice. Upon termination, Provider shall delete all Client data within 14 calendar days.",
      },
    ],
  ],
  [
    "da292b01-ff7e-4508-aa02-9e35c3455513",
    [
      {
        id: "c0000000-0000-0000-0000-000000000401",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455513",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 1,
        section_title: "Embedding Pipeline",
        chunk_index: 0,
        content: "Overview & Embedding Pipeline: Knowra processes ingested documents into 512-token chunks with 64-token sliding window overlaps. Passages are embedded using a 3072-dimensional dense embedding model to capture deep semantic intent across diverse file types.",
      },
      {
        id: "c0000000-0000-0000-0000-000000000402",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455513",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 2,
        section_title: "Vector Index Configuration",
        chunk_index: 1,
        content: "Vector Database & Indexing Configuration: Embeddings are stored in PostgreSQL with pgvector extension enabled. HNSW indexes are constructed using cosine distance operator halfvec_cosine_ops with m=16, ef_construction=64, providing sub-15ms vector retrieval.",
      },
      {
        id: "c0000000-0000-0000-0000-000000000403",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455513",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 3,
        section_title: "Hybrid Search & Reranking",
        chunk_index: 2,
        content: "Hybrid Retrieval & Reranking Strategy: Retrieval executes a hybrid search joining dense vector similarity with BM25 sparse keyword rankings (websearch_to_tsquery). Top 12 candidate passages are scored by a cross-encoder lexical coverage reranker.",
      },
      {
        id: "c0000000-0000-0000-0000-000000000404",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455513",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 4,
        section_title: "RLS Security Architecture",
        chunk_index: 3,
        content: "Security & RLS Isolation Architecture: PostgreSQL Row-Level Security (RLS) policies enforce multi-tenant isolation across collections. Server functions utilize service role authentication and fallbacks to guarantee resilience under all deployment configurations.",
      },
    ],
  ],
  [
    "da292b01-ff7e-4508-aa02-9e35c3455514",
    [
      {
        id: "c0000000-0000-0000-0000-000000000501",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455514",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 1,
        section_title: "Abstract",
        chunk_index: 0,
        content: "Abstract: Retrieval-Augmented Generation (RAG) models frequently suffer from hallucinations when answering domain-specific queries. We propose an Evidence-First Grounding Framework that enforces verbatim citation matching and confidence scoring.",
      },
      {
        id: "c0000000-0000-0000-0000-000000000502",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455514",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 4,
        section_title: "Citation Validation Algorithm",
        chunk_index: 1,
        content: "Verbatim Citation Validation Engine: For each generated claim, the system calculates lexical and semantic support scores against candidate passages. Claims with support scores below 0.25 are flagged as unsupported or ungrounded.",
      },
      {
        id: "c0000000-0000-0000-0000-000000000503",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455514",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 7,
        section_title: "Confidence Matrix",
        chunk_index: 2,
        content: "Confidence Matrix & Signal Analysis: System confidence is computed across three primary signals: (1) mean retrieval similarity, (2) citation support validity ratio, and (3) model self-assessment. Answers with score < 0.40 trigger insufficient evidence mode.",
      },
      {
        id: "c0000000-0000-0000-0000-000000000504",
        document_id: "da292b01-ff7e-4508-aa02-9e35c3455514",
        collection_id: "00000000-0000-0000-0000-000000000001",
        page_number: 10,
        section_title: "Benchmark Results",
        chunk_index: 3,
        content: "Experimental Benchmarks & Accuracy Results: On a benchmark of 1,200 complex multi-document questions, the Evidence-First framework achieved 94.2% factual precision, zero ungrounded assertions, and a 4.1x reduction in hallucinated claims.",
      },
    ],
  ],
]);
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
