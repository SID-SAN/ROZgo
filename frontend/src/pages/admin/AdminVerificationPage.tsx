import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Search,
  ArrowRight,
  UserCheck,
  RotateCcw,
  Check,
  AlertTriangle,
  FileText,
  Phone,
  Calendar,
  ExternalLink,
  ChevronRight,
  X,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LabourBadge } from '../../components/workers/LabourBadge';
import { verificationQueueService } from '../../services/verificationService';
import { VerificationApplication } from '../../types';

export const AdminVerificationPage: React.FC = () => {
  const { adminApproveWorker, adminRejectWorker, adminRequestPhotoWorker, resetWorkerVerificationDemo, workerUser } =
    useAuth();

  const [applications, setApplications] = useState<VerificationApplication[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<VerificationApplication | null>(null);

  // Review modal actions
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [photoRequestNote, setPhotoRequestNote] = useState('');
  const [isRequestingPhoto, setIsRequestingPhoto] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const refreshApplications = () => {
    setApplications(verificationQueueService.getApplications());
  };

  useEffect(() => {
    refreshApplications();
  }, []);

  // Filtered list
  const filteredApplications = applications.filter((app) => {
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'pending'
        ? app.status === 'pending'
        : app.status === activeFilter;

    const matchesSearch =
      app.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.workerPhone.includes(searchQuery) ||
      (app.maskedIdentifier && app.maskedIdentifier.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // Stats calculation
  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const verifiedCount = applications.filter((a) => a.status === 'verified').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  // Handlers
  const handleApprove = (app: VerificationApplication) => {
    adminApproveWorker(app.workerId);
    refreshApplications();
    // Update local selected modal view
    const updated = verificationQueueService.getApplications().find((a) => a.id === app.id);
    setSelectedApp(updated || null);
  };

  const handleReject = (app: VerificationApplication) => {
    const reason = rejectionReason.trim() || 'Document photo is unreadable or identity could not be verified.';
    adminRejectWorker(app.workerId, reason);
    setIsRejecting(false);
    setRejectionReason('');
    refreshApplications();
    const updated = verificationQueueService.getApplications().find((a) => a.id === app.id);
    setSelectedApp(updated || null);
  };

  const handleRequestPhoto = (app: VerificationApplication) => {
    const note = photoRequestNote.trim() || 'Please submit a clearer photo without glare or shadows.';
    adminRequestPhotoWorker(app.workerId, note);
    setIsRequestingPhoto(false);
    setPhotoRequestNote('');
    refreshApplications();
    const updated = verificationQueueService.getApplications().find((a) => a.id === app.id);
    setSelectedApp(updated || null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#123B32] text-white">
              Admin & Trust Portal
            </span>
            <span className="text-xs text-neutral-500 font-medium">Cooperative Identity Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mt-1">
            Worker Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            Review submitted Aadhaar, e-Shram & National IDs. Approved workers receive an official ROZGO Labour ID.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetWorkerVerificationDemo();
              refreshApplications();
            }}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Demo Queue
          </Button>
          <Link
            to="/worker/dashboard"
            className="text-xs font-bold text-rozgo-800 dark:text-rozgo-300 hover:underline"
          >
            Go to Worker Dashboard →
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="default" padding="md" className="space-y-1 bg-white dark:bg-darkbg-card">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Applications</p>
          <p className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">{totalCount}</p>
        </Card>

        <Card variant="default" padding="md" className="space-y-1 bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Pending Review</p>
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-900 dark:text-amber-200">{pendingCount}</p>
        </Card>

        <Card variant="default" padding="md" className="space-y-1 bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Approved & Verified</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-900 dark:text-emerald-200">{verifiedCount}</p>
        </Card>

        <Card variant="default" padding="md" className="space-y-1 bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">Rejected</p>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-900 dark:text-rose-200">{rejectedCount}</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-darkbg-card p-3 sm:p-4 rounded-2xl border border-neutral-200 dark:border-darkbg-border shadow-soft">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'verified', label: `Verified (${verifiedCount})` },
              { id: 'rejected', label: `Rejected (${rejectedCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-[#123B32] text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-darkbg-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by worker or phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#123B32]"
          />
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="bg-white dark:bg-darkbg-card rounded-3xl border border-neutral-200 dark:border-darkbg-border shadow-soft overflow-hidden">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              No applications match this filter
            </p>
            <p className="text-xs text-neutral-500">
              Try adjusting your search query or selecting a different tab.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-darkbg-border text-[11px] font-black uppercase tracking-wider text-neutral-400 bg-neutral-50 dark:bg-darkbg-surface/50">
                  <th className="py-3.5 px-4 sm:px-6">Worker</th>
                  <th className="py-3.5 px-4">Document / Type</th>
                  <th className="py-3.5 px-4">Identifier</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-darkbg-border text-xs">
                {filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-darkbg-surface/50 transition-colors"
                  >
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        {app.selfieUrl ? (
                          <img
                            src={app.selfieUrl}
                            alt={app.workerName}
                            className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-darkbg-border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-rozgo-100 dark:bg-rozgo-900/40 text-rozgo-900 dark:text-rozgo-200 flex items-center justify-center font-black">
                            {app.workerName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white">{app.workerName}</p>
                          <p className="text-[11px] text-neutral-500">{app.workerPhone}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">
                          {app.idType || app.method.toUpperCase()}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-neutral-700 dark:text-neutral-300">
                      {app.maskedIdentifier}
                    </td>

                    <td className="py-4 px-4 text-neutral-500">{app.submittedAt}</td>

                    <td className="py-4 px-4">
                      {app.status === 'verified' ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </div>
                      ) : app.status === 'rejected' ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[11px] font-bold border border-rose-300 dark:border-rose-800">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rejected</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-amber-300 dark:border-amber-800">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>Pending Review</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right">
                      <Button
                        variant="primary"
                        size="sm"
                        className="!bg-[#123B32] hover:!bg-[#0D2B24] text-white font-bold"
                        onClick={() => setSelectedApp(app)}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* REVIEW APPLICATION MODAL */}
      {/* ========================================================================= */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkbg-card rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200 dark:border-darkbg-border animate-scaleUp text-left">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-neutral-100 dark:border-darkbg-border flex items-center justify-between sticky top-0 bg-white/95 dark:bg-darkbg-card/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rozgo-100 dark:bg-rozgo-900/40 text-rozgo-900 dark:text-rozgo-200 flex items-center justify-center font-black">
                  <ShieldCheck className="w-6 h-6 text-rozgo-800 dark:text-rozgo-300" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                    Verification Review: {selectedApp.workerName}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Application ID: {selectedApp.id} • Submitted {selectedApp.submittedAt}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6">
              {/* Status Header inside modal */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-neutral-400">Current Status</span>
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 capitalize">
                    {selectedApp.status.replace('_', ' ')}
                  </p>
                </div>

                {selectedApp.status === 'verified' && (
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase text-emerald-600">Assigned Labour ID</span>
                    <p className="text-xs font-mono font-black text-emerald-800 dark:text-emerald-300">
                      {workerUser.labourNumber || 'RZG-748291'}
                    </p>
                  </div>
                )}
              </div>

              {/* Worker & Document Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 font-medium">Worker Name:</span>
                  <p className="font-bold text-neutral-900 dark:text-white mt-0.5">{selectedApp.workerName}</p>
                </div>
                <div>
                  <span className="text-neutral-400 font-medium">Phone Number:</span>
                  <p className="font-bold text-neutral-900 dark:text-white mt-0.5">{selectedApp.workerPhone}</p>
                </div>
                <div>
                  <span className="text-neutral-400 font-medium">Method / Document:</span>
                  <p className="font-bold text-neutral-900 dark:text-white mt-0.5">{selectedApp.idType}</p>
                </div>
                <div>
                  <span className="text-neutral-400 font-medium">Masked ID Number:</span>
                  <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {selectedApp.maskedIdentifier}
                  </p>
                </div>
              </div>

              {/* Document Images Preview */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500">
                  Document Photos & Selfie Match
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Front Document */}
                  <div className="space-y-1.5 text-center">
                    <p className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                      Front Document
                    </p>
                    {selectedApp.frontDocumentUrl ? (
                      <div
                        onClick={() => setPreviewImage(selectedApp.frontDocumentUrl!)}
                        className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-darkbg-border aspect-video cursor-pointer group"
                      >
                        <img
                          src={selectedApp.frontDocumentUrl}
                          alt="Front document"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                          Click to Expand
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs text-neutral-400">
                        No photo
                      </div>
                    )}
                  </div>

                  {/* Back Document */}
                  <div className="space-y-1.5 text-center">
                    <p className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                      Back Document
                    </p>
                    {selectedApp.backDocumentUrl ? (
                      <div
                        onClick={() => setPreviewImage(selectedApp.backDocumentUrl!)}
                        className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-darkbg-border aspect-video cursor-pointer group"
                      >
                        <img
                          src={selectedApp.backDocumentUrl}
                          alt="Back document"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                          Click to Expand
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs text-neutral-400">
                        Not required
                      </div>
                    )}
                  </div>

                  {/* Selfie Match */}
                  <div className="space-y-1.5 text-center">
                    <p className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                      Worker Selfie Match
                    </p>
                    {selectedApp.selfieUrl ? (
                      <div
                        onClick={() => setPreviewImage(selectedApp.selfieUrl!)}
                        className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-darkbg-border aspect-video cursor-pointer group"
                      >
                        <img
                          src={selectedApp.selfieUrl}
                          alt="Worker selfie"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                          Click to Expand
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs text-neutral-400">
                        No selfie
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rejection or note form if toggled */}
              {isRejecting && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 space-y-3">
                  <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    Specify Rejection Reason:
                  </p>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Document photo is too blurry to read, or name doesn't match..."
                    rows={3}
                    className="w-full p-3 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-darkbg-card text-xs text-neutral-900 dark:text-white outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsRejecting(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="!bg-rose-600 hover:!bg-rose-700 text-white"
                      onClick={() => handleReject(selectedApp)}
                    >
                      Confirm Rejection
                    </Button>
                  </div>
                </div>
              )}

              {isRequestingPhoto && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-3">
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Request Better Photo Instruction:
                  </p>
                  <input
                    type="text"
                    value={photoRequestNote}
                    onChange={(e) => setPhotoRequestNote(e.target.value)}
                    placeholder="e.g. Please capture front of Aadhaar in bright light without glare"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-darkbg-card text-xs text-neutral-900 dark:text-white outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsRequestingPhoto(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="!bg-amber-600 hover:!bg-amber-700 text-white"
                      onClick={() => handleRequestPhoto(selectedApp)}
                    >
                      Send Request
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 sm:p-6 border-t border-neutral-100 dark:border-darkbg-border flex flex-wrap items-center justify-between gap-3 bg-neutral-50/50 dark:bg-darkbg-surface/50">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="md"
                  className="text-rose-600 border-rose-300 hover:bg-rose-50"
                  onClick={() => setIsRejecting(!isRejecting)}
                  disabled={selectedApp.status === 'verified'}
                >
                  Reject
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="text-amber-700 border-amber-300 hover:bg-amber-50"
                  onClick={() => setIsRequestingPhoto(!isRequestingPhoto)}
                  disabled={selectedApp.status === 'verified'}
                >
                  Request Better Photo
                </Button>
              </div>

              <Button
                variant="primary"
                size="md"
                className="!bg-[#123B32] hover:!bg-[#0D2B24] text-white font-bold"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                onClick={() => handleApprove(selectedApp)}
              >
                {selectedApp.status === 'verified' ? 'Re-issue / Update Approval' : 'Approve & Issue Labour ID'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh]">
            <img src={previewImage} alt="Zoomed document" className="rounded-2xl max-w-full max-h-[85vh] object-contain" />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};