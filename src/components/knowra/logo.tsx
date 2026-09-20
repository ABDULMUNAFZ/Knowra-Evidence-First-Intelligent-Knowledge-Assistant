import { cn } from "@/lib/utils";

export function KnowraMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden="true">
      <defs>
        <linearGradient id="knowra-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      <path
        d="M16 2.5 28 9v14L16 29.5 4 23V9z"
        fill="none"
        stroke="url(#knowra-mark)"
        strokeWidth="1.6"
      />
      <circle cx="16" cy="16" r="3.2" fill="url(#knowra-mark)" />
      <path d="M16 16 8.5 11.5M16 16l7.5-4.5M16 16v8" stroke="url(#knowra-mark)" strokeWidth="1.2" />
    </svg>
  );
}

export function KnowraWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <KnowraMark />
      <span className="text-[0.95rem] font-semibold tracking-[0.22em] uppercase">Knowra</span>
    </span>
  );
}
