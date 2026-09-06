import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { SERVICES_DATA } from '../../data/servicesData';
import { ServiceCard } from '../../components/services/ServiceCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const EmployerHomePage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { activeAgreements } = useBooking();
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service');

  const activeBooking = activeAgreements.find(
    (b) => b.status === 'confirmed' || b.status === 'awaiting_confirmation'
  );

  const handleSelectService = (serviceId: string) => {
    navigate(`/employer/request?service=${serviceId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 text-left">
      {/* Ongoing / Accepted Work Status Banner */}
      {activeBooking && (
        <div
          className={`p-4 sm:p-5 rounded-3xl border-2 shadow-soft transition-all ${
            activeBooking.status === 'confirmed'
              ? 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-100/40 dark:from-darkbg-card dark:to-emerald-950/20 border-emerald-400 dark:border-emerald-700/80'
              : 'bg-amber-50/90 dark:bg-darkbg-card border-amber-300 dark:border-amber-700/60'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  activeBooking.status === 'confirmed'
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                }`}
              >
                {activeBooking.status === 'confirmed' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                ) : (
                  <Clock className="w-6 h-6 text-amber-700 dark:text-amber-400 animate-pulse" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      activeBooking.status === 'confirmed'
                        ? 'bg-emerald-500 animate-pulse'
                        : 'bg-amber-500 animate-pulse'
                    }`}
                  />
                  <Badge
                    variant={activeBooking.status === 'confirmed' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {activeBooking.status === 'confirmed'
                      ? 'WORK ACCEPTED • ONGOING JOB'
                      : 'WAITING FOR WORKER CONFIRMATION'}
                  </Badge>
                </div>
                <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
                  {activeBooking.status === 'confirmed'
                    ? `Worker Accepted: ${activeBooking.workTitle}`
                    : `Terms Sent: ${activeBooking.workTitle}`}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {activeBooking.status === 'confirmed'
                    ? `${activeBooking.workers[0]?.name || 'Worker'} has accepted the agreed wage of ₹${activeBooking.agreedWage.toLocaleString()}. The job is now active.`
                    : `Waiting for ${activeBooking.workers[0]?.name || 'the worker'} to accept ₹${activeBooking.agreedWage.toLocaleString()} agreed wage.`}
                </p>
              </div>
            </div>

            <Button
              variant={activeBooking.status === 'confirmed' ? 'success' : 'primary'}
              size="md"
              onClick={() => navigate('/employer/requests')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="shrink-0 font-bold w-full sm:w-auto shadow-xs"
            >
              {activeBooking.status === 'confirmed' ? 'View Ongoing Job' : 'Track Status'}
            </Button>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-200/80 dark:border-darkbg-border">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rozgo-100 dark:bg-darkbg-card text-rozgo-900 dark:text-rozgo-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Citizen-to-Worker Connection</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
            {t('employerFlow.heading')}
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {t('employerFlow.subheading')} Call directly, agree on fair wages without middleman cuts, and book with dignified agreements.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/employer/requests')}
          >
            {t('nav.myRequests')}
          </Button>
        </div>
      </div>

      {/* Responsive Services Grid: 4-col desktop, 2-3 tablet, 1-2 mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {SERVICES_DATA.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isSelected={preselectedService === service.id}
            onClick={() => handleSelectService(service.id)}
          />
        ))}
      </div>

      {/* Dignity & Transparency Statement */}
      <Card variant="elevated" padding="lg" className="bg-rozgo-50/70 dark:bg-darkbg-surface border border-rozgo-200 dark:border-darkbg-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rozgo-900 dark:text-rozgo-200 font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-rozgo-700" />
              <span>ROZGO Direct Connection Guarantee</span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-2xl leading-relaxed">
              Every worker on ROZGO possesses a verified Labour ID. You negotiate wages directly over a call and confirm the booking once both parties agree.
            </p>
          </div>

          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/about')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Learn How It Works
          </Button>
        </div>
      </Card>
    </div>
  );
};

