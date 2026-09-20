type HapticKind = "light" | "success" | "warning" | "error";

const PATTERNS: Record<HapticKind, number | number[]> = {
  light: 8,
  success: [10, 40, 18],
  warning: [16, 60, 16],
  error: [24, 40, 24, 40, 24],
};

/** Progressive enhancement only — silently does nothing where unsupported. */
export function triggerHaptic(kind: HapticKind = "light") {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }
  try {
    navigator.vibrate(PATTERNS[kind]);
  } catch {
    /* ignore */
  }
}
