import { Fragment, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  ChevronDown,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import type { generateGroundedAnswer } from "@/lib/rag.functions";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptics";

export type AnswerPayload = Awaited<ReturnType<typeof generateGroundedAnswer>>;

const LEVEL_META = {
  high: { label: "High Confidence", icon: ShieldCheck, className: "text-emerald-400" },
  medium: { label: "Medium Confidence", icon: ShieldQuestion, className: "text-amber-400" },
  low: { label: "Low Confidence", icon: ShieldAlert, className: "text-amber-400" },
  insufficient: { label: "Insufficient Evidence", icon: ShieldAlert, className: "text-red-400" },
} as const;

function renderWithCitations(text: string, onCite: (n: number) => void) {
  const parts = text.split(/(\[\d{1,2}\])/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[(\d{1,2})\]$/);
    if (!match) return <Fragment key={i}>{part}</Fragment>;
    const n = Number(match[1]);
    return (
      <button
        key={i}
        type="button"
        onClick={() => onCite(n)}
        className="text-[#ff4500] hover:bg-[#ff4500]/20 bg-[#ff4500]/10 font-bold mx-1 inline-flex min-w-5 items-center justify-center rounded border border-[#ff4500]/40 px-1.5 align-baseline font-mono text-xs transition-all shadow-sm cursor-pointer"
        aria-label={`Open source ${n}`}
      >
        [{n}]
      </button>
    );
  });
}

