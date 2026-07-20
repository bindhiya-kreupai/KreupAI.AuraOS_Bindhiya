export type CandidateChatFlow = { nodes: unknown[]; edges: unknown[]; updatedAt?: string };
export type CandidateChatReply = {
  response: string;
  suggestions: string[];
  actions: { type: string; label: string; path?: string }[];
};
