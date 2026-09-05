import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Star,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Edit3,
  Share2,
  Phone,
  Mail,
  Building2,
  Home,
  Briefcase,
  Users,
  HardHat,
  ArrowRight,
  Sparkles,
  HeartHandshake,
  Clock,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EditEmployerProfileModal } from '../../components/profile/EditEmployerProfileModal';

export const EmployerProfilePage: React.FC = () => {
  const { employerUser, logout, submitEmployerVerification } = useAuth();
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const copyEmployerId = () => {
    if (employerUser.employerId) {
      navigator.clipboard.writeText(employerUser.employerId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleShareProfile = () => {
    const profileUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(profileUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  const handleHireAgain = (trade: string, labourId?: string) => {
    const url = labourId
      ? `/employer/request?service=${trade}&labourId=${labourId}`
      : `/employer/request?service=${trade}`;
    navigate(url);
  };

  const getEmployerTypeLabel = (type: string) => {
    switch (type) {
      case 'individual':
        return 'Household & Individual Employer';
      case 'business':
        return 'Shop & Small Business Owner';
      case 'company':
        return 'Corporate & Office Representative';
      case 'contractor':
        return 'Registered Building Contractor';
      case 'property_manager':
        return 'Property & Society Facility Manager';
      default:
        return 'Verified Employer';
    }
  };

  const ratingBreakdown = employerUser.ratingBreakdown || {
    professionalism: 4.9,
    clarityOfScope: 4.8,
    paymentReliability: 5.0,
    workplaceSafety: 4.9,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-left transition-colors">
      {/* 1. Header Profile Card */}
      <Card variant="elevated" padding="xl" className="border border-neutral-200 dark:border-darkbg-border">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar or Initials */}
          {employerUser.avatar ? (
            <img
              src={employerUser.avatar}
              alt={employerUser.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-rozgo-900 shadow-soft shrink-0"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-rozgo-900 text-white flex items-center justify-center font-black text-3xl shadow-soft shrink-0">
              {employerUser.name.charAt(0)}
            </div>
          )}

          <div className="flex-1 space-y-3 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                    {employerUser.name}
                  </h1>
                  <Badge variant={employerUser.isVerified ? 'verified' : 'secondary'} size="md">
                    {employerUser.isVerified ? '✓ Verified Employer' : '⚠ Mobile Verified'}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
                  {getEmployerTypeLabel(employerUser.employerType)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Share2 className="w-3.5 h-3.5" />}
                  onClick={handleShareProfile}
                >
                  {shareSuccess ? 'Copied Link!' : 'Share'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<LogOut className="w-3.5 h-3.5" />}
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-red-700 border-red-200 dark:border-red-900/60 dark:text-red-300 hover:bg-red-50"
                >
                  Logout
                </Button>
              </div>
            </div>

            {/* Official Employer ID Badge with Copy */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rozgo-50 dark:bg-darkbg-surface border border-rozgo-200 dark:border-darkbg-border">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Employer ID:
              </span>
              <span className="font-mono font-black text-sm text-rozgo-900 dark:text-rozgo-300">
                {employerUser.employerId}
              </span>
              <button
                type="button"
                onClick={copyEmployerId}
                className="p-1 text-neutral-400 hover:text-rozgo-900 dark:hover:text-rozgo-300 transition-colors"
                title="Copy Employer ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Meta details: Location & Member Since */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rozgo-700 dark:text-rozgo-400" />
                {employerUser.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-rozgo-700 dark:text-rozgo-400" />
                Member since {employerUser.memberSince}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-bold text-rozgo-900 dark:text-rozgo-300">
                <Phone className="w-3.5 h-3.5" />
                {employerUser.phone}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-neutral-100 dark:border-darkbg-border">
          <div className="p-4 rounded-2xl bg-rozgo-50/70 dark:bg-darkbg-surface text-center sm:text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Overall Rating</div>
            <div className="text-2xl font-black text-neutral-900 dark:text-white mt-1 flex items-center justify-center sm:justify-start gap-1.5">
              <span>{employerUser.rating.toFixed(1)}</span>
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rozgo-50/70 dark:bg-darkbg-surface text-center sm:text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Total Bookings
            </div>
            <div className="text-2xl font-black text-neutral-900 dark:text-white mt-1">
              {employerUser.totalBookings}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rozgo-50/70 dark:bg-darkbg-surface text-center sm:text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Payment Record
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              100% Direct Pay
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rozgo-50/70 dark:bg-darkbg-surface text-center sm:text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Response Rate
            </div>
            <div className="text-2xl font-black text-rozgo-900 dark:text-rozgo-300 mt-1">
              98% Accept
            </div>
          </div>
        </div>
      </Card>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 3. About & Household / Business Details */}
          <Card variant="default" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Home className="w-5 h-5 text-rozgo-900 dark:text-rozgo-300" />
                <span>About & Entity Overview</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-bold text-rozgo-900 dark:text-rozgo-300 hover:underline"
              >
                Edit
              </button>
            </div>

            {employerUser.bio ? (
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {employerUser.bio}
              </p>
            ) : (
              <p className="text-sm text-neutral-400 italic">
                No bio added yet. Add a short note about your home or business to help workers connect comfortably.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              {employerUser.businessName && (
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border">
                  <span className="text-neutral-400 block font-semibold">Entity / Firm Name</span>
                  <span className="font-bold text-neutral-900 dark:text-white text-sm">
                    {employerUser.businessName}
                  </span>
                </div>
              )}

              {employerUser.designation && (
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border">
                  <span className="text-neutral-400 block font-semibold">Designation</span>
                  <span className="font-bold text-neutral-900 dark:text-white text-sm">
                    {employerUser.designation}
                  </span>
                </div>
              )}

              {employerUser.hiringPurpose && (
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border">
                  <span className="text-neutral-400 block font-semibold">Primary Purpose</span>
                  <span className="font-bold text-neutral-900 dark:text-white text-sm">
                    {employerUser.hiringPurpose}
                  </span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border">
                <span className="text-neutral-400 block font-semibold">Preferred Communication</span>
                <span className="font-bold text-neutral-900 dark:text-white text-sm capitalize">
                  {employerUser.preferredCommunication === 'call'
                    ? '📞 Direct Phone Call'
                    : employerUser.preferredCommunication === 'whatsapp'
                    ? '💬 WhatsApp'
                    : '🔔 App Notifications'}
                </span>
              </div>
            </div>

            {/* Languages */}
            {employerUser.languagesSpoken && employerUser.languagesSpoken.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                  Languages Spoken
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {employerUser.languagesSpoken.map((lang) => (
                    <span
                      key={lang}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-darkbg-surface text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-darkbg-border"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* 4. Ratings & Worker Feedback Scorecard */}
          <Card variant="default" padding="lg" className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>Worker Ratings & Feedback Scorecard</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Feedback from local workers who completed jobs for {employerUser.name}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-neutral-900 dark:text-white">
                  {employerUser.rating.toFixed(1)}
                </span>
                <span className="text-xs text-neutral-400 block">out of 5.0</span>
              </div>
            </div>

            {/* 4 Performance Metric Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-neutral-700 dark:text-neutral-300">Professionalism & Respect</span>
                  <span className="text-rozgo-900 dark:text-rozgo-300">{ratingBreakdown.professionalism.toFixed(1)} / 5.0</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rozgo-900 dark:bg-rozgo-400 rounded-full"
                    style={{ width: `${(ratingBreakdown.professionalism / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-neutral-700 dark:text-neutral-300">Clarity of Work Scope</span>
                  <span className="text-rozgo-900 dark:text-rozgo-300">{ratingBreakdown.clarityOfScope.toFixed(1)} / 5.0</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rozgo-900 dark:bg-rozgo-400 rounded-full"
                    style={{ width: `${(ratingBreakdown.clarityOfScope / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-neutral-700 dark:text-neutral-300">Payment Reliability & Speed</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{ratingBreakdown.paymentReliability.toFixed(1)} / 5.0</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${(ratingBreakdown.paymentReliability / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-neutral-700 dark:text-neutral-300">Safe Workplace Conditions</span>
                  <span className="text-rozgo-900 dark:text-rozgo-300">{ratingBreakdown.workplaceSafety.toFixed(1)} / 5.0</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rozgo-900 dark:bg-rozgo-400 rounded-full"
                    style={{ width: `${(ratingBreakdown.workplaceSafety / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Worker Reviews List */}
            {employerUser.reviews && employerUser.reviews.length > 0 && (
              <div className="pt-4 border-t border-neutral-100 dark:border-darkbg-border space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                  Recent Worker Reviews ({employerUser.reviews.length})
                </span>

                <div className="space-y-3">
                  {employerUser.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-neutral-50/70 dark:bg-darkbg-surface border border-neutral-200/80 dark:border-darkbg-border space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 dark:text-white">{rev.workerName}</span>
                          <span className="text-neutral-400">({rev.workerSkill})</span>
                          {rev.workerLabourId && (
                            <span className="font-mono text-[11px] text-rozgo-700 dark:text-rozgo-400 font-semibold">
                              {rev.workerLabourId}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 font-bold text-amber-500">
                          <span>{rev.rating}</span>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        </div>
                      </div>

                      <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        &quot;{rev.comment}&quot;
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                        <span>Task: {rev.jobTitle}</span>
                        <span>{rev.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* 5. Past Hired Workers & "Hire Again" Action */}
          <Card variant="default" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-rozgo-900 dark:text-rozgo-300" />
                  <span>Hiring History & Quick Re-Hire</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Easily re-hire trusted workers who have previously completed work for you.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/employer/requests')}
              >
                View All Requests
              </Button>
            </div>

            {employerUser.completedBookings && employerUser.completedBookings.length > 0 ? (
              <div className="space-y-3 pt-2">
                {employerUser.completedBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 rounded-2xl bg-white dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:border-rozgo-900 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      {booking.workerAvatar ? (
                        <img
                          src={booking.workerAvatar}
                          alt={booking.workerName}
                          className="w-12 h-12 rounded-xl object-cover border shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-rozgo-100 dark:bg-rozgo-900/40 text-rozgo-900 dark:text-rozgo-300 font-bold flex items-center justify-center shrink-0">
                          {booking.workerName.charAt(0)}
                        </div>
                      )}

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 dark:text-white text-sm">
                            {booking.workerName}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rozgo-50 text-rozgo-900 dark:bg-rozgo-900/60 dark:text-rozgo-300 capitalize">
                            {booking.workerTrade}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <span className="font-mono font-semibold text-rozgo-700 dark:text-rozgo-400">
                            {booking.workerLabourId}
                          </span>
                          <span>•</span>
                          <span>Completed on {booking.completedDate}</span>
                        </div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-400">
                          Paid: <strong>₹{booking.wagePaid}</strong> direct • {booking.location}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                      onClick={() => handleHireAgain(booking.workerTrade, booking.workerLabourId)}
                    >
                      Hire Again
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-neutral-400 text-xs rounded-2xl bg-neutral-50 dark:bg-darkbg-surface">
                No past bookings yet. Once you complete your first job with a worker, you can easily hire them again here.
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (Sidebar details) */}
        <div className="space-y-8">
          {/* 6. Saved Work Locations Card */}
          <Card variant="default" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rozgo-900 dark:text-rozgo-300" />
                <span>Saved Work Sites</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-bold text-rozgo-900 dark:text-rozgo-300 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Site</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {employerUser.workLocations && employerUser.workLocations.length > 0 ? (
                employerUser.workLocations.map((loc) => (
                  <div
                    key={loc.id}
                    className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 dark:text-white">{loc.label}</span>
                      {loc.isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rozgo-100 text-rozgo-900 dark:bg-rozgo-900/60 dark:text-rozgo-300">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-500">{loc.addressLine}, {loc.city}</p>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-darkbg-surface text-xs text-neutral-500">
                  {employerUser.location}
                </div>
              )}
            </div>

            {/* Privacy Protection Note */}
            <div className="p-3 rounded-xl bg-rozgo-50/70 dark:bg-darkbg-surface border border-rozgo-200 dark:border-darkbg-border text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-rozgo-700 shrink-0 mt-0.5" />
              <span>Exact house/flat numbers are hidden from workers until phone negotiation agreement.</span>
            </div>
          </Card>

          {/* 7. Hiring Preferences */}
          <Card variant="default" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-rozgo-900 dark:text-rozgo-300" />
                <span>Hiring Preferences</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-bold text-rozgo-900 dark:text-rozgo-300 hover:underline"
              >
                Edit
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-neutral-400 block mb-1.5 font-semibold">Frequently Needed Trades</span>
                <div className="flex flex-wrap gap-1.5">
                  {employerUser.hiringPreferences?.frequentlyNeededTrades?.map((trade) => (
                    <span
                      key={trade}
                      className="px-2.5 py-1 rounded-xl font-bold bg-rozgo-50 text-rozgo-900 dark:bg-darkbg-surface dark:text-rozgo-300 border border-rozgo-200 dark:border-darkbg-border capitalize"
                    >
                      {trade.replace('_', ' ')}
                    </span>
                  )) || <span className="text-neutral-400">Not specified</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border">
                  <span className="text-neutral-400 block">Frequency</span>
                  <span className="font-bold text-neutral-900 dark:text-white capitalize">
                    {employerUser.hiringPreferences?.hiringFrequency || 'Occasional'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border">
                  <span className="text-neutral-400 block">Workers Needed</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {employerUser.hiringPreferences?.workersUsuallyNeeded || '1'} Worker
                  </span>
                </div>
              </div>

              <div>
                <span className="text-neutral-400 block mb-1 font-semibold">Preferred Times</span>
                <div className="flex flex-wrap gap-1">
                  {employerUser.hiringPreferences?.preferredWorkTimes?.map((time) => (
                    <span
                      key={time}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* 8. Trust & Verification Status */}
          <Card variant="default" padding="lg" className="space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rozgo-900 dark:text-rozgo-300" />
              <span>Identity & Trust Status</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-darkbg-surface border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mobile Verified</span>
                </div>
                <Badge variant="verified" size="sm">✓ Done</Badge>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border flex items-center justify-between">
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white block">Government ID</span>
                  <span className="text-[11px] font-mono font-bold text-rozgo-900 dark:text-rozgo-300">
                    {employerUser.verificationDetails?.identityType
                      ? `${employerUser.verificationDetails.identityType.toUpperCase()}: ${employerUser.verificationDetails.identityMasked}`
                      : 'Aadhaar / Driving Licence'}
                  </span>
                </div>
                {employerUser.isVerified ? (
                  <Badge variant="verified" size="sm">✓ Verified</Badge>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      submitEmployerVerification({
                        identityType: 'aadhaar',
                        identityMasked: 'XXXX XXXX 6821',
                      });
                    }}
                  >
                    Verify Now
                  </Button>
                )}
              </div>

              {employerUser.employerType !== 'individual' && (
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border flex items-center justify-between">
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-white block">Business / Trade Reg</span>
                    <span className="text-[11px] font-mono font-bold text-rozgo-900 dark:text-rozgo-300">
                      {employerUser.verificationDetails?.businessDocNumber
                        ? `${(employerUser.verificationDetails.businessDocType || 'GSTIN').toUpperCase()}: ${employerUser.verificationDetails.businessDocNumber}`
                        : 'GSTIN / MSME (Optional)'}
                    </span>
                  </div>
                  {employerUser.verificationDetails?.businessVerified ? (
                    <Badge variant="verified" size="sm">✓ Verified</Badge>
                  ) : (
                    <span className="text-[11px] text-neutral-400 font-semibold">Optional</span>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* 9. Direct Payment Guarantee Card */}
          <Card
            variant="elevated"
            padding="lg"
            className="bg-rozgo-50/80 dark:bg-darkbg-surface border border-rozgo-200 dark:border-darkbg-border space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed"
          >
            <div className="flex items-center gap-2 text-rozgo-900 dark:text-rozgo-200 font-bold text-sm">
              <HeartHandshake className="w-4 h-4 text-rozgo-700" />
              <span>ROZGO Fair Wage Agreement</span>
            </div>
            <p>
              You negotiate fair wages directly with workers over the phone. No platform convenience fee is deducted from the worker&apos;s earnings.
            </p>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditEmployerProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};
