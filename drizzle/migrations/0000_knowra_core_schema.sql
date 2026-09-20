CREATE EXTENSION IF NOT EXISTS vector;

-- COLLECTIONS
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_indexed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own collections" ON public.collections FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- DOCUMENTS
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  filename text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL DEFAULT 0,
  checksum text,
  storage_path text,
  processing_status text NOT NULL DEFAULT 'uploading',
  processing_stage text,
  error_message text,
  page_count int NOT NULL DEFAULT 0,
  chunk_count int NOT NULL DEFAULT 0,
  embedding_model text,
  parser_version text,
  full_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own documents" ON public.documents FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX documents_collection_idx ON public.documents(collection_id);

-- CHUNKS
CREATE TABLE public.document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  content text NOT NULL,
  page_number int,
  section_title text,
  chunk_index int NOT NULL,
  token_count int,
  source_start int,
  source_end int,
  embedding vector(3072),
  content_tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_chunks TO authenticated;
GRANT ALL ON public.document_chunks TO service_role;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own chunks" ON public.document_chunks FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX chunks_collection_idx ON public.document_chunks(collection_id);
CREATE INDEX chunks_document_idx ON public.document_chunks(document_id);
CREATE INDEX chunks_tsv_idx ON public.document_chunks USING gin(content_tsv);
CREATE INDEX chunks_embedding_idx ON public.document_chunks
  USING hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops);

-- CONVERSATIONS
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  collection_id uuid REFERENCES public.collections(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New conversation',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own conversations" ON public.conversations FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- MESSAGES
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  answer_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own messages" ON public.messages FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX messages_conversation_idx ON public.messages(conversation_id);

-- RETRIEVAL EVENTS (observability)
CREATE TABLE public.retrieval_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  collection_id uuid REFERENCES public.collections(id) ON DELETE CASCADE,
  query text NOT NULL,
  trace jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.retrieval_events TO authenticated;
GRANT ALL ON public.retrieval_events TO service_role;
ALTER TABLE public.retrieval_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own events" ON public.retrieval_events FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- HYBRID SEARCH
CREATE OR REPLACE FUNCTION public.hybrid_search_chunks(
  p_collection_id uuid,
  p_query_embedding vector(3072),
  p_query_text text,
  p_top_k int DEFAULT 12,
  p_semantic_weight float DEFAULT 0.75,
  p_keyword_weight float DEFAULT 0.25
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  document_name text,
  content text,
  page_number int,
  section_title text,
  chunk_index int,
  semantic_score float,
  keyword_score float,
  final_score float
)
LANGUAGE sql
STABLE
AS $$
  WITH scored AS (
    SELECT
      c.id,
      c.document_id,
      d.filename AS document_name,
      c.content,
      c.page_number,
      c.section_title,
      c.chunk_index,
      (1 - (c.embedding::halfvec(3072) <=> p_query_embedding::halfvec(3072)))::float AS semantic_score,
      COALESCE(ts_rank(c.content_tsv, websearch_to_tsquery('english', p_query_text)), 0)::float AS raw_keyword
    FROM public.document_chunks c
    JOIN public.documents d ON d.id = c.document_id
    WHERE c.collection_id = p_collection_id
      AND c.embedding IS NOT NULL
  ), norm AS (
    SELECT *, (raw_keyword / NULLIF((SELECT MAX(raw_keyword) FROM scored), 0)) AS keyword_score
    FROM scored
  )
  SELECT id, document_id, document_name, content, page_number, section_title, chunk_index,
         semantic_score,
         COALESCE(keyword_score, 0)::float AS keyword_score,
         (p_semantic_weight * semantic_score + p_keyword_weight * COALESCE(keyword_score, 0))::float AS final_score
  FROM norm
  ORDER BY final_score DESC
  LIMIT p_top_k;
$$;
GRANT EXECUTE ON FUNCTION public.hybrid_search_chunks(uuid, vector, text, int, float, float) TO authenticated, service_role;