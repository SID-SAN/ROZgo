import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, PhoneCall, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/logo.png';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const { isLoggedIn, role } = useAuth();
  const navigate = useNavigate();

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

  return (
    <footer className="bg-rozgo-900 text-white mt-auto border-t border-rozgo-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-rozgo-800/80">
          {/* Brand Col (2 spans) */}
          <div className="lg:col-span-2 space-y-4">
            <button
              type="button"
              onClick={handleLogoClick}
              className="inline-flex items-center group cursor-pointer focus:outline-none text-left"
              title={isLoggedIn ? 'Go to Home' : 'Go to Landing Page'}
            >
              <div className="bg-white/95 px-3 py-1.5 rounded-2xl shadow-soft transition-transform group-hover:scale-[1.02]">
                <img
                  src={logoImg}
                  alt="ROZGO - Rozgaar Ka Naya Raasta"
                  className="h-10 w-auto max-w-[200px] object-contain"
                />
              </div>
            </button>

            <p className="text-sm text-rozgo-100/80 leading-relaxed max-w-sm">
              {t('landing.footerMission')}
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rozgo-800 text-rozgo-200 border border-rozgo-700">
                <ShieldCheck className="w-4 h-4 text-rozgo-300" />
                <span>Verified Labour Identity</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rozgo-800 text-rozgo-200 border border-rozgo-700">
                <HeartHandshake className="w-4 h-4 text-rozgo-300" />
                <span>Zero Commission Cuts</span>
              </span>
            </div>
          </div>

          {/* Col 1: Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-rozgo-200">
              {t('landing.footerColServices')}
            </h4>
            <ul className="space-y-2.5 text-sm text-rozgo-100/80">
              <li>
                <Link to="/employer?service=plumber" className="hover:text-white transition-colors">
                  {t('services.plumber')}
                </Link>
              </li>
              <li>
                <Link to="/employer?service=electrician" className="hover:text-white transition-colors">
                  {t('services.electrician')}
                </Link>
              </li>
              <li>
                <Link to="/employer?service=carpenter" className="hover:text-white transition-colors">
                  {t('services.carpenter')}
                </Link>
              </li>
              <li>
                <Link to="/employer?service=domestic_help" className="hover:text-white transition-colors">
                  {t('services.domesticHelp')}
                </Link>
              </li>
              <li>
                <Link to="/employer?service=painter" className="hover:text-white transition-colors">
                  {t('services.painter')}
                </Link>
              </li>
              <li>
                <Link to="/employer" className="inline-flex items-center gap-1 text-rozgo-300 font-bold hover:underline pt-1">
                  <span>{t('landing.viewAllServices')}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Cooperative */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-rozgo-200">
              {t('landing.footerColCoop')}
            </h4>
            <ul className="space-y-2.5 text-sm text-rozgo-100/80">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  How ROZGO Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Worker Benefits
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Governance & Rights
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Transparency Charter
                </Link>
              </li>
              <li>
                <Link to="/auth/onboarding" className="hover:text-white transition-colors">
                  Get Labour Number
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-rozgo-200">
              {t('landing.footerColSupport')}
            </h4>
            <ul className="space-y-2.5 text-sm text-rozgo-100/80">
              <li>
                <span className="hover:text-white cursor-pointer">Help Center & FAQs</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Worker Grievance Redressal</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Community Standards</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Terms of Service</span>
              </li>
              <li className="pt-2">
                <a
                  href="tel:1800-ROZGO"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rozgo-800 text-rozgo-200 hover:text-white text-xs font-bold border border-rozgo-700"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Support: 1800-ROZGO</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-rozgo-200/70">
          <p>{t('landing.copyright')}</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Security</span>
            <span>Labour Dignity Pledge</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

