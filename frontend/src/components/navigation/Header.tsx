import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Globe,
  Sun,
  Moon,
  User,
  Menu,
  X,
  LogIn,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useGrievance } from '../../context/GrievanceContext';
import { Language } from '../../types';
import logoImg from '../../assets/logo.png';

export const Header: React.FC = () => {
  const { language, setLanguage, t, languageOptions } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { role, isLoggedIn, workerUser, employerUser } = useAuth();
  const { activeGrievancesCount } = useGrievance();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const activeUser = role === 'worker' ? workerUser : employerUser;

  const isCurrentActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      const targetHome = role === 'employer' ? '/employer' : '/worker/dashboard';
      navigate(targetHome);
    } else {
      navigate('/');
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  // Hide header on landing, login, and create account / onboarding pages for both worker and employer
  const isCreateAccountOrAuthPage =
    location.pathname === '/' ||
    location.pathname === '/auth/login' ||
    location.pathname === '/auth/create-account' ||
    location.pathname.startsWith('/auth/onboarding') ||
    location.pathname.startsWith('/auth/employer-onboard') ||
    location.pathname.startsWith('/auth/employer-register');

  if (isCreateAccountOrAuthPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-darkbg-base/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-darkbg-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center group select-none py-1 text-left cursor-pointer focus:outline-none"
          title={isLoggedIn ? 'Go to Home' : 'Go to Landing Page'}
        >
          <div className="flex items-center px-1.5 py-1 rounded-2xl dark:bg-white/95 transition-all">
            <img
              src={logoImg}
              alt="ROZGO - Rozgaar Ka Naya Raasta"
              className="h-10 sm:h-12 w-auto max-w-[190px] sm:max-w-[240px] object-contain transition-transform group-hover:scale-[1.02]"
            />
          </div>
        </button>



        {/* Right Actions: About, Language, Theme, Profile / Login */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* About Page Option */}
          <Link
            to="/about"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-neutral-200 dark:border-darkbg-border hover:bg-neutral-100 dark:hover:bg-darkbg-card text-neutral-800 dark:text-neutral-200 text-sm font-bold transition-colors ${
              isCurrentActive('/about')
                ? 'bg-rozgo-100 text-rozgo-900 dark:bg-darkbg-surface dark:text-rozgo-200 border-rozgo-300 dark:border-rozgo-700'
                : ''
            }`}
            title={t('nav.about')}
          >
            <Info className="w-4 h-4 text-rozgo-900 dark:text-rozgo-400" />
            <span className="hidden md:inline">{t('nav.about')}</span>
          </Link>

          {/* Help & Grievance Portal */}
          <Link
            to="/help"
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-neutral-200 dark:border-darkbg-border hover:bg-neutral-100 dark:hover:bg-darkbg-card text-neutral-800 dark:text-neutral-200 text-sm font-bold transition-colors ${
              location.pathname.startsWith('/grievance') || location.pathname === '/help'
                ? 'bg-rozgo-100 text-rozgo-900 dark:bg-darkbg-surface dark:text-rozgo-200 border-rozgo-300 dark:border-rozgo-700'
                : ''
            }`}
            title={t('nav.helpGrievance')}
          >
            <ShieldAlert className="w-4 h-4 text-rozgo-900 dark:text-rozgo-400" />
            <span className="hidden md:inline">{t('nav.helpGrievance')}</span>
            {activeGrievancesCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </Link>

          {/* Language Selector Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-neutral-200 dark:border-darkbg-border hover:bg-neutral-100 dark:hover:bg-darkbg-card text-neutral-800 dark:text-neutral-200 text-sm font-bold transition-colors"
              aria-label="Select language"
              aria-expanded={isLangOpen}
            >
              <Globe className="w-4 h-4 text-rozgo-900 dark:text-rozgo-400" />
              <span className="uppercase">{language}</span>
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-darkbg-card rounded-2xl shadow-xl border border-neutral-200 dark:border-darkbg-border py-2 z-50 animate-fadeIn max-h-80 overflow-y-auto">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-darkbg-border mb-1">
                  Choose Language (8)
                </div>
                {languageOptions.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => {
                      setLanguage(opt.code as Language);
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-sm text-left hover:bg-rozgo-50 dark:hover:bg-darkbg-surface transition-colors ${
                      language === opt.code
                        ? 'font-bold text-rozgo-900 dark:text-rozgo-300 bg-rozgo-50/70 dark:bg-darkbg-surface'
                        : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span>{opt.nativeLabel}</span>
                    <span className="text-xs text-neutral-400 font-normal">({opt.label})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl border border-neutral-200 dark:border-darkbg-border hover:bg-neutral-100 dark:hover:bg-darkbg-card text-neutral-700 dark:text-neutral-300 transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-neutral-700" />
            )}
          </button>

          {/* Profile CTA / Login */}
          {isLoggedIn ? (
            <Link
              to={role === 'worker' ? '/worker/profile' : '/employer/profile'}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-rozgo-900 hover:bg-rozgo-800 text-white font-bold text-sm shadow-soft transition-all active:scale-95"
            >
              <User className="w-4 h-4 text-rozgo-200" />
              <span className="hidden md:inline max-w-[100px] truncate">{activeUser.name}</span>
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rozgo-900 hover:bg-rozgo-800 text-white font-bold text-sm shadow-soft transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4 text-rozgo-200" />
              <span>{t('nav.login')}</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-2xl lg:hidden border border-neutral-200 dark:border-darkbg-border text-neutral-700 dark:text-neutral-300"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 dark:border-darkbg-border bg-white dark:bg-darkbg-base px-5 py-6 space-y-4 animate-fadeIn">
          {isLoggedIn ? (
            <>
              <div className="flex flex-col space-y-2 pt-1">
                <Link
                  to="/about"
                  className="px-4 py-3 rounded-2xl font-bold text-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-darkbg-card flex items-center gap-2"
                >
                  <Info className="w-4 h-4 text-rozgo-900 dark:text-rozgo-400" />
                  {t('nav.about')}
                </Link>
                <Link
                  to="/help"
                  className="px-4 py-3 rounded-2xl font-bold text-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-darkbg-card flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rozgo-900 dark:text-rozgo-400" />
                    <span>{t('nav.helpGrievance')}</span>
                  </div>
                  {activeGrievancesCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      {activeGrievancesCount}
                    </span>
                  )}
                </Link>
                <Link
                  to={role === 'worker' ? '/worker/profile' : '/employer/profile'}
                  className="px-4 py-3 rounded-2xl font-bold text-rozgo-900 dark:text-rozgo-300 bg-rozgo-50 dark:bg-darkbg-card flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>{t('nav.profile')} ({activeUser.name})</span>
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col space-y-2">
              <Link
                to="/about"
                className="px-4 py-3 rounded-2xl font-bold text-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-darkbg-card flex items-center gap-2"
              >
                <Info className="w-4 h-4 text-rozgo-900 dark:text-rozgo-400" />
                {t('nav.about')}
              </Link>
              <Link
                to="/help"
                className="px-4 py-3 rounded-2xl font-bold text-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-darkbg-card flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-rozgo-900 dark:text-rozgo-400" />
                <span>{t('nav.helpGrievance')}</span>
              </Link>
              <div className="pt-3 border-t border-neutral-100 dark:border-darkbg-border flex flex-col gap-2">
                <Link
                  to="/auth/login"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rozgo-900 text-white font-bold"
                >
                  <LogIn className="w-4 h-4 text-rozgo-200" />
                  <span>{t('nav.login')}</span>
                </Link>
                <Link
                  to="/auth/create-account"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-neutral-300 dark:border-darkbg-border font-bold text-neutral-800 dark:text-neutral-200"
                >
                  <span>{t('auth.createAccount')}</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

