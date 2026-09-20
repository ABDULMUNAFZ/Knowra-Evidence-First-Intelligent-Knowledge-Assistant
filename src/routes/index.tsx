import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, FileSearch, ShieldCheck, Quote, GitCompare, Sparkles, Zap, Database, CheckCircle2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KnowraWordmark } from "@/components/knowra/logo";
import { EvidenceGraph } from "@/components/knowra/evidence-graph";
import FaultyTerminal from "@/components/reactbits/FaultyTerminal";
import TextCursor from "@/components/reactbits/TextCursor";
import { CounterLoader } from "@/components/reactbits/CounterLoader";

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
    accent: "from-indigo-500/20 to-purple-500/10",
  },
  {
    icon: Quote,
    badge: "100% TRACEABLE",
    title: "Exact Passage Citation Graph",
    body: "Every claim carries direct evidence links to document, page, section, and verbatim excerpts so nothing is assumed.",
    accent: "from-purple-500/20 to-pink-500/10",
  },
  {
    icon: ShieldCheck,
    badge: "STRICT ACCURACY",
    title: "Honest Uncertainty Scoring",
    body: "Retrieval scores, citation coverage and overlap are calculated algorithmically to detect missing context automatically.",
    accent: "from-blue-500/20 to-indigo-500/10",
  },
  {
    icon: GitCompare,
    badge: "CONFLICT RESOLUTION",
    title: "Multi-Document Conflict Awareness",
    body: "When documents present conflicting statements, both sources are surfaced transparently alongside source lineage.",
    accent: "from-amber-500/20 to-orange-500/10",
  },
];

