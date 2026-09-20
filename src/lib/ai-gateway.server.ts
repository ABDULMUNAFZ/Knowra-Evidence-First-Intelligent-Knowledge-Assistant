import { createOpenAI } from "@ai-sdk/openai";

export const GATEWAY_BASE_URL = process.env["AI_GATEWAY_URL"] || "https://api.openai.com/v1";
export const CHAT_MODEL = "openai/gpt-6-astra";
export const EMBEDDING_MODEL = "google/gemini-embedding-2";
export const EMBEDDING_DIMENSIONS = 3072;

export function requireGatewayKey(): string {
  const key = process.env["AI_GATEWAY_KEY"] || process.env["OPENAI_API_KEY"];
  if (!key) {
    throw new Error(
      "AI is not configured: AI_GATEWAY_KEY is missing on the server. Answers and indexing are unavailable until it is set.",
    );
  }
  return key;
}

export function createChatProvider(key: string) {
  return createOpenAI({
    baseURL: GATEWAY_BASE_URL,
    apiKey: key,
    headers: {
      "X-API-Key": key,
      "X-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

export function gatewayErrorMessage(status: number, body: string): string {
  switch (status) {
    case 401:
      return "AI provider rejected the server credentials. Check the AI configuration.";
    case 402:
      return "AI credits are exhausted for this workspace. Top up to continue indexing and answering.";
    case 403:
      return "AI access is blocked for this workspace.";
    case 429:
      return "AI provider is rate limiting requests. Try again in a moment.";
    default:
      return `AI provider error (${status}): ${body.slice(0, 300)}`;
  }
}
