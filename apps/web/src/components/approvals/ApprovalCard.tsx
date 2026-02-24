/**
 * @module ApprovalCard
 * @description Single approval request card with type-specific details and actions
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  Clock,
  Paperclip,
  MessageSquare,
  AlertTriangle,
  Send,
  Palmtree,
  Receipt,
  FileText,
  Briefcase,
  Users,
  ArrowUpRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  ApprovalRequest,
  LeaveDetails,
  ExpenseDetails,
  TimesheetDetails,
  RequisitionDetails,
  DocumentDetails,
} from '@/services/approvalService';
import { APPROVAL_TYPE_CONFIG, PRIORITY_CONFIG } from '@/services/approvalService';

interface ApprovalCardProps {
  request: ApprovalRequest;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onApprove: (id: string, remarks?: string) => void;
  onReject: (id: string, remarks: string) => void;
  onEscalate?: (id: string, remarks?: string) => void;
  onComment: (id: string, text: string) => void;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  request,
  isSelected,
  onToggleSelect,
  onApprove,
  onReject,
  onEscalate,
  onComment,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [commentText, setCommentText] = useState('');

  const typeConfig = APPROVAL_TYPE_CONFIG[request.type];
  const priorityConfig = PRIORITY_CONFIG[request.priority];
  const isPending = request.status === 'pending';

  const isOverdue = request.dueDate && new Date(request.dueDate) < new Date() && isPending;
  const daysUntilDue = request.dueDate
    ? Math.ceil((new Date(request.dueDate).getTime() - Date.now()) / 86400000)
    : null;

  const handleReject = useCallback(() => {
    if (!rejectReason.trim()) return;
    onReject(request.id, rejectReason.trim());
    setRejectReason('');
    setShowReject(false);
  }, [request.id, rejectReason, onReject]);

  const handleComment = useCallback(() => {
    if (!commentText.trim()) return;
    onComment(request.id, commentText.trim());
    setCommentText('');
    setShowComment(false);
  }, [request.id, commentText, onComment]);

  return (
    <div
      className={`rounded-xl border transition-colors ${
        isOverdue
          ? 'border-coral-alert/30 bg-coral-alert/5 dark:bg-coral-alert/5'
          : isSelected
            ? 'border-celestial-indigo/40 bg-celestial-indigo/5 dark:bg-celestial-indigo/5'
            : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue'
      }`}
    >
      {/* Main row */}
      <div className="flex items-start gap-3 p-3">
        {/* Checkbox */}
        {isPending && (
          <button
            onClick={() => onToggleSelect(request.id)}
            className={`mt-1 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
              isSelected
                ? 'border-celestial-indigo bg-celestial-indigo'
                : 'border-cloud dark:border-nebula-purple/30'
            }`}
          >
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </button>
        )}

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[10px] font-bold text-celestial-indigo shrink-0">
          {request.requestedByName
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h4 className="text-xs font-semibold text-ink-black dark:text-pearl">
              {request.title}
            </h4>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${typeConfig.color} ${typeConfig.bgColor}`}
            >
              {typeConfig.label}
            </span>
            {request.priority !== 'low' && (
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${priorityConfig.color} ${priorityConfig.bgColor}`}
              >
                {priorityConfig.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-silver-mist flex-wrap">
            <span>{request.requestedByName}</span>
            <span>·</span>
            <span>{request.requestedByDept}</span>
            <span>·</span>
            <span className="flex items-center gap-0.5">
              <Calendar className="w-2.5 h-2.5" />
              {new Date(request.requestDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
            {daysUntilDue !== null && isPending && (
              <span
                className={`flex items-center gap-0.5 ${isOverdue ? 'text-coral-alert font-semibold' : daysUntilDue <= 2 ? 'text-sunset-amber' : ''}`}
              >
                <Clock className="w-2.5 h-2.5" />
                {isOverdue ? 'Overdue' : `${daysUntilDue}d left`}
              </span>
            )}
            {request.attachments.length > 0 && (
              <span className="flex items-center gap-0.5">
                <Paperclip className="w-2.5 h-2.5" /> {request.attachments.length}
              </span>
            )}
            {request.comments.length > 0 && (
              <span className="flex items-center gap-0.5">
                <MessageSquare className="w-2.5 h-2.5" /> {request.comments.length}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {isPending && (
            <>
              <button
                onClick={() => onApprove(request.id)}
                className="p-1.5 rounded-lg bg-neural-mint/10 text-neural-mint hover:bg-neural-mint/20 transition-colors"
                title="Approve"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowReject(!showReject)}
                className="p-1.5 rounded-lg bg-coral-alert/10 text-coral-alert hover:bg-coral-alert/20 transition-colors"
                title="Reject"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-silver-mist" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-silver-mist" />
            )}
          </button>
        </div>
      </div>

      {/* Reject reason input */}
      {showReject && isPending && (
        <div className="px-3 pb-3 flex items-center gap-2">
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleReject()}
            placeholder="Reason for rejection (required)..."
            className="flex-1 px-2.5 py-1.5 rounded-lg border border-coral-alert/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-coral-alert transition-colors"
            autoFocus
          />
          <button
            onClick={handleReject}
            disabled={!rejectReason.trim()}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-coral-alert text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            Reject
          </button>
          <button
            onClick={() => setShowReject(false)}
            className="text-[10px] text-silver-mist hover:text-ink-black dark:hover:text-pearl"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-cloud/50 dark:border-nebula-purple/10 pt-3">
          {/* Type-specific details */}
          {request.type === 'leave' && (
            <LeaveDetailsView details={request.details as LeaveDetails} />
          )}
          {request.type === 'expense' && (
            <ExpenseDetailsView details={request.details as ExpenseDetails} />
          )}
          {request.type === 'timesheet' && (
            <TimesheetDetailsView details={request.details as TimesheetDetails} />
          )}
          {request.type === 'requisition' && (
            <RequisitionDetailsView details={request.details as RequisitionDetails} />
          )}
          {request.type === 'document' && (
            <DocumentDetailsView details={request.details as DocumentDetails} />
          )}

          {/* Attachments */}
          {request.attachments.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-silver-mist mb-1">Attachments</p>
              <div className="flex flex-wrap gap-1.5">
                {request.attachments.map((att) => (
                  <span
                    key={att.id}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-pearl/50 dark:bg-deep-cosmos/20 text-[10px] text-ink-black dark:text-pearl"
                  >
                    <Paperclip className="w-2.5 h-2.5 text-silver-mist" /> {att.name}{' '}
                    <span className="text-silver-mist">({att.size})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          {request.comments.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-silver-mist mb-1">Comments</p>
              <div className="space-y-1.5">
                {request.comments.map((c) => (
                  <div
                    key={c.id}
                    className="px-2.5 py-1.5 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-semibold text-ink-black dark:text-pearl">
                        {c.byName}
                      </span>
                      <span className="text-[8px] text-silver-mist">
                        {new Date(c.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-[10px] text-ink-black dark:text-pearl">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add comment */}
          {isPending && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                placeholder="Add a comment..."
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                className="p-1.5 rounded-lg bg-celestial-indigo/10 text-celestial-indigo hover:bg-celestial-indigo/20 disabled:opacity-40 transition-colors"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Escalate & workflow info */}
          {isPending && request.totalLevels > 1 && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[9px] text-silver-mist">
                Level {request.currentLevel} of {request.totalLevels}
              </span>
              {onEscalate && (
                <button
                  onClick={() => onEscalate(request.id)}
                  className="flex items-center gap-0.5 text-[10px] text-nebula-purple hover:text-nebula-purple/80 transition-colors"
                >
                  <ArrowUpRight className="w-3 h-3" /> Escalate
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Type-Specific Detail Views ─────────────────────────────────────────────────

const LeaveDetailsView: React.FC<{ details: LeaveDetails }> = ({ details }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
    <DetailCell icon={Palmtree} label="Leave Type" value={details.leaveType} />
    <DetailCell
      icon={Calendar}
      label="Dates"
      value={`${new Date(details.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(details.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
    />
    <DetailCell
      icon={Clock}
      label="Duration"
      value={`${details.totalDays} day${details.totalDays > 1 ? 's' : ''}`}
    />
    <DetailCell
      icon={Users}
      label="Balance After"
      value={`${details.leaveBalance - details.totalDays} days`}
    />
    {details.reason && (
      <div className="col-span-full">
        <p className="text-[10px] text-silver-mist">
          Reason: <span className="text-ink-black dark:text-pearl">{details.reason}</span>
        </p>
      </div>
    )}
    {details.handoverTo && (
      <div className="col-span-full">
        <p className="text-[10px] text-silver-mist">
          Handover to: <span className="text-ink-black dark:text-pearl">{details.handoverTo}</span>
        </p>
      </div>
    )}
  </div>
);

const ExpenseDetailsView: React.FC<{ details: ExpenseDetails }> = ({ details }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <DetailCell icon={Receipt} label="Category" value={details.category} />
      <DetailCell
        icon={DollarSign}
        label="Total"
        value={`${details.currency} ${details.totalAmount.toLocaleString()}`}
      />
      <DetailCell
        icon={Calendar}
        label="Date"
        value={new Date(details.expenseDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      />
      <DetailCell icon={Paperclip} label="Receipts" value={`${details.receiptCount} attached`} />
    </div>
    {details.lineItems.length > 0 && (
      <div className="space-y-1">
        {details.lineItems.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-[10px] px-2 py-1 rounded-lg bg-pearl/20 dark:bg-deep-cosmos/10"
          >
            <span className="text-ink-black dark:text-pearl">{item.description}</span>
            <span className="font-semibold text-ink-black dark:text-pearl">
              ${item.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const TimesheetDetailsView: React.FC<{ details: TimesheetDetails }> = ({ details }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <DetailCell
        icon={Calendar}
        label="Period"
        value={`${new Date(details.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(details.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
      />
      <DetailCell icon={Clock} label="Total Hours" value={`${details.totalHours}h`} />
      <DetailCell icon={Clock} label="Overtime" value={`${details.overtimeHours}h`} />
      <DetailCell icon={AlertTriangle} label="Violations" value={`${details.violations}`} />
    </div>
    {details.projects.length > 0 && (
      <div className="space-y-1">
        {details.projects.map((p, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-[10px] px-2 py-1 rounded-lg bg-pearl/20 dark:bg-deep-cosmos/10"
          >
            <span className="text-ink-black dark:text-pearl">{p.name}</span>
            <span className="font-semibold text-ink-black dark:text-pearl">{p.hours}h</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const RequisitionDetailsView: React.FC<{ details: RequisitionDetails }> = ({ details }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <DetailCell icon={Briefcase} label="Position" value={details.positionTitle} />
      <DetailCell icon={Users} label="Headcount" value={`${details.headcount}`} />
      <DetailCell
        icon={DollarSign}
        label="Salary Range"
        value={`${details.salaryRange.currency} ${details.salaryRange.min.toLocaleString()} – ${details.salaryRange.max.toLocaleString()}`}
      />
      <DetailCell icon={Clock} label="Type" value={details.employmentType} />
    </div>
    <p className="text-[10px] text-silver-mist">
      Justification: <span className="text-ink-black dark:text-pearl">{details.justification}</span>
    </p>
  </div>
);

const DocumentDetailsView: React.FC<{ details: DocumentDetails }> = ({ details }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
    <DetailCell icon={FileText} label="Document" value={details.documentName} />
    <DetailCell icon={FileText} label="Type" value={details.documentType} />
    <DetailCell icon={Clock} label="Version" value={details.version} />
    <DetailCell
      icon={Check}
      label="Signature"
      value={details.requiresSignature ? 'Required' : 'Not required'}
    />
    {details.description && (
      <div className="col-span-full">
        <p className="text-[10px] text-silver-mist">{details.description}</p>
      </div>
    )}
  </div>
);

const DetailCell: React.FC<{ icon: LucideIcon; label: string; value: string }> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="px-2 py-1.5 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10">
    <p className="text-[8px] text-silver-mist flex items-center gap-0.5 mb-0.5">
      <Icon className="w-2.5 h-2.5" /> {label}
    </p>
    <p className="text-[10px] font-semibold text-ink-black dark:text-pearl">{value}</p>
  </div>
);

export default ApprovalCard;
