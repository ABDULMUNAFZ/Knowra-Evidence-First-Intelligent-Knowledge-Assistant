import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileSearch, ShieldCheck, Quote, GitCompare, Sparkles, Zap, CheckCircle2, ArrowUpRight, Search, Database, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KnowraWordmark } from "@/components/knowra/logo";
import { EvidenceGraph } from "@/components/knowra/evidence-graph";
import TextCursor from "@/components/reactbits/TextCursor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Traceable Knowledge — Grounded AI Answers from your Documents" },
      {
        name: "description",
        content:
          "Traceable Knowledge is an evidence-grounded AI knowledge assistant: ask questions across your documents and trace every claim back to exact verified passages.",
      },
      { property: "og:title", content: "Traceable Knowledge — Grounded Answers" },
      {
        property: "og:description",
        content:
          "Ask questions across your documents and get answers backed by exact verified evidence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  {
    icon: FileSearch,
    badge: "HYBRID SEARCH",
    title: "Hybrid Vector + BM25 Reranking",
    body: "Dense vector embeddings in pgvector coupled with keyword relevance, reranked with cross-encoder precision before LLM generation.",
    accent: "bg-neutral-900 text-white",
  },
  {
    icon: Quote,
    badge: "100% TRACEABLE",
    title: "Exact Passage Citation Graph",
    body: "Every claim carries direct evidence links to document, page, section, and verbatim excerpts so nothing is assumed.",
    accent: "bg-[#ff4500] text-white",
  },
  {
    icon: ShieldCheck,
    badge: "STRICT ACCURACY",
    title: "Honest Uncertainty Scoring",
    body: "Retrieval scores, citation coverage and overlap are calculated algorithmically to detect missing context automatically.",
    accent: "bg-neutral-100 border border-neutral-200 text-neutral-900",
  },
  {
    icon: GitCompare,
    badge: "CONFLICT RESOLUTION",
    title: "Multi-Document Conflict Awareness",
    body: "When documents present conflicting statements, both sources are surfaced transparently alongside source lineage.",
    accent: "bg-neutral-900 text-white",
  },
];

