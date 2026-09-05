import React, { useState } from 'react';
import { Star, CheckCircle, HeartHandshake } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StarRating } from '../common/StarRating';

interface RatingReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, tags: string[]) => void;
  targetName: string;
  role: 'worker' | 'employer';
}

const AVAILABLE_TAGS = [
  'Punctual',
  'Polite & Respectful',
  'Clean Work',
  'Fair Direct Agreement',
  'Highly Skilled',
  'Safe & Reliable',
];

export const RatingReviewModal: React.FC<RatingReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  targetName,
  role,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Punctual', 'Clean Work']);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating, comment, selectedTags);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      {isSubmitted ? (
        <div className="text-center py-8 space-y-4 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
            Thank You!
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
            Your review and rating have been recorded. You are strengthening trust in the ROZGO cooperative community!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
              How was your experience?
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {role === 'worker' ? 'Rate this employer' : 'Rate this worker'}:{' '}
              <span className="font-bold text-rozgo-900 dark:text-rozgo-300">
                {targetName}
              </span>
            </p>

            {/* Interactive Stars */}
            <div className="mt-4 flex justify-center">
              <StarRating
                rating={rating}
                size="xl"
                interactive={true}
                onRatingChange={(r) => setRating(r)}
              />
            </div>
            <div className="text-sm font-bold text-amber-500 mt-2">
              {rating === 5
                ? '⭐⭐⭐⭐⭐ Outstanding (5.0)'
                : rating === 4
                ? '⭐⭐⭐⭐ Very Good (4.0)'
                : rating === 3
                ? '⭐⭐⭐ Satisfactory (3.0)'
                : 'Needs Improvement'}
            </div>
          </div>

          {/* Quick feedback tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Select Highlights
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                      isSelected
                        ? 'bg-rozgo-900 text-white dark:bg-rozgo-700'
                        : 'bg-neutral-100 dark:bg-darkbg-surface text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review text */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Write a Review (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share a few words about punctuality, craftsmanship, and mutual cooperation..."
              className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rozgo-900 resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<HeartHandshake className="w-5 h-5 text-rozgo-300" />}
          >
            Submit Review
          </Button>
        </form>
      )}
    </Modal>
  );
};

