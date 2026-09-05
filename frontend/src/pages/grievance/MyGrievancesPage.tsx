import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  Filter,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  FileText,
  ChevronRight,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGrievance } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { Grievance, GrievanceStatus, GrievancePriority } from '../../types';
import { renderCategoryIcon } from './GrievanceLandingPage';

export const getStatusBadge = (status: GrievanceStatus, isHindi = false) => {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <Clock className="w-3.5 h-3.5" />
          <span>{isHindi ? 'लंबित (समीक्षा बाकी)' : 'Pending Review'}</span>
        </span>
      );
    case 'under_review':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
          <Clock className="w-3.5 h-3.5" />
          <span>{isHindi ? 'जांच जारी' : 'Under Investigation'}</span>
        </span>
      );
    case 'info_requested':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 animate-pulse">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{isHindi ? 'जानकारी आवश्यक' : 'More Info Needed'}</span>
        </span>
      );
    case 'escalated':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{isHindi ? 'उच्चाधिकारी को प्रेषित' : 'Escalated'}</span>
        </span>
      );
    case 'resolved':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isHindi ? 'समाधान हो चुका' : 'Resolved'}</span>
        </span>
      );
    case 'closed':
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700">
          <span>{isHindi ? 'बंद' : 'Closed'}</span>
        </span>
      );
    default:
      return null;
  }
};

export const getPriorityBadge = (priority: GrievancePriority, isHindi = false) => {
  switch (priority) {
    case 'critical':
      return (
        <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
          {isHindi ? 'अत्यंत गंभीर' : 'Critical'}
        </span>
      );
    case 'high':
      return (
        <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
          {isHindi ? 'उच्च' : 'High Priority'}
        </span>
      );
    case 'medium':
      return (
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
          {isHindi ? 'मध्यम' : 'Medium'}
        </span>
      );
    case 'low':
    default:
      return (
        <span className="text-[11px] font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
          {isHindi ? 'सामान्य' : 'Normal'}
        </span>
      );
  }
};