export function AnswerView({ payload }: { payload: AnswerPayload }) {
  const [openSource, setOpenSource] = useState<number | null>(null);
  const [trustOpen, setTrustOpen] = useState(false);
  const meta = LEVEL_META[payload.confidence.level];
  const source = openSource ? payload.sources[openSource - 1] : null;
  const signals = payload.confidence.signals;

  const openCitation = (n: number) => {
    triggerHaptic("light");
    setOpenSource(n);
  };

  return (
    <div className="rounded-3xl bg-neutral-950 text-white border border-neutral-800 overflow-hidden shadow-2xl">
      <div className="p-5 sm:p-6">
        <p className="text-[#ff4500] font-mono font-bold text-[10px] tracking-[0.2em] uppercase">Answer</p>
        <div className="mt-3 text-[15px] leading-relaxed whitespace-pre-wrap text-white font-['Space_Grotesk',sans-serif] font-normal">
          {renderWithCitations(payload.answer, openCitation)}
        </div>

        {payload.conflictNote && (
          <div className="mt-5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
              <AlertTriangle className="size-4" /> Conflicting Information Found
            </p>
            <p className="mt-2 text-xs leading-relaxed font-mono">{payload.conflictNote}</p>
          </div>
        )}

        <div className="mt-6 border-t border-neutral-800 pt-5">
          <div className="flex items-center gap-2">
            <meta.icon className={cn("size-4", meta.className)} />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-['Chakra_Petch',sans-serif]">Evidence strength: {meta.label}</span>
            <span className="text-neutral-400 font-mono text-xs">
              ({payload.confidence.score})
            </span>
          </div>
          <p className="text-neutral-400 mt-1 text-xs font-mono">{payload.confidence.reason}</p>

          <button
            type="button"
            onClick={() => setTrustOpen((v) => !v)}
            className="text-neutral-400 hover:text-white mt-4 flex min-h-11 items-center gap-2 text-xs font-mono transition-colors"
            aria-expanded={trustOpen}
          >
            <ChevronDown className={cn("size-4 transition-transform text-[#ff4500]", trustOpen && "rotate-180")} />
            Why should I trust this?
          </button>

          {trustOpen && signals && (
            <div className="bg-neutral-900 border border-neutral-800 mt-2 space-y-2 rounded-2xl p-4 text-xs font-mono text-neutral-300 shadow-inner">
              <p className="text-emerald-400">✓ {signals.supportingPassages} supporting passages used</p>
              <p className="text-emerald-400">✓ {signals.distinctDocuments} distinct documents</p>
              <p className="text-sky-400">
                {signals.citationValidity >= 0.8 ? "✓" : "!"} Citation validation:{" "}
                {Math.round(signals.citationValidity * 100)}% of claims verified against cited passage
              </p>
              <p className="text-amber-400">
                {signals.unsupportedClaims === 0 ? "✓" : "!"} {signals.unsupportedClaims} unsupported
                claim{signals.unsupportedClaims === 1 ? "" : "s"} detected
              </p>
              <p className="text-neutral-500 border-t border-neutral-800 pt-2 text-[11px]">
                Limitations: Information is derived strictly from active documents in this collection.
              </p>
            </div>
          )}

          {payload.missingInformation && (
            <p className="text-neutral-400 mt-4 text-xs font-mono">
              <span className="text-white font-medium">Missing: </span>
              {payload.missingInformation}
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="sources" className="border-t border-neutral-800 bg-neutral-950">
        <TabsList className="m-4 mb-0 bg-neutral-900 border border-neutral-800 p-1">
          <TabsTrigger value="sources" className="text-xs font-mono font-bold uppercase tracking-wider data-[state=active]:bg-[#ff4500] data-[state=active]:text-white text-neutral-400">Sources</TabsTrigger>
          <TabsTrigger value="evidence" className="text-xs font-mono font-bold uppercase tracking-wider data-[state=active]:bg-[#ff4500] data-[state=active]:text-white text-neutral-400">Evidence</TabsTrigger>
          <TabsTrigger value="claims" className="text-xs font-mono font-bold uppercase tracking-wider data-[state=active]:bg-[#ff4500] data-[state=active]:text-white text-neutral-400">Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-2 p-4">
          {payload.sources.length === 0 && (
            <p className="text-neutral-400 text-xs font-mono">No sources were used.</p>
          )}
          {payload.sources.map((s, i) => (
            <button
              key={s.id}
              onClick={() => openCitation(i + 1)}
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 w-full rounded-2xl p-4 text-left transition-all text-white"
            >
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-[#ff4500] font-bold">[{i + 1}]</span>
                <span className="truncate font-bold text-white text-sm">{s.document_name}</span>
                {s.page != null && (
                  <span className="text-neutral-400 text-xs">Page {s.page}</span>
                )}
                <span className="text-emerald-400 ml-auto font-mono text-xs font-bold">
                  {Math.round(s.relevance_score * 100)}%
                </span>
              </div>
              {s.section && <p className="text-neutral-400 mt-1.5 text-xs font-mono">{s.section}</p>}
            </button>
          ))}
        </TabsContent>

        <TabsContent value="evidence" className="space-y-3 p-4">
          {payload.sources.map((s, i) => (
            <div key={s.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-white">
              <p className="text-neutral-400 text-xs font-mono">
                <span className="text-[#ff4500] font-bold">[{i + 1}]</span> {s.document_name}
                {s.page != null ? ` · Page ${s.page}` : ""}
                {s.section ? ` · ${s.section}` : ""}
              </p>
              <p className="mt-2 text-xs leading-relaxed whitespace-pre-wrap font-mono text-neutral-200">
                {s.excerpt.slice(0, 900)}
                {s.excerpt.length > 900 ? "…" : ""}
              </p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="claims" className="space-y-2 p-4">
          {payload.claims.length === 0 && (
            <p className="text-neutral-400 text-xs font-mono">No individual claims were extracted.</p>
          )}
          {payload.claims.map((c, i) => (
            <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-xs font-mono text-white">
              <p className="text-neutral-100">{c.text}</p>
              <p className="text-neutral-400 mt-2 text-[11px]">
                {c.citationValid ? "✓ Verified against" : "! Unverified —"}{" "}
                {c.citationNumbers.length > 0
                  ? c.citationNumbers.map((n) => `[${n}]`).join(" ")
                  : "no valid citation"}{" "}
                · support {Math.round(c.supportScore * 100)}%
              </p>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <Sheet open={openSource != null} onOpenChange={(o) => !o && setOpenSource(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md bg-neutral-950 border-neutral-800 text-white">
          <SheetHeader>
            <SheetTitle className="text-white font-['Orbitron',sans-serif]">Source Passage [{openSource}]</SheetTitle>
          </SheetHeader>
          {source && (
            <div className="space-y-4 px-4 pb-8 mt-4">
              <div>
                <p className="font-bold text-white text-sm">{source.document_name}</p>
                <p className="text-neutral-400 text-xs font-mono">
                  {source.page != null ? `Page ${source.page}` : "No page numbering"}
                  {source.section ? ` · ${source.section}` : ""}
                </p>
              </div>
              <p className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap font-mono text-neutral-200">
                {source.excerpt}
              </p>
              <Button asChild variant="outline" className="min-h-11 w-full rounded-full border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider font-['Chakra_Petch',sans-serif]">
                <Link
                  to="/app/documents/$documentId"
                  params={{ documentId: source.document_id }}
                  search={{ page: source.page ?? 1, chunk: source.id }}
                >
                  Open document <ExternalLink className="ml-1 size-4 text-[#ff4500]" />
                </Link>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
