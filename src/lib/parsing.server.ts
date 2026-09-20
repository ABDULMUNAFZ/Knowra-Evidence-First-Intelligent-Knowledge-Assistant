import { unzipSync, strFromU8, unzlibSync, inflateSync } from "fflate";

export const PARSER_VERSION = "knowra-parser-2";

export interface ParsedPage {
  pageNumber: number;
  text: string;
}

export interface ParsedDocument {
  pages: ParsedPage[];
  pageCount: number;
}

function normalize(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/** Decode a PDF literal string body (between parentheses). */
function decodeLiteralString(raw: string): string {
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch !== "\\") {
      out += ch;
      continue;
    }
    const next = raw[++i];
    if (next === undefined) break;
    if (next === "n") out += "\n";
    else if (next === "r") out += "\r";
    else if (next === "t") out += "\t";
    else if (next === "b") out += "\b";
    else if (next === "f") out += "\f";
    else if (next === "\n") continue;
    else if (next >= "0" && next <= "7") {
      let oct = next;
      while (oct.length < 3 && raw[i + 1] !== undefined && raw[i + 1]! >= "0" && raw[i + 1]! <= "7") oct += raw[++i];
      out += String.fromCharCode(parseInt(oct, 8));
    } else out += next;
  }
  return out;
}

function decodeHexString(raw: string): string {
  const hex = raw.replace(/[^0-9a-fA-F]/g, "");
  let out = "";
  // Heuristic: UTF-16BE when the stream looks like 2-byte codes.
  for (let i = 0; i + 1 < hex.length; i += 2) {
    out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
  }
  return out;
}

/** Extract visible text from a decoded PDF content stream. */
function textFromContentStream(content: string): string {
  let out = "";
  const re = /\((?:\\.|[^\\()])*\)|<[0-9A-Fa-f\s]*>|(T\*|Td|TD|TJ|Tj|'|"|ET)/g;
  let match: RegExpExecArray | null;
  let pendingStrings: string[] = [];

  const flush = () => {
    if (pendingStrings.length) {
      out += pendingStrings.join("");
      pendingStrings = [];
    }
  };

  while ((match = re.exec(content)) !== null) {
    const token = match[0];
    if (token.startsWith("(")) {
      pendingStrings.push(decodeLiteralString(token.slice(1, -1)));
    } else if (token.startsWith("<")) {
      pendingStrings.push(decodeHexString(token.slice(1, -1)));
    } else if (token === "Tj" || token === "TJ" || token === "'" || token === '"') {
      flush();
      if (token === "'" || token === '"') out += "\n";
    } else if (token === "Td" || token === "TD" || token === "T*" || token === "ET") {
      flush();
      out += "\n";
    }
  }
  flush();

  return out
    .replace(/\u0000/g, "")
    .replace(/[ \t]{2,}/g, " ");
}

function inflateStream(data: Uint8Array): Uint8Array | null {
  try {
    return unzlibSync(data);
  } catch {
    try {
      return inflateSync(data);
    } catch {
      return null;
    }
  }
}

/** Decode an ASCII85 (base85) encoded PDF stream. */
function ascii85Decode(data: Uint8Array): Uint8Array | null {
  const text = new TextDecoder("latin1").decode(data).replace(/^<~/, "");
  const out: number[] = [];
  let tuple = 0;
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (c === "~") break;
    if (/\s/.test(c)) continue;
    if (c === "z" && count === 0) {
      out.push(0, 0, 0, 0);
      continue;
    }
    const v = c.charCodeAt(0) - 33;
    if (v < 0 || v > 84) return null;
    tuple = tuple * 85 + v;
    if (++count === 5) {
      out.push((tuple >>> 24) & 255, (tuple >>> 16) & 255, (tuple >>> 8) & 255, tuple & 255);
      tuple = 0;
      count = 0;
    }
  }
  if (count > 0) {
    for (let i = count; i < 5; i++) tuple = tuple * 85 + 84;
    const bytes = [(tuple >>> 24) & 255, (tuple >>> 16) & 255, (tuple >>> 8) & 255, tuple & 255];
    out.push(...bytes.slice(0, count - 1));
  }
  return new Uint8Array(out);
}

