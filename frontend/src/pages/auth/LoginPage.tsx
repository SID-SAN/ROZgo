import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, Lock, ArrowRight, Briefcase, Users, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { authApi } from '../../api/authApi';
import logoImg from '../../assets/logo.png';

export const LoginPage: React.FC = () => {
  const { loginAsWorker, loginAsEmployer } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const roleParam = searchParams.get('role');
  const [activeRole, setActiveRole] = useState<'worker' | 'employer'>(
    roleParam === 'employer' ? 'employer' : 'worker'
  );

  useEffect(() => {
    if (roleParam === 'employer') {
      setActiveRole('employer');
    } else if (roleParam === 'worker') {
      setActiveRole('worker');
    }
  }, [roleParam]);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [useOtp, setUseOtp] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // OTP state & timers
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isOtpSent && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpSent, otpCountdown]);

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number first.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setIsSendingOtp(true);

    try {
      const res = await authApi.sendOtp(phone);
      setIsOtpSent(true);
      setOtpCountdown(30);
      setSuccessMsg(res.message + (res.demo_otp ? ` (Test OTP: ${res.demo_otp})` : ''));
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleWorkerLogin = () => {
    loginAsWorker(phone || undefined);
    navigate('/worker/dashboard');
  };

  const handleEmployerLogin = () => {
    const service = searchParams.get('service');
    loginAsEmployer(phone || undefined);
    navigate(service ? `/employer?service=${service}` : '/employer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (useOtp) {
      if (otp.length < 4) {
        setError('Please enter the 4 to 6-digit OTP sent to your phone');
        return;
      }

      setError(null);
      setIsVerifying(true);

      try {
        await authApi.verifyOtp(phone, otp, activeRole);
        if (activeRole === 'employer') {
          handleEmployerLogin();
        } else {
          handleWorkerLogin();
        }
      } catch (err: any) {
        setError(err.message || 'Invalid OTP entered. Please check and try again.');
      } finally {
        setIsVerifying(false);
      }
    } else {
      if (!otp.trim()) {
        setError('Please enter your password');
        return;
      }
      setError(null);
      if (activeRole === 'employer') {
        handleEmployerLogin();
      } else {
        handleWorkerLogin();
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fadeIn text-left">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header with official logo */}
        <div className="text-center space-y-4">
          <Link to="/" className="inline-block group" title="Return to Home">
            <div className="w-full max-w-[280px] sm:max-w-[320px] p-4 sm:p-5 rounded-3xl bg-white shadow-soft border border-neutral-200/90 dark:border-neutral-700 transition-all group-hover:scale-[1.03]">
              <img
                src={logoImg}
                alt="ROZGO - Rozgaar Ka Naya Raasta"
                className="h-20 sm:h-24 w-auto max-w-[260px] sm:max-w-[300px] object-contain mx-auto"
              />
            </div>
          </Link>
          <div>
            <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              {activeRole === 'employer' ? 'Employer Login' : 'Worker Login'}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {activeRole === 'employer'
                ? 'Login to find & hire local verified workers with zero commissions'
                : 'Login to find local gigs & connect directly with customers'}
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card variant="elevated" padding="lg" className="border border-neutral-200/90 dark:border-darkbg-border">
          {/* Role Mode Switcher Tabs */}
          <div className="flex rounded-2xl bg-neutral-100 dark:bg-darkbg-surface p-1 mb-6 border border-neutral-200/80 dark:border-darkbg-border">
            <button
              type="button"
              onClick={() => {
                setActiveRole('employer');
                setSearchParams((prev) => {
                  const p = new URLSearchParams(prev);
                  p.set('role', 'employer');
                  return p;
                });
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeRole === 'employer'
                  ? 'bg-rozgo-900 text-white shadow-soft'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Employer</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveRole('worker');
                setSearchParams((prev) => {
                  const p = new URLSearchParams(prev);
                  p.set('role', 'worker');
                  return p;
                });
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeRole === 'worker'
                  ? 'bg-rozgo-900 text-white shadow-soft'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Worker</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-900/60 flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Mobile number input with Send OTP CTA */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {t('auth.mobileLabel')}
                </label>
                <span className={`text-[11px] font-bold ${phone.length === 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`}>
                  {phone.length}/10 digits
                </span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1 flex items-center">
                  <Phone className="w-5 h-5 absolute left-3.5 text-neutral-400 pointer-events-none" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      setError(null);
                      setSuccessMsg(null);
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                    }}
                    placeholder="10-digit mobile number"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white font-bold text-base tracking-wider focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                    required
                  />
                </div>

                {useOtp && (
                  <Button
                    type="button"
                    variant={isOtpSent ? 'outline' : 'primary'}
                    size="md"
                    onClick={handleSendOtp}
                    disabled={phone.length !== 10 || isSendingOtp || (isOtpSent && otpCountdown > 0)}
                    className="shrink-0 font-bold whitespace-nowrap text-xs px-4"
                  >
                    {isSendingOtp ? (
                      'Sending...'
                    ) : isOtpSent && otpCountdown > 0 ? (
                      `Resend (${otpCountdown}s)`
                    ) : isOtpSent ? (
                      'Resend OTP'
                    ) : (
                      'Send OTP'
                    )}
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Enter your 10-digit mobile number and click Send OTP.
              </p>
            </div>

            {/* OTP / Password input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {useOtp ? t('auth.otpLabel') : 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMsg(null);
                    setUseOtp(!useOtp);
                  }}
                  className="text-xs text-rozgo-700 dark:text-rozgo-400 font-bold hover:underline cursor-pointer"
                >
                  {useOtp ? 'Use Password' : 'Use OTP'}
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-5 h-5 absolute left-3.5 text-neutral-400 pointer-events-none" />
                <input
                  type={useOtp ? 'tel' : 'password'}
                  inputMode={useOtp ? 'numeric' : 'text'}
                  maxLength={useOtp ? 6 : 30}
                  value={otp}
                  onChange={(e) => {
                    setError(null);
                    setOtp(useOtp ? e.target.value.replace(/\D/g, '').slice(0, 6) : e.target.value);
                  }}
                  placeholder={useOtp ? 'Enter 4 or 6-digit OTP' : '••••••••'}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white font-mono text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                  required
                />
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={phone.length !== 10 || (useOtp ? otp.length < 4 : !otp.trim()) || isVerifying}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="font-bold shadow-soft"
            >
              {isVerifying ? 'Verifying OTP...' : useOtp ? 'Verify OTP & Login' : (activeRole === 'employer' ? 'Login as Employer' : 'Login as Worker')}
            </Button>
          </form>
        </Card>

        {/* Create account link */}
        <div className="text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {t('auth.newToRozgo')}{' '}
            <Link
              to="/auth/create-account"
              className="font-bold text-rozgo-900 dark:text-rozgo-300 hover:underline"
            >
              {t('auth.createAccount')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
