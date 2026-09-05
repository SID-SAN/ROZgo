import React, { useState } from 'react';
import { Users, UserPlus, Check, X } from 'lucide-react';
import { Button } from '../common/Button';

export const WorkerReferralCard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [friendName, setFriendName] = useState('');
  const [friendPhone, setFriendPhone] = useState('');
  const [friendTrade, setFriendTrade] = useState('Electrician');
  const [referredSuccess, setReferredSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName.trim() || !friendPhone.trim()) return;

    setReferredSuccess(true);
    setTimeout(() => {
      setReferredSuccess(false);
      setFriendName('');
      setFriendPhone('');
      setIsModalOpen(false);
    }, 2000);
  };

  return (
    <>
      <div className="bg-white dark:bg-darkbg-card rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-darkbg-border shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rozgo-100 dark:bg-rozgo-900/40 text-[#123B32] dark:text-rozgo-200 flex items-center justify-center flex-shrink-0 font-black">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-neutral-900 dark:text-white">
              Worker Referral (Majdoor Mitr)
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Know a hardworking local worker? Refer them to join the ROZGO trust cooperative.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<UserPlus className="w-4 h-4 text-[#123B32]" />}
          onClick={() => setIsModalOpen(true)}
          className="font-bold border-neutral-300 self-start sm:self-auto"
        >
          Refer a Worker
        </Button>
      </div>

      {/* Refer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkbg-card rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-neutral-200 dark:border-darkbg-border animate-scaleUp text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-neutral-900 dark:text-white">
                Refer a Fellow Worker
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {referredSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto font-bold">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Referral Sent Successfully!
                </h4>
                <p className="text-xs text-neutral-500">
                  An invitation SMS with your referral link has been queued for {friendName}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Worker's Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    placeholder="e.g. Mukesh Kumar"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#123B32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={friendPhone}
                    onChange={(e) => setFriendPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#123B32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Trade / Profession
                  </label>
                  <select
                    value={friendTrade}
                    onChange={(e) => setFriendTrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-neutral-900 dark:text-white outline-none"
                  >
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Painter">Painter</option>
                    <option value="Mason">Mason</option>
                    <option value="Driver">Driver</option>
                    <option value="Domestic Help">Domestic Help</option>
                    <option value="Gardener">Gardener</option>
                  </select>
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
                    Send Invitation
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

