'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Bot, Send, MessageCircle, User, Sparkles } from 'lucide-react';

export default function AIAgentsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalConversations: 0, totalMessages: 0 });
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [formData, setFormData] = useState({
    agentType: 'HR_ASSISTANT',
    title: '',
  });

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/ai-conversations?limit=100');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.data || []);
        setStats((prev) => ({ ...prev, totalConversations: data.meta?.total || 0 }));

        // Auto-select first conversation
        if (data.data && data.data.length > 0 && !selectedConversation) {
          setSelectedConversation(data.data[0]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/v1/ai-conversations/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const res = await fetch('/api/v1/ai-conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setIsCreateOpen(false);
        setFormData({ agentType: 'HR_ASSISTANT', title: '' });
        fetchConversations();
        setSelectedConversation(data.data);
      }
    } catch (error: any) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      // Add user message
      const userMessageRes = await fetch(
        `/api/v1/ai-conversations/${selectedConversation.id}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'USER',
            content: messageInput,
          }),
        }
      );

      if (userMessageRes.ok) {
        setMessageInput('');

        // Simulate AI response (in production, this would call actual AI service)
        setTimeout(async () => {
          await fetch(`/api/v1/ai-conversations/${selectedConversation.id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: 'ASSISTANT',
              content: generateMockAIResponse(messageInput, selectedConversation.agentType),
            }),
          });
          fetchMessages(selectedConversation.id);
        }, 1000);

        fetchMessages(selectedConversation.id);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
    }
  };

  const generateMockAIResponse = (userMessage: string, agentType: string): string => {
    const responses: Record<string, string[]> = {
      HR_ASSISTANT: [
        "I can help you with HR-related queries. What specific information do you need?",
        "Based on your question, I'd recommend checking the employee handbook or consulting with HR management.",
        "Let me provide some insights on that HR topic...",
      ],
      LEAVE_ADVISOR: [
        "For leave-related queries, I can check your balance and policy details.",
        "Your current leave balance appears to be sufficient for this request.",
        "Let me help you understand the leave policy better...",
      ],
      PAYROLL_HELPER: [
        "I can assist with payroll calculations and queries.",
        "Your payroll information is processed monthly. Let me get those details...",
        "Based on your salary structure, here's what I found...",
      ],
      POLICY_GUIDE: [
        "I can help you navigate company policies and procedures.",
        "According to our policy guidelines...",
        "Let me reference the relevant policy section for you...",
      ],
      ANALYTICS_ANALYST: [
        "I can analyze workforce data and provide insights.",
        "Based on the analytics data, here's what I found...",
        "Let me generate that report for you...",
      ],
    };

    const agentResponses = responses[agentType] || responses.HR_ASSISTANT;
    return agentResponses[Math.floor(Math.random() * agentResponses.length)];
  };

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'HR_ASSISTANT':
        return Bot;
      case 'LEAVE_ADVISOR':
        return MessageCircle;
      case 'PAYROLL_HELPER':
        return Sparkles;
      case 'POLICY_GUIDE':
        return Bot;
      case 'ANALYTICS_ANALYST':
        return Sparkles;
      default:
        return Bot;
    }
  };

  const getAgentColor = (agentType: string) => {
    const colors: Record<string, string> = {
      HR_ASSISTANT: 'text-blue-600 bg-blue-100 dark:bg-blue-950',
      LEAVE_ADVISOR: 'text-green-600 bg-green-100 dark:bg-green-950',
      PAYROLL_HELPER: 'text-purple-600 bg-purple-100 dark:bg-purple-950',
      POLICY_GUIDE: 'text-orange-600 bg-orange-100 dark:bg-orange-950',
      ANALYTICS_ANALYST: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950',
    };
    return colors[agentType] || 'text-gray-600 bg-gray-100 dark:bg-gray-950';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Interact with AI-powered assistants for HR operations
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>New Conversation</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Conversation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="agentType">Agent Type</Label>
                <Select
                  value={formData.agentType}
                  onValueChange={(value: any) => setFormData({ ...formData, agentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HR_ASSISTANT">HR Assistant</SelectItem>
                    <SelectItem value="LEAVE_ADVISOR">Leave Advisor</SelectItem>
                    <SelectItem value="PAYROLL_HELPER">Payroll Helper</SelectItem>
                    <SelectItem value="POLICY_GUIDE">Policy Guide</SelectItem>
                    <SelectItem value="ANALYTICS_ANALYST">Analytics Analyst</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Conversation Title (Optional)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Leave Balance Query"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateConversation}>Start</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-12 gap-3 h-[600px]">
        {/* Conversations List */}
        <Card className="col-span-12 md:col-span-4 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto h-[calc(600px-80px)]">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground px-4">
                No conversations yet. Start a new one!
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conversation) => {
                  const Icon = getAgentIcon(conversation.agentType);
                  const colorClass = getAgentColor(conversation.agentType);
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full text-left p-4 hover:bg-muted/50 transition-colors border-l-4 ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-muted border-l-primary'
                          : 'border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{conversation.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {conversation.agentType.replace('_', ' ')}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {conversation.messageCount} messages
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="col-span-12 md:col-span-8 flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              {selectedConversation ? (
                <>
                  {(() => {
                    const Icon = getAgentIcon(selectedConversation.agentType);
                    return <Icon className="h-4 w-4" />;
                  })()}
                  {selectedConversation.title}
                </>
              ) : (
                'Select a conversation'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!selectedConversation ? (
                <div className="text-center py-8 text-muted-foreground">
                  Select a conversation to view messages
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'USER' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'ASSISTANT' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.role === 'USER'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          message.role === 'USER'
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    {message.role === 'USER' && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            {selectedConversation && (
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

