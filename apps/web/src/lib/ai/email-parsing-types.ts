export type EmailCategory = 'LEAVE_REQUEST' | 'EXPENSE' | 'TICKET' | 'OTHER';

export type ParsedEmail = {
  category: EmailCategory;
  confidence: number;
  entities: Record<string, unknown>;
  suggestedActions: Array<{
    action: string;
    confidence: number;
    requiresHumanConfirmation: boolean;
  }>;
  provider: 'rules' | 'llm';
};
