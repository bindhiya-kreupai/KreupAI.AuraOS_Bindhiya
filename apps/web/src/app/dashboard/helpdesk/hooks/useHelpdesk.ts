"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Ticket,
  SLAPolicy,
  Agent,
  KnowledgeBaseArticle,
  CannedResponse,
  EscalationMatrix,
  HelpdeskSettings,
  HelpdeskAlert
} from '../types';
import {
  TicketManagementService,
  SLATrackingService,
  AgentManagementService,
  KnowledgeBaseService,
  CannedResponseService,
  EscalationMatrixService,
  HelpdeskSettingsService,
  AlertsService
} from '../services';
import {
  sampleTickets,
  sampleSLAPolicies,
  sampleAgents,
  sampleKnowledgeBaseArticles,
  sampleCannedResponses,
  sampleEscalationMatrices,
  sampleHelpdeskSettings
} from '../data';

interface Toast {
  type: 'success' | 'error' | 'info';
  message: string;
}

export const useHelpdesk = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [slaPolicies, setSlaPolicies] = useState<SLAPolicy[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseArticle[]>([]);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [escalationMatrices, setEscalationMatrices] = useState<EscalationMatrix[]>([]);
  const [settings, setSettings] = useState<HelpdeskSettings | null>(null);
  const [alerts, setAlerts] = useState<HelpdeskAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Toast) => {
    setToasts(prev => [...prev, toast]);
    setTimeout(() => setToasts(prev => prev.slice(1)), 5000);
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        ticketsData,
        policiesData,
        agentsData,
        articlesData,
        responsesData,
        matricesData,
        settingsData
      ] = await Promise.all([
        TicketManagementService.getAllTickets(),
        SLATrackingService.getAllPolicies(),
        AgentManagementService.getAllAgents(),
        KnowledgeBaseService.getAllArticles(),
        CannedResponseService.getAllResponses(),
        EscalationMatrixService.getAllMatrices(),
        HelpdeskSettingsService.getSettings()
      ]);

      if (ticketsData.length === 0) {
        for (const ticket of sampleTickets) {
          await TicketManagementService.createTicket(ticket);
        }
        setTickets(sampleTickets);
      } else {
        setTickets(ticketsData);
      }

      if (policiesData.length === 0) {
        for (const policy of sampleSLAPolicies) {
          await SLATrackingService.createPolicy(policy);
        }
        setSlaPolicies(sampleSLAPolicies);
      } else {
        setSlaPolicies(policiesData);
      }

      if (agentsData.length === 0) {
        for (const agent of sampleAgents) {
          await AgentManagementService.createAgent(agent);
        }
        setAgents(sampleAgents);
      } else {
        setAgents(agentsData);
      }

      if (articlesData.length === 0) {
        for (const article of sampleKnowledgeBaseArticles) {
          await KnowledgeBaseService.createArticle(article);
        }
        setKnowledgeBase(sampleKnowledgeBaseArticles);
      } else {
        setKnowledgeBase(articlesData);
      }

      if (responsesData.length === 0) {
        for (const response of sampleCannedResponses) {
          await CannedResponseService.createResponse(response);
        }
        setCannedResponses(sampleCannedResponses);
      } else {
        setCannedResponses(responsesData);
      }

      if (matricesData.length === 0) {
        for (const matrix of sampleEscalationMatrices) {
          await EscalationMatrixService.createMatrix(matrix);
        }
        setEscalationMatrices(sampleEscalationMatrices);
      } else {
        setEscalationMatrices(matricesData);
      }

      if (!settingsData) {
        await HelpdeskSettingsService.updateSettings(sampleHelpdeskSettings);
        setSettings(sampleHelpdeskSettings);
      } else {
        setSettings(settingsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      addToast({ type: 'error', message: 'Failed to load helpdesk data' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Ticket Management Operations
  const createTicket = async (data: Partial<Ticket>) => {
    setLoading(true);
    try {
      const newTicket = await TicketManagementService.createTicket(data);
      setTickets(await TicketManagementService.getAllTickets());
      addToast({ type: 'success', message: 'Ticket created successfully' });
      return newTicket;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to create ticket' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (ticketId: string, updates: Partial<Ticket>) => {
    setLoading(true);
    try {
      const updated = await TicketManagementService.updateTicket(ticketId, updates);
      setTickets(await TicketManagementService.getAllTickets());
      addToast({ type: 'success', message: 'Ticket updated successfully' });
      return updated;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update ticket' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const assignTicket = async (ticketId: string, agentInfo: any) => {
    setLoading(true);
    try {
      const assigned = await TicketManagementService.assignTicket(ticketId, agentInfo);
      setTickets(await TicketManagementService.getAllTickets());
      addToast({ type: 'success', message: 'Ticket assigned successfully' });
      return assigned;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to assign ticket' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addCommentToTicket = async (ticketId: string, comment: any) => {
    setLoading(true);
    try {
      const updated = await TicketManagementService.addComment(ticketId, comment);
      setTickets(await TicketManagementService.getAllTickets());
      addToast({ type: 'success', message: 'Comment added' });
      return updated;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to add comment' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // SLA Policy Operations
  const createSLAPolicy = async (data: Partial<SLAPolicy>) => {
    setLoading(true);
    try {
      const newPolicy = await SLATrackingService.createPolicy(data);
      setSlaPolicies(await SLATrackingService.getAllPolicies());
      addToast({ type: 'success', message: 'SLA policy created' });
      return newPolicy;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to create SLA policy' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSLAPolicy = async (policyId: string, updates: Partial<SLAPolicy>) => {
    setLoading(true);
    try {
      const updated = await SLATrackingService.updatePolicy(policyId, updates);
      setSlaPolicies(await SLATrackingService.getAllPolicies());
      addToast({ type: 'success', message: 'SLA policy updated' });
      return updated;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update SLA policy' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Agent Operations
  const createAgent = async (data: Partial<Agent>) => {
    setLoading(true);
    try {
      const newAgent = await AgentManagementService.createAgent(data);
      setAgents(await AgentManagementService.getAllAgents());
      addToast({ type: 'success', message: 'Agent created successfully' });
      return newAgent;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to create agent' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAgent = async (agentId: string, updates: Partial<Agent>) => {
    setLoading(true);
    try {
      const updated = await AgentManagementService.updateAgent(agentId, updates);
      setAgents(await AgentManagementService.getAllAgents());
      addToast({ type: 'success', message: 'Agent updated successfully' });
      return updated;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update agent' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAvailableAgents = async () => {
    try {
      return await AgentManagementService.getAvailableAgents();
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to retrieve available agents' });
      throw err;
    }
  };

  // Knowledge Base Operations
  const createArticle = async (data: Partial<KnowledgeBaseArticle>) => {
    setLoading(true);
    try {
      const newArticle = await KnowledgeBaseService.createArticle(data);
      setKnowledgeBase(await KnowledgeBaseService.getAllArticles());
      addToast({ type: 'success', message: 'Article created' });
      return newArticle;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to create article' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateArticle = async (articleId: string, updates: Partial<KnowledgeBaseArticle>) => {
    setLoading(true);
    try {
      const updated = await KnowledgeBaseService.updateArticle(articleId, updates);
      setKnowledgeBase(await KnowledgeBaseService.getAllArticles());
      addToast({ type: 'success', message: 'Article updated' });
      return updated;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update article' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchArticles = async (query: string) => {
    try {
      return await KnowledgeBaseService.searchArticles(query);
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to search articles' });
      throw err;
    }
  };

  // Canned Response Operations
  const createCannedResponse = async (data: Partial<CannedResponse>) => {
    setLoading(true);
    try {
      const newResponse = await CannedResponseService.createResponse(data);
      setCannedResponses(await CannedResponseService.getAllResponses());
      addToast({ type: 'success', message: 'Canned response created' });
      return newResponse;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to create canned response' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCannedResponse = async (responseId: string, updates: Partial<CannedResponse>) => {
    setLoading(true);
    try {
      const updated = await CannedResponseService.updateResponse(responseId, updates);
      setCannedResponses(await CannedResponseService.getAllResponses());
      addToast({ type: 'success', message: 'Canned response updated' });
      return updated;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update canned response' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Escalation Matrix Operations
  const createEscalationMatrix = async (data: Partial<EscalationMatrix>) => {
    setLoading(true);
    try {
      const newMatrix = await EscalationMatrixService.createMatrix(data);
      setEscalationMatrices(await EscalationMatrixService.getAllMatrices());
      addToast({ type: 'success', message: 'Escalation matrix created' });
      return newMatrix;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to create escalation matrix' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEscalationMatrix = async (matrixId: string, updates: Partial<EscalationMatrix>) => {
    setLoading(true);
    try {
      const updated = await EscalationMatrixService.updateMatrix(matrixId, updates);
      setEscalationMatrices(await EscalationMatrixService.getAllMatrices());
      addToast({ type: 'success', message: 'Escalation matrix updated' });
      return updated;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update escalation matrix' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    tickets,
    slaPolicies,
    agents,
    knowledgeBase,
    cannedResponses,
    escalationMatrices,
    settings,
    alerts,
    loading,
    error,
    toasts,
    createTicket,
    updateTicket,
    assignTicket,
    addCommentToTicket,
    createSLAPolicy,
    updateSLAPolicy,
    createAgent,
    updateAgent,
    getAvailableAgents,
    createArticle,
    updateArticle,
    searchArticles,
    createCannedResponse,
    updateCannedResponse,
    createEscalationMatrix,
    updateEscalationMatrix,
    loadAllData
  };
};
