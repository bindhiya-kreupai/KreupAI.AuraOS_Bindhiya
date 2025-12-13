/**
 * Collaboration Module - Service Layer
 * API-ready services for digital whiteboard, task kanban, and daily standups
 */

'use client';

import {
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
  private static WHITEBOARDS_KEY = 'collaboration_whiteboards';

  static async getWhiteboards(userId?: string): Promise<Whiteboard[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.WHITEBOARDS_KEY);
    const whiteboards: Whiteboard[] = data ? JSON.parse(data) : [];

    if (userId) {
      return whiteboards.filter(
        (wb) =>
          wb.ownerId === userId ||
          wb.collaborators.some((c) => c.userId === userId) ||
          wb.visibility === 'organization'
      );
    }
    return whiteboards;
  }

  static async getWhiteboardById(whiteboardId: string): Promise<Whiteboard> {
    // TODO: Replace with actual API call
    const whiteboards = await this.getWhiteboards();
    const whiteboard = whiteboards.find((wb) => wb.whiteboardId === whiteboardId);
    if (!whiteboard) throw new Error('Whiteboard not found');
    return whiteboard;
  }

  static async createWhiteboard(whiteboard: Whiteboard): Promise<Whiteboard> {
    // TODO: Replace with actual API call
    const whiteboards = await this.getWhiteboards();
    const newWhiteboard = {
      ...whiteboard,
      version: 1,
      versions: [],
      totalElements: 0,
      elements: [],
      activeUsers: [],
      viewCount: 0,
      editCount: 0,
      audit: {
        createdAt: new Date(),
        createdBy: whiteboard.ownerId,
        updatedAt: new Date(),
        updatedBy: whiteboard.ownerId,
      },
    };
    whiteboards.push(newWhiteboard);
    localStorage.setItem(this.WHITEBOARDS_KEY, JSON.stringify(whiteboards));
    return newWhiteboard;
  }

  static async updateWhiteboard(whiteboardId: string, updates: Partial<Whiteboard>): Promise<Whiteboard> {
    // TODO: Replace with actual API call
    const whiteboards = await this.getWhiteboards();
    const index = whiteboards.findIndex((wb) => wb.whiteboardId === whiteboardId);
    if (index === -1) throw new Error('Whiteboard not found');

    const updated = {
      ...whiteboards[index],
      ...updates,
      lastEditedDate: new Date(),
      editCount: whiteboards[index].editCount + 1,
      audit: {
        ...whiteboards[index].audit,
        updatedAt: new Date(),
        updatedBy: updates.lastEditedBy || 'current-user',
      },
    };
    whiteboards[index] = updated;
    localStorage.setItem(this.WHITEBOARDS_KEY, JSON.stringify(whiteboards));
    return updated;
  }

  static async deleteWhiteboard(whiteboardId: string): Promise<void> {
    // TODO: Replace with actual API call
    const whiteboards = await this.getWhiteboards();
    const filtered = whiteboards.filter((wb) => wb.whiteboardId !== whiteboardId);
    localStorage.setItem(this.WHITEBOARDS_KEY, JSON.stringify(filtered));
  }

  // Element Operations
  static async addElement(whiteboardId: string, element: WhiteboardElement): Promise<Whiteboard> {
    // TODO: Replace with actual API call
    const whiteboard = await this.getWhiteboardById(whiteboardId);

    const newElement = {
      ...element,
      lastEditedDate: new Date(),
      comments: [],
      reactions: [],
    };

    whiteboard.elements.push(newElement);
    whiteboard.totalElements++;

    return this.updateWhiteboard(whiteboardId, {
      elements: whiteboard.elements,
      totalElements: whiteboard.totalElements,
    });
  }

  static async updateElement(
    whiteboardId: string,
    elementId: string,
    updates: Partial<WhiteboardElement>
  ): Promise<Whiteboard> {
    // TODO: Replace with actual API call
    const whiteboard = await this.getWhiteboardById(whiteboardId);

    const elementIndex = whiteboard.elements.findIndex((e) => e.elementId === elementId);
    if (elementIndex === -1) throw new Error('Element not found');

    whiteboard.elements[elementIndex] = {
      ...whiteboard.elements[elementIndex],
      ...updates,
      lastEditedDate: new Date(),
    };

    return this.updateWhiteboard(whiteboardId, {
      elements: whiteboard.elements,
    });
  }

  static async deleteElement(whiteboardId: string, elementId: string): Promise<Whiteboard> {
    // TODO: Replace with actual API call
    const whiteboard = await this.getWhiteboardById(whiteboardId);

    whiteboard.elements = whiteboard.elements.filter((e) => e.elementId !== elementId);
    whiteboard.totalElements--;

    return this.updateWhiteboard(whiteboardId, {
      elements: whiteboard.elements,
      totalElements: whiteboard.totalElements,
    });
  }

  // Collaboration
  static async addCollaborator(whiteboardId: string, collaborator: Collaborator): Promise<Whiteboard> {
    // TODO: Replace with actual API call
    const whiteboard = await this.getWhiteboardById(whiteboardId);

    const newCollaborator = {
      ...collaborator,
      addedDate: new Date(),
    };

    whiteboard.collaborators.push(newCollaborator);

    return this.updateWhiteboard(whiteboardId, {
      collaborators: whiteboard.collaborators,
    });
  }

  static async removeCollaborator(whiteboardId: string, userId: string): Promise<Whiteboard> {
    // TODO: Replace with actual API call
    const whiteboard = await this.getWhiteboardById(whiteboardId);

    whiteboard.collaborators = whiteboard.collaborators.filter((c) => c.userId !== userId);

    return this.updateWhiteboard(whiteboardId, {
      collaborators: whiteboard.collaborators,
    });
  }

  // Versioning
  static async createVersion(whiteboardId: string, versionName?: string): Promise<WhiteboardVersion> {
    // TODO: Replace with actual API call
    const whiteboard = await this.getWhiteboardById(whiteboardId);

    const version: WhiteboardVersion = {
      versionId: `ver-${Date.now()}`,
      versionNumber: whiteboard.version + 1,
      versionName,
      createdBy: 'current-user',
      createdDate: new Date(),
      changes: 'Manual version save',
      elementsSnapshot: [...whiteboard.elements],
      isCurrent: true,
    };

    // Mark all previous versions as not current
    whiteboard.versions.forEach((v) => (v.isCurrent = false));
    whiteboard.versions.push(version);
    whiteboard.version++;

    await this.updateWhiteboard(whiteboardId, {
      version: whiteboard.version,
      versions: whiteboard.versions,
    });

    return version;
  }

  static async restoreVersion(whiteboardId: string, versionId: string): Promise<Whiteboard> {
    // TODO: Replace with actual API call
    const whiteboard = await this.getWhiteboardById(whiteboardId);

    const version = whiteboard.versions.find((v) => v.versionId === versionId);
    if (!version) throw new Error('Version not found');

    return this.updateWhiteboard(whiteboardId, {
      elements: [...version.elementsSnapshot],
      totalElements: version.elementsSnapshot.length,
    });
  }

  // Export
  static async exportWhiteboard(whiteboardId: string, format: 'png' | 'pdf' | 'svg' | 'json'): Promise<Blob> {
    // TODO: Replace with actual export implementation
    const whiteboard = await this.getWhiteboardById(whiteboardId);

    // Mock export
    const content = JSON.stringify(whiteboard, null, 2);
    return new Blob([content], { type: 'application/json' });
  }
}

