import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Users, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import logoImg from '../../assets/logo.png';

export const RoleSelectPage: React.FC = () => {
  const { t } = useLanguage();
  const { setRole } = useAuth();
  const navigate = useNavigate();

  const handleSelectWorker = () => {
    setRole('worker');
    navigate('/auth/onboarding');
  };

  const handleSelectEmployer = () => {
    setRole('employer');
    navigate('/auth/employer-onboard');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14 space-y-4">
        <Link to="/" className="inline-block group" title="Return to Home">
          <div className="w-full max-w-[280px] sm:max-w-[320px] p-4 sm:p-5 rounded-3xl bg-white shadow-soft border border-neutral-200/90 dark:border-neutral-700 transition-all group-hover:scale-[1.03] mx-auto">
            <img
              src={logoImg}
              alt="ROZGO - Rozgaar Ka Naya Raasta"
              className="h-20 sm:h-24 w-auto max-w-[260px] sm:max-w-[300px] object-contain mx-auto"
            />
          </div>
        </Link>
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            {t('auth.selectRoleTitle')}
          </h2>
          <p className="text-base text-neutral-600 dark:text-neutral-400 mt-1">
            {t('auth.selectRoleSub')}
          </p>
        </div>
      </div>

      {/* Two Large Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Card 1: Worker */}
        <Card
          variant="interactive"
          padding="xl"
          onClick={handleSelectWorker}
          className="flex flex-col justify-between group border-2 hover:border-rozgo-900 dark:hover:border-rozgo-400"
        >
          <div className="space-y-5">
            <div className="w-18 h-18 rounded-3xl bg-rozgo-100 dark:bg-rozgo-900/40 text-rozgo-900 dark:text-rozgo-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rozgo-700 dark:text-rozgo-400">
                For Local Workers & Labour
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                {t('auth.workerRoleTitle')}
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {t('auth.workerRoleDesc')}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-rozgo-700 dark:text-rozgo-400" />
              <span>Get verified ROZGO Labour No. (RZG-XXXXXX)</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-darkbg-border flex items-center justify-between text-rozgo-900 dark:text-rozgo-300 font-bold">
            <span>Register as Worker</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </Card>

        {/* Card 2: Employer */}
        <Card
          variant="interactive"
          padding="xl"
          onClick={handleSelectEmployer}
          className="flex flex-col justify-between group border-2 hover:border-rozgo-900 dark:hover:border-rozgo-400"
        >
          <div className="space-y-5">
            <div className="w-18 h-18 rounded-3xl bg-neutral-100 dark:bg-darkbg-surface text-neutral-800 dark:text-neutral-200 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                For Households & Businesses
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                {t('auth.employerRoleTitle')}
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {t('auth.employerRoleDesc')}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-rozgo-700 dark:text-rozgo-400" />
              <span>Get verified ROZGO Employer ID (RZE-XXXXXX)</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-darkbg-border flex items-center justify-between text-rozgo-900 dark:text-rozgo-300 font-bold">
            <span>Register as Employer</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </Card>
      </div>

      <div className="text-center mt-10">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-bold text-rozgo-900 dark:text-rozgo-300 underline hover:opacity-80">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

