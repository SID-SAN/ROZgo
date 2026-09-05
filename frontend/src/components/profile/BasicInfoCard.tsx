import React from 'react';
import { User, Calendar, MapPin, Globe, Award, Shield } from 'lucide-react';
import { WorkerProfile } from '../../types';

interface BasicInfoCardProps {
  worker: WorkerProfile;
}

export const BasicInfoCard: React.FC<BasicInfoCardProps> = ({ worker }) => {
  const details = [
    {
      icon: <User className="w-4 h-4 text-[#123B32] dark:text-rozgo-300" />,
      label: 'Full Name',
      value: worker.name,
    },
    {
      icon: <Calendar className="w-4 h-4 text-[#123B32] dark:text-rozgo-300" />,
      label: 'Age / Gender',
      value: `${worker.dobOrAge || '32 years'} • ${worker.gender || 'Male'}`,
    },
    {
      icon: <MapPin className="w-4 h-4 text-[#123B32] dark:text-rozgo-300" />,
      label: 'Location',
      value: worker.location,
    },
    {
      icon: <Globe className="w-4 h-4 text-[#123B32] dark:text-rozgo-300" />,
      label: 'Preferred Language',
      value: worker.preferredLanguage || 'Hindi',
    },
    {
      icon: <Award className="w-4 h-4 text-[#123B32] dark:text-rozgo-300" />,
      label: 'Trade Experience',
      value: `${worker.experienceYears}+ Years`,
    },
    {
      icon: <Shield className="w-4 h-4 text-[#123B32] dark:text-rozgo-300" />,
      label: 'Membership',
      value: `Member since ${worker.joinedDate}`,
    },
  ];

  return (
    <div className="bg-white dark:bg-darkbg-card rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-4 text-left">
      <h3 className="text-base font-black text-neutral-900 dark:text-white">
        Basic Information
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {details.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-100 dark:border-darkbg-border"
          >
            <div className="w-9 h-9 rounded-xl bg-rozgo-100 dark:bg-rozgo-900/40 flex items-center justify-center flex-shrink-0">
              {item.icon}
            </div>
            <div>
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

