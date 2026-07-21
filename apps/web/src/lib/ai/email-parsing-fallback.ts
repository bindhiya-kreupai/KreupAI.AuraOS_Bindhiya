import type { ParsedEmail } from './email-parsing-types';

export function emptyEmailParse(): ParsedEmail {
  return {
    category: 'OTHER',
    confidence: 0,
    entities: {},
    suggestedActions: [
      { action: 'ROUTE_FOR_REVIEW', confidence: 0, requiresHumanConfirmation: true },
    ],
    provider: 'rules',
  };
}
