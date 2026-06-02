import type { AxiosInstance } from 'axios';
import axios from 'axios';

export type TeamsChannel = {
  id: string;
  displayName: string;
  description?: string;
  membershipType: string;
};

export type TeamsUser = {
  id: string;
  displayName: string;
  mail: string;
  jobTitle?: string;
};

export class TeamsClient {
  private client: AxiosInstance;

  constructor(accessToken: string) {
    this.client = axios.create({
      baseURL: 'https://graph.microsoft.com/v1.0',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    });
  }

  async listTeams(): Promise<{ id: string; displayName: string }[]> {
    const { data } = await this.client.get('/me/joinedTeams');
    return data.value;
  }

  async listChannels(teamId: string): Promise<TeamsChannel[]> {
    const { data } = await this.client.get(`/teams/${teamId}/channels`);
    return data.value;
  }

  async sendChannelMessage(teamId: string, channelId: string, content: string): Promise<string> {
    const { data } = await this.client.post(`/teams/${teamId}/channels/${channelId}/messages`, {
      body: { contentType: 'html', content },
    });
    return data.id;
  }

  async sendChatMessage(userId: string, content: string): Promise<string> {
    const chatResponse = await this.client.post('/chats', {
      chatType: 'oneOnOne',
      members: [
        { '@odata.type': '#microsoft.graph.aadUserConversationMember', roles: ['owner'], 'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${userId}')` },
      ],
    });
    const chatId = chatResponse.data.id;
    const { data } = await this.client.post(`/chats/${chatId}/messages`, {
      body: { contentType: 'html', content },
    });
    return data.id;
  }

  async getUser(userId: string): Promise<TeamsUser> {
    const { data } = await this.client.get(`/users/${userId}`);
    return { id: data.id, displayName: data.displayName, mail: data.mail, jobTitle: data.jobTitle };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/me');
      return true;
    } catch { return false; }
  }
}
