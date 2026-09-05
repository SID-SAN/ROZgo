import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Wrench,
  CheckCircle2,
  Users,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { SERVICES_DATA } from '../../data/servicesData';
import { DifficultyLevel } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const CreateWorkRequestPage: React.FC = () => {
  const { t } = useLanguage();
  const { startWorkRequest } = useBooking();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const serviceParam = searchParams.get('service') || 'plumber';

  const [selectedServiceId, setSelectedServiceId] = useState<string>(serviceParam);
  const activeService =
    SERVICES_DATA.find((s) => s.id === selectedServiceId) || SERVICES_DATA[0];

  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(
    activeService.subcategories[0]?.defaultName || 'Tap Repair & Fitting'
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Intermediate');
  const [description, setDescription] = useState<string>(
    'Wall mixer tap is leaking and cold water handle needs repair.'
  );
  const [location, setLocation] = useState<string>('Tower 4, Sushant Lok 1, Gurgaon');
  const [preferredDate, setPreferredDate] = useState<string>('Today');
  const [preferredTime, setPreferredTime] = useState<string>('11:00 AM');
  const [needsMultipleWorkers, setNeedsMultipleWorkers] = useState<boolean>(false);
  const [workersCount, setWorkersCount] = useState<number>(1);

  // Update subcategory default when service changes
  useEffect(() => {
    if (activeService.subcategories[0]) {
      setSelectedSubcategory(activeService.subcategories[0].defaultName);
    }
  }, [selectedServiceId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startWorkRequest({
      serviceCategory: selectedServiceId,
      subcategory: selectedSubcategory,
      difficulty,
      description,
      location,
      preferredDate,
      preferredTime,
      workersNeeded: needsMultipleWorkers ? workersCount : 1,
    });
    navigate('/employer/match');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-left">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <button
          type="button"
          onClick={() => navigate('/employer')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-rozgo-700 dark:text-rozgo-300 hover:underline mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Services</span>
        </button>

        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
          Create Work Request
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Specify your task requirements so ROZGO can instantly connect you with verified local workers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Selected Service Bar */}
        <Card variant="default" padding="md" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rozgo-100 dark:bg-rozgo-900/60 text-rozgo-900 dark:text-rozgo-200 flex items-center justify-center font-bold">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-neutral-400 font-bold uppercase">Selected Service</span>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                {activeService.defaultName}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/employer')}
            className="text-xs font-bold text-rozgo-700 dark:text-rozgo-300 hover:underline"
          >
            Change
          </button>
        </Card>

        {/* Step 2: Specific Subcategory Task */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Select Specific Task
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeService.subcategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubcategory(sub.defaultName)}
                className={`p-4 rounded-2xl border text-left font-bold text-sm transition-all flex items-center justify-between ${
                  selectedSubcategory === sub.defaultName
                    ? 'bg-rozgo-100 text-rozgo-950 dark:bg-rozgo-900/60 dark:text-white border-rozgo-900 dark:border-rozgo-400 shadow-xs'
                    : 'bg-white dark:bg-darkbg-card text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-darkbg-border hover:bg-neutral-50'
                }`}
              >
                <span>{sub.defaultName}</span>
                {selectedSubcategory === sub.defaultName && (
                  <CheckCircle2 className="w-4 h-4 text-rozgo-900 dark:text-rozgo-300" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Difficulty Level Cards */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Task Difficulty Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Easy */}
            <button
              type="button"
              onClick={() => setDifficulty('Easy')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                difficulty === 'Easy'
                  ? 'bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-darkbg-card text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-darkbg-border'
              }`}
            >
              <div className="font-bold text-base">Easy</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Minor repair, single fixture or quick touchup
              </div>
            </button>

            {/* Intermediate */}
            <button
              type="button"
              onClick={() => setDifficulty('Intermediate')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                difficulty === 'Intermediate'
                  ? 'bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-white border-amber-600 shadow-xs'
                  : 'bg-white dark:bg-darkbg-card text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-darkbg-border'
              }`}
            >
              <div className="font-bold text-base">Intermediate</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Standard replacement, fitting or joint fixing
              </div>
            </button>

            {/* High */}
            <button
              type="button"
              onClick={() => setDifficulty('High')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                difficulty === 'High'
                  ? 'bg-rozgo-100 text-rozgo-950 dark:bg-rozgo-900/60 dark:text-white border-rozgo-900 dark:border-rozgo-400 shadow-xs'
                  : 'bg-white dark:bg-darkbg-card text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-darkbg-border'
              }`}
            >
              <div className="font-bold text-base">High</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Extensive repair, full bathroom or overhaul
              </div>
            </button>
          </div>
        </div>

        {/* Step 4: Description */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Work Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what needs repair or installation..."
            className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rozgo-900 resize-none"
            required
          />
        </div>

        {/* Step 5: Location */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Service Location / Address
          </label>
          <div className="relative flex items-center">
            <MapPin className="w-5 h-5 absolute left-3.5 text-neutral-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Tower 4, Sushant Lok 1, Gurgaon"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rozgo-900"
              required
            />
          </div>
        </div>

        {/* Step 6: Timing & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Preferred Date
            </label>
            <div className="relative flex items-center">
              <Calendar className="w-5 h-5 absolute left-3.5 text-neutral-400" />
              <input
                type="text"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                placeholder="Today or tomorrow"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Preferred Start Time
            </label>
            <div className="relative flex items-center">
              <Clock className="w-5 h-5 absolute left-3.5 text-neutral-400" />
              <input
                type="text"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                placeholder="e.g. 11:00 AM"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                required
              />
            </div>
          </div>
        </div>

        {/* Step 7: Multiple Workers (Majdoor Mitr) */}
        <Card variant="default" padding="lg" className="border border-neutral-200 dark:border-darkbg-border space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={needsMultipleWorkers}
                onChange={(e) => setNeedsMultipleWorkers(e.target.checked)}
                className="w-5 h-5 rounded-md accent-rozgo-900"
              />
              <div>
                <span className="font-bold text-neutral-900 dark:text-white text-base">
                  I need multiple workers (Majdoor Mitr)
                </span>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Select if this task requires helper labour or a multi-person crew.
                </p>
              </div>
            </label>
          </div>

          {needsMultipleWorkers && (
            <div className="pt-4 border-t border-neutral-100 dark:border-darkbg-border flex items-center justify-between animate-fadeIn">
              <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                How many workers do you need?
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setWorkersCount(Math.max(2, workersCount - 1))}
                  className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-darkbg-surface text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold hover:bg-neutral-200 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-black text-rozgo-900 dark:text-white px-2">
                  {workersCount}
                </span>
                <button
                  type="button"
                  onClick={() => setWorkersCount(workersCount + 1)}
                  className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-darkbg-surface text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold hover:bg-neutral-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="xl"
          fullWidth
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          {t('employerFlow.raiseRequestBtn')}
        </Button>
      </form>
    </div>
  );
};

