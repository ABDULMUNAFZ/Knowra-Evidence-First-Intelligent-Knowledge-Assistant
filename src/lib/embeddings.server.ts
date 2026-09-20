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

async function callEmbeddings(input: string[]): Promise<number[][]> {
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

  if (!res.ok) {
    const body = await res.text();
    throw new Error(gatewayErrorMessage(res.status, body));
  }

  const json = (await res.json()) as {
    data: { index: number; embedding: number[] }[];
  };
  const ordered = [...json.data].sort((a, b) => a.index - b.index);
  return ordered.map((d) => d.embedding);
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
    if (!vec) throw new Error("Embedding provider returned no vector for the query.");
    return vec;
  },
};