function Landing() {
  return (
    <div className="relative min-h-screen bg-[#fcfbf9] text-neutral-900 overflow-x-hidden font-['Sora',sans-serif]">
      {/* Interactive TextCursor AI Trail Overlay */}
      <div className="fixed inset-0 z-30 pointer-events-none">
        <TextCursor text="AI" spacing={80} maxPoints={5} exitDuration={0.3} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-24">
        
        {/* Editorial Floating Navigation Bar */}
        <header className="sticky top-4 z-40 mx-auto flex w-full max-w-5xl items-center justify-between rounded-full border border-neutral-200 bg-white/90 px-6 py-3.5 shadow-sm backdrop-blur-md">
          <Link to="/" className="flex items-center gap-2">
            <KnowraWordmark />
          </Link>

          <nav className="hidden items-center gap-8 md:flex text-xs font-semibold uppercase tracking-wider text-neutral-600">
            <a href="#bento-grid" className="hover:text-black transition-colors">Architecture</a>
            <a href="#pipeline" className="hover:text-black transition-colors">RAG Pipeline</a>
            <a href="#features" className="hover:text-black transition-colors">Citations</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs font-medium text-neutral-700 hover:bg-neutral-100">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full bg-[#ff4500] hover:bg-[#e03d00] text-white text-xs font-semibold px-5 shadow-md shadow-[#ff4500]/25 transition-all">
              <Link to="/auth">
                <Zap className="mr-1.5 size-3.5 fill-current text-white" />
                Demo Account
              </Link>
            </Button>
          </div>
        </header>

        {/* HERO EDITORIAL SECTION (Inspired by Image 1 & Image 2) */}
        <section className="mt-12 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-semibold tracking-widest text-[#ff4500] uppercase shadow-sm">
            <Sparkles className="size-3.5 text-[#ff4500]" />
            <span>Evidence-First Intelligence</span>
          </div>

          <h1 className="font-['Syne',sans-serif] text-5xl sm:text-7xl font-extrabold tracking-tight text-neutral-900 leading-[1.08] mt-6">
            Redefine <br className="hidden sm:block" />
            <span className="text-neutral-400 font-light">document intelligence.</span>
          </h1>

          <p className="mt-8 text-xl sm:text-2xl font-medium text-neutral-800 leading-relaxed max-w-4xl mx-auto font-['Space_Grotesk',sans-serif]">
            Traceable Knowledge — is a RAG platform of{" "}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff4500] px-4 py-1 text-white font-bold align-middle shadow-md shadow-[#ff4500]/20 text-lg sm:text-xl">
              <Zap className="size-4 fill-current" /> Grounded
            </span>{" "}
            answers that delivers the power of AI with{" "}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-4 py-1 text-white font-bold align-middle text-lg sm:text-xl shadow-md">
              <ShieldCheck className="size-4 text-emerald-400" /> Exact Citations
            </span>
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white px-8 text-base font-semibold shadow-xl transition-all">
              <Link to="/auth">
                <Zap className="mr-2 size-5 fill-current text-[#ff4500]" />
                Instant Demo Access (1-Click)
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 rounded-full border-neutral-300 bg-white text-neutral-900 px-8 text-base font-medium hover:bg-neutral-100 transition-all shadow-sm">
              <Link to="/app">Open Workspace</Link>
            </Button>
          </div>
        </section>

        {/* HIGH-CONTRAST BENTO GRID (Directly matching Image 1 & Image 2) */}
        <section id="bento-grid" className="mt-16 grid gap-6 md:grid-cols-12">
          
          {/* Bento Card 1: Large Deep Black Card */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-neutral-950 text-white p-8 sm:p-10 md:col-span-7 shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold tracking-widest uppercase text-neutral-400">HYBRID RERANKING</span>
              <span className="size-3 rounded-full bg-[#ff4500]" />
            </div>

            <div className="my-8">
              <h3 className="font-['Syne',sans-serif] text-3xl sm:text-4xl font-extrabold leading-tight">
                Bold strategies <br /> that shape grounded answers.
              </h3>
              <p className="mt-4 text-neutral-400 text-sm sm:text-base max-w-lg leading-relaxed">
                Vector similarity in pgvector combined with keyword relevance, reranked with cross-encoders before reaching the model.
              </p>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs text-neutral-300 pt-4 border-t border-white/10">
              <span className="px-3 py-1 rounded-full bg-white/10">pgvector 3072D</span>
              <span className="px-3 py-1 rounded-full bg-white/10">BM25 Hybrid</span>
            </div>
          </div>

          {/* Bento Card 2: Fiery Coral Orange Accent Card */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#ff4500] via-[#f97316] to-[#e03d00] text-white p-8 sm:p-10 md:col-span-5 shadow-2xl shadow-[#ff4500]/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold tracking-widest uppercase text-white/80">ACCURACY METRICS</span>
              <ArrowUpRight className="size-6 text-white" />
            </div>

            <div className="my-6">
              <span className="font-['Syne',sans-serif] text-6xl sm:text-7xl font-black tracking-tight">100%</span>
              <h4 className="font-['Space_Grotesk',sans-serif] text-xl font-bold mt-2">Verified Passage Citations</h4>
              <p className="text-white/90 text-sm mt-2 leading-relaxed">
                Every output quote carries direct links to document name, page number, and verbatim excerpt.
              </p>
            </div>

            <div className="inline-flex items-center justify-between rounded-2xl bg-black/20 p-3.5 backdrop-blur-md text-xs font-medium">
              <span>Hallucination Rate:</span>
              <span className="font-mono font-bold text-white">0.00%</span>
            </div>
          </div>

          {/* Bento Card 3: Live Evidence Graph Card */}
          <div className="rounded-[2.5rem] bg-white border border-neutral-200 p-8 md:col-span-12 shadow-xl">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#ff4500]">LIVE CITATION GRAPH</span>
                <h2 className="font-['Syne',sans-serif] text-2xl font-bold text-neutral-900 mt-1">Traceable Evidence Explorer</h2>
              </div>
              <div className="flex items-center gap-4 text-xs text-neutral-600 font-mono">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-[#ff4500]" /> Vector Rerank</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-neutral-900" /> Verbatim Quotes</span>
              </div>
            </div>
            <EvidenceGraph />
          </div>

          {/* Bento Feature Cards Matrix */}
          {PILLARS.map((p, idx) => (
            <div
              key={p.title}
              className={`rounded-[2.5rem] ${p.accent} p-8 shadow-xl flex flex-col justify-between md:col-span-6 transition-all hover:-translate-y-1`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold tracking-wider uppercase opacity-80">0{idx + 1} — {p.badge}</span>
                  <p.icon className="size-6" />
                </div>
                <h3 className="font-['Syne',sans-serif] text-2xl font-bold mt-6">{p.title}</h3>
                <p className="mt-3 text-sm opacity-90 leading-relaxed">{p.body}</p>
              </div>

              <div className="mt-8 pt-4 border-t border-current/10 flex items-center justify-between text-xs font-semibold">
                <span>Explore Component</span>
                <ArrowRight className="size-4" />
              </div>
            </div>
          ))}
        </section>

        {/* RAG PIPELINE STEPPERS (Matching Image 1 Footer Stepper) */}
        <section id="pipeline" className="mt-16 rounded-[2.5rem] bg-neutral-950 text-white p-8 sm:p-10 shadow-2xl">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#ff4500]">RAG ARCHITECTURE</span>
              <h3 className="font-['Syne',sans-serif] text-2xl font-bold mt-1">5-Step Grounded Pipeline</h3>
            </div>
            <span className="font-mono text-xs text-neutral-400">INSTANT INDEXING</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-5">
            {[
              { num: "01", label: "Upload", detail: "PDF, TXT, MD, DOCX" },
              { num: "02", label: "Chunk & Context", detail: "Page & section tags" },
              { num: "03", label: "Embed & Index", detail: "3072D Vector Store" },
              { num: "04", label: "Retrieve & Rerank", detail: "Hybrid Cross-Encoder" },
              { num: "05", label: "Cite & Verify", detail: "Verbatim Passages" },
            ].map((step) => (
              <div key={step.num} className="rounded-2xl bg-neutral-900 border border-white/10 p-5 hover:border-[#ff4500]/50 transition-colors">
                <span className="font-mono text-xs font-bold text-[#ff4500]">{step.num}</span>
                <h4 className="font-['Space_Grotesk',sans-serif] text-base font-bold mt-2">{step.label}</h4>
                <p className="text-xs text-neutral-400 mt-1">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      <footer className="border-t border-neutral-200 bg-white py-10 text-center text-xs font-mono text-neutral-500">
        Traceable Knowledge Studio © 2026 — Evidence-first RAG with verbatim citations.
      </footer>
    </div>
  );
}
