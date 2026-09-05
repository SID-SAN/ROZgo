import React from 'react';
import { BookOpen, Globe2, Check } from 'lucide-react';
import { WorkerEducationItem, WorkerLanguageItem } from '../../types';

interface EducationLanguagesCardProps {
  education?: WorkerEducationItem[];
  languages?: WorkerLanguageItem[];
}

export const EducationLanguagesCard: React.FC<EducationLanguagesCardProps> = ({
  education = [
    { title: 'ITI Certificate', field: 'Plumbing & Pipefitting', year: '2019', type: 'ITI' },
    { title: 'Residential Skill Training', field: 'Domestic Plumbing Installation', year: '2021', type: 'Vocational' },
  ],
  languages = [
    { name: 'Hindi', proficiency: 'Fluent' },
    { name: 'Marathi', proficiency: 'Fluent' },
    { name: 'English', proficiency: 'Basic' },
  ],
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
      {/* Education & Training */}
      <div className="bg-white dark:bg-darkbg-card rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-3">
        <h3 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#123B32] dark:text-rozgo-300" />
          <span>Education & Training</span>
        </h3>

        <div className="space-y-2.5">
          {education.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-100 dark:border-darkbg-border space-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">{item.title}</span>
                <span className="text-[10px] font-mono font-bold text-neutral-400">{item.year}</span>
              </div>
              <p className="text-[11px] text-neutral-500">{item.field}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="bg-white dark:bg-darkbg-card rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-3">
        <h3 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-[#123B32] dark:text-rozgo-300" />
          <span>Languages Known</span>
        </h3>

        <div className="space-y-2.5">
          {languages.map((lang, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-100 dark:border-darkbg-border flex items-center justify-between"
            >
              <span className="text-xs font-bold text-neutral-900 dark:text-white">{lang.name}</span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rozgo-100 dark:bg-rozgo-900/40 text-[#123B32] dark:text-rozgo-300">
                {lang.proficiency}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