function Landing() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative min-h-screen bg-black text-foreground overflow-x-hidden selection:bg-indigo-500/30">
      {/* 1. Counter Loader Component (Descending 100 to 1) */}
      {loading && <CounterLoader onComplete={() => setLoading(false)} />}

      {/* 2. TextCursor Interactive AI Trail from React Bits */}
      <div className="fixed inset-0 z-30 pointer-events-none">
        <TextCursor text="AI" spacing={75} maxPoints={6} exitDuration={0.4} />
      </div>

      {/* 3. WebGL FaultyTerminal Canvas Background from React Bits */}
      <div className="absolute inset-0 z-0 h-[850px] w-full overflow-hidden opacity-30 mix-blend-screen pointer-events-none">
        <FaultyTerminal
          scale={1.4}
          gridMul={[2.5, 1.2]}
          digitSize={1.3}
          timeScale={0.4}
          pause={false}
          scanlineIntensity={0.2}
          glitchAmount={0.8}
          flickerAmount={0.5}
          noiseAmp={0.9}
          chromaticAberration={0.002}
          dither={0}
          curvature={0.15}
          tint="#818cf8"
          mouseReact={true}
          mouseStrength={0.3}
          brightness={0.85}
        />
        {/* Gradient Overlay for seamless blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-20">
        {/* Floating Capsule Header (Inspired by Bento design style) */}
        <header className="sticky top-4 z-40 mx-auto flex w-full max-w-4xl items-center justify-between rounded-full border border-white/10 bg-neutral-900/80 px-5 py-3 backdrop-blur-2xl shadow-2xl">
          <Link to="/" className="flex items-center gap-2">
            <KnowraWordmark />
          </Link>

          <nav className="hidden items-center gap-6 md:flex font-mono text-xs text-neutral-400">
            <a href="#bento-grid" className="hover:text-white transition-colors">Architecture</a>
            <a href="#pipeline" className="hover:text-white transition-colors">RAG Pipeline</a>
            <a href="#features" className="hover:text-white transition-colors">Citations</a>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs hover:bg-white/10">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full bg-indigo-600 text-xs font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-600/30">
              <Link to="/auth">
                <Zap className="mr-1.5 size-3.5 fill-current text-yellow-300" />
                Demo Account
              </Link>
            </Button>
          </div>
        </header>

        {/* HERO BENTO GRID SECTION (Inspired by screenshot bento cards) */}
        <section className="mt-10 grid gap-6 md:grid-cols-12">
          
          {/* Main Hero Card (Large Span 8) */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-indigo-500/20 bg-neutral-900/80 p-8 sm:p-12 md:col-span-8 backdrop-blur-xl shadow-2xl transition-all hover:border-indigo-500/40">
            <div className="absolute -top-24 -left-24 size-72 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/60 px-4 py-1.5 text-xs font-semibold tracking-wider text-indigo-300 uppercase">
              <Sparkles className="size-3.5 text-indigo-400 animate-pulse" />
              <span>Evidence-Grounded RAG System</span>
            </div>

            <h1 className="font-['Syne',sans-serif] text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] text-white">
              BIG KNOWLEDGE, <br />
              <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                BEAUTIFULLY TRACED.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base sm:text-lg text-neutral-300 leading-relaxed font-['Sora',sans-serif]">
              Ask complex questions across your entire document repository and get grounded answers backed by verbatim passage citations.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="h-13 rounded-2xl bg-indigo-600 px-7 text-sm font-semibold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 hover:shadow-indigo-600/50 transition-all">
                <Link to="/auth">
                  <Zap className="mr-2 size-4 fill-current text-yellow-300" />
                  Instant Demo Account (1-Click)
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-13 rounded-2xl border-white/15 bg-white/5 px-6 text-sm font-medium text-white hover:bg-white/10 transition-all">
                <Link to="/app">Open Workspace</Link>
              </Button>
            </div>
          </div>

          {/* Side Hero Stats Card (Span 4) */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-indigo-950/60 to-neutral-900/90 p-8 md:col-span-4 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-indigo-400">PRECISION METRICS</span>
              <span className="flex size-3 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div className="my-6">
              <div className="flex items-baseline gap-1">
                <span className="font-['Syne',sans-serif] text-6xl font-black text-white">100</span>
                <span className="font-mono text-2xl font-bold text-indigo-400">%</span>
              </div>
              <p className="mt-2 text-sm font-medium text-neutral-300">Grounded Passage Verification</p>
              <p className="mt-1 text-xs text-neutral-400">Zero made-up citations or unverified quotes.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs">
              <div className="flex items-center justify-between text-neutral-400">
                <span>RAG Hallucination Risk:</span>
                <span className="font-bold text-emerald-400">0.00%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                <div className="h-full w-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Evidence Visualizer Bento Row */}
        <section className="mt-6">
          <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/90 p-8 backdrop-blur-xl">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-purple-400">LIVE RAG GRAPH</span>
                <h2 className="font-['Space_Grotesk',sans-serif] text-2xl font-bold text-white mt-1">Grounded Citation Graph Engine</h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-emerald-400" /> Vector Similarity</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-indigo-400" /> Page Chunking</span>
              </div>
            </div>
            <EvidenceGraph />
          </div>
        </section>

        {/* PILLARS BENTO GRID (4 Bento Cards with high-contrast borders and curved corners) */}
        <section id="bento-grid" className="mt-12">
          <div className="mb-8">
            <span className="font-mono text-xs uppercase tracking-widest text-indigo-400">SYSTEM ARCHITECTURE</span>
            <h2 className="font-['Syne',sans-serif] text-3xl sm:text-4xl font-extrabold text-white mt-1">
              Engineered for absolute accuracy.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p) => (
              <div
                key={p.title}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/80 p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10"
              >
                <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${p.accent} opacity-0 transition-opacity group-hover:opacity-100`} />
                
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                      <p.icon className="size-6" />
                    </div>
                    <span className="font-mono text-[10px] font-semibold tracking-wider text-indigo-300 uppercase px-2.5 py-1 rounded-full border border-indigo-500/20 bg-indigo-950/40">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="font-['Space_Grotesk',sans-serif] text-xl font-bold text-white mt-6">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    {p.body}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-indigo-400 font-medium">
                  <span>Learn more</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5-STEP RAG PIPELINE BANNER */}
        <section id="pipeline" className="mt-12 rounded-[2.5rem] border border-white/10 bg-gradient-to-r from-neutral-950 via-neutral-900 to-indigo-950/50 p-8 backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-indigo-400">DATA FLOW PIPELINE</span>
            <span className="font-mono text-xs text-neutral-400">5-STAGE PROCESSING</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-5">
            {[
              { step: "01", title: "Document Upload", desc: "PDF, TXT, MD, DOCX" },
              { step: "02", title: "Chunk & Context", desc: "Page & section tags" },
              { step: "03", title: "Embed & Index", desc: "pgvector 3072D" },
              { step: "04", title: "Hybrid Rerank", desc: "Vector + Keyword" },
              { step: "05", title: "Cite & Verify", desc: "Verbatim excerpts" },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl border border-white/10 bg-black/50 p-5 transition-all hover:border-indigo-500/40">
                <span className="font-mono text-xs font-bold text-indigo-400">{s.step}</span>
                <h4 className="font-['Space_Grotesk',sans-serif] text-sm font-bold text-white mt-2">{s.title}</h4>
                <p className="text-[11px] text-neutral-400 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="border-t border-white/10 bg-black py-8 text-center text-xs font-mono text-neutral-500">
        Traceable Knowledge Base — Grounded answers with verbatim citations.
      </footer>
    </div>
  );
}