async function parsePdf(bytes: Uint8Array): Promise<ParsedDocument> {
  const latin = new TextDecoder("latin1").decode(bytes);
  const pages: ParsedPage[] = [];
  const streamRe = /stream\r?\n?/g;
  let m: RegExpExecArray | null;

  while ((m = streamRe.exec(latin)) !== null) {
    const start = m.index + m[0].length;
    const end = latin.indexOf("endstream", start);
    if (end === -1) break;
    streamRe.lastIndex = end;

    const header = latin.slice(Math.max(0, m.index - 600), m.index);
    const raw = bytes.subarray(start, end);
    let decoded: Uint8Array | null = raw;
    if (/\/ASCII85Decode/.test(header)) decoded = ascii85Decode(decoded);
    if (decoded && /\/FlateDecode/.test(header)) decoded = inflateStream(decoded);

    if (!decoded) continue;
    // Skip obvious non-content streams (fonts, images).
    if (/\/Subtype\s*\/Image|\/FontFile/.test(header)) continue;

    const content = new TextDecoder("latin1").decode(decoded);
    if (!/(Tj|TJ)\b/.test(content)) continue;

    const text = normalize(textFromContentStream(content));
    if (text.length > 0) {
      pages.push({ pageNumber: pages.length + 1, text });
    }
  }

  if (pages.length === 0) {
    throw new Error(
      "No readable text could be extracted from this PDF. It may be a scanned image; please upload a text-based PDF."
    );
  }

  return { pages, pageCount: pages.length };
}


function parseDocx(bytes: Uint8Array): ParsedDocument {
  const files = unzipSync(bytes);
  const xmlBytes = files["word/document.xml"];
  if (!xmlBytes) {
    throw new Error("This DOCX file does not contain a readable document body.");
  }
  const xml = strFromU8(xmlBytes);
  const paragraphs = xml
    .split(/<\/w:p>/)
    .map((p) => {
      const runs = [...p.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map((m) => m[1]);
      return runs
        .join("")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .trim();
    })
    .filter(Boolean);

  const text = normalize(paragraphs.join("\n\n"));
  return { pages: paginatePlainText(text), pageCount: Math.max(1, paginatePlainText(text).length) };
}

/** Plain text formats have no real pages: create stable synthetic pages of ~3000 chars. */
function paginatePlainText(text: string): ParsedPage[] {
  const PAGE_SIZE = 3000;
  const blocks = text.split(/\n{2,}/);
  const pages: ParsedPage[] = [];
  let current = "";
  for (const block of blocks) {
    if (current.length + block.length > PAGE_SIZE && current.length > 0) {
      pages.push({ pageNumber: pages.length + 1, text: current.trim() });
      current = "";
    }
    current += (current ? "\n\n" : "") + block;
  }
  if (current.trim()) pages.push({ pageNumber: pages.length + 1, text: current.trim() });
  return pages;
}

export async function parseDocument(
  bytes: Uint8Array,
  filename: string,
  mimeType: string,
): Promise<ParsedDocument> {
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  let parsed: ParsedDocument;

  if (ext === "pdf" || mimeType === "application/pdf") {
    parsed = await parsePdf(bytes);
  } else if (
    ext === "docx" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    parsed = parseDocx(bytes);
  } else if (["txt", "md", "markdown", "csv"].includes(ext) || mimeType.startsWith("text/")) {
    const text = normalize(strFromU8(bytes));
    parsed = { pages: paginatePlainText(text), pageCount: 0 };
    parsed.pageCount = parsed.pages.length;
  } else {
    throw new Error(`Unsupported file type: .${ext}. Supported: PDF, DOCX, TXT, MD, CSV.`);
  }

  const totalChars = parsed.pages.reduce((n, p) => n + p.text.length, 0);
  if (totalChars < 20) {
    throw new Error(
      "Unable to extract usable text from this document. It may be a scanned image or empty.",
    );
  }
  if (parsed.pageCount === 0) parsed.pageCount = parsed.pages.length;
  return parsed;
}
