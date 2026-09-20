# Knowra — Traceable Evidence-First Intelligent Knowledge Assistant

> **AI Hackathon 2026 Entry**  
> **Team Name**: Tech Mavericks  
> **Team Member**: Abdul Munaf Z ([z.abdulmunaf@gmail.com](mailto:z.abdulmunaf@gmail.com))  

---

## Overview

**Knowra** is a production-grade, evidence-grounded AI knowledge assistant designed to turn unstructured documents into verifiable, citation-backed answers. By combining **dense vector similarity (3072D pgvector)** with **BM25 keyword search** and **cross-encoder reranking**, Knowra eliminates AI hallucinations and traces every generated claim back to verbatim document excerpts, page numbers, and source lineage.

---

## Hackathon Goal & Problem Solved

Scattered enterprise documents, policies, and specifications lead to wasted hours searching for accurate information. Traditional LLMs often hallucinate or guess missing details. 

**Knowra solves this by enforcing strict grounding**:
1. **Verbatim Passage Lineage**: Answers present clickable inline citations linked directly to document name, page, and chunk excerpt.
2. **Honest Uncertainty Scoring**: Algorithmic evaluation of retrieval relevance, coverage, and missing context flags uncertain queries instead of inventing facts.
3. **Multi-Document Conflict Awareness**: Surfaces conflicting claims transparently alongside source lineage when documents present opposing statements.

---

## Team & Submission Details

- **Event**: AI Hackathon 2026  
- **Team Name**: Tech Mavericks  
- **Team Leader & Member**: Abdul Munaf Z  
- **Contact Email**: [z.abdulmunaf@gmail.com](mailto:z.abdulmunaf@gmail.com)  

---

## Key Features & Working Capabilities

### 1. Document Upload & Automated Ingestion Pipeline
- **Supported Formats**: `.pdf`, `.docx`, `.txt`, `.md`, `.csv` (up to 25 MB per file).
- **Real Stage Progress**: Uploading → Extracting → Cleaning → Chunking (500–1000 tokens) → Embedding (3072D) → Indexing → Ready.
- **pgvector Integration**: Stores dense embeddings with strict `collection_id` multi-tenant boundaries.

### 2. Hybrid Search & Cross-Encoder Reranking
- **pgvector Cosine Search**: Captures semantic intent and contextual similarity.
- **BM25 Keyword Matching**: Retains exact term precision for technical codes and key phrases.
- **Reranker Pipeline**: Normalizes and scores candidates before passing context to the LLM.

### 3. Traceable Evidence Explorer
- Interactive visual graph displaying the exact flow from **Source Documents → Vector Passages → Reranked Evidence → Grounded Output**.
- Node inspection panel allowing users to preview real vector text chunks and groundness scores.

### 4. Single-Click Instant Demo Access
- Instant 1-click workspace entry with pre-configured demo account (`demo@gmail.com`).
- Preset role shortcuts for **Product Manager**, **Researcher**, and **Developer**.

---

## End-to-End Technology Stack

- **Frontend**: React 19, TypeScript, TanStack Start, TanStack Router, TanStack Query, TailwindCSS.
- **UI Components**: shadcn/ui, Lucide Icons, React Bits (`TextCursor`, `FaultyTerminal` WebGL background).
- **Typography**: Orbitron, Chakra Petch, Space Grotesk, JetBrains Mono (Jarvis AI Lab aesthetic).
- **Database & Storage**: PostgreSQL, `pgvector` vector extension, Supabase Storage (`knowledge-documents`).
- **Authentication**: Supabase Auth with fallback 1-click session guarantee.

---

## Project Structure

```
traceable-knowledge/
├── src/
│   ├── components/
│   │   ├── knowra/             # Grounding graph, upload zone, answer view
│   │   ├── reactbits/          # TextCursor, FaultyTerminal WebGL background
│   │   └── ui/                 # Accessible UI components (Buttons, Inputs)
│   ├── integrations/
│   │   └── supabase/           # Auth middleware, Supabase client
│   ├── lib/
│   │   ├── documents.functions.ts  # RPC document ingestion & processing
│   │   ├── rag.functions.ts        # Hybrid search, reranking & answer generation
│   │   ├── parsing.server.ts       # PDF, DOCX, TXT text extraction
│   │   └── chunking.server.ts      # Semantic-aware chunking algorithm
│   └── routes/                 # TanStack file-based routes (Hero, Auth, App)
├── public/                     # Static assets
└── README.md                   # Hackathon submission documentation
```

---

## Local Setup & Development

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/ABDULMUNAFZ/Knowra-Evidence-First-Intelligent-Knowledge-Assistant.git
cd Knowra-Evidence-First-Intelligent-Knowledge-Assistant

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
SUPABASE_URL="https://your-supabase-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
VITE_SUPABASE_URL="https://your-supabase-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
```

### 4. Running the Application
```bash
# Start the Vite development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Production Verification Commands

```bash
# Type check TypeScript codebase
npx tsc --noEmit

# Build production bundle
npm run build
```

---

## License & Credits

Built with precision for **AI Hackathon 2026** by **Team Tech Mavericks** (Abdul Munaf Z).
