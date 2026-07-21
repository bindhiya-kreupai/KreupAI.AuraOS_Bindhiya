import type { CandidateChatReply } from './chatbot-types';

type FlowNode = { data?: { label?: unknown; response?: unknown; intent?: unknown } };

function flowReply(message: string, nodes: unknown[]): CandidateChatReply | null {
  const text = message.toLowerCase();
  const matchingNode = nodes
    .filter((node): node is FlowNode => Boolean(node && typeof node === 'object'))
    .find((node) => {
      const intent = String(node.data?.intent ?? node.data?.label ?? '').toLowerCase();
      return intent && text.includes(intent);
    });
  const response = matchingNode?.data?.response ?? matchingNode?.data?.label;
  if (typeof response !== 'string' || !response.trim()) return null;
  return { response, suggestions: [], actions: [] };
}

export function answerCandidateIntent(
  message: string,
  flowNodes: unknown[] = []
): CandidateChatReply {
  const configuredReply = flowReply(message, flowNodes);
  if (configuredReply) return configuredReply;
  const text = message.toLowerCase();
  if (text.includes('leave'))
    return {
      response:
        'Leave questions are handled by the employer after onboarding. Please review the role benefits or ask your recruiter.',
      suggestions: ['Benefits', 'Application status'],
      actions: [],
    };
  if (text.includes('salary') || text.includes('pay'))
    return {
      response:
        'Compensation is discussed during the recruitment process and depends on the role and experience.',
      suggestions: ['Application status', 'Interview'],
      actions: [],
    };
  if (text.includes('status') || text.includes('application'))
    return {
      response:
        'Your application status is available through the recruitment team. They will contact you when there is an update.',
      suggestions: ['Interview', 'Role details'],
      actions: [],
    };
  if (text.includes('interview'))
    return {
      response:
        'If selected, the recruitment team will send an interview invitation with available time slots.',
      suggestions: ['Application status'],
      actions: [],
    };
  return {
    response:
      'I can help with application status, interviews, compensation questions, and role information.',
    suggestions: ['Application status', 'Interview', 'Salary'],
    actions: [],
  };
}
