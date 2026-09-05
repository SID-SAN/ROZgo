import React, { useState } from 'react';
import { Edit3, Check, X, FileText } from 'lucide-react';
import { Button } from '../common/Button';

interface AboutMeCardProps {
  bio: string;
  onSaveBio?: (newBio: string) => void;
  isEditable?: boolean;
}

export const AboutMeCard: React.FC<AboutMeCardProps> = ({
  bio,
  onSaveBio,
  isEditable = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftBio, setDraftBio] = useState(bio);

  const handleSave = () => {
    if (onSaveBio) {
      onSaveBio(draftBio);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftBio(bio);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-darkbg-card rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-3.5 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#123B32] dark:text-rozgo-300" />
          <span>About Me</span>
        </h3>

        {isEditable && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#123B32] dark:text-rozgo-300 hover:underline"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit About Me</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={draftBio}
            onChange={(e) => setDraftBio(e.target.value)}
            rows={4}
            className="w-full p-3.5 rounded-2xl border border-neutral-300 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-xs sm:text-sm text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#123B32]"
            placeholder="Write a few simple lines about your work experience..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="!bg-[#123B32] text-white font-bold"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
          {bio || 'Experienced local worker dedicated to quality, safety, and punctual service.'}
        </p>
      )}
    </div>
  );
};

