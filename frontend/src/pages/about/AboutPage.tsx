import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  ShieldCheck,
  Phone,
  Users,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Award,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const AboutPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 text-left">
      {/* 1. HERO HEADER */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rozgo-100 dark:bg-darkbg-card text-rozgo-900 dark:text-rozgo-300 text-xs sm:text-sm font-bold">
          <HeartHandshake className="w-4 h-4 text-rozgo-700 dark:text-rozgo-400" />
          <span>{t('about.badge')}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
          {t('about.title')}
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
          {t('about.subtitle')}
        </p>
      </section>

      {/* 2. WHAT IS ROZGO & THE COOPERATIVE MODEL */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <Card variant="elevated" padding="xl" className="space-y-4 border border-neutral-200 dark:border-darkbg-border">
          <div className="w-14 h-14 rounded-2xl bg-rozgo-100 dark:bg-rozgo-900/60 text-rozgo-900 dark:text-rozgo-200 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t('about.whatIsTitle')}
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {t('about.whatIsDesc')} We provide identity, verified matchmaking, and formal agreement generation, while allowing the worker and customer to talk directly.
          </p>
        </Card>

        <Card variant="elevated" padding="xl" className="space-y-4 border border-neutral-200 dark:border-darkbg-border">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t('about.modelTitle')}
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {t('about.modelDesc')} By keeping negotiation direct over phone calls, workers establish dignity, build their personal brand, and retain full earnings.
          </p>
        </Card>
      </section>

      {/* 3. FOR WORKERS & FOR EMPLOYERS */}
      <section className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white text-center">
          Designed for Everyone
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* For Workers */}
          <Card variant="default" padding="lg" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rozgo-900 text-white flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                For Workers & Labourers
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Permanent ROZGO Labour ID (RZG-XXXXXX) usable for life.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Swipe-style job opportunities matched strictly to your skill.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Zero commission cuts — earn exactly what you agree on.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Majdoor Mitr: Invite friends or helper workers to bigger projects.</span>
              </li>
            </ul>
          </Card>

          {/* For Employers */}
          <Card variant="default" padding="lg" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rozgo-900 text-white flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                For Employers & Households
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Instant connection with nearby verified tradespeople.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Direct phone call to agree on wages, time, and worker count.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Formal ROZGO booking agreement document for transparency.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Direct hire by Labour ID when someone refers a great worker.</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* 4. TRUST & VERIFICATION */}
      <section className="p-8 sm:p-12 rounded-3xl bg-neutral-100 dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border space-y-4">
        <div className="flex items-center gap-2 text-rozgo-900 dark:text-rozgo-300 font-bold text-sm uppercase tracking-wider">
          <ShieldCheck className="w-5 h-5 text-rozgo-700 dark:text-rozgo-400" />
          <span>Trust, Dignity & Transparency</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
          {t('about.trustTitle')}
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
          {t('about.trustDesc')} We believe workers are dignified professionals, not mere commoditized gig labour. Ratings and agreements build mutual accountability and lasting community trust.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/auth/create-account')}
          >
            Join the Cooperative
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/employer')}
          >
            Find a Local Worker
          </Button>
        </div>
      </section>
    </div>
  );
};

