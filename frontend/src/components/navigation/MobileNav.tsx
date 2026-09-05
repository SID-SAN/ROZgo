import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Briefcase, Users, FileText, User, Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const MobileNav: React.FC = () => {
  const { role, isLoggedIn } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  // Hide mobile bottom nav on all auth/create-account/onboarding pages
  if (location.pathname.startsWith('/auth')) {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-darkbg-base/95 backdrop-blur-lg border-t border-neutral-200/90 dark:border-darkbg-border pb-safe transition-colors">
      <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 font-bold text-[11px] transition-colors ${
              isActive
                ? 'text-rozgo-900 dark:text-rozgo-300'
                : 'text-neutral-500 dark:text-neutral-400'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        {!isLoggedIn ? (
          <>
            <NavLink
              to="/employer"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 font-bold text-[11px] transition-colors ${
                  isActive
                    ? 'text-rozgo-900 dark:text-rozgo-300'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`
              }
            >
              <Users className="w-5 h-5" />
              <span>{t('nav.findWorkers')}</span>
            </NavLink>

            <NavLink
              to="/worker/find-work"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 font-bold text-[11px] transition-colors ${
                  isActive
                    ? 'text-rozgo-900 dark:text-rozgo-300'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`
              }
            >
              <Briefcase className="w-5 h-5" />
              <span>{t('nav.findWork')}</span>
            </NavLink>

            <NavLink
              to="/auth/login"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 font-bold text-[11px] transition-colors ${
                  isActive
                    ? 'text-rozgo-900 dark:text-rozgo-300'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`
              }
            >
              <LogIn className="w-5 h-5 text-rozgo-900 dark:text-rozgo-300" />
              <span className="font-bold text-rozgo-900 dark:text-rozgo-300">{t('nav.login')}</span>
            </NavLink>
          </>
        ) : role === 'worker' ? (
          <>
            <NavLink
              to="/worker/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 font-bold text-[11px] transition-colors ${
                  isActive
                    ? 'text-rozgo-900 dark:text-rozgo-300'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`
              }
            >
              <Sparkles className="w-5 h-5" />
              <span>{t('nav.dashboard')}</span>
            </NavLink>

            <NavLink
              to="/worker/find-work"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 font-bold text-[11px] transition-colors ${
                  isActive
                    ? 'text-rozgo-900 dark:text-rozgo-300'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`
              }
            >
              <Briefcase className="w-5 h-5" />
              <span>{t('nav.findWork')}</span>
            </NavLink>

            <NavLink
              to="/worker/profile"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 font-bold text-[11px] transition-colors ${
                  isActive
                    ? 'text-rozgo-900 dark:text-rozgo-300'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`
              }
            >
              <User className="w-5 h-5" />
              <span>{t('nav.profile')}</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/employer"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 font-bold text-[11px] transition-colors ${
                  isActive
                    ? 'text-rozgo-900 dark:text-rozgo-300'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`
              }
            >
              <Users className="w-5 h-5" />
              <span>{t('nav.findWorkers')}</span>
            </NavLink>

            <NavLink
              to="/employer/requests"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 font-bold text-[11px] transition-colors ${
                  isActive
                    ? 'text-rozgo-900 dark:text-rozgo-300'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`
              }
            >
              <FileText className="w-5 h-5" />
              <span>{t('nav.myRequests')}</span>
            </NavLink>

            <NavLink
              to="/employer/profile"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 font-bold text-[11px] transition-colors ${
                  isActive
                    ? 'text-rozgo-900 dark:text-rozgo-300'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`
              }
            >
              <User className="w-5 h-5" />
              <span>{t('nav.profile')}</span>
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};
