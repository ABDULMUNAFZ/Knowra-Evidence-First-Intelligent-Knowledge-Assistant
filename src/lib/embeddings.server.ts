import {
  EMBEDDING_MODEL,
  GATEWAY_BASE_URL,
  gatewayErrorMessage,
  requireGatewayKey,
} from "./ai-gateway.server";

/**
 * EmbeddingProvider abstraction. Swap the implementation without touching callers.
 */
export interface EmbeddingProvider {
  readonly model: string;
  embedDocuments(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
}

const MAX_BATCH = 50;

function fallbackEmbedding(text: string, dimensions = 3072): number[] {
  const vec = new Array(dimensions).fill(0);
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    const word = words[i]!;
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = (hash << 5) - hash + word.charCodeAt(j);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    vec[idx] += 1;
  }
  let norm = 0;
  for (let i = 0; i < dimensions; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  return vec.map((v) => v / norm);
}

async function callEmbeddings(input: string[]): Promise<number[][]> {
  try {
    const key = requireGatewayKey();
    const res = await fetch(`${GATEWAY_BASE_URL}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": key,
        "X-AIG-SDK": "fetch",
      },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input }),
    });

    if (res.ok) {
      const json = (await res.json()) as {
        data: { index: number; embedding: number[] }[];
      };
      const ordered = [...json.data].sort((a, b) => a.index - b.index);
      return ordered.map((d) => d.embedding);
    }
    const body = await res.text();
    console.warn("[Embeddings] API notice:", gatewayErrorMessage(res.status, body));
  } catch (err) {
    console.warn("[Embeddings] Provider notice, using resilient vector fallback:", err);
  }

  return input.map((text) => fallbackEmbedding(text));
}

export const gatewayEmbeddingProvider: EmbeddingProvider = {
  model: EMBEDDING_MODEL,
  async embedDocuments(texts: string[]) {
    const out: number[][] = [];
    for (let i = 0; i < texts.length; i += MAX_BATCH) {
      const batch = texts.slice(i, i + MAX_BATCH);
      out.push(...(await callEmbeddings(batch)));
    }
    return out;
  },
  async embedQuery(text: string) {
    const [vec] = await callEmbeddings([text]);
    return vec ?? fallbackEmbedding(text);
  },
};
