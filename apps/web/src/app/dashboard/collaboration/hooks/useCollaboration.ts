/**
 * Collaboration Module - Custom Hook
 * Centralized state management and business logic for collaboration tools
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
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
} from '../types';
import {
  WhiteboardService,
  KanbanService,
  StandupService,
  CollaborationAnalyticsService,
  CollaborationSettingsService,
} from '../services';

export interface UseCollaborationReturn {
  // Digital Whiteboard
  whiteboards: Whiteboard[];
  getWhiteboardById: (whiteboardId: string) => Promise<Whiteboard>;
  createWhiteboard: (whiteboard: Whiteboard) => Promise<Whiteboard>;
  updateWhiteboard: (whiteboardId: string, updates: Partial<Whiteboard>) => Promise<Whiteboard>;
  deleteWhiteboard: (whiteboardId: string) => Promise<void>;
  addElement: (whiteboardId: string, element: WhiteboardElement) => Promise<Whiteboard>;
  updateElement: (whiteboardId: string, elementId: string, updates: Partial<WhiteboardElement>) => Promise<Whiteboard>;
  deleteElement: (whiteboardId: string, elementId: string) => Promise<Whiteboard>;
  addCollaborator: (whiteboardId: string, collaborator: Collaborator) => Promise<Whiteboard>;
  removeCollaborator: (whiteboardId: string, userId: string) => Promise<Whiteboard>;
  createVersion: (whiteboardId: string, versionName?: string) => Promise<WhiteboardVersion>;
  restoreVersion: (whiteboardId: string, versionId: string) => Promise<Whiteboard>;
  exportWhiteboard: (whiteboardId: string, format: 'png' | 'pdf' | 'svg' | 'json') => Promise<Blob>;

  // Kanban Board
  kanbanBoards: KanbanBoard[];
  getBoardById: (boardId: string) => Promise<KanbanBoard>;
  createBoard: (board: KanbanBoard) => Promise<KanbanBoard>;
  updateBoard: (boardId: string, updates: Partial<KanbanBoard>) => Promise<KanbanBoard>;
  deleteBoard: (boardId: string) => Promise<void>;
  addColumn: (boardId: string, column: KanbanColumn) => Promise<KanbanBoard>;
  updateColumn: (boardId: string, columnId: string, updates: Partial<KanbanColumn>) => Promise<KanbanBoard>;
  deleteColumn: (boardId: string, columnId: string) => Promise<KanbanBoard>;
  createCard: (boardId: string, columnId: string, card: KanbanCard) => Promise<KanbanCard>;
  updateCard: (boardId: string, cardId: string, updates: Partial<KanbanCard>) => Promise<KanbanCard>;
  moveCard: (boardId: string, cardId: string, targetColumnId: string, position: number) => Promise<KanbanCard>;
  deleteCard: (boardId: string, cardId: string) => Promise<void>;
  addComment: (boardId: string, cardId: string, comment: CardComment) => Promise<KanbanCard>;
  addTimeEntry: (boardId: string, cardId: string, timeEntry: TimeEntry) => Promise<KanbanCard>;

  // Daily Standups
  standups: Standup[];
  standupResponses: StandupResponse[];
  getStandupById: (standupId: string) => Promise<Standup>;
  createStandup: (standup: Standup) => Promise<Standup>;
  updateStandup: (standupId: string, updates: Partial<Standup>) => Promise<Standup>;
  deleteStandup: (standupId: string) => Promise<void>;
  submitResponse: (response: StandupResponse) => Promise<StandupResponse>;
  updateResponse: (responseId: string, updates: Partial<StandupResponse>) => Promise<StandupResponse>;
  addBlocker: (responseId: string, blocker: Blocker) => Promise<StandupResponse>;
  resolveBlocker: (responseId: string, blockerId: string, resolution: string) => Promise<Blocker>;
  createMeeting: (standupId: string, meeting: StandupMeeting) => Promise<StandupMeeting>;
  completeMeeting: (standupId: string, meetingId: string, summary: Partial<StandupMeeting>) => Promise<StandupMeeting>;

  // Analytics & Settings
  analytics: CollaborationAnalytics | null;
  settings: CollaborationSettings | null;
  updateSettings: (updates: Partial<CollaborationSettings>) => Promise<CollaborationSettings>;

  // Global State
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useCollaboration(userId: string = 'user-001'): UseCollaborationReturn {
  // State
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [kanbanBoards, setKanbanBoards] = useState<KanbanBoard[]>([]);
  const [standups, setStandups] = useState<Standup[]>([]);
  const [standupResponses, setStandupResponses] = useState<StandupResponse[]>([]);
  const [analytics, setAnalytics] = useState<CollaborationAnalytics | null>(null);
  const [settings, setSettings] = useState<CollaborationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Data
  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        whiteboardsData,
        boardsData,
        standupsData,
        responsesData,
        analyticsData,
        settingsData,
      ] = await Promise.all([
        WhiteboardService.getWhiteboards(userId),
        KanbanService.getBoards(userId),
        StandupService.getStandups(),
        StandupService.getResponses(undefined, userId),
        CollaborationAnalyticsService.getAnalytics('monthly'),
        CollaborationSettingsService.getSettings(),
      ]);

      setWhiteboards(whiteboardsData);
      setKanbanBoards(boardsData);
      setStandups(standupsData);
      setStandupResponses(responsesData);
      setAnalytics(analyticsData);
      setSettings(settingsData);
    } catch (error) {
      setError(err instanceof Error ? err.message : 'Failed to load collaboration data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // ============================================================================
  // Digital Whiteboard Methods
  // ============================================================================

  const getWhiteboardById = async (whiteboardId: string): Promise<Whiteboard> => {
    return WhiteboardService.getWhiteboardById(whiteboardId);
  };

  const createWhiteboard = async (whiteboard: Whiteboard): Promise<Whiteboard> => {
    const created = await WhiteboardService.createWhiteboard(whiteboard);
    setWhiteboards([...whiteboards, created]);
    return created;
  };

  const updateWhiteboard = async (whiteboardId: string, updates: Partial<Whiteboard>): Promise<Whiteboard> => {
    const updated = await WhiteboardService.updateWhiteboard(whiteboardId, updates);
    setWhiteboards(whiteboards.map((wb) => (wb.whiteboardId === whiteboardId ? updated : wb)));
    return updated;
  };

  const deleteWhiteboard = async (whiteboardId: string): Promise<void> => {
    await WhiteboardService.deleteWhiteboard(whiteboardId);
    setWhiteboards(whiteboards.filter((wb) => wb.whiteboardId !== whiteboardId));
  };

  const addElement = async (whiteboardId: string, element: WhiteboardElement): Promise<Whiteboard> => {
    const updated = await WhiteboardService.addElement(whiteboardId, element);
    setWhiteboards(whiteboards.map((wb) => (wb.whiteboardId === whiteboardId ? updated : wb)));
    return updated;
  };

  const updateElement = async (
    whiteboardId: string,
    elementId: string,
    updates: Partial<WhiteboardElement>
  ): Promise<Whiteboard> => {
    const updated = await WhiteboardService.updateElement(whiteboardId, elementId, updates);
    setWhiteboards(whiteboards.map((wb) => (wb.whiteboardId === whiteboardId ? updated : wb)));
    return updated;
  };

  const deleteElement = async (whiteboardId: string, elementId: string): Promise<Whiteboard> => {
    const updated = await WhiteboardService.deleteElement(whiteboardId, elementId);
    setWhiteboards(whiteboards.map((wb) => (wb.whiteboardId === whiteboardId ? updated : wb)));
    return updated;
  };

  const addCollaborator = async (whiteboardId: string, collaborator: Collaborator): Promise<Whiteboard> => {
    const updated = await WhiteboardService.addCollaborator(whiteboardId, collaborator);
    setWhiteboards(whiteboards.map((wb) => (wb.whiteboardId === whiteboardId ? updated : wb)));
    return updated;
  };

  const removeCollaborator = async (whiteboardId: string, userId: string): Promise<Whiteboard> => {
    const updated = await WhiteboardService.removeCollaborator(whiteboardId, userId);
    setWhiteboards(whiteboards.map((wb) => (wb.whiteboardId === whiteboardId ? updated : wb)));
    return updated;
  };

  const createVersion = async (whiteboardId: string, versionName?: string): Promise<WhiteboardVersion> => {
    const version = await WhiteboardService.createVersion(whiteboardId, versionName);
    // Refresh whiteboard to get updated versions
    const updated = await WhiteboardService.getWhiteboardById(whiteboardId);
    setWhiteboards(whiteboards.map((wb) => (wb.whiteboardId === whiteboardId ? updated : wb)));
    return version;
  };

  const restoreVersion = async (whiteboardId: string, versionId: string): Promise<Whiteboard> => {
    const updated = await WhiteboardService.restoreVersion(whiteboardId, versionId);
    setWhiteboards(whiteboards.map((wb) => (wb.whiteboardId === whiteboardId ? updated : wb)));
    return updated;
  };

  const exportWhiteboard = async (whiteboardId: string, format: 'png' | 'pdf' | 'svg' | 'json'): Promise<Blob> => {
    return WhiteboardService.exportWhiteboard(whiteboardId, format);
  };

  // ============================================================================
  // Kanban Board Methods
  // ============================================================================

  const getBoardById = async (boardId: string): Promise<KanbanBoard> => {
    return KanbanService.getBoardById(boardId);
  };

  const createBoard = async (board: KanbanBoard): Promise<KanbanBoard> => {
    const created = await KanbanService.createBoard(board);
    setKanbanBoards([...kanbanBoards, created]);
    return created;
  };

  const updateBoard = async (boardId: string, updates: Partial<KanbanBoard>): Promise<KanbanBoard> => {
    const updated = await KanbanService.updateBoard(boardId, updates);
    setKanbanBoards(kanbanBoards.map((b) => (b.boardId === boardId ? updated : b)));
    return updated;
  };

  const deleteBoard = async (boardId: string): Promise<void> => {
    await KanbanService.deleteBoard(boardId);
    setKanbanBoards(kanbanBoards.filter((b) => b.boardId !== boardId));
  };

  const addColumn = async (boardId: string, column: KanbanColumn): Promise<KanbanBoard> => {
    const updated = await KanbanService.addColumn(boardId, column);
    setKanbanBoards(kanbanBoards.map((b) => (b.boardId === boardId ? updated : b)));
    return updated;
  };

  const updateColumn = async (boardId: string, columnId: string, updates: Partial<KanbanColumn>): Promise<KanbanBoard> => {
    const updated = await KanbanService.updateColumn(boardId, columnId, updates);
    setKanbanBoards(kanbanBoards.map((b) => (b.boardId === boardId ? updated : b)));
    return updated;
  };

  const deleteColumn = async (boardId: string, columnId: string): Promise<KanbanBoard> => {
    const updated = await KanbanService.deleteColumn(boardId, columnId);
    setKanbanBoards(kanbanBoards.map((b) => (b.boardId === boardId ? updated : b)));
    return updated;
  };

  const createCard = async (boardId: string, columnId: string, card: KanbanCard): Promise<KanbanCard> => {
    const created = await KanbanService.createCard(boardId, columnId, card);
    // Refresh board to get updated state
    const updated = await KanbanService.getBoardById(boardId);
    setKanbanBoards(kanbanBoards.map((b) => (b.boardId === boardId ? updated : b)));
    return created;
  };

  const updateCard = async (boardId: string, cardId: string, updates: Partial<KanbanCard>): Promise<KanbanCard> => {
    const updated = await KanbanService.updateCard(boardId, cardId, updates);
    // Refresh board to get updated state
    const board = await KanbanService.getBoardById(boardId);
    setKanbanBoards(kanbanBoards.map((b) => (b.boardId === boardId ? board : b)));
    return updated;
  };

  const moveCard = async (boardId: string, cardId: string, targetColumnId: string, position: number): Promise<KanbanCard> => {
    const moved = await KanbanService.moveCard(boardId, cardId, targetColumnId, position);
    // Refresh board to get updated state
    const updated = await KanbanService.getBoardById(boardId);
    setKanbanBoards(kanbanBoards.map((b) => (b.boardId === boardId ? updated : b)));
    return moved;
  };

  const deleteCard = async (boardId: string, cardId: string): Promise<void> => {
    await KanbanService.deleteCard(boardId, cardId);
    // Refresh board to get updated state
    const updated = await KanbanService.getBoardById(boardId);
    setKanbanBoards(kanbanBoards.map((b) => (b.boardId === boardId ? updated : b)));
  };

  const addComment = async (boardId: string, cardId: string, comment: CardComment): Promise<KanbanCard> => {
    const updated = await KanbanService.addComment(boardId, cardId, comment);
    // Refresh board to get updated state
    const board = await KanbanService.getBoardById(boardId);
    setKanbanBoards(kanbanBoards.map((b) => (b.boardId === boardId ? board : b)));
    return updated;
  };

  const addTimeEntry = async (boardId: string, cardId: string, timeEntry: TimeEntry): Promise<KanbanCard> => {
    const updated = await KanbanService.addTimeEntry(boardId, cardId, timeEntry);
    // Refresh board to get updated state
    const board = await KanbanService.getBoardById(boardId);
    setKanbanBoards(kanbanBoards.map((b) => (b.boardId === boardId ? board : b)));
    return updated;
  };

  // ============================================================================
  // Daily Standups Methods
  // ============================================================================

  const getStandupById = async (standupId: string): Promise<Standup> => {
    return StandupService.getStandupById(standupId);
  };

  const createStandup = async (standup: Standup): Promise<Standup> => {
    const created = await StandupService.createStandup(standup);
    setStandups([...standups, created]);
    return created;
  };

  const updateStandup = async (standupId: string, updates: Partial<Standup>): Promise<Standup> => {
    const updated = await StandupService.updateStandup(standupId, updates);
    setStandups(standups.map((s) => (s.standupId === standupId ? updated : s)));
    return updated;
  };

  const deleteStandup = async (standupId: string): Promise<void> => {
    await StandupService.deleteStandup(standupId);
    setStandups(standups.filter((s) => s.standupId !== standupId));
  };

  const submitResponse = async (response: StandupResponse): Promise<StandupResponse> => {
    const created = await StandupService.submitResponse(response);
    setStandupResponses([...standupResponses, created]);
    // Refresh standup to get updated statistics
    const updated = await StandupService.getStandupById(response.standupId);
    setStandups(standups.map((s) => (s.standupId === response.standupId ? updated : s)));
    return created;
  };

  const updateResponse = async (responseId: string, updates: Partial<StandupResponse>): Promise<StandupResponse> => {
    const updated = await StandupService.updateResponse(responseId, updates);
    setStandupResponses(standupResponses.map((r) => (r.responseId === responseId ? updated : r)));
    return updated;
  };

  const addBlocker = async (responseId: string, blocker: Blocker): Promise<StandupResponse> => {
    const updated = await StandupService.addBlocker(responseId, blocker);
    setStandupResponses(standupResponses.map((r) => (r.responseId === responseId ? updated : r)));
    return updated;
  };

  const resolveBlocker = async (responseId: string, blockerId: string, resolution: string): Promise<Blocker> => {
    const resolvedBlocker = await StandupService.resolveBlocker(responseId, blockerId, resolution);
    // Refresh response to get updated blockers
    const responses = await StandupService.getResponses();
    setStandupResponses(responses);
    return resolvedBlocker;
  };

  const createMeeting = async (standupId: string, meeting: StandupMeeting): Promise<StandupMeeting> => {
    const created = await StandupService.createMeeting(standupId, meeting);
    // Refresh standup to get updated meetings
    const updated = await StandupService.getStandupById(standupId);
    setStandups(standups.map((s) => (s.standupId === standupId ? updated : s)));
    return created;
  };

  const completeMeeting = async (standupId: string, meetingId: string, summary: Partial<StandupMeeting>): Promise<StandupMeeting> => {
    const completed = await StandupService.completeMeeting(standupId, meetingId, summary);
    // Refresh standup to get updated meetings
    const updated = await StandupService.getStandupById(standupId);
    setStandups(standups.map((s) => (s.standupId === standupId ? updated : s)));
    return completed;
  };

  // ============================================================================
  // Settings Methods
  // ============================================================================

  const updateSettings = async (updates: Partial<CollaborationSettings>): Promise<CollaborationSettings> => {
    const updated = await CollaborationSettingsService.updateSettings(updates);
    setSettings(updated);
    return updated;
  };

  return {
    // Digital Whiteboard
    whiteboards,
    getWhiteboardById,
    createWhiteboard,
    updateWhiteboard,
    deleteWhiteboard,
    addElement,
    updateElement,
    deleteElement,
    addCollaborator,
    removeCollaborator,
    createVersion,
    restoreVersion,
    exportWhiteboard,

    // Kanban Board
    kanbanBoards,
    getBoardById,
    createBoard,
    updateBoard,
    deleteBoard,
    addColumn,
    updateColumn,
    deleteColumn,
    createCard,
    updateCard,
    moveCard,
    deleteCard,
    addComment,
    addTimeEntry,

    // Daily Standups
    standups,
    standupResponses,
    getStandupById,
    createStandup,
    updateStandup,
    deleteStandup,
    submitResponse,
    updateResponse,
    addBlocker,
    resolveBlocker,
    createMeeting,
    completeMeeting,

    // Global
    analytics,
    settings,
    updateSettings,
    loading,
    error,
    refreshData: initializeData,
  };
}
