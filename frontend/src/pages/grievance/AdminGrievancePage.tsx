import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Briefcase,
  ArrowUpDown,
} from 'lucide-react';
import { useGrievance } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { GrievanceStatus, GrievancePriority } from '../../types';
import { getStatusBadge, getPriorityBadge } from './MyGrievancesPage';
import { renderCategoryIcon } from './GrievanceLandingPage';

export const AdminGrievancePage: React.FC = () => {
  const { grievances, adminUpdateStatus, adminUpdatePriority } = useGrievance();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isHindi = language === 'hi';

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // KPI Metrics
  const totalCount = grievances.length;
  const pendingCount = grievances.filter((g) => g.status === 'pending').length;
  const underReviewCount = grievances.filter((g) => g.status === 'under_review').length;
  const infoRequestedCount = grievances.filter((g) => g.status === 'info_requested').length;
  const escalatedCount = grievances.filter((g) => g.status === 'escalated').length;
  const resolvedCount = grievances.filter((g) => g.status === 'resolved').length;

  const filteredGrievances = grievances.filter((g) => {
    if (statusFilter !== 'all' && g.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && g.priority !== priorityFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = g.id.toLowerCase().includes(q);
      const matchTitle = g.title.toLowerCase().includes(q);
      const matchUser = g.userName.toLowerCase().includes(q);
      const matchBooking = g.bookingNumber?.toLowerCase().includes(q);
      const matchParty = g.counterpartyName?.toLowerCase().includes(q);
      return matchId || matchTitle || matchUser || matchBooking || matchParty;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#fafcfa] dark:bg-darkbg-base py-8 sm:py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rozgo-100 dark:bg-rozgo-900/40 text-rozgo-900 dark:text-rozgo-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ROZGO Administration Redressal Cell</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 dark:text-white">
              {isHindi ? 'शिकायत निवारण प्रबंधन कंसोल' : 'Grievance Redressal & Mediation Console'}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {isHindi
                ? 'श्रमिकों और नियोक्ताओं के विवादों की निष्पक्ष जांच, स्थिति अद्यतन और मध्यस्थता समाधान।'
                : 'Monitor incoming complaints, review disputed wage agreements, and issue official resolutions.'}
            </p>
          </div>

          <Link
            to="/grievances"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-card text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-50 shrink-0"
          >
            <span>{isHindi ? 'सार्वजनिक पोर्टल देखें' : 'View Public Portal'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="p-4 rounded-2xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border space-y-1 shadow-sm">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              {isHindi ? 'कुल मामले' : 'Total Cases'}
            </span>
            <p className="text-2xl font-black text-neutral-900 dark:text-white">{totalCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-1">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
              {isHindi ? 'लंबित' : 'Pending'}
            </span>
            <p className="text-2xl font-black text-amber-900 dark:text-amber-300">{pendingCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 space-y-1">
            <span className="text-[11px] font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider">
              {isHindi ? 'जांच में' : 'Under Review'}
            </span>
            <p className="text-2xl font-black text-blue-900 dark:text-blue-300">{underReviewCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 space-y-1">
            <span className="text-[11px] font-bold text-purple-800 dark:text-purple-400 uppercase tracking-wider">
              {isHindi ? 'जानकारी अपेक्षित' : 'Info Requested'}
            </span>
            <p className="text-2xl font-black text-purple-900 dark:text-purple-300">
              {infoRequestedCount}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-1">
            <span className="text-[11px] font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider">
              {isHindi ? 'एस्केलेटेड' : 'Escalated'}
            </span>
            <p className="text-2xl font-black text-rose-900 dark:text-rose-300">{escalatedCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
              {isHindi ? 'हल किए गए' : 'Resolved'}
            </span>
            <p className="text-2xl font-black text-emerald-900 dark:text-emerald-300">
              {resolvedCount}
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-xs font-bold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="info_requested">Info Requested</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed / Rejected</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-500">Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-xs font-bold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical / Emergency</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket ID, name, booking, topic..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rozgo-900"
              />
            </div>
          </div>
        </div>

        {/* Cases Data Table */}
        <div className="bg-white dark:bg-darkbg-card rounded-3xl border border-neutral-200 dark:border-darkbg-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-neutral-50 dark:bg-darkbg-surface/80 border-b border-neutral-200 dark:border-darkbg-border text-neutral-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Case ID</th>
                  <th className="py-3.5 px-4">Complainant</th>
                  <th className="py-3.5 px-4">Category & Subject</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-darkbg-border/60">
                {filteredGrievances.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-neutral-400">
                      No grievance records matching the filters.
                    </td>
                  </tr>
                ) : (
                  filteredGrievances.map((g) => (
                    <tr
                      key={g.id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-darkbg-surface/50 transition-colors"
                    >
                      <td className="py-4 px-4 sm:px-6 font-mono font-bold text-rozgo-900 dark:text-rozgo-300">
                        {g.id}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-neutral-900 dark:text-white">
                          {g.userName}
                        </div>
                        <div className="text-[11px] text-neutral-400 capitalize">
                          {g.userRole} • {g.userPhone}
                        </div>
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-bold text-neutral-900 dark:text-white truncate flex items-center gap-1.5">
                          {renderCategoryIcon(g.category, 'w-3.5 h-3.5 text-neutral-500')}
                          <span>{g.categoryLabel}</span>
                        </div>
                        <div className="text-xs text-neutral-500 truncate mt-0.5">{g.title}</div>
                      </td>
                      <td className="py-4 px-4">{getPriorityBadge(g.priority, isHindi)}</td>
                      <td className="py-4 px-4">{getStatusBadge(g.status, isHindi)}</td>
                      <td className="py-4 px-4 text-xs text-neutral-500 whitespace-nowrap">
                        {g.createdAt}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <Link
                          to={`/admin/grievances/${g.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rozgo-900 hover:bg-rozgo-800 text-white font-bold text-xs shadow-soft transition-all"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

