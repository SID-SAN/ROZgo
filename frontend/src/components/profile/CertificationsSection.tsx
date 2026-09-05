import React, { useState } from 'react';
import { Award, Plus, CheckCircle2, Clock, X, Upload, FileText, Check } from 'lucide-react';
import { WorkerCertificate } from '../../types';
import { Button } from '../common/Button';

interface CertificationsSectionProps {
  certifications?: WorkerCertificate[];
  onAddCertificate?: (cert: WorkerCertificate) => void;
  isEditable?: boolean;
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  certifications = [],
  onAddCertificate,
  isEditable = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [issuingOrg, setIssuingOrg] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [fileUploaded, setFileUploaded] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !issuingOrg.trim()) return;

    const newCert: WorkerCertificate = {
      id: `cert-${Date.now()}`,
      name: name.trim(),
      issuingOrg: issuingOrg.trim(),
      certificateNumber: certificateNumber.trim() || undefined,
      issueDate: issueDate.trim() || 'Recent',
      credentialId: `RZG-CERT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'pending', // new uploads start as pending verification
    };

    if (onAddCertificate) {
      onAddCertificate(newCert);
    }

    setName('');
    setIssuingOrg('');
    setCertificateNumber('');
    setIssueDate('');
    setFileUploaded(false);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-darkbg-card rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#123B32] dark:text-rozgo-300" />
              <span>Skills & Certifications</span>
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-darkbg-surface text-neutral-600 dark:text-neutral-400">
              {certifications.length}
            </span>
          </div>

          {isEditable && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-darkbg-border text-xs font-bold text-[#123B32] dark:text-rozgo-300 hover:bg-neutral-50 dark:hover:bg-darkbg-surface transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Certificate</span>
            </button>
          )}
        </div>

        {/* Certificates List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {certifications.length > 0 ? (
            certifications.map((cert) => (
              <div
                key={cert.id}
                className="p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border space-y-2 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                      {cert.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Issued by: <strong>{cert.issuingOrg}</strong>
                    </p>
                  </div>

                  {cert.status === 'verified' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 flex-shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>Verification Pending</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-200/60 dark:border-darkbg-border">
                  {cert.credentialId && (
                    <span className="font-mono font-semibold">ID: {cert.credentialId}</span>
                  )}
                  {cert.issueDate && <span>Issued: {cert.issueDate}</span>}
                </div>
              </div>
            ))
          ) : (
            <div className="sm:col-span-2 p-6 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface text-center space-y-1">
              <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                No certificates added yet.
              </p>
              <p className="text-[11px] text-neutral-500">
                Workers with verified skill credentials earn up to 40% higher customer trust.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Certificate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkbg-card rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-200 dark:border-darkbg-border animate-scaleUp text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-neutral-900 dark:text-white">
                Add Skill Certificate
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Certificate Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Plumbing Skill Certification (RPL)"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#123B32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Issuing Organization *
                </label>
                <input
                  type="text"
                  required
                  value={issuingOrg}
                  onChange={(e) => setIssuingOrg(e.target.value)}
                  placeholder="e.g. Skill India / ITI / State Council"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#123B32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Certificate Number
                  </label>
                  <input
                    type="text"
                    value={certificateNumber}
                    onChange={(e) => setCertificateNumber(e.target.value)}
                    placeholder="e.g. SIDH-10492"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-neutral-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="text"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    placeholder="e.g. March 2023"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-neutral-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Upload Certificate Document (Photo or PDF)
                </label>
                <label className="p-3 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-darkbg-border text-center flex items-center justify-center gap-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-darkbg-surface">
                  <Upload className="w-4 h-4 text-neutral-400" />
                  <span className="text-xs font-bold text-[#123B32] dark:text-rozgo-300">
                    {fileUploaded ? 'Document Attached ✓' : 'Upload File'}
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={() => setFileUploaded(true)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="!bg-[#123B32] text-white font-bold"
                >
                  Save Certificate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

