import React from 'react';
import { MapPin, Navigation, Compass, Lock } from 'lucide-react';

interface ServiceAreaCardProps {
  areas: string[];
  maxDistanceKm: number;
}

export const ServiceAreaCard: React.FC<ServiceAreaCardProps> = ({
  areas = ['Pune', 'Pimpri-Chinchwad', 'Nearby areas'],
  maxDistanceKm = 10,
}) => {
  return (
    <div className="bg-white dark:bg-darkbg-card rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#123B32] dark:text-rozgo-300" />
          <span>Where I Work</span>
        </h3>
        <span className="text-xs font-bold text-neutral-500">
          Max Radius: <strong className="text-[#123B32] dark:text-rozgo-300">{maxDistanceKm} km</strong>
        </span>
      </div>

      {/* Service Areas Tags */}
      <div className="flex flex-wrap gap-2">
        {areas.map((area, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-darkbg-surface text-xs font-bold text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-darkbg-border"
          >
            <MapPin className="w-3.5 h-3.5 text-[#123B32] dark:text-rozgo-300" />
            <span>{area}</span>
          </div>
        ))}
      </div>

      {/* Privacy note */}
      <div className="pt-2 border-t border-neutral-100 dark:border-darkbg-border flex items-center gap-2 text-[11px] text-neutral-500">
        <Lock className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Exact residential address is protected and never shown to employers.</span>
      </div>
    </div>
  );
};

