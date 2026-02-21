"use client";

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ModuleGrid } from '@/components/dashboard/module-grid';
import { TicketManagementService } from './services';

export default function HrHelpdeskPage() {
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const tickets = await TicketManagementService.getAllTickets();
        setTicketCount(tickets.length);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const features = [
    'Ticket Management',
    'SLA Tracking',
    'Knowledge Base',
    'Agent Assignment',
    'Escalation Matrix',
    'Customer Satisfaction',
    'Canned Responses',
    'Analytics',
    'Tickets'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <ModuleGrid
      title="HR Helpdesk"
      description="Manage your hr helpdesk operations and settings."
      features={features}
      basePath="/dashboard/helpdesk"
    />
  );
}
