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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ask Knowra</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Grounded in {active?.name ?? "your collection"} · every claim traceable.
          </p>
        </div>
        <Select value={activeId ?? ""} onValueChange={(v) => setActiveId(v)}>
          <SelectTrigger className="min-h-11 w-full sm:w-52" aria-label="Collection">
            <SelectValue placeholder="Select collection" />
          </SelectTrigger>
          <SelectContent>
            {collections.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-8 space-y-8">
        {turns.map((turn, i) => (
          <div key={i} className="space-y-3">
            <p className="text-sm font-medium">{turn.question}</p>
            <AnswerView payload={turn.payload} />
            {turn.payload.followUps.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {turn.payload.followUps.map((f) => (
                  <button
                    key={f}
                    onClick={() => void ask(f)}
                    disabled={busy}
                    className="bg-elevated hover:border-[var(--border-strong)] min-h-10 rounded-full border px-3 text-xs transition-colors"
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {busy && (
          <div className="panel text-muted-foreground flex items-center gap-3 p-4 text-sm">
            <Loader2 className="text-primary size-4 animate-spin" />
            {phase === "retrieving" && "Searching your documents…"}
            {phase === "reading" && "Reading the retrieved passages…"}
            {phase === "generating" && "Composing a grounded answer…"}
          </div>
        )}

        {turns.length === 0 && !busy && (
          <div className="panel text-muted-foreground p-6 text-sm">
            <p className="text-foreground flex items-center gap-2 font-medium">
              <Sparkles className="text-primary size-4" /> Ask anything about your documents
            </p>
            <p className="mt-2 leading-relaxed">
              Knowra only answers from passages it can retrieve. If the evidence isn't there, it
              will tell you instead of guessing.
            </p>
          </div>
        )}
      </div>

      <form
        className="bg-background sticky bottom-16 mt-8 md:bottom-4"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(question);
        }}
      >
        <div className="panel p-3">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void ask(question);
              }
            }}
            placeholder="Ask a question about your documents…"
            rows={2}
            className="resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            aria-label="Your question"
          />
          <div className="mt-2 flex items-center gap-2">
            <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
              <SelectTrigger className="h-9 w-32" aria-label="Answer style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="submit"
              disabled={busy || question.trim().length < 2}
              className="ml-auto min-h-11"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Ask
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