// ============================================================================
// Kanban Board Service
// ============================================================================

export class KanbanService {
  private static BOARDS_KEY = 'collaboration_kanban_boards';

  static async getBoards(userId?: string): Promise<KanbanBoard[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.BOARDS_KEY);
    const boards: KanbanBoard[] = data ? JSON.parse(data) : [];

    if (userId) {
      return boards.filter(
        (board) =>
          board.ownerId === userId ||
          board.collaborators.some((c) => c.userId === userId) ||
          board.visibility === 'organization'
      );
    }
    return boards;
  }

  static async getBoardById(boardId: string): Promise<KanbanBoard> {
    // TODO: Replace with actual API call
    const boards = await this.getBoards();
    const board = boards.find((b) => b.boardId === boardId);
    if (!board) throw new Error('Kanban board not found');
    return board;
  }

  static async createBoard(board: KanbanBoard): Promise<KanbanBoard> {
    // TODO: Replace with actual API call
    const boards = await this.getBoards();
    const newBoard = {
      ...board,
      totalCards: 0,
      activeCards: 0,
      completedCards: 0,
      archivedCards: 0,
      lastActivity: new Date(),
      activityLog: [],
      audit: {
        createdAt: new Date(),
        createdBy: board.ownerId,
        updatedAt: new Date(),
        updatedBy: board.ownerId,
      },
    };
    boards.push(newBoard);
    localStorage.setItem(this.BOARDS_KEY, JSON.stringify(boards));
    return newBoard;
  }

  static async updateBoard(boardId: string, updates: Partial<KanbanBoard>): Promise<KanbanBoard> {
    // TODO: Replace with actual API call
    const boards = await this.getBoards();
    const index = boards.findIndex((b) => b.boardId === boardId);
    if (index === -1) throw new Error('Kanban board not found');

    const updated = {
      ...boards[index],
      ...updates,
      lastActivity: new Date(),
      audit: {
        ...boards[index].audit,
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };
    boards[index] = updated;
    localStorage.setItem(this.BOARDS_KEY, JSON.stringify(boards));
    return updated;
  }

  static async deleteBoard(boardId: string): Promise<void> {
    // TODO: Replace with actual API call
    const boards = await this.getBoards();
    const filtered = boards.filter((b) => b.boardId !== boardId);
    localStorage.setItem(this.BOARDS_KEY, JSON.stringify(filtered));
  }

  // Column Operations
  static async addColumn(boardId: string, column: KanbanColumn): Promise<KanbanBoard> {
    // TODO: Replace with actual API call
    const board = await this.getBoardById(boardId);

    const newColumn = {
      ...column,
      cards: [],
      cardCount: 0,
    };

    board.columns.push(newColumn);

    return this.updateBoard(boardId, {
      columns: board.columns,
    });
  }

  static async updateColumn(boardId: string, columnId: string, updates: Partial<KanbanColumn>): Promise<KanbanBoard> {
    // TODO: Replace with actual API call
    const board = await this.getBoardById(boardId);

    const columnIndex = board.columns.findIndex((c) => c.columnId === columnId);
    if (columnIndex === -1) throw new Error('Column not found');

    board.columns[columnIndex] = {
      ...board.columns[columnIndex],
      ...updates,
    };

    return this.updateBoard(boardId, {
      columns: board.columns,
    });
  }

  static async deleteColumn(boardId: string, columnId: string): Promise<KanbanBoard> {
    // TODO: Replace with actual API call
    const board = await this.getBoardById(boardId);

    board.columns = board.columns.filter((c) => c.columnId !== columnId);

    return this.updateBoard(boardId, {
      columns: board.columns,
    });
  }

  // Card Operations
  static async createCard(boardId: string, columnId: string, card: KanbanCard): Promise<KanbanCard> {
    // TODO: Replace with actual API call
    const board = await this.getBoardById(boardId);
    const column = board.columns.find((c) => c.columnId === columnId);
    if (!column) throw new Error('Column not found');

    const newCard = {
      ...card,
      cardNumber: board.totalCards + 1,
      status: 'active' as const,
      columnId,
      subtasks: [],
      checklists: [],
      attachments: [],
      links: [],
      comments: [],
      activityLog: [],
      timeEntries: [],
      totalTimeSpent: 0,
      watchers: [],
      blockedBy: [],
      blocks: [],
      relatedCards: [],
      isBlocked: false,
      isPinned: false,
      audit: {
        createdAt: new Date(),
        createdBy: card.reporter,
        updatedAt: new Date(),
        updatedBy: card.reporter,
      },
    };

    column.cards.push(newCard);
    column.cardCount++;
    board.totalCards++;
    board.activeCards++;

    await this.updateBoard(boardId, {
      columns: board.columns,
      totalCards: board.totalCards,
      activeCards: board.activeCards,
    });

    return newCard;
  }

  static async updateCard(boardId: string, cardId: string, updates: Partial<KanbanCard>): Promise<KanbanCard> {
    // TODO: Replace with actual API call
    const board = await this.getBoardById(boardId);

    let updatedCard: KanbanCard | undefined;
    for (const column of board.columns) {
      const cardIndex = column.cards.findIndex((c) => c.cardId === cardId);
      if (cardIndex >= 0) {
        column.cards[cardIndex] = {
          ...column.cards[cardIndex],
          ...updates,
          audit: {
            ...column.cards[cardIndex].audit,
            updatedAt: new Date(),
            updatedBy: 'current-user',
          },
        };
        updatedCard = column.cards[cardIndex];
        break;
      }
    }

    if (!updatedCard) throw new Error('Card not found');

    await this.updateBoard(boardId, {
      columns: board.columns,
    });

    return updatedCard;
  }

  static async moveCard(boardId: string, cardId: string, targetColumnId: string, position: number): Promise<KanbanCard> {
    // TODO: Replace with actual API call
    const board = await this.getBoardById(boardId);

    // Find and remove card from current column
    let card: KanbanCard | undefined;
    for (const column of board.columns) {
      const cardIndex = column.cards.findIndex((c) => c.cardId === cardId);
      if (cardIndex >= 0) {
        card = column.cards.splice(cardIndex, 1)[0];
        column.cardCount--;
        break;
      }
    }

    if (!card) throw new Error('Card not found');

    // Add to target column
    const targetColumn = board.columns.find((c) => c.columnId === targetColumnId);
    if (!targetColumn) throw new Error('Target column not found');

    card.columnId = targetColumnId;
    card.position = position;
    targetColumn.cards.splice(position, 0, card);
    targetColumn.cardCount++;

    // Update completion status if moved to done column
    if (targetColumn.isDone && card.status !== 'completed') {
      card.status = 'completed';
      card.completedDate = new Date();
      board.activeCards--;
      board.completedCards++;
    }

    await this.updateBoard(boardId, {
      columns: board.columns,
      activeCards: board.activeCards,
      completedCards: board.completedCards,
    });

    return card;
  }

  static async deleteCard(boardId: string, cardId: string): Promise<void> {
    // TODO: Replace with actual API call
    const board = await this.getBoardById(boardId);

    for (const column of board.columns) {
      const cardIndex = column.cards.findIndex((c) => c.cardId === cardId);
      if (cardIndex >= 0) {
        column.cards.splice(cardIndex, 1);
        column.cardCount--;
        board.totalCards--;
        break;
      }
    }

    await this.updateBoard(boardId, {
      columns: board.columns,
      totalCards: board.totalCards,
    });
  }

  // Card Comments
  static async addComment(boardId: string, cardId: string, comment: CardComment): Promise<KanbanCard> {
    // TODO: Replace with actual API call
    const board = await this.getBoardById(boardId);

    let updatedCard: KanbanCard | undefined;
    for (const column of board.columns) {
      const card = column.cards.find((c) => c.cardId === cardId);
      if (card) {
        const newComment = {
          ...comment,
          commentDate: new Date(),
          reactions: [],
        };
        card.comments.push(newComment);
        updatedCard = card;
        break;
      }
    }

    if (!updatedCard) throw new Error('Card not found');

    await this.updateBoard(boardId, {
      columns: board.columns,
    });

    return updatedCard;
  }

  // Time Tracking
  static async addTimeEntry(boardId: string, cardId: string, timeEntry: TimeEntry): Promise<KanbanCard> {
    // TODO: Replace with actual API call
    const board = await this.getBoardById(boardId);

    let updatedCard: KanbanCard | undefined;
    for (const column of board.columns) {
      const card = column.cards.find((c) => c.cardId === cardId);
      if (card) {
        card.timeEntries.push(timeEntry);
        card.totalTimeSpent += timeEntry.duration;
        updatedCard = card;
        break;
      }
    }

    if (!updatedCard) throw new Error('Card not found');

    await this.updateBoard(boardId, {
      columns: board.columns,
    });

    return updatedCard;
  }
}

