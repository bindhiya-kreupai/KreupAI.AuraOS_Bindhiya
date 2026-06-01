/**
 * AI Chatbot API Routes
 * Phase 3: Intelligence Layer - Conversational AI
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/ai/chatbot
 * Chat with AI assistant
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || 'chat';

    switch (action) {
      case 'chat':
        // Send message and get response
        if (!body.message) {
          return NextResponse.json(
            { error: 'message is required', errorAr: 'الرسالة مطلوبة' },
            { status: 400 }
          );
        }

        const message = body.message.toLowerCase();
        const response = {
          message: '',
          suggestions: [] as string[],
          actions: [] as any[],
        };

        // Simple intent detection (mock AI)
        if (message.includes('leave') || message.includes('time off')) {
          response.message = 'I can help you with leave requests. You currently have 15 days of annual leave available. Would you like to apply for leave?';
          response.suggestions = ['Apply for leave', 'Check leave balance', 'View leave history'];
          response.actions = [
            { type: 'navigate', label: 'Apply for Leave', path: '/dashboard/leave/apply' },
          ];
        } else if (message.includes('salary') || message.includes('payslip')) {
          response.message = 'I can assist you with salary-related queries. Your last payslip was generated on Dec 1st, 2024. Would you like to download it?';
          response.suggestions = ['Download payslip', 'View salary breakdown', 'Tax information'];
          response.actions = [
            { type: 'navigate', label: 'View Payslip', path: '/dashboard/payroll/payslip' },
          ];
        } else if (message.includes('attendance') || message.includes('punch')) {
          response.message = 'I can help with attendance. You were present for 22 days this month with an average check-in time of 9:05 AM. Need anything specific?';
          response.suggestions = ['View attendance', 'Regularize attendance', 'Apply for comp-off'];
        } else if (message.includes('performance') || message.includes('review')) {
          response.message = 'Your next performance review is scheduled for January 15th, 2025. Your current performance rating is 4.2/5. Would you like more details?';
          response.suggestions = ['View goals', 'Check feedback', 'Schedule 1-on-1'];
        } else {
          response.message = 'I\'m here to help with HR queries! You can ask me about leave, salary, attendance, performance reviews, benefits, and more. What would you like to know?';
          response.suggestions = ['My leave balance', 'View payslip', 'Attendance summary', 'Performance review'];
        }

        return NextResponse.json({
          success: true,
          data: {
            messageId: `msg_${Date.now()}`,
            response: response.message,
            suggestions: response.suggestions,
            actions: response.actions,
            timestamp: new Date().toISOString(),
          },
        });

      case 'history':
        // Get chat history
        const conversationId = body.conversationId || 'default';

        return NextResponse.json({
          success: true,
          data: {
            conversationId,
            messages: [
              {
                id: 'msg-1',
                role: 'user',
                content: 'What is my leave balance?',
                timestamp: '2024-12-24T10:00:00Z',
              },
              {
                id: 'msg-2',
                role: 'assistant',
                content: 'You have 15 days of annual leave available.',
                timestamp: '2024-12-24T10:00:01Z',
              },
            ],
          },
        });

      case 'feedback':
        // Submit feedback on response
        return NextResponse.json({
          success: true,
          data: {
            message: 'Thank you for your feedback!',
          },
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
          { status: 400 }
        );
    }
  } catch (error: any) {
        return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process chat request',
        errorAr: 'فشل في معالجة طلب الدردشة',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/chatbot
 * Get chatbot configuration or knowledge base
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'config';

    if (type === 'config') {
      return NextResponse.json({
        success: true,
        data: {
          name: 'Aura HR Assistant',
          version: '2.0',
          capabilities: [
            'Leave Management',
            'Payroll Information',
            'Attendance Tracking',
            'Performance Reviews',
            'Benefits Information',
            'Policy Queries',
          ],
          languages: ['en', 'ar'],
          features: {
            contextAware: true,
            multiTurn: true,
            suggestions: true,
            actions: true,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {},
    });
  } catch (error: any) {
        return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch chatbot configuration',
        errorAr: 'فشل في جلب تكوين الدردشة',
      },
      { status: 500 }
    );
  }
}
