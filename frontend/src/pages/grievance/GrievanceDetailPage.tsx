import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileText,
  MessageSquare,
  Send,
  Calendar,
  DollarSign,
  User,
  ShieldCheck,
  Download,
  Volume2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGrievance } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { getStatusBadge, getPriorityBadge } from './MyGrievancesPage';
import { renderCategoryIcon } from './GrievanceLandingPage';
import { GrievanceTimelineItem } from '../../types';

export const GrievanceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getGrievanceById, addMessage, provideRequestedInformation, requestReconsideration } =
    useGrievance();
  const { language } = useLanguage();
  const isHindi = language === 'hi';

  const grievance = id ? getGrievanceById(id) : undefined;

  const [copiedId, setCopiedId] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [infoResponseText, setInfoResponseText] = useState('');
  const [showReconsiderModal, setShowReconsiderModal] = useState(false);
  const [reconsiderReason, setReconsiderReason] = useState('');
  const [showFullTimeline, setShowFullTimeline] = useState(false);

  if (!grievance) {
    return (
      <div className="min-h-screen bg-[#fafcfa] dark:bg-darkbg-base py-16 text-center">
        <div className="max-w-md mx-auto px-4 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            {isHindi ? 'शिकायत नहीं मिली' : 'Grievance Not Found'}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {isHindi
              ? 'यह शिकायत ID मौजूद नहीं है या हटा दी गई है।'
              : `Grievance ticket "${id}" could not be located in our records.`}
          </p>
          <Link
            to="/grievances/my"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rozgo-900 text-white text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isHindi ? 'मेरी शिकायतें देखें' : 'View My Grievances'}</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(grievance.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    addMessage(grievance.id, newMessage.trim());
    setNewMessage('');
  };

  const handleSendInfoResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!infoResponseText.trim()) return;
    provideRequestedInformation(grievance.id, infoResponseText.trim());
    setInfoResponseText('');
  };

  const handleReconsiderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconsiderReason.trim()) return;
    requestReconsideration(grievance.id, reconsiderReason.trim());
    setReconsiderReason('');
    setShowReconsiderModal(false);
  };

  // Determine active step for 4-phase stepper
  // 1: Submitted, 2: Under Review, 3: Mediation / Escalation, 4: Resolved
  const getProgressStage = () => {
    switch (grievance.status) {
      case 'pending':
        return 1;
      case 'under_review':
        return 2;
      case 'info_requested':
      case 'escalated':
        return 3;
      case 'resolved':
      case 'closed':
      case 'rejected':
        return 4;
      default:
        return 1;
    }
  };

  const currentStage = getProgressStage();

  return (
    <div className="min-h-screen bg-[#fafcfa] dark:bg-darkbg-base py-8 sm:py-12 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/grievances/my"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-rozgo-900 dark:hover:text-rozgo-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isHindi ? 'मेरी शिकायतों पर वापस जाएं' : 'Back to My Grievances'}</span>
          </Link>
          <span className="text-xs text-neutral-400">
            {isHindi ? 'अंतिम अपडेट: ' : 'Updated: '} {grievance.updatedAt}
          </span>
        </div>

        {/* Grievance Summary Header Card */}
        <div className="bg-white dark:bg-darkbg-card rounded-3xl border border-neutral-200 dark:border-darkbg-border p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-darkbg-border/60 pb-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl sm:text-3xl font-mono font-black text-rozgo-900 dark:text-rozgo-300">
                  {grievance.id}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-600 dark:text-neutral-300 transition-colors"
                  title="Copy ID"
                >
                  {copiedId ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                {getStatusBadge(grievance.status, isHindi)}
                {getPriorityBadge(grievance.priority, isHindi)}
              </div>
              <p className="text-xs text-neutral-400">
                {isHindi ? 'दर्ज तिथि:' : 'Filed on'} {grievance.createdAt}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rozgo-50 dark:bg-rozgo-950/60 text-rozgo-900 dark:text-rozgo-300 border border-rozgo-100 dark:border-rozgo-800">
                {renderCategoryIcon(grievance.category, 'w-6 h-6')}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-neutral-400">
                  {isHindi ? 'शिकायत श्रेणी' : 'Category'}
                </span>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                  {grievance.categoryLabel}
                </p>
              </div>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              {isHindi ? 'निवारण प्रगति (Resolution Progress)' : 'Resolution Progress Timeline'}
            </h3>

            <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
              {[
                { step: 1, label: isHindi ? 'शिकायत दर्ज' : 'Submitted' },
                { step: 2, label: isHindi ? 'जांच व समीक्षा' : 'Review' },
                { step: 3, label: isHindi ? 'मध्यस्थता' : 'Mediation' },
                { step: 4, label: isHindi ? 'अंतिम समाधान' : 'Resolved' },
              ].map((st) => {
                const isPassed = currentStage >= st.step;
                const isCurrent = currentStage === st.step;
                return (
                  <div key={st.step} className="space-y-2 text-center">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        isPassed
                          ? 'bg-rozgo-900 dark:bg-rozgo-400'
                          : 'bg-neutral-200 dark:bg-neutral-800'
                      }`}
                    />
                    <span
                      className={`text-xs block font-bold ${
                        isCurrent
                          ? 'text-rozgo-900 dark:text-rozgo-300'
                          : isPassed
                          ? 'text-neutral-700 dark:text-neutral-300'
                          : 'text-neutral-400'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Timeline Detailed Dropdown */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowFullTimeline(!showFullTimeline)}
                className="text-xs font-bold text-rozgo-900 dark:text-rozgo-300 hover:underline flex items-center gap-1"
              >
                <span>
                  {showFullTimeline
                    ? isHindi
                      ? 'टाइमलाइन छिपाएं'
                      : 'Hide Milestones'
                    : isHindi
                    ? 'विस्तृत टाइमलाइन देखें'
                    : 'View Detailed Milestones'}
                </span>
                {showFullTimeline ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showFullTimeline && (
                <div className="mt-4 border-t border-neutral-100 dark:border-darkbg-border pt-4 space-y-3">
                  {grievance.timeline.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-rozgo-900 dark:bg-rozgo-400 mt-1.5 shrink-0" />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 dark:text-white">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {item.timestamp}
                          </span>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACTION BANNER 1: MORE INFO REQUESTED */}
        {grievance.status === 'info_requested' && (
          <div className="bg-purple-50 dark:bg-purple-950/30 border-2 border-purple-300 dark:border-purple-800 rounded-3xl p-6 shadow-sm space-y-4 animate-fadeIn">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded-2xl shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-purple-950 dark:text-purple-200">
                  {isHindi ? 'अतिरिक्त जानकारी आवश्यक है' : 'Information Requested by ROZGO Team'}
                </h3>
                <p className="text-xs sm:text-sm text-purple-900 dark:text-purple-300/90 leading-relaxed">
                  {grievance.requestedInfoQuery ||
                    (isHindi
                      ? 'कृपया इस मामले की जांच आगे बढ़ाने के लिए अतिरिक्त प्रमाण या विवरण प्रदान करें।'
                      : 'Our grievance redressal executive needs additional clarification or evidence from you.')}
                </p>
              </div>
            </div>

            {/* Response Input */}
            <form onSubmit={handleSendInfoResponse} className="space-y-3 pt-2">
              <textarea
                rows={3}
                value={infoResponseText}
                onChange={(e) => setInfoResponseText(e.target.value)}
                placeholder={
                  isHindi
                    ? 'मांगी गई जानकारी का विवरण यहां लिखें...'
                    : 'Provide the requested details or clarification here...'
                }
                className="w-full px-4 py-3 rounded-2xl border border-purple-200 dark:border-purple-900/80 bg-white dark:bg-darkbg-card text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!infoResponseText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold text-xs transition-all active:scale-95"
                >
                  {isHindi ? 'जानकारी सबमिट करें' : 'Submit Response & Resume Review'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ACTION BANNER 2: RESOLVED CARD */}
        {grievance.status === 'resolved' && (
          <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-2xl shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-emerald-950 dark:text-emerald-200">
                    {isHindi ? 'आधिकारिक समाधान निर्णय' : 'Official ROZGO Redressal Resolution'}
                  </h3>
                  {grievance.resolvedAt && (
                    <span className="text-xs text-emerald-800 dark:text-emerald-400 font-bold">
                      {isHindi ? 'समाधान तिथि: ' : 'Resolved on: '} {grievance.resolvedAt}
                    </span>
                  )}
                </div>
                <p className="text-sm text-emerald-900 dark:text-emerald-200/90 whitespace-pre-wrap leading-relaxed mt-2 p-4 rounded-2xl bg-white dark:bg-darkbg-card border border-emerald-200 dark:border-emerald-900/60 font-medium">
                  {grievance.resolutionNotes ||
                    (isHindi
                      ? 'यह मामला दोनों पक्षों के मध्यस्थता और समझौते के बाद सफलतापूर्वक सुलझा लिया गया है।'
                      : 'The grievance has been resolved amicably in accordance with ROZGO cooperative guidelines.')}
                </p>
              </div>
            </div>

            {/* Reconsideration Option */}
            <div className="pt-3 border-t border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <p className="text-emerald-800 dark:text-emerald-400">
                {isHindi
                  ? 'क्या आप इस समाधान से संतुष्ट नहीं हैं? आप 7 दिनों के भीतर पुनर्विचार का अनुरोध कर सकते हैं।'
                  : 'Not satisfied with this resolution? You may request a secondary review within 7 days.'}
              </p>
              <button
                type="button"
                onClick={() => setShowReconsiderModal(true)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-darkbg-card border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold hover:bg-emerald-50 transition-colors"
              >
                {isHindi ? 'पुनर्विचार का अनुरोध करें' : 'Request Reconsideration'}
              </button>
            </div>
          </div>
        )}

        {/* Grievance Content & Side Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: Details, Description, Evidence */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-darkbg-card rounded-3xl border border-neutral-200 dark:border-darkbg-border p-6 sm:p-7 shadow-sm space-y-5">
              <h2 className="text-lg font-black text-neutral-900 dark:text-white">
                {isHindi ? 'शिकायत का विवरण' : 'Incident Details & Description'}
              </h2>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {grievance.title}
                </h3>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                  {grievance.description}
                </p>
              </div>

              {/* Wage dispute comparison if available */}
              {(grievance.agreedWage || grievance.actualPaid) && (
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    {isHindi ? 'मजदूरी का विवरण' : 'Dispute Financials'}
                  </h4>
                  <div className="flex flex-wrap items-center gap-6 text-xs">
                    <div>
                      <span className="text-neutral-500">Agreed Wage: </span>
                      <span className="font-bold text-neutral-900 dark:text-white">
                        ₹{grievance.agreedWage || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Actually Paid: </span>
                      <span className="font-bold text-neutral-900 dark:text-white">
                        ₹{grievance.actualPaid || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Disputed Balance: </span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        ₹{(grievance.agreedWage || 0) - (grievance.actualPaid || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Attached Evidence */}
              <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-darkbg-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  {isHindi ? 'संलग्न साक्ष्य' : 'Attached Evidence'} ({grievance.evidence.length})
                </h4>

                {grievance.evidence.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">
                    {isHindi ? 'कोई साक्ष्य संलग्न नहीं किया गया था।' : 'No files were attached.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {grievance.evidence.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="p-2 rounded-xl bg-white dark:bg-darkbg-card text-rozgo-900 dark:text-rozgo-400 border border-neutral-200 dark:border-darkbg-border shrink-0">
                            {ev.fileType === 'audio' ? (
                              <Volume2 className="w-4 h-4" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                              {ev.fileName}
                            </p>
                            <p className="text-[10px] text-neutral-400">
                              {ev.fileSize} • {ev.uploadDate}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-rozgo-900 dark:text-rozgo-300 hover:underline shrink-0">
                          View
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* TWO-WAY SUPPORT MESSAGES THREAD */}
            <div className="bg-white dark:bg-darkbg-card rounded-3xl border border-neutral-200 dark:border-darkbg-border p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-rozgo-900 dark:text-rozgo-400" />
                  <h2 className="text-lg font-black text-neutral-900 dark:text-white">
                    {isHindi ? 'ROZGO सहायता संवाद' : 'Support Ticket Conversation'}
                  </h2>
                </div>
                <span className="text-xs text-neutral-400">
                  {grievance.messages.length} {isHindi ? 'संदेश' : 'messages'}
                </span>
              </div>

              {/* Messages Container */}
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {grievance.messages.map((msg) => {
                  const isUser = msg.senderRole === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-neutral-500">
                          {msg.senderName}
                        </span>
                        <span className="text-[10px] text-neutral-400">{msg.timestamp}</span>
                      </div>
                      <div
                        className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isUser
                            ? 'bg-rozgo-900 text-white rounded-tr-sm'
                            : 'bg-neutral-100 dark:bg-darkbg-surface text-neutral-900 dark:text-white rounded-tl-sm border border-neutral-200 dark:border-darkbg-border'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={
                    isHindi
                      ? 'अधिकारी को संदेश या प्रश्न भेजें...'
                      : 'Send a message or follow-up to support...'
                  }
                  className="flex-1 px-4 py-3 rounded-2xl border border-neutral-200 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-5 py-3 rounded-2xl bg-rozgo-900 hover:bg-rozgo-800 disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>{isHindi ? 'भेजें' : 'Send'}</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Counterparty & Booking Metadata Card */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-darkbg-card rounded-3xl border border-neutral-200 dark:border-darkbg-border p-6 shadow-sm space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                {isHindi ? 'केस संदर्भ विवरण' : 'Case Reference Information'}
              </h3>

              {/* Complainant Info */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-neutral-400">
                  {isHindi ? 'शिकायतकर्ता' : 'Complainant'}
                </span>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                  {grievance.userName} ({grievance.userRole})
                </p>
                <p className="text-xs text-neutral-500">{grievance.userPhone}</p>
              </div>

              {/* Counterparty Info */}
              <div className="space-y-1 pt-3 border-t border-neutral-100 dark:border-darkbg-border">
                <span className="text-[11px] font-bold text-neutral-400">
                  {isHindi ? 'विपक्षी पक्ष' : 'Counterparty Reported'}
                </span>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                  {grievance.counterpartyName || 'N/A'}
                </p>
                {grievance.counterpartyPhone && (
                  <p className="text-xs text-neutral-500">{grievance.counterpartyPhone}</p>
                )}
              </div>

              {/* Booking Info if any */}
              {grievance.bookingNumber && (
                <div className="space-y-1 pt-3 border-t border-neutral-100 dark:border-darkbg-border">
                  <span className="text-[11px] font-bold text-neutral-400">
                    {isHindi ? 'सम्बंधित बुकिंग' : 'Linked Booking'}
                  </span>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">
                    {grievance.bookingTitle}
                  </p>
                  <p className="text-xs font-mono font-bold text-rozgo-900 dark:text-rozgo-300">
                    {grievance.bookingNumber}
                  </p>
                  {grievance.bookingDate && (
                    <p className="text-[11px] text-neutral-400">Date: {grievance.bookingDate}</p>
                  )}
                </div>
              )}

              {/* ROZGO Redressal Officer */}
              <div className="space-y-1 pt-3 border-t border-neutral-100 dark:border-darkbg-border">
                <span className="text-[11px] font-bold text-neutral-400">
                  {isHindi ? 'सौंपा गया अधिकारी' : 'Assigned Redressal Desk'}
                </span>
                <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {grievance.assignedOfficer || 'ROZGO Grievance Cell (Desk-3)'}
                  </span>
                </p>
              </div>
            </div>

            {/* Help Callout */}
            <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border space-y-2 text-xs">
              <h4 className="font-bold text-neutral-900 dark:text-white">
                {isHindi ? 'निष्पक्ष मध्यस्थता का वचन' : 'Neutral Redressal Guarantee'}
              </h4>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {isHindi
                  ? 'ROZGO दोनों पक्षों के साथ निष्पक्ष व्यवहार करता है। यदि आपको तत्काल फोन सहायता चाहिए, तो हमारी हेल्पलाइन 1800-ROZGO पर संपर्क करें।'
                  : 'ROZGO acts as a fair, neutral mediator adhering to agreed terms. For telephonic inquiries, reach out via 1800-ROZGO.'}
              </p>
            </div>
          </div>
        </div>

        {/* Reconsideration Request Modal */}
        {showReconsiderModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-scaleUp">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                  {isHindi ? 'पुनर्विचार का अनुरोध करें' : 'Request Case Reconsideration'}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {isHindi
                    ? 'कृपया बताएं कि आप दिए गए समाधान से क्यों असहमत हैं या कोई छूटा हुआ साक्ष्य साझा करें।'
                    : 'Explain why you believe the current resolution is insufficient or provide newly uncovered facts.'}
                </p>
              </div>

              <form onSubmit={handleReconsiderSubmit} className="space-y-4">
                <textarea
                  rows={4}
                  value={reconsiderReason}
                  onChange={(e) => setReconsiderReason(e.target.value)}
                  placeholder={
                    isHindi
                      ? 'पुनर्विचार का कारण लिखें...'
                      : 'State your reason for reconsideration and requested remedy...'
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                />
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReconsiderModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-darkbg-border text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100"
                  >
                    {isHindi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={!reconsiderReason.trim()}
                    className="px-5 py-2.5 rounded-xl bg-rozgo-900 hover:bg-rozgo-800 disabled:opacity-40 text-white text-xs font-bold transition-all"
                  >
                    {isHindi ? 'अनुरोध भेजें' : 'Submit Reconsideration'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

