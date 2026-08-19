/**
 * Intentionally empty. The first AI assistant pass (Gemini-backed chat over
 * read-only task/event/note context) lives in apps/api/src/ai instead, since
 * it's a single NestJS module with no cross-app reuse yet. This package stays
 * reserved for AI code that genuinely needs to be shared (assistant/tools/
 * embeddings/rag/prompts) — e.g. if note search grows embeddings/RAG, or a
 * second consumer needs the same assistant logic outside apps/api.
 */
export {};
