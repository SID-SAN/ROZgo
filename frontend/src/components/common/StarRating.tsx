import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  showNumber?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showNumber = false,
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  };

  return (
    <div className="inline-flex items-center gap-1.5 select-none">
      <div className="flex items-center gap-1">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.round(rating);

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
              className={`${interactive ? 'cursor-pointer hover:scale-115 transition-transform' : 'cursor-default'} focus:outline-none`}
            >
              <Star
                className={`${sizeMap[size]} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-neutral-200 text-neutral-300 dark:fill-neutral-700 dark:text-neutral-600'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>
      {showNumber && (
        <span className="font-bold text-neutral-800 dark:text-neutral-200 ml-1 text-sm sm:text-base">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

