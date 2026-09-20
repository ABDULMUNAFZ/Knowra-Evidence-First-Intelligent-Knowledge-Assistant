import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Send, Sparkles } from "lucide-react";
import { retrieveEvidence, generateGroundedAnswer } from "@/lib/rag.functions";
import { useActiveCollection } from "@/hooks/use-active-collection";
import { AnswerView, type AnswerPayload } from "@/components/knowra/answer-view";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { triggerHaptic } from "@/lib/haptics";

export const Route = createFileRoute("/_authenticated/app/ask")({
  head: () => ({
    meta: [
      { title: "Ask Knowra — grounded answers" },
      {
        name: "description",
        content: "Ask questions and get answers grounded in your own documents, with citations.",
      },
      { property: "og:title", content: "Ask Knowra — grounded answers" },
      {
        property: "og:description",
        content: "Ask questions and get answers grounded in your own documents, with citations.",
      },
    ],
  }),
  component: Ask,
});

type Phase = "idle" | "retrieving" | "reading" | "generating";

interface Turn {
  question: string;
  payload: AnswerPayload;
}

const MODES = [
  { value: "concise", label: "Concise" },
  { value: "detailed", label: "Detailed" },
  { value: "executive", label: "Executive" },
] as const;

function Ask() {
  const { collections, activeId, setActiveId, active } = useActiveCollection();
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<"concise" | "detailed" | "executive">("concise");
  const [phase, setPhase] = useState<Phase>("idle");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const busy = phase !== "idle";

  async function ask(text: string) {
    if (!activeId || text.trim().length < 2 || busy) return;
    triggerHaptic("light");
    setPhase("retrieving");
    try {
      const retrieval = await retrieveEvidence({
        data: { collectionId: activeId, question: text.trim() },
      });
      setPhase("reading");
      const payload = await generateGroundedAnswer({
        data: {
          collectionId: activeId,
          question: retrieval.question,
          mode,
          evidenceIds: retrieval.evidence.map((e) => e.id),
          conversationId,
          history: turns.slice(-3).flatMap((t) => [
            { role: "user" as const, content: t.question },
            { role: "assistant" as const, content: t.payload.answer },
          ]),
        },
      });
      setTurns((prev) => [...prev, { question: retrieval.question, payload }]);
      if (payload.conversationId) setConversationId(payload.conversationId);
      setQuestion("");
      triggerHaptic(payload.confidence.level === "insufficient" ? "warning" : "success");
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch (err) {
      triggerHaptic("error");
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPhase("idle");
    }
  }

  if (collections.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">
          Create a collection and upload documents before asking questions.
        </p>
        <Button asChild className="mt-4 min-h-11">
          <Link to="/app">Go to collections</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-4 sm:py-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3.5 py-1 text-xs font-bold tracking-widest text-[#ff4500] uppercase shadow-sm font-['Chakra_Petch',sans-serif] mb-2">
            <Sparkles className="size-3.5 text-[#ff4500]" />
            <span>Verbatim Grounded RAG</span>
          </div>
          <h1 className="font-['Orbitron',sans-serif] text-3xl font-black text-neutral-950 tracking-tight">
            Ask Knowra
          </h1>
          <p className="text-neutral-600 mt-1 text-xs font-mono">
            Grounding Repository: <strong className="text-neutral-900">{active?.name ?? "No Collection Selected"}</strong>
          </p>
        </div>
        <Select value={activeId ?? ""} onValueChange={(v) => setActiveId(v)}>
          <SelectTrigger className="h-11 w-full sm:w-60 rounded-full border-neutral-300 bg-white text-xs font-bold font-['Chakra_Petch',sans-serif] uppercase tracking-wider shadow-sm" aria-label="Collection">
            <SelectValue placeholder="Select collection" />
          </SelectTrigger>
          <SelectContent>
            {collections.map((c) => (
              <SelectItem key={c.id} value={c.id} className="font-mono text-xs">
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {turns.map((turn, i) => (
          <div key={i} className="space-y-3 bg-white p-6 rounded-3xl border border-neutral-200 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-mono text-[#ff4500] font-bold">
              <span>PROMPT QUERY #{i + 1}:</span>
            </div>
            <h3 className="text-base font-bold text-neutral-950">{turn.question}</h3>
            <AnswerView payload={turn.payload} />
            {turn.payload.followUps.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {turn.payload.followUps.map((f) => (
                  <button
                    key={f}
                    onClick={() => void ask(f)}
                    disabled={busy}
                    className="bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-medium transition-all"
                  >
                    {f} →
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {busy && (
          <div className="rounded-3xl border border-[#ff4500]/40 bg-neutral-950 text-white flex items-center gap-3 p-5 text-xs font-mono shadow-xl animate-pulse">
            <Loader2 className="text-[#ff4500] size-4 animate-spin" />
            {phase === "retrieving" && "SEARCHING PGVECTOR 3072D INDEX…"}
            {phase === "reading" && "RERANKING CANDIDATE PASSAGES WITH CROSS-ENCODER…"}
            {phase === "generating" && "COMPOSING GROUNDED ANSWER WITH VERBATIM CITATIONS…"}
          </div>
        )}

        {turns.length === 0 && !busy && (
          <div className="rounded-3xl bg-neutral-950 text-white p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-mono text-[#ff4500] font-bold uppercase tracking-widest">
              <Sparkles className="size-4 animate-pulse text-[#ff4500]" /> Grounded AI Assistant Ready
            </div>
            <h2 className="font-['Orbitron',sans-serif] text-2xl font-bold mt-2">Ask anything across your uploaded documents</h2>
            <p className="mt-3 text-neutral-400 text-xs font-mono leading-relaxed max-w-xl">
              Knowra retrieves exact matching vector passages before synthesizing answers. If verified evidence is not found, the system explicitly reports missing context.
            </p>
          </div>
        )}
      </div>

      <form
        className="sticky bottom-4 z-20"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(question);
        }}
      >
        <div className="rounded-3xl bg-white border border-neutral-300 p-4 shadow-2xl ring-1 ring-black/5">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void ask(question);
              }
            }}
            placeholder="Ask a question about your documents… (e.g., What are the Q3 audit metrics?)"
            rows={2}
            className="resize-none border-0 bg-transparent p-1 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-0 font-['Space_Grotesk',sans-serif]"
            aria-label="Your question"
          />
          <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider hidden sm:inline">Style:</span>
              <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
                <SelectTrigger className="h-9 w-32 rounded-full border-neutral-300 bg-neutral-50 text-xs font-bold font-mono" aria-label="Answer style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="text-xs font-mono">
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              disabled={busy || question.trim().length < 2}
              className="h-11 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-['Chakra_Petch',sans-serif] font-bold text-xs uppercase tracking-wider px-6 shadow-md"
            >
              {busy ? <Loader2 className="size-4 animate-spin mr-2" /> : <Send className="size-4 text-[#ff4500] mr-2" />}
              Ask Knowra
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
