import React from 'react';
import { GraduationCap, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';

interface SkillIndiaCardProps {
  primarySkill: string;
}

export const SkillIndiaCard: React.FC<SkillIndiaCardProps> = ({ primarySkill = 'plumber' }) => {
  const getTradeRecommendations = (trade: string) => {
    const lower = trade.toLowerCase();
    if (lower.includes('plumb')) {
      return {
        tradeName: 'Plumbing & Water Systems',
        courses: [
          'Plumber General (NSQF Level 4) — Skill India',
          'Concealed Pipe Fitting & Diverter Systems',
          'Solar Water Heater Plumbing & Servicing',
        ],
      };
    }
    if (lower.includes('electr')) {
      return {
        tradeName: 'Electrical & House Wiring',
        courses: [
          'Wireman / Domestic Electrician (NSQF Level 4)',
          'Solar Rooftop PV Installation & Maintenance',
          'Inverter, UPS & Protection Switchgear',
        ],
      };
    }
    if (lower.includes('carpent')) {
      return {
        tradeName: 'Carpentry & Modular Woodwork',
        courses: [
          'Carpenter — Wooden Furniture & Modular Kitchen',
          'Modern Hardware & Sliding Fittings Certification',
          'Wood Finishing, Staining & PU Polish',
        ],
      };
    }
    return {
      tradeName: `${trade.toUpperCase()} Trade Certification`,
      courses: [
        'National Skill Qualification Framework (NSQF) Training',
        'Recognition of Prior Learning (RPL) Assessment',
        'Workplace Safety & Quality Standards',
      ],
    };
  };

  const recs = getTradeRecommendations(primarySkill);

  return (
    <div className="bg-gradient-to-br from-rozgo-50/90 to-amber-50/70 dark:from-rozgo-950/30 dark:to-darkbg-card rounded-3xl p-6 sm:p-7 border-2 border-rozgo-200 dark:border-rozgo-900/60 shadow-soft space-y-4 text-left relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#123B32] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                Get Skill Certified
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                Skill India Digital Hub
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Improve your skills and earn recognised credentials through the official Government of India ecosystem.
            </p>
          </div>
        </div>

        <a
          href="https://www.skillindiadigital.gov.in/courses"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#123B32] hover:bg-[#0d2822] text-white text-xs font-bold transition-all shadow-sm flex-shrink-0 hover:scale-105 active:scale-95"
        >
          <span>Explore Skill India Courses</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Recommended for your trade */}
      <div className="pt-2 border-t border-rozgo-200/60 dark:border-neutral-800 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#123B32] dark:text-rozgo-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Recommended for You ({recs.tradeName}):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          {recs.courses.map((course, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-2.5 rounded-xl bg-white dark:bg-darkbg-surface border border-neutral-200/80 dark:border-darkbg-border font-medium text-neutral-800 dark:text-neutral-200"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2 leading-snug">{course}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

