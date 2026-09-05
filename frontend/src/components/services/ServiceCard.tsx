import React from 'react';
import {
  Wrench,
  Zap,
  Hammer,
  Home,
  Paintbrush,
  Building,
  Wind,
  Cpu,
  Trees,
  ShieldAlert,
  Droplets,
  Car,
  Truck,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { ServiceCategory } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Wrench,
  Zap,
  Hammer,
  Home,
  Paintbrush,
  Building,
  Wind,
  Cpu,
  Trees,
  ShieldAlert,
  Droplets,
  Car,
  Truck,
  BookOpen,
};

// Subtle controlled accent background for the icon container
const ACCENT_COLORS: Record<string, { bg: string; text: string }> = {
  plumber: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300' },
  electrician: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300' },
  carpenter: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300' },
  domestic_help: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300' },
  painter: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300' },
  mason: { bg: 'bg-stone-100 dark:bg-stone-900/50', text: 'text-stone-700 dark:text-stone-300' },
  ac_repair: { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300' },
  appliance_repair: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300' },
  gardener: { bg: 'bg-lime-50 dark:bg-lime-950/40', text: 'text-lime-700 dark:text-lime-300' },
  pest_control: { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-300' },
  ro_water: { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-300' },
  driver: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300' },
  packers_movers: { bg: 'bg-yellow-50 dark:bg-yellow-950/40', text: 'text-yellow-800 dark:text-yellow-300' },
  home_tutor: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300' },
};

interface ServiceCardProps {
  service: ServiceCategory;
  onClick: () => void;
  isSelected?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onClick,
  isSelected = false,
}) => {
  const { t } = useLanguage();
  const IconComponent = ICON_MAP[service.iconName] || Wrench;
  const accent = ACCENT_COLORS[service.id] || {
    bg: 'bg-rozgo-50 dark:bg-rozgo-900/30',
    text: 'text-rozgo-900 dark:text-rozgo-300',
  };

  const localizedName = t(service.nameKey) || service.defaultName;
  const localizedDesc = t(service.shortDescKey) || service.defaultShortDesc;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      className={`group relative flex flex-col p-6 sm:p-7 rounded-3xl transition-all duration-300 cursor-pointer select-none text-left ${
        isSelected
          ? 'bg-rozgo-50/80 dark:bg-darkbg-card border-2 border-rozgo-900 dark:border-rozgo-400 shadow-soft-lg ring-2 ring-rozgo-900/20'
          : 'bg-white dark:bg-darkbg-card border border-neutral-200/90 dark:border-darkbg-border shadow-soft hover:shadow-card-hover hover:border-rozgo-400 dark:hover:border-rozgo-500 hover:-translate-y-1'
      }`}
    >
      {/* Icon Container with subtle controlled accent */}
      <div
        className={`w-14 h-14 rounded-2xl ${accent.bg} ${accent.text} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105`}
      >
        <IconComponent className="w-7 h-7" />
      </div>

      {/* Service Name */}
      <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mb-2 group-hover:text-rozgo-900 dark:group-hover:text-rozgo-300 transition-colors">
        {localizedName}
      </h3>

      {/* Short Description */}
      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2 mb-4">
        {localizedDesc}
      </p>

      {/* Bottom Hint Link */}
      <div className="mt-auto pt-2 flex items-center gap-1 text-xs font-bold text-rozgo-900 dark:text-rozgo-300 group-hover:translate-x-1 transition-transform">
        <span>Find Workers</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};

