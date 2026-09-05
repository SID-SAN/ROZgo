import React, { useState } from 'react';
import { X, Copy, Check, Share2, Phone, ShieldCheck } from 'lucide-react';
import { WorkerProfile } from '../../types';

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: WorkerProfile;
}

export const ShareProfileModal: React.FC<ShareProfileModalProps> = ({
  isOpen,
  onClose,
  worker,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/worker/${worker.labourNumber || worker.id}`
    : `https://rozgo.in/worker/${worker.labourNumber || worker.id}`;

  const shareText = `Check out ${worker.name}'s verified professional worker profile on ROZGO (Labour No: ${worker.labourNumber || 'Verified'}). Direct Profile: ${publicUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-darkbg-surface w-full max-w-md rounded-3xl border border-neutral-200 dark:border-darkbg-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-[#123B32] text-white p-6 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Share2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Share Worker Profile</h3>
              <p className="text-xs text-emerald-200 mt-0.5">ROZGO Verified Digital Identity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-center">
          {/* Worker Snapshot preview */}
          <div className="flex items-center gap-3 p-3.5 bg-neutral-50 dark:bg-darkbg-base rounded-2xl border border-neutral-200 dark:border-darkbg-border text-left">
            <img 
              src={worker.avatar} 
              alt={worker.name} 
              className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-darkbg-border"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-neutral-900 dark:text-white truncate">{worker.name}</p>
                {worker.isVerified && <ShieldCheck className="w-4 h-4 text-[#123B32] dark:text-emerald-400 shrink-0" />}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                {worker.primarySkill} • {worker.city || worker.location}
              </p>
            </div>
            {worker.labourNumber && (
              <span className="font-mono text-xs font-bold text-[#123B32] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 shrink-0">
                {worker.labourNumber}
              </span>
            )}
          </div>

          {/* Direct Profile Link with Copy Button */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
              Direct Public Link
            </label>
            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-darkbg-base p-1.5 rounded-xl border border-neutral-200 dark:border-darkbg-border">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="bg-transparent text-xs font-mono text-neutral-700 dark:text-neutral-300 px-2 py-1 flex-1 outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-[#123B32] text-white hover:bg-[#0c2721] transition-all shadow-sm shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#25D366] text-white font-bold text-xs hover:bg-[#1EBE5D] transition-colors shadow-sm"
            >
              <Phone className="w-4 h-4" />
              Share on WhatsApp
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `${worker.name} - ROZGO Profile`,
                    text: shareText,
                    url: publicUrl,
                  }).catch(() => {});
                } else {
                  handleCopy();
                }
              }}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-neutral-100 dark:bg-darkbg-base text-neutral-800 dark:text-neutral-200 font-bold text-xs hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-darkbg-border"
            >
              <Share2 className="w-4 h-4" />
              More Options
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-base/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
