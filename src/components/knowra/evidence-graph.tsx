import { useEffect, useRef, useState } from "react";

const LAYERS = [
  { label: "Documents", nodes: 4 },
  { label: "Passages", nodes: 6 },
  { label: "Evidence", nodes: 3 },
  { label: "Answer", nodes: 1 },
];

/**
 * Lightweight SVG visualization of the grounding chain.
 * Pure transform/opacity animation, paused for reduced-motion users.
 */
export function EvidenceGraph() {
  const [active, setActive] = useState(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) return;
    const timer = window.setInterval(() => setActive((a) => (a + 1) % LAYERS.length), 1400);
    return () => window.clearInterval(timer);
  }, []);

  const width = 520;
  const height = 300;
  const colX = (i: number) => 60 + i * ((width - 120) / (LAYERS.length - 1));
  const nodeY = (count: number, i: number) => height / 2 + (i - (count - 1) / 2) * 44;

  return (
    <div className="panel atmosphere relative overflow-hidden p-4 sm:p-6">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Knowledge flow from documents to passages to evidence to a grounded answer"
      >
        {LAYERS.slice(0, -1).map((layer, li) =>
          Array.from({ length: layer.nodes }).map((_, i) =>
            Array.from({ length: LAYERS[li + 1]!.nodes }).map((__, j) => (
              <line
                key={`${li}-${i}-${j}`}
                x1={colX(li)}
                y1={nodeY(layer.nodes, i)}
                x2={colX(li + 1)}
                y2={nodeY(LAYERS[li + 1]!.nodes, j)}
                stroke="currentColor"
                className="text-foreground"
                strokeWidth={0.6}
                opacity={active === li ? 0.35 : 0.08}
                style={{ transition: "opacity 600ms ease" }}
              />
            )),
          ),
        )}
        {LAYERS.map((layer, li) => (
          <g key={layer.label}>
            {Array.from({ length: layer.nodes }).map((_, i) => (
              <circle
                key={i}
                cx={colX(li)}
                cy={nodeY(layer.nodes, i)}
                r={li === LAYERS.length - 1 ? 12 : 6}
                fill={active === li ? "var(--primary)" : "var(--elevated)"}
                stroke="var(--border-strong)"
                style={{ transition: "fill 600ms ease" }}
              />
            ))}
            <text
              x={colX(li)}
              y={height - 12}
              textAnchor="middle"
              className="fill-current text-[10px] tracking-[0.18em] uppercase"
              opacity={active === li ? 0.9 : 0.4}
              fill="currentColor"
            >
              {layer.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
