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
  Clock,
  Paperclip,
  MessageSquare,
  AlertTriangle,
  Send,
  Award,
  ArrowLeftRight,
  Palmtree,
  FileText,
  Receipt,
  Shuffle,
  ArrowRightLeft,
  Users,
  ClipboardCheck,
  Gift,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  ApprovalRequest,
  ExpenseDetails,
  EmploymentHistoryDetails,
  InterCompanyTransferDetails,
  LeaveDetails,
  OvertimeDetails,
  ExitDetails,
  AttendanceDetails,
  CompOffDetails,
  ConfirmationDetails,
  ShiftSwapDetails,
} from '@/services/approvalService';
import { APPROVAL_TYPE_CONFIG, PRIORITY_CONFIG } from '@/services/approvalService';

interface ApprovalCardProps {
  request: ApprovalRequest;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onApprove: (id: string, remarks?: string) => void;
  onReject: (id: string, remarks: string) => void;
  onComment: (id: string, text: string) => void;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  request,
  isSelected,
  onToggleSelect,
  onApprove,
  onReject,
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
  }, [commentText, onComment, request.id]);

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
          {request.type === 'employment-history' && (
            <EmploymentHistoryDetailsView details={request.details as EmploymentHistoryDetails} />
          )}
          {request.type === 'inter-company-transfer' && (
            <InterCompanyTransferDetailsView details={request.details as InterCompanyTransferDetails} />
          )}
          {request.type === 'overtime' && (
            <OvertimeDetailsView details={request.details as OvertimeDetails} />
          )}
          {request.type === 'comp-off' && (
            <CompOffDetailsView details={request.details as CompOffDetails} />
          )}
          {request.type === 'confirmation' && (
            <ConfirmationDetailsView details={request.details as ConfirmationDetails} />
          )}
          {request.type === 'shift-swap' && (
            <ShiftSwapDetailsView details={request.details as ShiftSwapDetails} />
          )}
          {request.type === 'exit' && (
            <ExitDetailsView details={request.details as ExitDetails} />
          )}
          {request.type === 'attendance' && (
            <AttendanceDetailsView details={request.details as AttendanceDetails} />
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

          {/* Workflow info */}
          {isPending && request.totalLevels > 1 && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[9px] text-silver-mist">
                Level {request.currentLevel} of {request.totalLevels}
              </span>
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
      value={
        details.leaveBalance === undefined
          ? 'Not available'
          : `${details.leaveBalance - details.totalDays} days`
      }
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

const OvertimeDetailsView: React.FC<{ details: OvertimeDetails }> = ({ details }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <DetailCell
        icon={Calendar}
        label="Overtime Date"
        value={new Date(details.overtimeDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      />
      <DetailCell
        icon={Clock}
        label="Total Hours"
        value={`${details.totalHours}h`}
      />
      <DetailCell
        icon={AlertTriangle}
        label="Type"
        value={details.overtimeType}
      />
    </div>
    {details.reason && (
      <p className="text-[10px] text-silver-mist">
        Reason: <span className="text-ink-black dark:text-pearl">{details.reason}</span>
      </p>
    )}
  </div>
);

const ExpenseDetailsView: React.FC<{ details: ExpenseDetails }> = ({ details }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <DetailCell
        icon={Calendar}
        label="Expense Date"
        value={new Date(details.expenseDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      />
      <DetailCell icon={Receipt} label="Category" value={details.expenseCategory} />
      <DetailCell
        icon={Receipt}
        label="Amount"
        value={`${details.currency} ${details.totalAmount.toLocaleString()}`}
      />
      <DetailCell icon={ClipboardCheck} label="Purpose" value={details.businessPurpose} />
    </div>
    {details.description && (
      <p className="text-[10px] text-silver-mist">
        Description: <span className="text-ink-black dark:text-pearl">{details.description}</span>
      </p>
    )}
    {details.receiptUrl && (
      <p className="text-[10px] text-silver-mist">
        Receipt: <span className="text-ink-black dark:text-pearl">Attached</span>
      </p>
    )}
    {details.rejectionReason && (
      <p className="text-[10px] text-coral-alert">
        Rejection reason:{' '}
        <span className="text-ink-black dark:text-pearl">{details.rejectionReason}</span>
      </p>
    )}
  </div>
);

const EmploymentHistoryDetailsView: React.FC<{ details: EmploymentHistoryDetails }> = ({ details }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <DetailCell icon={Shuffle} label="Change Type" value={details.changeType.replace(/_/g, ' ')} />
      <DetailCell
        icon={Calendar}
        label="Effective Date"
        value={new Date(details.effectiveDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      />
      <DetailCell
        icon={Users}
        label="Department"
        value={`${details.previousDepartment || 'Current'} -> ${details.newDepartment || 'Current'}`}
      />
      <DetailCell
        icon={ClipboardCheck}
        label="Employment Type"
        value={`${details.previousEmploymentType || 'Current'} -> ${details.newEmploymentType || 'Current'}`}
      />
    </div>
    {(details.previousGrade || details.newGrade) && (
      <p className="text-[10px] text-silver-mist">
        Grade: <span className="text-ink-black dark:text-pearl">{details.previousGrade || 'Current'} → {details.newGrade || 'Current'}</span>
      </p>
    )}
    {(details.previousJobProfile || details.newJobProfile) && (
      <p className="text-[10px] text-silver-mist">
        Job profile: <span className="text-ink-black dark:text-pearl">{details.previousJobProfile || 'Current'} → {details.newJobProfile || 'Current'}</span>
      </p>
    )}
    {(details.previousSalary !== undefined || details.newSalary !== undefined) && (
      <p className="text-[10px] text-silver-mist">
        Salary: <span className="text-ink-black dark:text-pearl">{details.previousSalary ?? 'Current'} → {details.newSalary ?? 'Current'}</span>
      </p>
    )}
    {details.reason && (
      <p className="text-[10px] text-silver-mist">
        Reason: <span className="text-ink-black dark:text-pearl">{details.reason}</span>
      </p>
    )}
    {details.notes && (
      <p className="text-[10px] text-silver-mist">
        Notes: <span className="text-ink-black dark:text-pearl whitespace-pre-wrap">{details.notes}</span>
      </p>
    )}
  </div>
);

const InterCompanyTransferDetailsView: React.FC<{ details: InterCompanyTransferDetails }> = ({ details }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <DetailCell icon={ArrowRightLeft} label="Transfer Type" value={details.transferType.replace(/_/g, ' ')} />
      <DetailCell
        icon={Calendar}
        label="Effective Date"
        value={new Date(details.effectiveDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      />
      <DetailCell icon={Users} label="From" value={details.fromCompanyName} />
      <DetailCell icon={Users} label="To" value={details.toCompanyName} />
    </div>
    <p className="text-[10px] text-silver-mist">
      Route: <span className="text-ink-black dark:text-pearl">{details.fromCompanyId} → {details.toCompanyId}</span>
    </p>
  </div>
);

const CompOffDetailsView: React.FC<{ details: CompOffDetails }> = ({ details }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <DetailCell
        icon={Calendar}
        label="Worked Date"
        value={new Date(details.workedDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      />
      <DetailCell icon={Clock} label="Worked Hours" value={`${details.workedHours}h`} />
      <DetailCell icon={Gift} label="Credited" value={`${details.creditedDays} day${details.creditedDays > 1 ? 's' : ''}`} />
      <DetailCell
        icon={Calendar}
        label="Expires"
        value={new Date(details.expiryDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      />
    </div>
    {details.reason && (
      <p className="text-[10px] text-silver-mist">
        Reason: <span className="text-ink-black dark:text-pearl">{details.reason}</span>
      </p>
    )}
    {details.projectCode && (
      <p className="text-[10px] text-silver-mist">
        Project: <span className="text-ink-black dark:text-pearl">{details.projectCode}</span>
      </p>
    )}
    {details.remainingDays !== undefined && (
      <p className="text-[10px] text-silver-mist">
        Remaining: <span className="text-ink-black dark:text-pearl">{details.remainingDays} day{details.remainingDays > 1 ? 's' : ''}</span>
      </p>
    )}
  </div>
);

const ExitDetailsView: React.FC<{ details: ExitDetails }> = ({ details }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
    <DetailCell icon={FileText} label="Exit Type" value={details.exitType} />
    <DetailCell
      icon={Calendar}
      label="Resignation Date"
      value={new Date(details.resignationDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })}
    />
    <DetailCell
      icon={Clock}
      label="Last Working Day"
      value={new Date(details.lastWorkingDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })}
    />
    {details.reason && (
      <div className="col-span-full">
        <p className="text-[10px] text-silver-mist">
          Reason: <span className="text-ink-black dark:text-pearl">{details.reason}</span>
        </p>
      </div>
    )}
  </div>
);

const ConfirmationDetailsView: React.FC<{ details: ConfirmationDetails }> = ({ details }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <DetailCell
        icon={Calendar}
        label="Eligible Date"
        value={new Date(details.eligibleDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      />
      <DetailCell
        icon={Calendar}
        label="Requested Date"
        value={new Date(details.requestedDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      />
      <DetailCell icon={Award} label="Manager" value={details.managerApproval} />
      <DetailCell icon={ClipboardCheck} label="HR" value={details.hrApproval} />
    </div>
    {details.newSalary !== undefined && (
      <p className="text-[10px] text-silver-mist">
        Recommended salary:{' '}
        <span className="text-ink-black dark:text-pearl">{details.newSalary}</span>
      </p>
    )}
    {details.confirmationDate && (
      <p className="text-[10px] text-silver-mist">
        Confirmed on:{' '}
        <span className="text-ink-black dark:text-pearl">
          {new Date(details.confirmationDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </p>
    )}
  </div>
);

const ShiftSwapDetailsView: React.FC<{ details: ShiftSwapDetails }> = ({ details }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <DetailCell
        icon={Calendar}
        label="My Shift"
        value={new Date(details.requestorDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      />
      <DetailCell
        icon={Calendar}
        label="Swap Date"
        value={new Date(details.swapWithDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      />
      <DetailCell icon={ArrowLeftRight} label="Peer" value={details.peerApproval} />
      <DetailCell icon={ClipboardCheck} label="Manager" value={details.managerApproval} />
    </div>
    <p className="text-[10px] text-silver-mist">
      Swap with: <span className="text-ink-black dark:text-pearl">{details.swapWithId}</span>
    </p>
    <p className="text-[10px] text-silver-mist">
      Shift refs:{' '}
      <span className="text-ink-black dark:text-pearl">
        {details.requestorShiftId} → {details.swapWithShiftId}
      </span>
    </p>
    {details.reason && (
      <p className="text-[10px] text-silver-mist">
        Reason: <span className="text-ink-black dark:text-pearl">{details.reason}</span>
      </p>
    )}
    {details.rejectionReason && (
      <p className="text-[10px] text-coral-alert">
        Rejection reason:{' '}
        <span className="text-ink-black dark:text-pearl">{details.rejectionReason}</span>
      </p>
    )}
  </div>
);

const AttendanceDetailsView: React.FC<{ details: AttendanceDetails }> = ({ details }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <DetailCell
        icon={Calendar}
        label="Attendance Date"
        value={new Date(details.attendanceDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      />
      <DetailCell icon={ClipboardCheck} label="Request Type" value={details.regularizationType} />
      <DetailCell
        icon={Clock}
        label="Clock In"
        value={
          details.requestedClockIn
            ? new Date(details.requestedClockIn).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })
            : 'No change'
        }
      />
      <DetailCell
        icon={Clock}
        label="Clock Out"
        value={
          details.requestedClockOut
            ? new Date(details.requestedClockOut).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })
            : 'No change'
        }
      />
    </div>
    {details.reason && (
      <p className="text-[10px] text-silver-mist">
        Reason: <span className="text-ink-black dark:text-pearl">{details.reason}</span>
      </p>
    )}
    {details.rejectionReason && (
      <p className="text-[10px] text-coral-alert">
        Rejection reason:{' '}
        <span className="text-ink-black dark:text-pearl">{details.rejectionReason}</span>
      </p>
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
