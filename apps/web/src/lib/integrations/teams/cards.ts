export type AdaptiveCardAction = {
  type: 'Action.OpenUrl' | 'Action.Submit';
  title: string;
  url?: string;
  data?: Record<string, unknown>;
};

export type AdaptiveCard = {
  type: 'AdaptiveCard';
  version: string;
  body: unknown[];
  actions?: AdaptiveCardAction[];
};

export function createLeaveApprovalCard(data: { employeeName: string; leaveType: string; startDate: string; endDate: string; reason: string; requestId: string }): AdaptiveCard {
  return {
    type: 'AdaptiveCard',
    version: '1.4',
    body: [
      { type: 'TextBlock', text: 'Leave Approval Request', weight: 'bolder', size: 'medium' },
      { type: 'FactSet', facts: [
        { title: 'Employee', value: data.employeeName },
        { title: 'Type', value: data.leaveType },
        { title: 'From', value: data.startDate },
        { title: 'To', value: data.endDate },
        { title: 'Reason', value: data.reason },
      ]},
    ],
    actions: [
      { type: 'Action.Submit', title: 'Approve', data: { action: 'approve', requestId: data.requestId } },
      { type: 'Action.Submit', title: 'Reject', data: { action: 'reject', requestId: data.requestId } },
    ],
  };
}

export function createRecognitionCard(data: { senderName: string; recipientName: string; message: string; badge?: string }): AdaptiveCard {
  return {
    type: 'AdaptiveCard',
    version: '1.4',
    body: [
      { type: 'TextBlock', text: 'Employee Recognition', weight: 'bolder', size: 'medium', color: 'good' },
      { type: 'TextBlock', text: `${data.senderName} recognized ${data.recipientName}`, wrap: true },
      { type: 'TextBlock', text: `"${data.message}"`, wrap: true, isSubtle: true },
      ...(data.badge ? [{ type: 'TextBlock', text: `Badge: ${data.badge}`, weight: 'bolder' }] : []),
    ],
  };
}

export function createAnnouncementCard(data: { title: string; body: string; author: string; url?: string }): AdaptiveCard {
  return {
    type: 'AdaptiveCard',
    version: '1.4',
    body: [
      { type: 'TextBlock', text: data.title, weight: 'bolder', size: 'large' },
      { type: 'TextBlock', text: data.body, wrap: true },
      { type: 'TextBlock', text: `Posted by ${data.author}`, isSubtle: true, size: 'small' },
    ],
    actions: data.url ? [{ type: 'Action.OpenUrl', title: 'View Details', url: data.url }] : [],
  };
}
