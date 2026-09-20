import type { ParsedPage } from "./parsing.server";

export interface Chunk {
  content: string;
  pageNumber: number;
  sectionTitle: string | null;
  chunkIndex: number;
  tokenCount: number;
  sourceStart: number;
  sourceEnd: number;
}

const TARGET_CHARS = 3200; // ~800 tokens
const MIN_CHARS = 600;
const OVERLAP_CHARS = 400; // ~100 tokens

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function looksLikeHeading(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0 || trimmed.length > 90) return false;
  if (/^#{1,6}\s+/.test(trimmed)) return true;
  if (/^\d{1,2}[.)]\s+\S/.test(trimmed) && trimmed.length < 80) return true;
  const letters = trimmed.replace(/[^A-Za-z]/g, "");
  if (letters.length > 3 && letters === letters.toUpperCase()) return true;
  return false;
}

/**
 * Semantic-aware chunking: keeps paragraphs intact, tracks the nearest heading
 * as section context, and never merges text across page boundaries.
 */
export function chunkPages(pages: ParsedPage[], documentTitle: string): Chunk[] {
  const chunks: Chunk[] = [];
  let section: string | null = null;
  let index = 0;

  for (const page of pages) {
    const blocks = page.text.split(/\n{2,}/).filter((b) => b.trim().length > 0);
    let buffer = "";
    let bufferStart = 0;
    let cursor = 0;
    let bufferSection = section;

    const flush = () => {
      const body = buffer.trim();
      if (!body) return;
      const header = [documentTitle, bufferSection, `Page ${page.pageNumber}`]
        .filter(Boolean)
        .join(" — ");
      chunks.push({
        content: `${header}\n\n${body}`,
        pageNumber: page.pageNumber,
        sectionTitle: bufferSection,
        chunkIndex: index++,
        tokenCount: estimateTokens(body),
        sourceStart: bufferStart,
        sourceEnd: bufferStart + body.length,
      });
    };

    for (const block of blocks) {
      const firstLine = block.split("\n")[0] ?? "";
      if (looksLikeHeading(firstLine)) {
        section = firstLine.replace(/^#{1,6}\s+/, "").trim();
        if (!buffer) bufferSection = section;
      }

      if (buffer.length + block.length > TARGET_CHARS && buffer.length >= MIN_CHARS) {
        flush();
        const tail = buffer.slice(-OVERLAP_CHARS);
        bufferStart = Math.max(0, cursor - tail.length);
        buffer = tail;
        bufferSection = section;
      }

      buffer += (buffer ? "\n\n" : "") + block;
      cursor += block.length + 2;
    }
    flush();
    buffer = "";
  }

  return chunks;
}
