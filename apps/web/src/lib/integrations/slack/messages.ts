import type { SlackClient } from './client';

export type MessageTemplate = 'leave_approved' | 'leave_rejected' | 'review_due' | 'recognition' | 'announcement';

const templates: Record<MessageTemplate, (data: Record<string, string>) => { text: string; blocks: unknown[] }> = {
  leave_approved: (data) => ({
    text: `Leave request approved for ${data.employeeName}`,
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: `*Leave Approved* :white_check_mark:\n${data.employeeName}'s leave from ${data.startDate} to ${data.endDate} has been approved.` } },
    ],
  }),
  leave_rejected: (data) => ({
    text: `Leave request rejected for ${data.employeeName}`,
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: `*Leave Rejected* :x:\n${data.employeeName}'s leave request has been rejected.\nReason: ${data.reason}` } },
    ],
  }),
  review_due: (data) => ({
    text: `Performance review due for ${data.employeeName}`,
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: `*Performance Review Due* :memo:\nReview for ${data.employeeName} is due by ${data.dueDate}.` } },
    ],
  }),
  recognition: (data) => ({
    text: `${data.senderName} recognized ${data.recipientName}`,
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: `*Recognition* :star:\n${data.senderName} recognized ${data.recipientName}: "${data.message}"` } },
    ],
  }),
  announcement: (data) => ({
    text: data.title,
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: `*${data.title}*\n${data.body}` } },
    ],
  }),
};

export async function sendTemplatedMessage(client: SlackClient, channel: string, template: MessageTemplate, data: Record<string, string>): Promise<string> {
  const { text, blocks } = templates[template](data);
  return client.postMessage(channel, text, blocks);
}

export async function sendDirectMessage(client: SlackClient, userId: string, message: string): Promise<string> {
  return client.postMessage(userId, message);
}
