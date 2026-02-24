import axios, { AxiosInstance } from 'axios';

export type SlackChannel = {
  id: string;
  name: string;
  isPrivate: boolean;
  memberCount: number;
};

export type SlackUser = {
  id: string;
  name: string;
  realName: string;
  avatar: string;
  email?: string;
};

export class SlackClient {
  private client: AxiosInstance;

  constructor(token: string) {
    this.client = axios.create({
      baseURL: 'https://slack.com/api',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
  }

  async listChannels(): Promise<SlackChannel[]> {
    const { data } = await this.client.get('/conversations.list');
    return data.channels.map((ch: any) => ({
      id: ch.id,
      name: ch.name,
      isPrivate: ch.is_private,
      memberCount: ch.num_members,
    }));
  }

  async getUser(userId: string): Promise<SlackUser> {
    const { data } = await this.client.get('/users.info', { params: { user: userId } });
    return {
      id: data.user.id,
      name: data.user.name,
      realName: data.user.real_name,
      avatar: data.user.profile.image_72,
      email: data.user.profile.email,
    };
  }

  async postMessage(channel: string, text: string, blocks?: unknown[]): Promise<string> {
    const { data } = await this.client.post('/chat.postMessage', { channel, text, blocks });
    return data.ts;
  }

  async testConnection(): Promise<boolean> {
    const { data } = await this.client.get('/auth.test');
    return data.ok;
  }
}
