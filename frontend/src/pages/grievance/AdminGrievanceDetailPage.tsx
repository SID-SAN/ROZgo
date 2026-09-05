import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Send,
  MessageSquare,
  FileText,
  DollarSign,
  User,
  Phone,
  Calendar,
  Volume2,
  Share2,
} from 'lucide-react';
import { useGrievance } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { GrievanceStatus, GrievancePriority } from '../../types';
import { getStatusBadge, getPriorityBadge } from './MyGrievancesPage';
import { renderCategoryIcon } from './GrievanceLandingPage';

export const AdminGrievanceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getGrievanceById,
    adminUpdateStatus,
    adminUpdatePriority,
    adminRequestMoreInfo,
    adminEscalateGrievance,
    adminResolveGrievance,
    addMessage,
  } = useGrievance();
  const { language } = useLanguage();
  const isHindi = language === 'hi';

  const grievance = id ? getGrievanceById(id) : undefined;

  // Modal states
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [infoQuestion, setInfoQuestion] = useState('');

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionText, setResolutionText] = useState('');

  const [adminMessage, setAdminMessage] = useState('');

  if (!grievance) {
    return (
      <div className="min-h-screen bg-[#fafcfa] dark:bg-darkbg-base py-16 text-center">
        <div className="max-w-md mx-auto px-4 space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Grievance Case Not Found
          </h2>
          <Link
            to="/admin/grievances"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rozgo-900 text-white text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Console</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    adminUpdateStatus(grievance.id, e.target.value as GrievanceStatus);
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    adminUpdatePriority(grievance.id, e.target.value as GrievancePriority);
  };

  const handleEscalate = () => {
    adminEscalateGrievance(grievance.id, 'Escalated by Admin Officer for expedited resolution.');
  };

  const handleRequestInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!infoQuestion.trim()) return;
    adminRequestMoreInfo(grievance.id, infoQuestion.trim());
    setInfoQuestion('');
    setShowRequestInfoModal(false);
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionText.trim()) return;
    adminResolveGrievance(grievance.id, resolutionText.trim());
    setResolutionText('');
    setShowResolveModal(false);
  };

  const handleSendAdminMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMessage.trim()) return;
    addMessage(grievance.id, `[Official Officer Note]: ${adminMessage.trim()}`);
    setAdminMessage('');
  };

  return (
    <div className="min-h-screen bg-[#fafcfa] dark:bg-darkbg-base py-8 sm:py-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/grievances"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-rozgo-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Grievance Console</span>
          </Link>
          <span className="text-xs text-neutral-400">Case ID: {grievance.id}</span>
        </div>

        {/* Case Header & Quick Admin Action Bar */}
        <div className="bg-white dark:bg-darkbg-card rounded-3xl border border-neutral-200 dark:border-darkbg-border p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-100 dark:border-darkbg-border/60 pb-6">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl sm:text-3xl font-mono font-black text-rozgo-900 dark:text-rozgo-300">
                  {grievance.id}
                </span>
                {getStatusBadge(grievance.status, isHindi)}
                {getPriorityBadge(grievance.priority, isHindi)}
              </div>
              <p className="text-xs text-neutral-400">
                Complainant: <strong>{grievance.userName}</strong> ({grievance.userRole}) • Registered: {grievance.createdAt}
              </p>
            </div>

            {/* Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-neutral-500">Status:</span>
                <select
                  value={grievance.status}
                  onChange={handleStatusChange}
                  className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-xs font-bold text-neutral-900 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="info_requested">Info Requested</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed / Rejected</option>
                </select>
              </div>

              {/* Priority Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-neutral-500">Priority:</span>
                <select
                  value={grievance.priority}
                  onChange={handlePriorityChange}
                  className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-xs font-bold text-neutral-900 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Action: Request Info */}
              <button
                type="button"
                onClick={() => setShowRequestInfoModal(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold text-xs transition-colors"
              >
                Request Info
              </button>

              {/* Action: Escalate */}
              <button
                type="button"
                onClick={handleEscalate}
                className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold text-xs transition-colors"
              >
                Escalate Case
              </button>

              {/* Action: Resolve */}
              <button
                type="button"
                onClick={() => setShowResolveModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-soft transition-all"
              >
                Provide Resolution
              </button>
            </div>
          </div>

          {/* Incident Overview and Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Case Subject & Category
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-1">
                  {grievance.title}
                </h3>
                <p className="text-xs font-bold text-rozgo-900 dark:text-rozgo-300 flex items-center gap-1.5 mt-0.5">
                  {renderCategoryIcon(grievance.category, 'w-3.5 h-3.5')}
                  <span>{grievance.categoryLabel}</span>
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Incident Statement
                </span>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed mt-1 p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border">
                  {grievance.description}
                </p>
              </div>

              {/* Wage details if applicable */}
              {(grievance.agreedWage || grievance.actualPaid) && (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-1">
                  <span className="text-[11px] font-bold uppercase text-amber-800 dark:text-amber-400">
                    Payment Discrepancy
                  </span>
                  <div className="flex gap-6 text-xs font-bold text-neutral-800 dark:text-neutral-200 pt-1">
                    <span>Agreed: ₹{grievance.agreedWage || 0}</span>
                    <span>Paid: ₹{grievance.actualPaid || 0}</span>
                    <span className="text-rose-600 dark:text-rose-400">
                      Disputed: ₹{(grievance.agreedWage || 0) - (grievance.actualPaid || 0)}
                    </span>
                  </div>
                </div>
              )}

              {/* Resolution Decision if Resolved */}
              {grievance.resolutionNotes && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-400">
                    Official Decision Logged
                  </span>
                  <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed pt-1 whitespace-pre-wrap">
                    {grievance.resolutionNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Case Metadata & Booking */}
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border space-y-4 text-xs">
              <div>
                <span className="text-[11px] font-bold uppercase text-neutral-400">
                  Complainant
                </span>
                <p className="font-bold text-neutral-900 dark:text-white mt-0.5">
                  {grievance.userName} ({grievance.userRole})
                </p>
                <p className="text-neutral-500">{grievance.userPhone}</p>
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-darkbg-border">
                <span className="text-[11px] font-bold uppercase text-neutral-400">
                  Reported Party
                </span>
                <p className="font-bold text-neutral-900 dark:text-white mt-0.5">
                  {grievance.counterpartyName || 'Not specified'}
                </p>
                <p className="text-neutral-500">{grievance.counterpartyPhone || 'N/A'}</p>
              </div>

              {grievance.bookingNumber && (
                <div className="pt-3 border-t border-neutral-200 dark:border-darkbg-border">
                  <span className="text-[11px] font-bold uppercase text-neutral-400">
                    Linked Work Order
                  </span>
                  <p className="font-bold text-neutral-900 dark:text-white mt-0.5">
                    {grievance.bookingTitle}
                  </p>
                  <p className="font-mono text-rozgo-900 dark:text-rozgo-300">
                    {grievance.bookingNumber}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-neutral-200 dark:border-darkbg-border">
                <span className="text-[11px] font-bold uppercase text-neutral-400">
                  Submitted Proofs ({grievance.evidence.length})
                </span>
                <div className="mt-2 space-y-1.5">
                  {grievance.evidence.length === 0 ? (
                    <span className="text-neutral-400 italic">No files attached</span>
                  ) : (
                    grievance.evidence.map((e) => (
                      <div
                        key={e.id}
                        className="p-2 rounded-xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border flex items-center justify-between"
                      >
                        <span className="truncate font-bold text-neutral-800 dark:text-neutral-200">
                          {e.fileName}
                        </span>
                        <span className="text-[10px] text-neutral-400 shrink-0 ml-2">
                          {e.fileSize}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messaging Thread Console & Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages Thread (2 columns) */}
          <div className="lg:col-span-2 bg-white dark:bg-darkbg-card rounded-3xl border border-neutral-200 dark:border-darkbg-border p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-rozgo-900 dark:text-rozgo-400" />
                <h3 className="text-base font-black text-neutral-900 dark:text-white">
                  Case Communication Log
                </h3>
              </div>
              <span className="text-xs text-neutral-400">{grievance.messages.length} messages</span>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {grievance.messages.map((m) => {
                const isAdmin = m.senderRole === 'admin';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[11px] font-bold text-neutral-500">
                      <span>{m.senderName}</span>
                      <span className="text-[10px] text-neutral-400">{m.timestamp}</span>
                    </div>
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isAdmin
                          ? 'bg-rozgo-900 text-white rounded-tr-sm'
                          : 'bg-neutral-100 dark:bg-darkbg-surface text-neutral-900 dark:text-white rounded-tl-sm border border-neutral-200 dark:border-darkbg-border'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Admin Reply Form */}
            <form onSubmit={handleSendAdminMessage} className="flex gap-2 pt-2">
              <input
                type="text"
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="Post official redressal message to complainant..."
                className="flex-1 px-4 py-3 rounded-2xl border border-neutral-200 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rozgo-900"
              />
              <button
                type="submit"
                disabled={!adminMessage.trim()}
                className="px-5 py-3 rounded-2xl bg-rozgo-900 hover:bg-rozgo-800 disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5"
              >
                <span>Post</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Timeline Milestones (1 column) */}
          <div className="bg-white dark:bg-darkbg-card rounded-3xl border border-neutral-200 dark:border-darkbg-border p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Audit Milestones
            </h3>
            <div className="space-y-3">
              {grievance.timeline.map((item) => (
                <div key={item.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-rozgo-900 dark:bg-rozgo-400 mt-1.5 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-neutral-900 dark:text-white">{item.title}</p>
                    <p className="text-[10px] text-neutral-400">{item.timestamp}</p>
                    <p className="text-neutral-600 dark:text-neutral-400 text-[11px]">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal: Request More Info */}
        {showRequestInfoModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-scaleUp">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                  Request Additional Information
                </h3>
                <p className="text-xs text-neutral-500">
                  This will change the case status to <strong>More Info Needed</strong> and prompt
                  the complainant to respond.
                </p>
              </div>

              <form onSubmit={handleRequestInfoSubmit} className="space-y-4">
                <textarea
                  rows={4}
                  value={infoQuestion}
                  onChange={(e) => setInfoQuestion(e.target.value)}
                  placeholder="e.g. Please upload the bank transfer statement or specify the exact work location where disagreement occurred..."
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestInfoModal(false)}
                    className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!infoQuestion.trim()}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                  >
                    Send Query to Complainant
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Resolve Case */}
        {showResolveModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-scaleUp">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                  Issue Official Resolution
                </h3>
                <p className="text-xs text-neutral-500">
                  This will mark the ticket as <strong>Resolved</strong> and publish the official
                  decision to both parties.
                </p>
              </div>

              <form onSubmit={handleResolveSubmit} className="space-y-4">
                <textarea
                  rows={4}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="State the findings, settlement terms, wage adjustment, or action taken..."
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResolveModal(false)}
                    className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!resolutionText.trim()}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-soft"
                  >
                    Confirm & Resolve Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

