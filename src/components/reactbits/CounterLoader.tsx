import React, { useState, useEffect } from "react";
import { Sparkles, Shield, Cpu } from "lucide-react";

interface CounterLoaderProps {
  onComplete?: () => void;
}

const DIAGNOSTIC_MESSAGES = [
  "INITIALIZING VECTOR INDEX...",
  "VERIFYING HYBRID RAG ROUTER...",
  "CONNECTING SUPABASE EMBEDDING PIPELINE...",
  "BUILDING TRACEABLE CITATION GRAPH...",
  "READY FOR HYBRID KNOWLEDGE SEARCH",
];

export function CounterLoader({ onComplete }: CounterLoaderProps) {
  const [count, setCount] = useState(100);
  const [msgIndex, setMsgIndex] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Fast countdown from 100 to 1 over ~2 seconds
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            setFadingOut(true);
            setTimeout(() => {
              onComplete?.();
            }, 600);
          }, 300);
          return 1;
        }
        return prev - 1;
      });
    }, 18);

    const msgInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % DIAGNOSTIC_MESSAGES.length);
    }, 400);

    return () => {
      clearInterval(interval);
      msgInterval;
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-6 backdrop-blur-2xl transition-all duration-700 ${
        fadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Curved Cyber Box Container */}
      <div className="relative flex w-full max-w-lg flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border border-indigo-500/30 bg-neutral-950/80 p-10 text-center shadow-2xl shadow-indigo-500/20 backdrop-blur-3xl">
        {/* Glow Effects */}
        <div className="absolute -top-20 -left-20 size-48 rounded-full bg-indigo-600/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 size-48 rounded-full bg-purple-600/30 blur-3xl pointer-events-none" />

        {/* Top Pills */}
        <div className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/50 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-400 backdrop-blur-md">
          <Cpu className="size-3.5 animate-spin text-indigo-400" />
          <span>System Initialization</span>
        </div>

        {/* Descending Counter Display */}
        <div className="relative my-6 flex items-baseline gap-1 font-mono">
          <span className="text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-indigo-100 to-indigo-400 sm:text-8xl drop-shadow-[0_0_35px_rgba(99,102,241,0.5)]">
            {count < 10 ? `0${count}` : count}
          </span>
          <span className="text-xl font-bold text-indigo-400/80">%</span>
        </div>

        {/* Progress Bar with Curved Ends */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-900 p-0.5 border border-indigo-500/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-75 shadow-[0_0_15px_rgba(129,140,248,0.8)]"
            style={{ width: `${100 - count + 1}%` }}
          />
        </div>

        {/* Diagnostic Status Message */}
        <div className="mt-6 flex items-center justify-center gap-2 font-mono text-xs text-indigo-300/80">
          <Sparkles className="size-3.5 animate-pulse text-indigo-400" />
          <span className="tracking-wider uppercase">{DIAGNOSTIC_MESSAGES[msgIndex]}</span>
        </div>

        {/* Bottom Security Badge */}
        <div className="mt-8 flex items-center gap-4 text-[11px] font-medium text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Shield className="size-3 text-emerald-400" /> Grounded RAG
          </span>
          <span>•</span>
          <span>Traceable Citations</span>
        </div>
      </div>
    </div>
  );
}
