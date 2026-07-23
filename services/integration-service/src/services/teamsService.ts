import { Client } from '@microsoft/microsoft-graph-client';

export interface TeamsConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  accessToken?: string;
}

export interface SendCardParams {
  channelId: string;
  card: AdaptiveCard;
  replyToId?: string;
}

export interface AdaptiveCard {
  type: 'AdaptiveCard';
  version: string;
  body: CardElement[];
  actions?: CardAction[];
}

export interface CardElement {
  type: string;
  text?: string;
  size?: string;
  weight?: string;
  items?: CardElement[];
}

export interface CardAction {
  type: string;
  title: string;
  url?: string;
  data?: Record<string, unknown>;
}

export interface TeamsChannel {
  id: string;
  displayName: string;
  description?: string;
  membershipType: 'standard' | 'private' | 'shared';
}

export interface TeamInfo {
  id: string;
  displayName: string;
  description?: string;
  members: TeamMember[];
}

export interface TeamMember {
  id: string;
  displayName: string;
  email: string;
  roles: string[];
}

export interface SendCardResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class TeamsService {
  private config: TeamsConfig | null = null;

  /**
   * Initialize the Teams service with credentials
   */
  initialize(config: TeamsConfig): void {
    this.config = config;
  }

  /**
   * Send an Adaptive Card to a Teams channel
   */
  async sendCard(params: SendCardParams): Promise<SendCardResult> {
    this.ensureInitialized();

    try {
      const client = Client.init({
        authProvider: (done) => {
          done(null, this.config!.accessToken!);
        }
      });
      
      const message = {
        body: { contentType: 'html', content: '' },
        attachments: [{
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: JSON.stringify(params.card),
        }],
      };
      
      const result = await client.api(`/teams/${this.config!.tenantId}/channels/${params.channelId}/messages`).post(message);

      return {
        success: true,
        messageId: 'msg_' + Date.now().toString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * List channels in a team
   */
  async listChannels(teamId: string): Promise<TeamsChannel[]> {
    this.ensureInitialized();

    const client = Client.init({
      authProvider: (done) => done(null, this.config!.accessToken!)
    });
    const result = await client.api(`/teams/${teamId}/channels`).get();
    
    return (result.value || []).map((ch: any) => ({
      id: ch.id,
      displayName: ch.displayName,
      description: ch.description,
      membershipType: ch.membershipType
    }));
  }

  /**
   * Get team information including members
   */
  async getTeamInfo(teamId: string): Promise<TeamInfo> {
    this.ensureInitialized();

    const client = Client.init({
      authProvider: (done) => done(null, this.config!.accessToken!)
    });
    
    const team = await client.api(`/teams/${teamId}`).get();
    const members = await client.api(`/teams/${teamId}/members`).get();
    
    return {
      id: teamId,
      displayName: team.displayName,
      description: team.description,
      members: (members.value || []).map((m: any) => ({
        id: m.id,
        displayName: m.displayName,
        email: m.email || '',
        roles: m.roles || []
      })),
    };
  }

  /**
   * Create a new channel in a team
   */
  async createChannel(teamId: string, displayName: string, description?: string): Promise<TeamsChannel> {
    this.ensureInitialized();

    const client = Client.init({
      authProvider: (done) => done(null, this.config!.accessToken!)
    });
    
    const channel = {
      displayName,
      description,
      membershipType: 'standard'
    };
    
    const result = await client.api(`/teams/${teamId}/channels`).post(channel);
    
    return {
      id: result.id,
      displayName: result.displayName,
      description: result.description,
      membershipType: result.membershipType,
    };
  }

  /**
   * Add a member to a team
   */
  async addMember(teamId: string, userId: string, role: string = 'member'): Promise<boolean> {
    this.ensureInitialized();

    const client = Client.init({
      authProvider: (done) => done(null, this.config!.accessToken!)
    });
    
    const conversationMember = {
      '@odata.type': '#microsoft.graph.aadUserConversationMember',
      roles: [role],
      'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${userId}')`
    };
    
    await client.api(`/teams/${teamId}/members`).post(conversationMember);
    return true;
  }

  /**
   * Remove a member from a team
   */
  async removeMember(teamId: string, membershipId: string): Promise<boolean> {
    this.ensureInitialized();

    const client = Client.init({
      authProvider: (done) => done(null, this.config!.accessToken!)
    });
    
    await client.api(`/teams/${teamId}/members/${membershipId}`).delete();
    return true;
  }

  private ensureInitialized(): void {
    if (!this.config) {
      throw new Error('TeamsService not initialized. Call initialize() first.');
    }
  }
}

export default new TeamsService();