export const MyGrievancesPage: React.FC = () => {
  const { userGrievances, grievances } = useGrievance();
  const { role } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const isHindi = language === 'hi';

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'info_requested' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fallback to all grievances if userGrievances is empty during demo
  const displayGrievances = userGrievances.length > 0 ? userGrievances : grievances;

  // Filter based on tab and search
  const filteredList = displayGrievances.filter((g) => {
    // Tab filtering
    if (activeTab === 'active') {
      if (g.status === 'resolved' || g.status === 'closed' || g.status === 'rejected') return false;
    } else if (activeTab === 'info_requested') {
      if (g.status !== 'info_requested') return false;
    } else if (activeTab === 'resolved') {
      if (g.status !== 'resolved' && g.status !== 'closed') return false;
    }

    // Query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = g.id.toLowerCase().includes(q);
      const matchTitle = g.title.toLowerCase().includes(q);
      const matchCategory = g.categoryLabel.toLowerCase().includes(q);
      const matchBooking = g.bookingNumber?.toLowerCase().includes(q);
      const matchParty = g.counterpartyName?.toLowerCase().includes(q);
      return matchId || matchTitle || matchCategory || matchBooking || matchParty;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#fafcfa] dark:bg-darkbg-base py-8 sm:py-12 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header and Top Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
              {isHindi ? 'मेरी शिकायतें और समाधान' : 'My Grievance Redressal Tickets'}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {isHindi
                ? 'अपनी दर्ज शिकायतों की वास्तविक स्थिति देखें, प्रमाण जोड़ें और ROZGO टीम से संपर्क करें।'
                : 'Track your submitted issues, respond to investigation queries, and view neutral resolutions.'}
            </p>
          </div>

          <Link
            to="/grievances/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rozgo-900 hover:bg-rozgo-800 text-white font-bold text-sm shadow-soft transition-all shrink-0 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isHindi ? 'नई शिकायत दर्ज करें' : 'Raise New Grievance'}</span>
          </Link>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === 'all'
                    ? 'bg-rozgo-900 text-white dark:bg-rozgo-400 dark:text-rozgo-950 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-darkbg-surface'
                }`}
              >
                {isHindi ? 'सभी शिकायतें' : 'All Tickets'} ({displayGrievances.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === 'active'
                    ? 'bg-rozgo-900 text-white dark:bg-rozgo-400 dark:text-rozgo-950 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-darkbg-surface'
                }`}
              >
                {isHindi ? 'सक्रिय / जांच में' : 'In Progress'} (
                {displayGrievances.filter((g) => g.status !== 'resolved' && g.status !== 'closed' && g.status !== 'rejected').length}
                )
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('info_requested')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === 'info_requested'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-darkbg-surface'
                }`}
              >
                {isHindi ? 'जानकारी अपेक्षित' : 'Action Required'} (
                {displayGrievances.filter((g) => g.status === 'info_requested').length}
                )
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('resolved')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === 'resolved'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-darkbg-surface'
                }`}
              >
                {isHindi ? 'समाधान पूर्ण' : 'Resolved'} (
                {displayGrievances.filter((g) => g.status === 'resolved' || g.status === 'closed').length}
                )
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isHindi ? 'ID या विषय से खोजें...' : 'Search by ID, keyword, booking...'}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rozgo-900"
              />
            </div>
          </div>
        </div>

        {/* Tickets List */}
        {filteredList.length === 0 ? (
          <div className="bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border rounded-3xl p-10 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-darkbg-surface text-neutral-400 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                {isHindi ? 'कोई शिकायत नहीं मिली' : 'No grievances found'}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                {searchQuery
                  ? isHindi
                    ? 'आपकी खोज से मेल खाती कोई शिकायत नहीं मिली। कृपया पुनः प्रयास करें।'
                    : 'No matching grievance records found for your search query.'
                  : isHindi
                  ? 'आपके खाते में इस श्रेणी में कोई सक्रिय शिकायत दर्ज नहीं है।'
                  : 'You have no complaints under this filter category at this moment.'}
              </p>
            </div>
            <Link
              to="/grievances/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rozgo-900 text-white font-bold text-xs hover:bg-rozgo-800 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isHindi ? 'नई शिकायत दर्ज करें' : 'Report an Issue'}</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredList.map((g) => {
              const hasActionRequired = g.status === 'info_requested';
              return (
                <div
                  key={g.id}
                  onClick={() => navigate(`/grievances/${g.id}`)}
                  className={`bg-white dark:bg-darkbg-card rounded-3xl border-2 transition-all p-5 sm:p-6 shadow-sm hover:shadow-md cursor-pointer group ${
                    hasActionRequired
                      ? 'border-purple-300 dark:border-purple-800 bg-purple-50/20'
                      : 'border-neutral-200 dark:border-darkbg-border hover:border-rozgo-400 dark:hover:border-rozgo-700'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: ID, Badges, Date */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base font-mono font-black text-rozgo-900 dark:text-rozgo-300">
                          {g.id}
                        </span>
                        {getStatusBadge(g.status, isHindi)}
                        {getPriorityBadge(g.priority, isHindi)}
                      </div>
                      <span className="text-xs text-neutral-400 font-medium">
                        {isHindi ? 'दर्ज तिथि: ' : 'Filed: '} {g.createdAt}
                      </span>
                    </div>

                    {/* Action Required Banner if More Info Needed */}
                    {hasActionRequired && (
                      <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span className="text-xs font-bold text-purple-950 dark:text-purple-200">
                            {isHindi
                              ? 'ROZGO अधिकारी ने अतिरिक्त जानकारी मांगी है। कृपया जांच जारी रखने के लिए विवरण दें।'
                              : 'ROZGO Redressal Officer needs additional details from you to proceed.'}
                          </span>
                        </div>
                        <span className="text-xs font-black text-purple-700 dark:text-purple-300 underline shrink-0">
                          {isHindi ? 'उत्तर दें' : 'Reply Now &rarr;'}
                        </span>
                      </div>
                    )}

                    {/* Middle: Title and Details */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white group-hover:text-rozgo-900 dark:group-hover:text-rozgo-300 transition-colors">
                        {g.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                        {g.description}
                      </p>
                    </div>

                    {/* Bottom row: Category badge, Booking tag, and Messages count */}
                    <div className="pt-3 border-t border-neutral-100 dark:border-darkbg-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-neutral-600 dark:text-neutral-400">
                        <span className="inline-flex items-center gap-1 font-bold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-darkbg-surface px-2.5 py-1 rounded-lg">
                          {g.categoryLabel}
                        </span>

                        {g.bookingNumber && (
                          <span className="font-mono font-medium">
                            Booking: <strong>{g.bookingNumber}</strong>
                          </span>
                        )}

                        {g.counterpartyName && (
                          <span>
                            With: <strong>{g.counterpartyName}</strong>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {g.messages.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-neutral-500 dark:text-neutral-400 font-medium">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{g.messages.length}</span>
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 font-bold text-rozgo-900 dark:text-rozgo-300 group-hover:translate-x-0.5 transition-transform">
                          <span>{isHindi ? 'विवरण देखें' : 'View Details'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

