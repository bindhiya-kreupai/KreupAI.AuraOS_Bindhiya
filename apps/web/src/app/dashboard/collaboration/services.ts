/**
 * Collaboration Module - Service Layer
 * API-ready services for digital whiteboard, task kanban, and daily standups
 */

'use client';

import { APIClient } from '@/lib/api-client';
import type {
  Whiteboard,
  WhiteboardElement,
  WhiteboardVersion,
  KanbanBoard,
  KanbanCard,
  KanbanColumn,
  Standup,
  StandupResponse,
  StandupMeeting,
  Blocker,
  CollaborationAnalytics,
  CollaborationSettings,
  Collaborator,
  CardComment,
  TimeEntry,
} from './types';

// ============================================================================
// Digital Whiteboard Service
// ============================================================================

export class WhiteboardService {
  private static endpoint = '/collaboration/whiteboards';

  static async getWhiteboards(userId?: string): Promise<Whiteboard[]> {
    try {
      const params = userId ? { userId } : undefined;
      return await APIClient.get<Whiteboard[]>(this.endpoint, params);
    } catch (error) {
            throw error;
    }
  }

  static async getWhiteboardById(whiteboardId: string): Promise<Whiteboard> {
    try {
      return await APIClient.get<Whiteboard>(`${this.endpoint}/${whiteboardId}`);
    } catch (error) {
            throw error;
    }
  }

  static async createWhiteboard(whiteboard: Whiteboard): Promise<Whiteboard> {
    try {
      return await APIClient.post<Whiteboard>(this.endpoint, whiteboard);
    } catch (error) {
            throw error;
    }
  }

  static async updateWhiteboard(whiteboardId: string, updates: Partial<Whiteboard>): Promise<Whiteboard> {
    try {
      return await APIClient.put<Whiteboard>(`${this.endpoint}/${whiteboardId}`, updates);
    } catch (error) {
            throw error;
    }
  }

  static async deleteWhiteboard(whiteboardId: string): Promise<void> {
    try {
      await APIClient.delete<void>(`${this.endpoint}/${whiteboardId}`);
    } catch (error) {
            throw error;
    }
  }

  // Element Operations
  static async addElement(whiteboardId: string, element: WhiteboardElement): Promise<Whiteboard> {
    try {
      return await APIClient.post<Whiteboard>(
        `${this.endpoint}/${whiteboardId}/elements`,
        element
      );
    } catch (error) {
            throw error;
    }
  }

  static async updateElement(
    whiteboardId: string,
    elementId: string,
    updates: Partial<WhiteboardElement>
  ): Promise<Whiteboard> {
    try {
      return await APIClient.put<Whiteboard>(
        `${this.endpoint}/${whiteboardId}/elements/${elementId}`,
        updates
      );
    } catch (error) {
            throw error;
    }
  }

  static async deleteElement(whiteboardId: string, elementId: string): Promise<Whiteboard> {
    try {
      return await APIClient.delete<Whiteboard>(
        `${this.endpoint}/${whiteboardId}/elements/${elementId}`
      );
    } catch (error) {
            throw error;
    }
  }

  // Collaboration
  static async addCollaborator(whiteboardId: string, collaborator: Collaborator): Promise<Whiteboard> {
    try {
      return await APIClient.post<Whiteboard>(
        `${this.endpoint}/${whiteboardId}/collaborators`,
        collaborator
      );
    } catch (error) {
            throw error;
    }
  }

  static async removeCollaborator(whiteboardId: string, userId: string): Promise<Whiteboard> {
    try {
      return await APIClient.delete<Whiteboard>(
        `${this.endpoint}/${whiteboardId}/collaborators/${userId}`
      );
    } catch (error) {
            throw error;
    }
  }

  // Versioning
  static async createVersion(whiteboardId: string, versionName?: string): Promise<WhiteboardVersion> {
    try {
      return await APIClient.post<WhiteboardVersion>(
        `${this.endpoint}/${whiteboardId}/versions`,
        { versionName }
      );
    } catch (error) {
            throw error;
    }
  }

  static async restoreVersion(whiteboardId: string, versionId: string): Promise<Whiteboard> {
    try {
      return await APIClient.post<Whiteboard>(
        `${this.endpoint}/${whiteboardId}/versions/${versionId}/restore`,
        {}
      );
    } catch (error) {
            throw error;
    }
  }

