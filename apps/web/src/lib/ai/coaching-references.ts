export type CoachingReference = {
  key: string;
  title: string;
  source: string;
  snippet?: string;
  similarity?: number;
  policyId?: string;
  href?: string;
  index?: number;
};

export function policyDocumentHref(policyId: string): string {
  return `/dashboard/hr-policies-compliance/policies?policyId=${encodeURIComponent(policyId)}`;
}

type ReferenceSource = {
  index?: number;
  title: string;
  source: string;
  snippet?: string;
  similarity?: number;
  policyId?: string;
  href?: string;
};

export function getMessageReferences(message: {
  sources?: ReferenceSource[];
  citations?: ReferenceSource[];
}): CoachingReference[] {
  const refs: CoachingReference[] = [];
  const seen = new Set<string>();

  for (const src of message.sources ?? []) {
    const key = src.policyId || `src:${src.index ?? ''}:${src.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    refs.push({
      key,
      title: src.title,
      source: src.source,
      snippet: src.snippet,
      similarity: src.similarity,
      policyId: src.policyId,
      href: src.href || (src.policyId ? policyDocumentHref(src.policyId) : undefined),
      index: src.index,
    });
  }

  for (const c of message.citations ?? []) {
    const key = c.policyId || `cite:${c.title}|${c.source}`;
    if (seen.has(key)) continue;
    seen.add(key);
    refs.push({
      key,
      title: c.title,
      source: c.source,
      policyId: c.policyId,
      href: c.href || (c.policyId ? policyDocumentHref(c.policyId) : undefined),
    });
  }

  return refs;
}