// ============================================================================
// Daily Standups Service
// ============================================================================

export class StandupService {
  private static STANDUPS_KEY = 'collaboration_standups';
  private static RESPONSES_KEY = 'collaboration_standup_responses';

  static async getStandups(teamId?: string): Promise<Standup[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.STANDUPS_KEY);
    const standups: Standup[] = data ? JSON.parse(data) : [];

    if (teamId) {
      return standups.filter((s) => s.teamId === teamId);
    }
    return standups;
  }

  static async getStandupById(standupId: string): Promise<Standup> {
    // TODO: Replace with actual API call
    const standups = await this.getStandups();
    const standup = standups.find((s) => s.standupId === standupId);
    if (!standup) throw new Error('Standup not found');
    return standup;
  }

  static async createStandup(standup: Standup): Promise<Standup> {
    // TODO: Replace with actual API call
    const standups = await this.getStandups();
    const newStandup = {
      ...standup,
      responses: [],
      totalResponses: 0,
      participationRate: 0,
      meetings: [],
      averageResponseTime: 0,
      completionRate: 0,
      trends: [],
      audit: {
        createdAt: new Date(),
        createdBy: standup.facilitatorId,
        updatedAt: new Date(),
        updatedBy: standup.facilitatorId,
      },
    };
    standups.push(newStandup);
    localStorage.setItem(this.STANDUPS_KEY, JSON.stringify(standups));
    return newStandup;
  }

  static async updateStandup(standupId: string, updates: Partial<Standup>): Promise<Standup> {
    // TODO: Replace with actual API call
    const standups = await this.getStandups();
    const index = standups.findIndex((s) => s.standupId === standupId);
    if (index === -1) throw new Error('Standup not found');

    const updated = {
      ...standups[index],
      ...updates,
      audit: {
        ...standups[index].audit,
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };
    standups[index] = updated;
    localStorage.setItem(this.STANDUPS_KEY, JSON.stringify(standups));
    return updated;
  }

  static async deleteStandup(standupId: string): Promise<void> {
    // TODO: Replace with actual API call
    const standups = await this.getStandups();
    const filtered = standups.filter((s) => s.standupId !== standupId);
    localStorage.setItem(this.STANDUPS_KEY, JSON.stringify(filtered));
  }

  // Responses
  static async getResponses(standupId?: string, userId?: string): Promise<StandupResponse[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.RESPONSES_KEY);
    let responses: StandupResponse[] = data ? JSON.parse(data) : [];

    if (standupId) {
      responses = responses.filter((r) => r.standupId === standupId);
    }
    if (userId) {
      responses = responses.filter((r) => r.userId === userId);
    }
    return responses;
  }

  static async submitResponse(response: StandupResponse): Promise<StandupResponse> {
    // TODO: Replace with actual API call
    const responses = await this.getResponses();

    const newResponse = {
      ...response,
      submittedDate: new Date(),
      comments: [],
      reactions: [],
      audit: {
        createdAt: new Date(),
        createdBy: response.userId,
        updatedAt: new Date(),
        updatedBy: response.userId,
      },
    };

    responses.push(newResponse);
    localStorage.setItem(this.RESPONSES_KEY, JSON.stringify(responses));

    // Update standup statistics
    const standup = await this.getStandupById(response.standupId);
    standup.totalResponses++;
    standup.participationRate = (standup.totalResponses / standup.participants.length) * 100;

    await this.updateStandup(response.standupId, {
      totalResponses: standup.totalResponses,
      participationRate: standup.participationRate,
    });

    return newResponse;
  }

  static async updateResponse(responseId: string, updates: Partial<StandupResponse>): Promise<StandupResponse> {
    // TODO: Replace with actual API call
    const responses = await this.getResponses();
    const index = responses.findIndex((r) => r.responseId === responseId);
    if (index === -1) throw new Error('Response not found');

    const updated = {
      ...responses[index],
      ...updates,
      audit: {
        ...responses[index].audit,
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };
    responses[index] = updated;
    localStorage.setItem(this.RESPONSES_KEY, JSON.stringify(responses));
    return updated;
  }

  // Blockers
  static async addBlocker(responseId: string, blocker: Blocker): Promise<StandupResponse> {
    // TODO: Replace with actual API call
    const responses = await this.getResponses();
    const response = responses.find((r) => r.responseId === responseId);
    if (!response) throw new Error('Response not found');

    const newBlocker = {
      ...blocker,
      createdDate: new Date(),
      daysBlocked: 0,
      status: 'open' as const,
    };

    response.blockers.push(newBlocker);

    return this.updateResponse(responseId, {
      blockers: response.blockers,
    });
  }

  static async resolveBlocker(responseId: string, blockerId: string, resolution: string): Promise<Blocker> {
    // TODO: Replace with actual API call
    const responses = await this.getResponses();
    const response = responses.find((r) => r.responseId === responseId);
    if (!response) throw new Error('Response not found');

    const blocker = response.blockers.find((b) => b.blockerId === blockerId);
    if (!blocker) throw new Error('Blocker not found');

    blocker.status = 'resolved';
    blocker.resolvedDate = new Date();
    blocker.resolvedBy = 'current-user';
    blocker.resolution = resolution;

    await this.updateResponse(responseId, {
      blockers: response.blockers,
    });

    return blocker;
  }

  // Meetings
  static async createMeeting(standupId: string, meeting: StandupMeeting): Promise<StandupMeeting> {
    // TODO: Replace with actual API call
    const standup = await this.getStandupById(standupId);

    const newMeeting = {
      ...meeting,
      attendees: [],
      totalAttendees: 0,
      attendanceRate: 0,
      keyHighlights: [],
      actionItems: [],
      blockers: [],
      status: 'scheduled' as const,
    };

    standup.meetings.push(newMeeting);

    await this.updateStandup(standupId, {
      meetings: standup.meetings,
    });

    return newMeeting;
  }

  static async completeMeeting(standupId: string, meetingId: string, summary: Partial<StandupMeeting>): Promise<StandupMeeting> {
    // TODO: Replace with actual API call
    const standup = await this.getStandupById(standupId);

    const meeting = standup.meetings.find((m) => m.meetingId === meetingId);
    if (!meeting) throw new Error('Meeting not found');

    Object.assign(meeting, summary, {
      status: 'completed',
      completedDate: new Date(),
    });

    await this.updateStandup(standupId, {
      meetings: standup.meetings,
    });

    return meeting;
  }
}

