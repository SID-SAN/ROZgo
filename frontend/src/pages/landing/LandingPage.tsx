import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  Users,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HeartHandshake,
  MapPin,
  Clock,
  LogIn,
  UserPlus,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Language } from '../../types';
import { SERVICES_DATA } from '../../data/servicesData';
import { ServiceCard } from '../../components/services/ServiceCard';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import logoImg from '../../assets/logo.png';

export const LandingPage: React.FC = () => {
  const { language, setLanguage, t, languageOptions } = useLanguage();
  const { setRole, isLoggedIn } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isLangOpen, setIsLangOpen] = useState(false);

  const handleFindWorker = () => {
    if (isLoggedIn) {
      setRole('employer');
      navigate('/employer');
    } else {
      navigate('/auth/login?role=employer');
    }
  };

  const handleFindWork = () => {
    if (isLoggedIn) {
      setRole('worker');
      navigate('/worker/dashboard');
    } else {
      navigate('/auth/login?role=worker');
    }
  };

  const handleServiceClick = (serviceId: string) => {
    if (isLoggedIn) {
      setRole('employer');
      navigate(`/employer?service=${serviceId}`);
    } else {
      navigate(`/auth/login?role=employer&service=${serviceId}`);
    }
  };

  const handleJoinRozgo = () => {
    navigate('/auth/create-account');
  };

  return (
    <div className="flex flex-col gap-16 sm:gap-24 pt-16 sm:pt-16 lg:pt-28 pb-8 sm:pb-12">
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4 sm:pt-8 lg:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            {/* Main Headline */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black text-neutral-900 dark:text-white tracking-tight leading-[1.08]">
                <span className="block text-rozgo-900 dark:text-rozgo-300">{t('landing.heroLine1')}</span>
                <span className="block">{t('landing.heroLine2')}</span>
                <span className="block text-neutral-800 dark:text-neutral-200">{t('landing.heroLine3')}</span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-xl leading-relaxed">
              {t('landing.heroSub')}
            </p>

            {/* Dual CTAs with large buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-4 sm:pt-5">
              <Button
                variant="primary"
                size="xl"
                onClick={handleFindWorker}
                leftIcon={<Users className="w-5 h-5 text-rozgo-300" />}
                className="shadow-soft-lg"
              >
                {t('landing.findWorkerCta')}
              </Button>

              <Button
                variant="secondary"
                size="xl"
                onClick={handleFindWork}
                leftIcon={<Wrench className="w-5 h-5 text-rozgo-700 dark:text-rozgo-400" />}
              >
                {t('landing.findWorkCta')}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Zero Commission Cuts</span>
              </div>
              <span className="text-neutral-300 dark:text-neutral-600">•</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rozgo-700 dark:text-rozgo-400" />
                <span>Verified ROZGO Labour IDs</span>
              </div>
              <span className="text-neutral-300 dark:text-neutral-600">•</span>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-rozgo-700 dark:text-rozgo-400" />
                <span>Direct Phone Negotiation</span>
              </div>
            </div>
          </div>

          {/* Right Hero Column */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Decorative background glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-rozgo-200 to-rozgo-400 dark:from-rozgo-900/40 dark:to-rozgo-700/20 rounded-3xl blur-xl opacity-60 dark:opacity-30" />

              {!isLoggedIn ? (
                /* Guest State Card: Big ROZGO Logo + Login + Create Account */
                <Card
                  variant="elevated"
                  padding="none"
                  className="relative overflow-hidden bg-white/95 dark:bg-darkbg-card/95 backdrop-blur-md border-2 border-rozgo-200 dark:border-darkbg-border shadow-soft-xl rounded-3xl"
                >
                  {/* Card Top Utility Bar: Cooperative Badge + Language & Theme */}
                  <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-neutral-100 dark:border-darkbg-border bg-neutral-50/50 dark:bg-darkbg-surface/50">
                    <Badge variant="primary" size="sm">
                      Cooperative Platform
                    </Badge>
                    <div className="flex items-center gap-2">
                      {/* Language dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsLangOpen(!isLangOpen)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-darkbg-border hover:bg-neutral-100 dark:hover:bg-darkbg-surface text-neutral-700 dark:text-neutral-300 text-xs font-bold transition-colors"
                          title="Change Language"
                        >
                          <Globe className="w-3.5 h-3.5 text-rozgo-800 dark:text-rozgo-400" />
                          <span className="uppercase">{language}</span>
                        </button>
                        {isLangOpen && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-darkbg-card rounded-2xl shadow-2xl border border-neutral-200 dark:border-darkbg-border py-1.5 z-50 animate-fadeIn max-h-60 overflow-y-auto">
                            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-darkbg-border mb-1">
                              Select Language
                            </div>
                            {languageOptions.map((opt) => (
                              <button
                                key={opt.code}
                                type="button"
                                onClick={() => {
                                  setLanguage(opt.code as Language);
                                  setIsLangOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-rozgo-50 dark:hover:bg-darkbg-surface transition-colors ${
                                  language === opt.code
                                    ? 'font-bold text-rozgo-900 dark:text-rozgo-300 bg-rozgo-50/70 dark:bg-darkbg-surface'
                                    : 'text-neutral-700 dark:text-neutral-300'
                                }`}
                              >
                                <span>{opt.nativeLabel}</span>
                                <span className="text-[10px] text-neutral-400 uppercase">{opt.code}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Theme toggle */}
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="p-1.5 rounded-xl border border-neutral-200 dark:border-darkbg-border hover:bg-neutral-100 dark:hover:bg-darkbg-surface text-neutral-700 dark:text-neutral-300 transition-colors"
                        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                      >
                        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
                      </button>
                    </div>
                  </div>

                  {/* Main Guest Card Body */}
                  <div className="p-6 sm:p-7 text-center flex flex-col items-center">
                    {/* Big ROZGO Logo */}
                    <div className="w-full max-w-[280px] sm:max-w-[320px] p-4 rounded-2xl bg-white shadow-sm border border-neutral-200/80 dark:border-neutral-700 mb-4 transition-transform hover:scale-[1.02]">
                      <img
                        src={logoImg}
                        alt="ROZGO - Rozgaar Ka Naya Raasta"
                        className="w-full h-auto max-h-24 sm:max-h-28 object-contain mx-auto"
                      />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                      Rozgaar Ka Naya Raasta
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-1.5 max-w-xs leading-relaxed">
                      Zero Commission • Direct Phone Negotiations • Fair Daily Earnings
                    </p>

                    {/* Action Buttons: Login and Create Account */}
                    <div className="w-full space-y-3 mt-6">
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={() => navigate('/auth/login')}
                        leftIcon={<LogIn className="w-5 h-5" />}
                        className="shadow-soft-md text-base font-bold py-3.5"
                      >
                        Login
                      </Button>

                      <Button
                        variant="secondary"
                        size="lg"
                        fullWidth
                        onClick={() => navigate('/auth/create-account')}
                        leftIcon={<UserPlus className="w-5 h-5 text-rozgo-800 dark:text-rozgo-300" />}
                        className="text-base font-bold py-3.5 border-2 border-rozgo-800/20 dark:border-rozgo-400/20 hover:border-rozgo-800 dark:hover:border-rozgo-300"
                      >
                        Create Account
                      </Button>
                    </div>

                    {/* Trust Footnote */}
                    <div className="flex items-center justify-center gap-3 pt-5 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>100% Free Sign Up</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-rozgo-700 dark:text-rozgo-400" />
                        <span>Verified Profiles</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                /* Logged In State: Illustrative Live Opportunity Card */
                <Card
                  variant="elevated"
                  padding="lg"
                  className="relative bg-white/95 dark:bg-darkbg-card/95 backdrop-blur-md border-2 border-rozgo-200 dark:border-darkbg-border shadow-soft-lg"
                >
                  {/* Card Tag */}
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-darkbg-border mb-4">
                    <span className="text-xs font-black uppercase tracking-wider text-rozgo-900 dark:text-rozgo-300">
                      {t('landing.cardPreviewBadge')}
                    </span>
                    <Badge variant="verified" size="sm">
                      Verified Match
                    </Badge>
                  </div>

                  {/* Job Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        Plumbing Service
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-0.5">
                        Tap Repair & Leak Fix
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-darkbg-surface p-3.5 rounded-2xl border border-neutral-100 dark:border-darkbg-border mb-4">
                    "Bathroom wall mixer dripping continuously. Need washer change & pipe check."
                  </p>

                  {/* Badges */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-5">
                    <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-rozgo-50 dark:bg-darkbg-surface text-rozgo-900 dark:text-rozgo-300 font-bold">
                      <MapPin className="w-4 h-4 text-rozgo-700 dark:text-rozgo-400" />
                      <span>2.4 km away</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-rozgo-50 dark:bg-darkbg-surface text-rozgo-900 dark:text-rozgo-300 font-bold">
                      <Users className="w-4 h-4 text-rozgo-700 dark:text-rozgo-400" />
                      <span>1 worker needed</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={handleFindWork}
                  >
                    {t('landing.viewWork')}
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR SERVICES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {t('landing.servicesTitle')}
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
            {t('landing.servicesSubtitle')}
          </p>
        </div>

        {/* 5-column responsive grid showing top 5 services */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {SERVICES_DATA.slice(0, 5).map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={() => handleServiceClick(service.id)}
            />
          ))}
        </div>
      </section>

      {/* 3. HOW ROZGO WORKS (4 CLEAR STEPS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {t('landing.howItWorksTitle')}
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2">
            {t('landing.howItWorksSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <Card variant="elevated" padding="lg" className="relative flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-4xl font-black text-rozgo-900/30 dark:text-rozgo-400/30">
                01
              </span>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                {t('landing.step1Title')}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t('landing.step1Desc')}
              </p>
            </div>
          </Card>

          {/* Step 2 */}
          <Card variant="elevated" padding="lg" className="relative flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-4xl font-black text-rozgo-900/30 dark:text-rozgo-400/30">
                02
              </span>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                {t('landing.step2Title')}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t('landing.step2Desc')}
              </p>
            </div>
          </Card>

          {/* Step 3 */}
          <Card variant="elevated" padding="lg" className="relative flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-4xl font-black text-rozgo-900/30 dark:text-rozgo-400/30">
                03
              </span>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                {t('landing.step3Title')}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t('landing.step3Desc')}
              </p>
            </div>
          </Card>

          {/* Step 4 */}
          <Card variant="elevated" padding="lg" className="relative flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-4xl font-black text-rozgo-900/30 dark:text-rozgo-400/30">
                04
              </span>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                {t('landing.step4Title')}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t('landing.step4Desc')}
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* 4. COOPERATIVE SECTION (DEEP ROZGO GREEN CTA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative overflow-hidden rounded-3xl bg-rozgo-900 text-white p-8 sm:p-14 shadow-2xl">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-rozgo-800/60 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rozgo-800 text-rozgo-200 border border-rozgo-700 text-xs font-bold uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4 text-rozgo-300" />
              <span>Civic Cooperative Platform</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {t('landing.cooperativeHeading')}
            </h2>

            <p className="text-base sm:text-lg text-rozgo-100/90 leading-relaxed">
              {t('landing.cooperativeBody')}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleFindWorker}
                className="bg-white text-rozgo-900 hover:bg-neutral-100"
              >
                {t('landing.bookServiceBtn')}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleJoinRozgo}
                className="border-white text-white hover:bg-rozgo-800"
              >
                {t('landing.joinRozgoBtn')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

