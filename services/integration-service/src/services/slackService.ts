import { WebClient } from '@slack/web-api';

export interface SlackConfig {
  token: string;
  teamId: string;
  defaultChannel?: string;
}

export interface SendMessageParams {
  channel: string;
  text: string;
  blocks?: SlackBlock[];
  threadTs?: string;
}

export interface SlackBlock {
  type: string;
  text?: { type: string; text: string };
  elements?: unknown[];
}

export interface SlackChannel {
  id: string;
  name: string;
  isPrivate: boolean;
  memberCount: number;
}

export interface SlackMessageResult {
  ok: boolean;
  channel: string;
  ts: string;
  message?: Record<string, unknown>;
  error?: string;
}

export interface ChannelCreateParams {
  name: string;
  isPrivate?: boolean;
  description?: string;
  members?: string[];
}

export class SlackService {
  private config: SlackConfig | null = null;

  /**
   * Initialize the Slack service with credentials
   */
  initialize(config: SlackConfig): void {
    this.config = config;
  }

  /**
   * Send a message to a Slack channel
   */
  async sendMessage(params: SendMessageParams): Promise<SlackMessageResult> {
    this.ensureInitialized();

    try {
      const client = new WebClient(this.config!.token);
      const result = await client.chat.postMessage({
        channel: params.channel,
        text: params.text,
        blocks: params.blocks as any,
        thread_ts: params.threadTs,
      });

      return {
        ok: true,
        channel: params.channel,
        ts: Date.now().toString(),
      };
    } catch (error) {
      return {
        ok: false,
        channel: params.channel,
        ts: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * List all channels in the workspace
   */
  async listChannels(): Promise<SlackChannel[]> {
    this.ensureInitialized();

    const client = new WebClient(this.config!.token);
    const result = await client.conversations.list();
    
    return (result.channels || []).map((ch: any) => ({
      id: ch.id,
      name: ch.name,
      isPrivate: ch.is_private,
      memberCount: ch.num_members || 0
    }));
  }

  /**
   * Create a new Slack channel
   */
  async createChannel(params: ChannelCreateParams): Promise<SlackChannel> {
    this.ensureInitialized();

    const client = new WebClient(this.config!.token);
    const result = await client.conversations.create({
      name: params.name,
      is_private: params.isPrivate || false
    });
    
    if (params.members && params.members.length > 0 && result.channel?.id) {
      await client.conversations.invite({
        channel: result.channel.id,
        users: params.members.join(',')
      });
    }

    return {
      id: result.channel?.id || 'C_generated',
      name: params.name,
      isPrivate: params.isPrivate || false,
      memberCount: params.members?.length || 0,
    };
  }

  /**
   * Archive a Slack channel
   */
  async archiveChannel(channelId: string): Promise<boolean> {
    this.ensureInitialized();

    const client = new WebClient(this.config!.token);
    await client.conversations.archive({ channel: channelId });
    return true;
  }

  /**
   * Invite users to a channel
   */
  async inviteToChannel(channelId: string, userIds: string[]): Promise<boolean> {
    this.ensureInitialized();

    const client = new WebClient(this.config!.token);
    await client.conversations.invite({
      channel: channelId,
      users: userIds.join(',')
    });
    return true;
  }

  private ensureInitialized(): void {
    if (!this.config) {
      throw new Error('SlackService not initialized. Call initialize() first.');
    }
  }
}

export default new SlackService();