// ============================================================================
// Analytics Service
// ============================================================================

export class CollaborationAnalyticsService {
  static async getAnalytics(period: string): Promise<CollaborationAnalytics> {
    // TODO: Replace with actual API call
    const whiteboards = await WhiteboardService.getWhiteboards();
    const boards = await KanbanService.getBoards();
    const standups = await StandupService.getStandups();

    return {
      period: period as any,
      periodStart: new Date(new Date().setDate(1)),
      periodEnd: new Date(),

      whiteboardMetrics: {
        totalWhiteboards: whiteboards.length,
        activeWhiteboards: whiteboards.filter((wb) => wb.status === 'active').length,
        totalCollaborators: whiteboards.reduce((sum, wb) => sum + wb.collaborators.length, 0),
        averageCollaboratorsPerBoard: whiteboards.reduce((sum, wb) => sum + wb.collaborators.length, 0) / whiteboards.length || 0,
        totalEdits: whiteboards.reduce((sum, wb) => sum + wb.editCount, 0),
        totalComments: 0,
        mostActiveBoards: [],
      },

      kanbanMetrics: {
        totalBoards: boards.length,
        totalCards: boards.reduce((sum, b) => sum + b.totalCards, 0),
        completedCards: boards.reduce((sum, b) => sum + b.completedCards, 0),
        averageCompletionTime: 0,
        throughput: 0,
        wipCards: boards.reduce((sum, b) => sum + b.activeCards, 0),
        blockedCards: 0,
        mostActiveBoards: [],
      },

      standupMetrics: {
        totalStandups: standups.length,
        activeStandups: standups.filter((s) => s.status === 'active').length,
        totalResponses: standups.reduce((sum, s) => sum + s.totalResponses, 0),
        averageParticipationRate: standups.reduce((sum, s) => sum + s.participationRate, 0) / standups.length || 0,
        onTimeRate: 0,
        totalBlockers: 0,
        resolvedBlockers: 0,
        averageBlockerResolutionTime: 0,
      },

      teamMetrics: {
        totalTeams: 0,
        averageTeamSize: 0,
        mostActiveTeams: [],
      },
    };
  }
}

