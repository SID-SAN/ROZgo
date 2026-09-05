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
  Layers,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { SERVICES_DATA } from '../../data/servicesData';
import { DifficultyLevel } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const CreateWorkRequestPage: React.FC = () => {
  const { t } = useLanguage();
  const { startWorkRequest } = useBooking();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const serviceParam = searchParams.get('service') || 'plumber';

  // Multi-field selection state
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([serviceParam]);
  const [tasksByService, setTasksByService] = useState<Record<string, string>>({
    [serviceParam]:
      SERVICES_DATA.find((s) => s.id === serviceParam)?.subcategories[0]?.defaultName ||
      'Tap Repair & Fitting',
  });

  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Intermediate');
  const [description, setDescription] = useState<string>(
    'Need plumbing and masonry work for washroom tile repair and mixer tap replacement.'
  );
  const [location, setLocation] = useState<string>('Tower 4, Sushant Lok 1, Gurgaon');
  const [preferredDate, setPreferredDate] = useState<string>('Today');
  const [preferredTime, setPreferredTime] = useState<string>('11:00 AM');
  const [needsMultipleWorkers, setNeedsMultipleWorkers] = useState<boolean>(false);
  const [workersCount, setWorkersCount] = useState<number>(1);

  // Toggle or add/remove a service category
  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((id) => id !== serviceId);
      } else {
        const svc = SERVICES_DATA.find((s) => s.id === serviceId);
        const defaultSub = svc?.subcategories[0]?.defaultName || `${svc?.defaultName} Work`;
        setTasksByService((tPrev) => ({ ...tPrev, [serviceId]: defaultSub }));
        return [...prev, serviceId];
      }
    });
  };

  const handleSubcategoryChange = (serviceId: string, subName: string) => {
    setTasksByService((prev) => ({
      ...prev,
      [serviceId]: subName,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startWorkRequest({
      serviceCategories: selectedServiceIds,
      categoryTasks: tasksByService,
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-left animate-fadeIn">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <button
          type="button"
          onClick={() => navigate('/employer')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-rozgo-700 dark:text-rozgo-300 hover:underline mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Services</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
              Create Work Request
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Select one or more trades simultaneously so ROZGO can connect you with verified local workers across fields.
            </p>
          </div>

          {selectedServiceIds.length > 1 && (
            <Badge variant="primary" size="md" className="shrink-0">
              <Layers className="w-4 h-4 mr-1.5" />
              <span>{selectedServiceIds.length} Simultaneous Trades</span>
            </Badge>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Multi-Trade Selection Chips */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Step 1: Choose Trade Fields (Select multiple if required)
            </label>
            <span className="text-xs font-medium text-neutral-400">
              {selectedServiceIds.length} field(s) selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {SERVICES_DATA.map((service) => {
              const isSelected = selectedServiceIds.includes(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service.id)}
                  className={`p-3.5 rounded-2xl border text-left font-bold text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-rozgo-900 text-white dark:bg-rozgo-700 dark:text-white border-rozgo-900 shadow-sm ring-2 ring-rozgo-400/50'
                      : 'bg-white dark:bg-darkbg-card text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-darkbg-border hover:bg-neutral-50 dark:hover:bg-darkbg-surface'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate">{service.defaultName}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Tip: You can select both <strong>Plumber</strong> and <strong>Mason (Rajmistri)</strong> together to book and coordinate both workers simultaneously in one go.
          </p>
        </div>

        {/* Step 2: Specific Tasks for Each Selected Field */}
        <div className="space-y-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Step 2: Specific Tasks for Selected Trades
          </label>

          {selectedServiceIds.map((serviceId, index) => {
            const service = SERVICES_DATA.find((s) => s.id === serviceId);
            if (!service) return null;
            const currentSubtask =
              tasksByService[serviceId] || service.subcategories[0]?.defaultName || 'General Task';

            return (
              <Card
                key={serviceId}
                variant="default"
                padding="md"
                className="space-y-3 border-2 border-rozgo-200 dark:border-rozgo-900/60"
              >
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-darkbg-border">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-rozgo-100 dark:bg-rozgo-900/60 text-rozgo-900 dark:text-rozgo-200 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                      {service.defaultName} Task
                    </h3>
                  </div>

                  {selectedServiceIds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => toggleService(serviceId)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove Field</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {service.subcategories.map((sub) => {
                    const isSubSelected = currentSubtask === sub.defaultName;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleSubcategoryChange(serviceId, sub.defaultName)}
                        className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isSubSelected
                            ? 'bg-rozgo-100 text-rozgo-950 dark:bg-rozgo-900/80 dark:text-white border-rozgo-900 dark:border-rozgo-400 shadow-xs'
                            : 'bg-neutral-50 dark:bg-darkbg-surface text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-darkbg-border hover:bg-neutral-100'
                        }`}
                      >
                        <span className="truncate">{sub.defaultName}</span>
                        {isSubSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-rozgo-900 dark:text-rozgo-300 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Step 3: Difficulty Level Cards */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Step 3: Task Difficulty Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setDifficulty('Easy')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
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

            <button
              type="button"
              onClick={() => setDifficulty('Intermediate')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
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

            <button
              type="button"
              onClick={() => setDifficulty('High')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                difficulty === 'High'
                  ? 'bg-rozgo-100 text-rozgo-950 dark:bg-rozgo-900/60 dark:text-white border-rozgo-900 dark:border-rozgo-400 shadow-xs'
                  : 'bg-white dark:bg-darkbg-card text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-darkbg-border'
              }`}
            >
              <div className="font-bold text-base">High</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Extensive repair, overhaul or multiple areas
              </div>
            </button>
          </div>
        </div>

        {/* Step 4: Description */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Step 4: Combined Work Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what needs repair or installation for your requested trade(s)..."
            className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rozgo-900 resize-none"
            required
          />
        </div>

        {/* Step 5: Location */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Step 5: Service Location / Address
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
                className="w-5 h-5 rounded-md accent-rozgo-900 cursor-pointer"
              />
              <div>
                <span className="font-bold text-neutral-900 dark:text-white text-base">
                  I need multiple helpers / workers (Majdoor Mitr)
                </span>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Select if this task requires additional helper labour or a multi-person crew.
                </p>
              </div>
            </label>
          </div>

          {needsMultipleWorkers && (
            <div className="pt-4 border-t border-neutral-100 dark:border-darkbg-border flex items-center justify-between animate-fadeIn">
              <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                How many workers per field?
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setWorkersCount(Math.max(2, workersCount - 1))}
                  className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-darkbg-surface text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-black text-rozgo-900 dark:text-white px-2">
                  {workersCount}
                </span>
                <button
                  type="button"
                  onClick={() => setWorkersCount(workersCount + 1)}
                  className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-darkbg-surface text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold hover:bg-neutral-200 transition-colors cursor-pointer"
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
          {selectedServiceIds.length > 1
            ? `Find Verified Workers for ${selectedServiceIds.length} Trades →`
            : t('employerFlow.raiseRequestBtn')}
        </Button>
      </form>
    </div>
  );
};
