-- Supabase Row Level Security (RLS) Permissive Policies Fix
-- Grants full CRUD permissions on all Knowra tables to authenticated, anon, and service_role.

-- Grant table privileges
GRANT ALL ON public.collections TO anon, authenticated, service_role;
GRANT ALL ON public.documents TO anon, authenticated, service_role;
GRANT ALL ON public.document_chunks TO anon, authenticated, service_role;
GRANT ALL ON public.conversations TO anon, authenticated, service_role;
GRANT ALL ON public.messages TO anon, authenticated, service_role;
GRANT ALL ON public.retrieval_events TO anon, authenticated, service_role;

-- Ensure RLS allows all insert, select, update, delete operations
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own collections" ON public.collections;
DROP POLICY IF EXISTS "allow all collections" ON public.collections;
CREATE POLICY "allow all collections" ON public.collections FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own documents" ON public.documents;
DROP POLICY IF EXISTS "allow all documents" ON public.documents;
CREATE POLICY "allow all documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own chunks" ON public.document_chunks;
DROP POLICY IF EXISTS "allow all chunks" ON public.document_chunks;
CREATE POLICY "allow all chunks" ON public.document_chunks FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own conversations" ON public.conversations;
DROP POLICY IF EXISTS "allow all conversations" ON public.conversations;
CREATE POLICY "allow all conversations" ON public.conversations FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own messages" ON public.messages;
DROP POLICY IF EXISTS "allow all messages" ON public.messages;
CREATE POLICY "allow all messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.retrieval_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own events" ON public.retrieval_events;
DROP POLICY IF EXISTS "allow all events" ON public.retrieval_events;
CREATE POLICY "allow all events" ON public.retrieval_events FOR ALL USING (true) WITH CHECK (true);

-- Ensure hybrid_search_chunks function is executable by all roles
GRANT EXECUTE ON FUNCTION public.hybrid_search_chunks(uuid, vector, text, int, float, float) TO anon, authenticated, service_role;
