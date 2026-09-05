import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  PlusCircle,
  FileSearch,
  CheckCircle2,
  Clock,
  ArrowRight,
  DollarSign,
  Calendar,
  Ban,
  Wrench,
  Briefcase,
  UserX,
  Star,
  ClipboardCheck,
  Lock,
  HelpCircle,
  PhoneCall,
  ShieldCheck,
  Headphones,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGrievance } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { GRIEVANCE_CATEGORIES, getCategoryDisplay } from '../../data/mockGrievances';

// Icon mapper for dynamic category icons
export const renderCategoryIcon = (iconName: string, className = 'w-6 h-6') => {
  switch (iconName) {
    case 'DollarSign':
      return <DollarSign className={className} />;
    case 'Calendar':
      return <Calendar className={className} />;
    case 'Ban':
      return <Ban className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'UserX':
      return <UserX className={className} />;
    case 'AlertTriangle':
      return <AlertTriangle className={className} />;
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    case 'Star':
      return <Star className={className} />;
    case 'ClipboardCheck':
      return <ClipboardCheck className={className} />;
    case 'Lock':
      return <Lock className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};

export const GrievanceLandingPage: React.FC = () => {
  const { role, isLoggedIn } = useAuth();
  const { activeGrievancesCount } = useGrievance();
  const { language } = useLanguage();
  const navigate = useNavigate();

  // If logged in, strictly enforce the user's role. If not logged in, allow role selection.
  const [unauthRoleTab, setUnauthRoleTab] = useState<'worker' | 'employer'>('worker');
  const currentRole = isLoggedIn ? role : unauthRoleTab;

  const filteredCategories = GRIEVANCE_CATEGORIES.filter((cat) =>
    cat.relevantRoles.includes(currentRole)
  );

  const isHindi = language === 'hi';

  return (
    <div className="min-h-screen bg-[#fafcfa] dark:bg-darkbg-base py-8 sm:py-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Emergency Safety Alert Banner */}
        <div className="bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-2xl shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-rose-900 dark:text-rose-200 flex items-center gap-2">
                {isHindi ? 'आपातकालीन या शारीरिक सुरक्षा खतरा?' : 'Immediate Danger or Physical Safety Emergency?'}
              </h3>
              <p className="text-sm text-rose-800 dark:text-rose-300/90 mt-1 max-w-2xl leading-relaxed">
                {isHindi
                  ? 'यदि आप या कोई अन्य व्यक्ति तत्काल खतरे, शारीरिक हिंसा या आपात स्थिति में है, तो कृपया तुरंत पुलिस व आपातकालीन सहायता के लिए 112 डायल करें। ROZGO का शिकायत पोर्टल प्लेटफ़ॉर्म विवाद, मजदूरी और निष्पक्ष मध्यस्थता का समाधान करता है।'
                  : 'If you or someone else is in immediate danger or facing physical harm, please call National Emergency Services directly at 112. ROZGO grievance portal handles wage disputes, platform bookings, misconduct, and neutral mediation.'}
              </p>
            </div>
          </div>
          <a
            href="tel:112"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all shrink-0 active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{isHindi ? '112 पर कॉल करें' : 'Call 112 Emergency'}</span>
          </a>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rozgo-100 dark:bg-rozgo-900/40 border border-rozgo-200 dark:border-rozgo-800 text-rozgo-900 dark:text-rozgo-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>{isHindi ? 'निष्पक्ष और गोपनीय समाधान' : 'Fair & Confidential Redressal'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
            {isHindi ? 'ROZGO शिकायत और सहायता केंद्र' : 'ROZGO Grievance & Resolution Portal'}
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {isHindi
              ? 'मजदूरी विवाद, बुकिंग समस्याएं, अभद्र व्यवहार या सुरक्षा संबंधी समस्याओं की रिपोर्ट करें। हम हर मामले को निष्पक्षता और संवेदनशीलता के साथ सुलझाते हैं।'
              : 'Report wage disputes, unexpected cancellations, conduct concerns, or safety problems. Every complaint is tracked with complete transparency and resolved impartially.'}
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Raise a Grievance */}
          <div className="bg-gradient-to-br from-[#123B32] to-[#0A2620] text-white p-7 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all pointer-events-none" />
            <div className="space-y-4">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-rozgo-300 border border-white/10">
                <PlusCircle className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isHindi ? 'नई शिकायत दर्ज करें' : 'Raise a New Grievance'}
                </h2>
                <p className="text-sm text-neutral-200/90 mt-2 leading-relaxed">
                  {isHindi
                    ? 'अपनी समस्या का विवरण, सम्बंधित बुकिंग और प्रमाण सुरक्षित रूप से साझा करें। हम 24 घंटे के भीतर कार्रवाई शुरू करते हैं।'
                    : 'Submit your issue, connect it to a booking, and attach evidence. We review every complaint within 24 hours.'}
                </p>
              </div>
            </div>
            <div className="pt-6">
              <Link
                to="/grievances/new"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-rozgo-900 font-black text-base shadow-soft hover:bg-rozgo-50 transition-all active:scale-95"
              >
                <span>{isHindi ? 'शिकायत शुरू करें' : 'Report an Issue Now'}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Track Existing Grievances */}
          <div className="bg-white dark:bg-darkbg-card border-2 border-neutral-200 dark:border-darkbg-border p-7 sm:p-8 rounded-3xl shadow-sm flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-rozgo-50 dark:bg-rozgo-950/50 rounded-2xl flex items-center justify-center text-rozgo-900 dark:text-rozgo-400 border border-rozgo-100 dark:border-rozgo-800">
                  <FileSearch className="w-7 h-7" />
                </div>
                {activeGrievancesCount > 0 && (
                  <span className="px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-300 dark:border-amber-800 animate-pulse">
                    {activeGrievancesCount} {isHindi ? 'सक्रिय शिकायतें' : 'Active Tickets'}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {isHindi ? 'मेरी शिकायतें ट्रैक करें' : 'Track My Grievances'}
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                  {isHindi
                    ? 'अपनी मौजूदा शिकायतों की स्थिति देखें, ROZGO सपोर्ट टीम से बात करें और अंतिम समाधान की समीक्षा करें।'
                    : 'Check the real-time status of your complaints, reply to support requests for more information, or view resolutions.'}
                </p>
              </div>
            </div>
            <div className="pt-6">
              <Link
                to="/grievances/my"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-neutral-100 dark:bg-darkbg-surface hover:bg-neutral-200 dark:hover:bg-neutral-700/50 text-neutral-900 dark:text-white font-black text-base border border-neutral-300 dark:border-darkbg-border transition-all active:scale-95"
              >
                <span>{isHindi ? 'स्थिति देखें' : 'View Submitted Grievances'}</span>
                <ArrowRight className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* Grievance Categories Guide */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-rozgo-900 dark:text-rozgo-300 bg-rozgo-100 dark:bg-darkbg-surface px-2.5 py-0.5 rounded-md">
                  {currentRole === 'worker'
                    ? isHindi
                      ? 'श्रमिक निवारण श्रेणियां'
                      : 'Worker Redressal'
                    : isHindi
                    ? 'नियोक्ता निवारण श्रेणियां'
                    : 'Employer Redressal'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                {currentRole === 'worker'
                  ? isHindi
                    ? 'एक श्रमिक के रूप में आप क्या रिपोर्ट कर सकते हैं?'
                    : 'What Can You Report as a Worker?'
                  : isHindi
                  ? 'एक नियोक्ता के रूप में आप क्या रिपोर्ट कर सकते हैं?'
                  : 'What Can You Report as an Employer?'}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {currentRole === 'worker'
                  ? isHindi
                    ? 'मजदूरी में कटौती, बिना पूर्व सूचना काम रद्दीकरण, अनुचित व्यवहार या असुरक्षित कार्यस्थल की शिकायत दर्ज करें।'
                    : 'Report unpaid wages, unexpected cancellations, excessive work, or unfair treatment. Your rating remains protected.'
                  : isHindi
                  ? 'श्रमिक के न आने, अधूरा काम छोड़ने, संपत्ति को नुकसान या भुगतान विवाद की निष्पक्ष जांच के लिए रिपोर्ट करें।'
                  : 'Report worker no-shows, incomplete craftsmanship, property damage, or wage disagreements for neutral mediation.'}
              </p>
            </div>

            {/* Filter Tabs - Only shown if guest / not logged in */}
            {!isLoggedIn && (
              <div className="inline-flex p-1 bg-neutral-100 dark:bg-darkbg-surface rounded-2xl border border-neutral-200 dark:border-darkbg-border self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setUnauthRoleTab('worker')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    unauthRoleTab === 'worker'
                      ? 'bg-white dark:bg-darkbg-card text-rozgo-900 dark:text-rozgo-300 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  {isHindi ? 'श्रमिकों के लिए (Workers)' : 'For Workers'}
                </button>
                <button
                  type="button"
                  onClick={() => setUnauthRoleTab('employer')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    unauthRoleTab === 'employer'
                      ? 'bg-white dark:bg-darkbg-card text-rozgo-900 dark:text-rozgo-300 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  {isHindi ? 'नियोक्ताओं के लिए (Employers)' : 'For Employers'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredCategories.map((cat) => {
              const display = getCategoryDisplay(cat, currentRole);
              return (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/grievances/new?category=${cat.id}`)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md ${
                    cat.isSafety
                      ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 hover:border-rose-400'
                      : 'bg-white dark:bg-darkbg-card border-neutral-200 dark:border-darkbg-border hover:border-rozgo-400 dark:hover:border-rozgo-600'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                          cat.isSafety
                            ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                            : 'bg-rozgo-50 dark:bg-rozgo-950/60 text-rozgo-900 dark:text-rozgo-300 group-hover:bg-rozgo-100'
                        }`}
                      >
                        {renderCategoryIcon(cat.iconName, 'w-5 h-5')}
                      </div>
                      {cat.isSafety && (
                        <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 rounded-md">
                          {isHindi ? 'सुरक्षा' : 'High Priority'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900 dark:text-white text-base group-hover:text-rozgo-900 dark:group-hover:text-rozgo-300 transition-colors">
                        {display.label}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                        {display.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-neutral-100 dark:border-darkbg-border/60 flex items-center justify-between text-xs font-bold text-rozgo-900 dark:text-rozgo-300">
                    <span>{isHindi ? 'रिपोर्ट दर्ज करें' : 'Report this issue'}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How Grievance Process Works */}
        <div className="bg-white dark:bg-darkbg-card rounded-3xl border border-neutral-200 dark:border-darkbg-border p-6 sm:p-10 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
              {isHindi ? 'ROZGO शिकायत निवारण प्रक्रिया' : 'How ROZGO Redressal Works'}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {isHindi
                ? 'पारदर्शी, निष्पक्ष और समयबद्ध समाधान की गारंटी।'
                : 'A transparent, multi-step resolution mechanism designed to protect both parties fairly.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="space-y-3 relative p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200/70 dark:border-darkbg-border">
              <div className="w-10 h-10 rounded-xl bg-rozgo-900 text-white font-black text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                {isHindi ? 'शिकायत और प्रमाण सबमिट करें' : 'Submit & Evidence'}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {isHindi
                  ? 'घटना का विवरण, समय, मजदूरी और फोटो/दस्तावेज़ साक्ष्य जोड़ें। आपको तुरंत एक ट्रैकिंग ID (RG-YYYY-XXXXXX) मिलती है।'
                  : 'Describe what happened and upload receipts or photos. You get an instant unique tracking ID (RG-YYYY-XXXXXX).'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3 relative p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200/70 dark:border-darkbg-border">
              <div className="w-10 h-10 rounded-xl bg-rozgo-900 text-white font-black text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                {isHindi ? 'सत्यापन और निष्पक्ष जांच' : 'Impartial Review'}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {isHindi
                  ? 'ROZGO शिकायत अधिकारी दोनों पक्षों के रिकॉर्ड और बुकिंग शर्तों की निष्पक्ष जांच करते हैं।'
                  : 'A dedicated ROZGO Grievance Officer examines booking agreement terms, call logs, and proofs neutrally.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3 relative p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200/70 dark:border-darkbg-border">
              <div className="w-10 h-10 rounded-xl bg-rozgo-900 text-white font-black text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                {isHindi ? 'द्विपक्षीय सीधा संवाद' : 'Two-Way Support Chat'}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {isHindi
                  ? 'यदि अतिरिक्त जानकारी की आवश्यकता हो, तो आप अपने टिकट के भीतर सीधे अधिकारी से बात कर सकते हैं।'
                  : 'Communicate directly inside your ticket thread with ROZGO officers if any clarification is required.'}
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3 relative p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200/70 dark:border-darkbg-border">
              <div className="w-10 h-10 rounded-xl bg-rozgo-900 text-white font-black text-sm flex items-center justify-center">
                4
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                {isHindi ? 'समाधान व पुनर्विचार अधिकार' : 'Resolution & Appeal'}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {isHindi
                  ? 'अंतिम निर्णय और समाधान नोट जारी होता है। असंतुष्ट होने पर 7 दिनों के भीतर पुनर्विचार का अधिकार मिलता है।'
                  : 'Official resolution notice is issued. If not satisfied, you can request reconsideration within 7 days.'}
              </p>
            </div>
          </div>
        </div>

        {/* ROZGO Cooperative Trust Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              {isHindi ? 'शून्य प्रतिशोध नीति' : 'Zero Retaliation Policy'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {isHindi
                ? 'शिकायत दर्ज करने के कारण किसी भी श्रमिक की प्रोफाइल रेटिंग या कार्य उपलब्धता पर नकारात्मक प्रभाव नहीं पड़ता।'
                : 'Filing a genuine complaint will never harm a worker’s platform rating, job eligibility, or visibility.'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              {isHindi ? '24 से 48 घंटे में समाधान' : 'Prompt 24-48h Resolution'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {isHindi
                ? 'सभी भुगतान और आवश्यक विवादों पर प्राथमिकता के साथ कार्य किया जाता है ताकि किसी का समय या धन व्यर्थ न हो।'
                : 'Standard wage issues and booking cancellations are resolved within 24 to 48 business hours.'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              {isHindi ? 'बहुभाषी सहायता' : 'Multilingual Assistance'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {isHindi
                ? 'हमारे अधिकारी हिंदी, अंग्रेजी और क्षेत्रीय भाषाओं में फोन व संदेश द्वारा सहयोग प्रदान करते हैं।'
                : 'Our grievance redressal executives assist in Hindi, English, and regional languages over phone or chat.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

