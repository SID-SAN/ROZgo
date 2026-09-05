import React, { useState } from 'react';
import { Plus, X, Wrench, Check, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';

interface SkillsSectionProps {
  skills: string[];
  onAddSkill?: (newSkill: string) => void;
  onRemoveSkill?: (skillToRemove: string) => void;
  isEditable?: boolean;
}

const COMMON_SKILL_SUGGESTIONS: Record<string, string[]> = {
  plumber: [
    'Tap Repair',
    'Pipe Repair',
    'Bathroom Plumbing',
    'Leakage Repair',
    'Installation',
    'Water Tank Cleaning',
    'Geyser Connection',
    'Drain Unclogging',
  ],
  electrician: [
    'Switchboard Repair',
    'Ceiling Fan Install',
    'MCB & Fuse',
    'Inverter Wiring',
    'Appliance Earthing',
    'Concealed Wiring',
  ],
  carpenter: [
    'Door Lock Fitting',
    'Wardrobe Hinges',
    'Furniture Repair',
    'Modular Kitchen',
    'Wood Polishing',
    'Bed Frame Repair',
  ],
};

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  onAddSkill,
  onRemoveSkill,
  isEditable = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customSkill, setCustomSkill] = useState('');

  const handleAddSuggested = (skillName: string) => {
    if (!skills.includes(skillName) && onAddSkill) {
      onAddSkill(skillName);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSkill.trim() && !skills.includes(customSkill.trim()) && onAddSkill) {
      onAddSkill(customSkill.trim());
      setCustomSkill('');
    }
  };

  const getSkillIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('tap')) return '🚰';
    if (lower.includes('pipe')) return '🔩';
    if (lower.includes('bathroom') || lower.includes('bath')) return '🚿';
    if (lower.includes('leak')) return '💧';
    if (lower.includes('install')) return '🛠';
    if (lower.includes('fan')) return '💨';
    if (lower.includes('switch') || lower.includes('fuse') || lower.includes('wire')) return '⚡';
    if (lower.includes('door') || lower.includes('wood')) return '🚪';
    return '🔧';
  };

  return (
    <>
      <div className="bg-white dark:bg-darkbg-card rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-neutral-900 dark:text-white">
              My Skills
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-darkbg-surface text-neutral-600 dark:text-neutral-400">
              {skills.length}
            </span>
          </div>

          {isEditable && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-darkbg-border text-xs font-bold text-[#123B32] dark:text-rozgo-300 hover:bg-neutral-50 dark:hover:bg-darkbg-surface transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill</span>
            </button>
          )}
        </div>

        {/* Skills Chips Grid */}
        <div className="flex flex-wrap gap-2.5">
          {skills.map((skill, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-darkbg-border shadow-xs group"
            >
              <span className="text-base leading-none">{getSkillIcon(skill)}</span>
              <span>{skill.replace('_', ' ')}</span>
              {isEditable && onRemoveSkill && (
                <button
                  type="button"
                  onClick={() => onRemoveSkill(skill)}
                  className="text-neutral-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                  title="Remove Skill"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Skill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkbg-card rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-200 dark:border-darkbg-border animate-scaleUp text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-neutral-900 dark:text-white">
                Add Skills to Profile
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Select suggested skills or enter a specialized trade skill you perform.
            </p>

            {/* Custom skill input */}
            <form onSubmit={handleAddCustom} className="flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="e.g. RO Purifier Plumbing"
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-neutral-300 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#123B32]"
              />
              <Button type="submit" variant="primary" size="sm" className="!bg-[#123B32] text-white font-bold">
                Add
              </Button>
            </form>

            {/* Suggestions */}
            <div className="space-y-2 pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Common Plumbing & Trade Suggestions:
              </p>
              <div className="flex flex-wrap gap-2">
                {COMMON_SKILL_SUGGESTIONS.plumber.map((item) => {
                  const isSelected = skills.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleAddSuggested(item)}
                      disabled={isSelected}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-neutral-100 dark:bg-darkbg-surface text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="font-bold"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