  // Export
  static async exportWhiteboard(whiteboardId: string, format: 'png' | 'pdf' | 'svg' | 'json'): Promise<Blob> {
    try {
      return await APIClient.get<Blob>(
        `${this.endpoint}/${whiteboardId}/export`,
        { format }
      );
    } catch (error) {
            throw error;
    }
  }
}

// ============================================================================
// Kanban Board Service
// ============================================================================

export class KanbanService {
  private static endpoint = '/collaboration/kanban';

  static async getBoards(userId?: string): Promise<KanbanBoard[]> {
    try {
      const params = userId ? { userId } : undefined;
      return await APIClient.get<KanbanBoard[]>(this.endpoint, params);
    } catch (error) {
            throw error;
    }
  }

  static async getBoardById(boardId: string): Promise<KanbanBoard> {
    try {
      return await APIClient.get<KanbanBoard>(`${this.endpoint}/${boardId}`);
    } catch (error) {
            throw error;
    }
  }

  static async createBoard(board: KanbanBoard): Promise<KanbanBoard> {
    try {
      return await APIClient.post<KanbanBoard>(this.endpoint, board);
    } catch (error) {
            throw error;
    }
  }

  static async updateBoard(boardId: string, updates: Partial<KanbanBoard>): Promise<KanbanBoard> {
    try {
      return await APIClient.put<KanbanBoard>(`${this.endpoint}/${boardId}`, updates);
    } catch (error) {
            throw error;
    }
  }

  static async deleteBoard(boardId: string): Promise<void> {
    try {
      await APIClient.delete<void>(`${this.endpoint}/${boardId}`);
    } catch (error) {
            throw error;
    }
  }

  // Column Operations
  static async addColumn(boardId: string, column: KanbanColumn): Promise<KanbanBoard> {
    try {
      return await APIClient.post<KanbanBoard>(
        `${this.endpoint}/${boardId}/columns`,
        column
      );
    } catch (error) {
            throw error;
    }
  }

  static async updateColumn(boardId: string, columnId: string, updates: Partial<KanbanColumn>): Promise<KanbanBoard> {
    try {
      return await APIClient.put<KanbanBoard>(
        `${this.endpoint}/${boardId}/columns/${columnId}`,
        updates
      );
    } catch (error) {
            throw error;
    }
  }

  static async deleteColumn(boardId: string, columnId: string): Promise<KanbanBoard> {
    try {
      return await APIClient.delete<KanbanBoard>(
        `${this.endpoint}/${boardId}/columns/${columnId}`
      );
    } catch (error) {
            throw error;
    }
  }

  // Card Operations
  static async createCard(boardId: string, columnId: string, card: KanbanCard): Promise<KanbanCard> {
    try {
      return await APIClient.post<KanbanCard>(
        `${this.endpoint}/${boardId}/columns/${columnId}/cards`,
        card
      );
    } catch (error) {
            throw error;
    }
  }

  static async updateCard(boardId: string, cardId: string, updates: Partial<KanbanCard>): Promise<KanbanCard> {
    try {
      return await APIClient.put<KanbanCard>(
        `${this.endpoint}/${boardId}/cards/${cardId}`,
        updates
      );
    } catch (error) {
            throw error;
    }
  }

  static async moveCard(boardId: string, cardId: string, targetColumnId: string, position: number): Promise<KanbanCard> {
    try {
      return await APIClient.post<KanbanCard>(
        `${this.endpoint}/${boardId}/cards/${cardId}/move`,
        { targetColumnId, position }
      );
    } catch (error) {
            throw error;
    }
  }

  static async deleteCard(boardId: string, cardId: string): Promise<void> {
    try {
      await APIClient.delete<void>(
        `${this.endpoint}/${boardId}/cards/${cardId}`
      );
    } catch (error) {
            throw error;
    }
  }

  // Card Comments
  static async addComment(boardId: string, cardId: string, comment: CardComment): Promise<KanbanCard> {
    try {
      return await APIClient.post<KanbanCard>(
        `${this.endpoint}/${boardId}/cards/${cardId}/comments`,
        comment
      );
    } catch (error) {
            throw error;
    }
  }

  // Time Tracking
  static async addTimeEntry(boardId: string, cardId: string, timeEntry: TimeEntry): Promise<KanbanCard> {
    try {
      return await APIClient.post<KanbanCard>(
        `${this.endpoint}/${boardId}/cards/${cardId}/time-entries`,
        timeEntry
      );
    } catch (error) {
            throw error;
    }
  }
}

