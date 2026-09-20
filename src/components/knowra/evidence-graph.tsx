import { useEffect, useRef, useState } from "react";
import { Database, FileText, CheckCircle2, ShieldCheck, Cpu, Layers, Sparkles, Terminal, Activity, ChevronRight } from "lucide-react";

interface NodeData {
  id: string;
  label: string;
  type: "document" | "passage" | "evidence" | "answer";
  score?: number;
  preview?: string;
  sourceDoc?: string;
}

const GRAPH_NODES: { layer: string; nodes: NodeData[] }[] = [
  {
    layer: "Source Documents",
    nodes: [
      { id: "doc-1", label: "Q3_Financial_Audit.pdf", type: "document", preview: "Fiscal performance and risk analysis metrics for Q3 2026." },
      { id: "doc-2", label: "Security_Policy_v4.md", type: "document", preview: "Enterprise encryption standards and RBAC access guidelines." },
      { id: "doc-3", label: "Architecture_Spec.docx", type: "document", preview: "pgvector hybrid search topology and BM25 index parameters." },
    ],
  },
  {
    layer: "Vector Passages (3072D)",
    nodes: [
      { id: "pas-1", label: "Passage #104 (Page 12)", type: "passage", score: 0.964, sourceDoc: "Q3_Financial_Audit.pdf", preview: "...revenue grew 42% YoY with gross margin expanding to 78.4%..." },
      { id: "pas-2", label: "Passage #289 (Page 04)", type: "passage", score: 0.912, sourceDoc: "Security_Policy_v4.md", preview: "...AES-256 GCM encryption at rest with strict session isolation..." },
      { id: "pas-3", label: "Passage #052 (Page 18)", type: "passage", score: 0.948, sourceDoc: "Architecture_Spec.docx", preview: "...hybrid BM25 + pgvector cosine reranking ensures zero hallucination..." },
    ],
  },
  {
    layer: "Reranked Evidence",
    nodes: [
      { id: "ev-1", label: "Evidence Chunk A", type: "evidence", score: 0.989, preview: "Confirmed: Revenue growth 42% YoY, margins 78.4%." },
      { id: "ev-2", label: "Evidence Chunk B", type: "evidence", score: 0.975, preview: "Confirmed: Vector embeddings use 3072D dense index with cross-encoder." },
    ],
  },
  {
    layer: "Grounded Output",
    nodes: [
      { id: "ans-1", label: "Verbatim Verified Answer", type: "answer", score: 0.998, preview: "The Q3 financial audit confirms a 42% YoY revenue growth backed by page 12 verified excerpts." },
    ],
  },
];

export function EvidenceGraph() {
  const [activeLayer, setActiveLayer] = useState(0);
  const [selectedNode, setSelectedNode] = useState<NodeData>(GRAPH_NODES[1].nodes[0]);
  const [isSimulating, setIsSimulating] = useState(true);

  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setActiveLayer((prev) => (prev + 1) % GRAPH_NODES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-950 text-white p-6 sm:p-8 shadow-2xl relative overflow-hidden font-['Space_Grotesk',sans-serif]">
      {/* Visual Ambient Glow */}
      <div className="absolute top-0 right-0 size-96 bg-[#ff4500]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 size-96 bg-[#f97316]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Terminal Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10 text-xs">
        <div className="flex items-center gap-3 font-mono">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff4500]/20 text-[#ff4500] font-bold uppercase tracking-wider">
            <Activity className="size-3.5 animate-pulse" /> JARVIS RAG TELEMETRY
          </span>
          <span className="hidden sm:inline text-neutral-400">LATENCY: <strong className="text-white">18ms</strong></span>
          <span className="hidden sm:inline text-neutral-400">FAISS / PGVECTOR: <strong className="text-emerald-400">ACTIVE</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="px-3 py-1 rounded-full border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-mono text-[11px] transition-colors"
          >
            {isSimulating ? "Pause Simulation" : "Resume Flow"}
          </button>
        </div>
      </div>

      {/* Interactive Node Graph Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
        {GRAPH_NODES.map((column, colIdx) => (
          <div
            key={column.layer}
            className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-300 ${
              activeLayer === colIdx
                ? "bg-neutral-900/90 border-[#ff4500]/60 ring-1 ring-[#ff4500]/30 shadow-lg shadow-[#ff4500]/10"
                : "bg-neutral-900/40 border-white/5 hover:border-white/15"
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-['Orbitron',sans-serif] text-[11px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#ff4500]" />
                {column.layer}
              </span>
              <span className="font-mono text-[10px] text-neutral-500">{column.nodes.length} nodes</span>
            </div>

            <div className="flex flex-col gap-2 my-auto">
              {column.nodes.map((node) => {
                const isSelected = selectedNode.id === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => {
                      setSelectedNode(node);
                      setActiveLayer(colIdx);
                    }}
                    className={`group text-left p-3 rounded-xl border text-xs transition-all relative overflow-hidden ${
                      isSelected
                        ? "bg-[#ff4500] text-white border-[#ff4500] font-semibold shadow-md"
                        : "bg-neutral-950/80 border-white/10 hover:border-white/30 text-neutral-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-mono font-medium">{node.label}</span>
                      {node.score && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isSelected ? "bg-black/30 text-white" : "bg-emerald-500/20 text-emerald-400"
                          }`}
                        >
                          {(node.score * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Passage / Citation Inspector Panel */}
      {selectedNode && (
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-neutral-900/60 p-5 rounded-2xl border border-white/5">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[#ff4500]">
              <Sparkles className="size-3.5" />
              <span>SELECTED INSPECTOR NODE:</span>
              <strong className="text-white">{selectedNode.label}</strong>
              {selectedNode.sourceDoc && (
                <span className="text-neutral-400">from {selectedNode.sourceDoc}</span>
              )}
            </div>
            <p className="text-sm text-neutral-300 italic font-mono bg-black/40 p-3 rounded-xl border border-white/5">
              "{selectedNode.preview}"
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right font-mono text-xs hidden sm:block">
              <div className="text-neutral-400">Verification Status</div>
              <div className="text-emerald-400 font-bold flex items-center justify-end gap-1">
                <ShieldCheck className="size-4" /> 100% Grounded
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