// ============================================================================
// Settings Service
// ============================================================================

export class CollaborationSettingsService {
  private static SETTINGS_KEY = 'collaboration_settings';

  static async getSettings(): Promise<CollaborationSettings> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.SETTINGS_KEY);
    if (data) return JSON.parse(data);

    return this.getDefaultSettings();
  }

  static async updateSettings(updates: Partial<CollaborationSettings>): Promise<CollaborationSettings> {
    // TODO: Replace with actual API call
    const settings = await this.getSettings();
    const updated = {
      ...settings,
      ...updates,
      audit: {
        ...settings.audit,
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  }

  private static getDefaultSettings(): CollaborationSettings {
    return {
      settingsId: 'default-settings',

      whiteboardSettings: {
        enabled: true,
        defaultVisibility: 'team',
        maxCollaborators: 50,
        enableVersioning: true,
        enableComments: true,
        autoSaveInterval: 30,
        enableRealtimeCollaboration: true,
      },

      kanbanSettings: {
        enabled: true,
        defaultVisibility: 'team',
        enableTimeTracking: true,
        enableSubtasks: true,
        enableChecklists: true,
        enableAttachments: true,
        cardNumberingFormat: 'sequential',
        defaultWipLimit: 5,
      },

      standupSettings: {
        enabled: true,
        defaultType: 'async',
        defaultDuration: 15,
        defaultQuestions: [
          {
            questionId: 'q1',
            questionText: 'What did you work on yesterday?',
            questionType: 'text',
            position: 1,
            isRequired: true,
            defaultQuestion: true,
          },
          {
            questionId: 'q2',
            questionText: 'What will you work on today?',
            questionType: 'text',
            position: 2,
            isRequired: true,
            defaultQuestion: true,
          },
          {
            questionId: 'q3',
            questionText: 'Are there any blockers?',
            questionType: 'text',
            position: 3,
            isRequired: false,
            defaultQuestion: true,
          },
        ],
        enableReminders: true,
        defaultReminderTime: 30,
        allowAnonymousResponses: false,
        autoArchiveAfter: 30,
      },

      notificationSettings: {
        notifyOnComment: true,
        notifyOnMention: true,
        notifyOnAssignment: true,
        notifyOnDueDate: true,
        notifyOnBlocker: true,
        notifyOnStandupReminder: true,
        digestFrequency: 'daily',
      },

      audit: {
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      },
    };
  }
}
