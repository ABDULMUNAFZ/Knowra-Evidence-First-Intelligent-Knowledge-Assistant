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
  high: { label: "High", icon: ShieldCheck, className: "text-[var(--success)]" },
  medium: { label: "Medium", icon: ShieldQuestion, className: "text-[var(--warning)]" },
  low: { label: "Low", icon: ShieldAlert, className: "text-[var(--warning)]" },
  insufficient: { label: "Insufficient evidence", icon: ShieldAlert, className: "text-destructive" },
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
        className="text-primary hover:bg-primary/20 mx-0.5 inline-flex min-w-5 items-center justify-center rounded border border-[var(--primary)]/40 px-1 align-baseline font-mono text-[11px] transition-colors"
        aria-label={`Open source ${n}`}
      >
        {n}
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
    <div className="panel overflow-hidden">
      <div className="p-5 sm:p-6">
        <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase">Answer</p>
        <div className="mt-3 text-[15px] leading-relaxed whitespace-pre-wrap">
          {renderWithCitations(payload.answer, openCitation)}
        </div>

        {payload.conflictNote && (
          <div className="mt-5 rounded-lg border border-[var(--warning)]/40 bg-[color-mix(in_oklch,var(--warning)_10%,transparent)] p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-[var(--warning)]">
              <AlertTriangle className="size-4" /> Conflicting information found
            </p>
            <p className="mt-2 text-sm leading-relaxed">{payload.conflictNote}</p>
          </div>
        )}

        <div className="mt-6 border-t pt-5">
          <div className="flex items-center gap-2">
            <meta.icon className={cn("size-4", meta.className)} />
            <span className="text-sm font-medium">Evidence strength: {meta.label}</span>
            <span className="text-muted-foreground font-mono text-xs">
              {payload.confidence.score}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">{payload.confidence.reason}</p>

          <button
            type="button"
            onClick={() => setTrustOpen((v) => !v)}
            className="text-muted-foreground hover:text-foreground mt-4 flex min-h-11 items-center gap-2 text-sm"
            aria-expanded={trustOpen}
          >
            <ChevronDown className={cn("size-4 transition-transform", trustOpen && "rotate-180")} />
            Why should I trust this?
          </button>

          {trustOpen && signals && (
            <div className="bg-elevated mt-2 space-y-2 rounded-lg p-4 text-sm">
              <p>✓ {signals.supportingPassages} supporting passages used</p>
              <p>✓ {signals.distinctDocuments} distinct documents</p>
              <p>
                {signals.citationValidity >= 0.8 ? "✓" : "!"} Citation validation:{" "}
                {Math.round(signals.citationValidity * 100)}% of claims verified against their cited
                passage
              </p>
              <p>
                {signals.unsupportedClaims === 0 ? "✓" : "!"} {signals.unsupportedClaims} unsupported
                claim{signals.unsupportedClaims === 1 ? "" : "s"} detected
              </p>
              <p className="text-muted-foreground border-t pt-2 text-xs">
                Limitations: information is based only on the documents in this collection.
                Relevance and support scores are retrieval measures, not objective truth.
              </p>
            </div>
          )}

          {payload.missingInformation && (
            <p className="text-muted-foreground mt-4 text-sm">
              <span className="text-foreground font-medium">Missing: </span>
              {payload.missingInformation}
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="sources" className="border-t">
        <TabsList className="m-4 mb-0">
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-2 p-4">
          {payload.sources.length === 0 && (
            <p className="text-muted-foreground text-sm">No sources were used.</p>
          )}
          {payload.sources.map((s, i) => (
            <button
              key={s.id}
              onClick={() => openCitation(i + 1)}
              className="bg-elevated hover:border-[var(--border-strong)] w-full rounded-lg border p-3 text-left transition-colors"
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary font-mono text-xs">[{i + 1}]</span>
                <span className="truncate font-medium">{s.document_name}</span>
                {s.page != null && (
                  <span className="text-muted-foreground text-xs">Page {s.page}</span>
                )}
                <span className="text-muted-foreground ml-auto font-mono text-xs">
                  {Math.round(s.relevance_score * 100)}%
                </span>
              </div>
              {s.section && <p className="text-muted-foreground mt-1 text-xs">{s.section}</p>}
            </button>
          ))}
        </TabsContent>

        <TabsContent value="evidence" className="space-y-3 p-4">
          {payload.sources.map((s, i) => (
            <div key={s.id} className="bg-elevated rounded-lg border p-3">
              <p className="text-muted-foreground text-xs">
                <span className="text-primary font-mono">[{i + 1}]</span> {s.document_name}
                {s.page != null ? ` · Page ${s.page}` : ""}
                {s.section ? ` · ${s.section}` : ""}
              </p>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                {s.excerpt.slice(0, 900)}
                {s.excerpt.length > 900 ? "…" : ""}
              </p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="claims" className="space-y-2 p-4">
          {payload.claims.length === 0 && (
            <p className="text-muted-foreground text-sm">No individual claims were extracted.</p>
          )}
          {payload.claims.map((c, i) => (
            <div key={i} className="bg-elevated rounded-lg border p-3 text-sm">
              <p>{c.text}</p>
              <p className="text-muted-foreground mt-2 text-xs">
                {c.citationValid ? "Verified against" : "Unverified —"}{" "}
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
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Source {openSource}</SheetTitle>
          </SheetHeader>
          {source && (
            <div className="space-y-4 px-4 pb-8">
              <div>
                <p className="font-medium">{source.document_name}</p>
                <p className="text-muted-foreground text-sm">
                  {source.page != null ? `Page ${source.page}` : "No page numbering"}
                  {source.section ? ` · ${source.section}` : ""}
                </p>
              </div>
              <p className="evidence-highlight text-sm leading-relaxed whitespace-pre-wrap">
                {source.excerpt}
              </p>
              <Button asChild variant="outline" className="min-h-11 w-full">
                <Link
                  to="/app/documents/$documentId"
                  params={{ documentId: source.document_id }}
                  search={{ page: source.page ?? 1, chunk: source.id }}
                >
                  Open document <ExternalLink className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