// ============================================================================
// Daily Standups Service
// ============================================================================

export class StandupService {
  private static endpoint = '/collaboration/standups';

  static async getStandups(teamId?: string): Promise<Standup[]> {
    try {
      const params = teamId ? { teamId } : undefined;
      return await APIClient.get<Standup[]>(this.endpoint, params);
    } catch (error) {
            throw error;
    }
  }

  static async getStandupById(standupId: string): Promise<Standup> {
    try {
      return await APIClient.get<Standup>(`${this.endpoint}/${standupId}`);
    } catch (error) {
            throw error;
    }
  }

  static async createStandup(standup: Standup): Promise<Standup> {
    try {
      return await APIClient.post<Standup>(this.endpoint, standup);
    } catch (error) {
            throw error;
    }
  }

  static async updateStandup(standupId: string, updates: Partial<Standup>): Promise<Standup> {
    try {
      return await APIClient.put<Standup>(`${this.endpoint}/${standupId}`, updates);
    } catch (error) {
            throw error;
    }
  }

  static async deleteStandup(standupId: string): Promise<void> {
    try {
      await APIClient.delete<void>(`${this.endpoint}/${standupId}`);
    } catch (error) {
            throw error;
    }
  }

  // Responses
  static async getResponses(standupId?: string, userId?: string): Promise<StandupResponse[]> {
    try {
      const params: any = {};
      if (standupId) params.standupId = standupId;
      if (userId) params.userId = userId;
      return await APIClient.get<StandupResponse[]>(`${this.endpoint}/responses`, Object.keys(params).length ? params : undefined);
    } catch (error) {
            throw error;
    }
  }

  static async submitResponse(response: StandupResponse): Promise<StandupResponse> {
    try {
      return await APIClient.post<StandupResponse>(`${this.endpoint}/responses`, response);
    } catch (error) {
            throw error;
    }
  }

  static async updateResponse(responseId: string, updates: Partial<StandupResponse>): Promise<StandupResponse> {
    try {
      return await APIClient.put<StandupResponse>(
        `${this.endpoint}/responses/${responseId}`,
        updates
      );
    } catch (error) {
            throw error;
    }
  }

  // Blockers
  static async addBlocker(responseId: string, blocker: Blocker): Promise<StandupResponse> {
    try {
      return await APIClient.post<StandupResponse>(
        `${this.endpoint}/responses/${responseId}/blockers`,
        blocker
      );
    } catch (error) {
            throw error;
    }
  }

  static async resolveBlocker(responseId: string, blockerId: string, resolution: string): Promise<Blocker> {
    try {
      return await APIClient.post<Blocker>(
        `${this.endpoint}/responses/${responseId}/blockers/${blockerId}/resolve`,
        { resolution }
      );
    } catch (error) {
            throw error;
    }
  }

  // Meetings
  static async createMeeting(standupId: string, meeting: StandupMeeting): Promise<StandupMeeting> {
    try {
      return await APIClient.post<StandupMeeting>(
        `${this.endpoint}/${standupId}/meetings`,
        meeting
      );
    } catch (error) {
            throw error;
    }
  }

  static async completeMeeting(standupId: string, meetingId: string, summary: Partial<StandupMeeting>): Promise<StandupMeeting> {
    try {
      return await APIClient.post<StandupMeeting>(
        `${this.endpoint}/${standupId}/meetings/${meetingId}/complete`,
        summary
      );
    } catch (error) {
            throw error;
    }
  }
}

// ============================================================================
// Analytics Service
// ============================================================================

export class CollaborationAnalyticsService {
  private static endpoint = '/collaboration/analytics';

  static async getAnalytics(period: string): Promise<CollaborationAnalytics> {
    try {
      return await APIClient.get<CollaborationAnalytics>(this.endpoint, { period });
    } catch (error) {
            throw error;
    }
  }
}

// ============================================================================
// Settings Service
// ============================================================================

export class CollaborationSettingsService {
  private static endpoint = '/collaboration/settings';

  static async getSettings(): Promise<CollaborationSettings> {
    try {
      return await APIClient.get<CollaborationSettings>(this.endpoint);
    } catch (error) {
            throw error;
    }
  }

  static async updateSettings(updates: Partial<CollaborationSettings>): Promise<CollaborationSettings> {
    try {
      return await APIClient.put<CollaborationSettings>(this.endpoint, updates);
    } catch (error) {
            throw error;
    }
  }
}
