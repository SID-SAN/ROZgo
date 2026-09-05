import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  Camera, 
  Upload, 
  Trash2, 
  X,
  AlertTriangle,
  LogOut,
  User,
  Wrench,
  ShieldCheck,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { WorkerProfile } from '../../types';

// Profile modular components
import { WorkerProfileHeader } from '../../components/profile/WorkerProfileHeader';
import { ShareProfileModal } from '../../components/profile/ShareProfileModal';
import { EditProfileModal } from '../../components/profile/EditProfileModal';
import { ProfileCompletionCard } from '../../components/profile/ProfileCompletionCard';
import { BasicInfoCard } from '../../components/profile/BasicInfoCard';
import { AboutMeCard } from '../../components/profile/AboutMeCard';
import { SkillsSection } from '../../components/profile/SkillsSection';
import { ExperienceSection } from '../../components/profile/ExperienceSection';
import { ServiceAreaCard } from '../../components/profile/ServiceAreaCard';
import { AvailabilityCard } from '../../components/profile/AvailabilityCard';
import { WorkPortfolioSection } from '../../components/profile/WorkPortfolioSection';
import { CertificationsSection } from '../../components/profile/CertificationsSection';
import { SkillIndiaCard } from '../../components/profile/SkillIndiaCard';
import { EducationLanguagesCard } from '../../components/profile/EducationLanguagesCard';
import { PrivateVerificationCard } from '../../components/profile/PrivateVerificationCard';
import { WorkerBenefitsCard } from '../../components/profile/WorkerBenefitsCard';
import { ProfilePrivacyCard } from '../../components/profile/ProfilePrivacyCard';
import { WorkerReferralCard } from '../../components/profile/WorkerReferralCard';

type SectionTabId = 'overview' | 'skills' | 'verification' | 'settings';

interface SectionTab {
  id: SectionTabId;
  label: string;
  icon: React.ElementType;
  count: number;
}

export const WorkerProfilePage: React.FC = () => {
  const { workerUser, updateWorkerProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Active section filter tab
  const [activeTab, setActiveTab] = useState<SectionTabId>('overview');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleProfileSave = (updatedFields: Partial<WorkerProfile>) => {
    updateWorkerProfile(updatedFields);
    showToast('Profile updated successfully!');
  };

  const SECTION_TABS: SectionTab[] = [
    { id: 'overview', label: 'Overview & Bio', icon: User, count: 4 },
    { id: 'skills', label: 'Skills & Portfolio', icon: Wrench, count: 4 },
    { id: 'verification', label: 'Verification & Benefits', icon: ShieldCheck, count: 5 },
    { id: 'settings', label: 'Privacy & Account', icon: Settings, count: 2 },
  ];

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-darkbg-base py-6 sm:py-10 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#123B32] text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-500/30 animate-fade-in text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            {toastMessage}
          </div>
        )}

        {/* Unverified Alert Banner */}
        {!workerUser.isVerified && (
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm text-left">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-amber-900 dark:text-amber-200">
                  Profile Not Yet Verified
                </h3>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300/80 mt-0.5 max-w-2xl">
                  Complete Aadhaar or e-Shram verification to build trust with local employers, receive direct booking requests, and get your official ROZGO Labour Number.
                </p>
              </div>
            </div>

            <Link
              to="/worker/verify"
              className="px-5 py-2.5 rounded-xl bg-[#123B32] text-white text-xs font-bold hover:bg-[#0c2721] transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              Verify Profile Now
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Master Profile Header Card & Immediate Availability Section */}
        <div className="space-y-4 sm:space-y-6">
          <WorkerProfileHeader
            worker={workerUser}
            onEditProfile={() => setIsEditModalOpen(true)}
            onShareProfile={() => setIsShareModalOpen(true)}
            onLogout={handleLogout}
            onUpdatePhoto={(newPhotoUrl) => {
              updateWorkerProfile({ avatar: newPhotoUrl });
              showToast('Profile photo updated successfully!');
            }}
          />

          {/* Quick Availability Status positioned near the Worker Name Card */}
          <AvailabilityCard
            schedule={workerUser.weeklySchedule}
            onUpdateSchedule={(newSch) => {
              const isTodayAvail = newSch.find((s) => s.day.toLowerCase() === 'today')?.status === 'available';
              updateWorkerProfile({ 
                weeklySchedule: newSch,
                availability: isTodayAvail ? 'Available Today' : 'Busy',
                availableToday: isTodayAvail,
              });
              showToast(isTodayAvail ? 'Availability updated: Available for work today!' : 'Availability updated: Not available today.');
            }}
          />
        </div>

        {/* Section Filter & Navigation Tabs Bar with enhanced spacing */}
        <div className="bg-white dark:bg-darkbg-card rounded-2xl p-2.5 sm:p-3 border border-neutral-200 dark:border-darkbg-border shadow-soft">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
            {SECTION_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                    isActive
                      ? 'bg-rozgo-900 text-white shadow-soft dark:bg-rozgo-100 dark:text-rozgo-900'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-darkbg-surface'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-rozgo-200 dark:text-rozgo-900' : 'text-neutral-400'}`} />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold shrink-0 ${
                      isActive
                        ? 'bg-rozgo-800 text-rozgo-100 dark:bg-rozgo-200 dark:text-rozgo-900'
                        : 'bg-neutral-100 dark:bg-darkbg-surface text-neutral-500 dark:text-neutral-400 border border-neutral-200/60 dark:border-darkbg-border'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: Personal & Overview */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <section className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-darkbg-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rozgo-100 dark:bg-rozgo-900/50 text-rozgo-900 dark:text-rozgo-300 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                    <span>Identity & Professional Overview</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-darkbg-surface text-neutral-600 dark:text-neutral-400">
                      4 Cards
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Basic information, personal bio, service distance, and spoken languages.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Basic Info & About Me */}
              <div className="lg:col-span-7 space-y-6">
                <BasicInfoCard worker={workerUser} />
                <AboutMeCard
                  bio={workerUser.bio}
                  onSaveBio={(newBio) => {
                    updateWorkerProfile({ bio: newBio });
                    showToast('About Me updated successfully!');
                  }}
                />
              </div>

              {/* Right Column: Service Radius & Languages */}
              <div className="lg:col-span-5 space-y-6">
                <ServiceAreaCard
                  areas={workerUser.serviceAreaList || [workerUser.location]}
                  maxDistanceKm={workerUser.maxTravelDistanceKm || workerUser.serviceRadiusKm || 10}
                />
                <EducationLanguagesCard
                  education={workerUser.educationTraining}
                  languages={workerUser.languagesKnown || workerUser.languagesList}
                />
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: Skills, Experience & Work Portfolio */}
        {/* ========================================================================= */}
        {activeTab === 'skills' && (
          <section className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-darkbg-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                    <span>Skills, Experience & Work Portfolio</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-darkbg-surface text-neutral-600 dark:text-neutral-400">
                      4 Cards
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Trade competencies, experience breakdown, project photo gallery, and certifications.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Skills & Experience */}
              <div className="lg:col-span-6 space-y-6">
                <SkillsSection
                  skills={workerUser.skills}
                  onAddSkill={(newSkill) => {
                    if (!workerUser.skills.includes(newSkill)) {
                      updateWorkerProfile({ skills: [...workerUser.skills, newSkill] });
                      showToast(`Skill "${newSkill}" added!`);
                    }
                  }}
                  onRemoveSkill={(remSkill) => {
                    updateWorkerProfile({ skills: workerUser.skills.filter((s) => s !== remSkill) });
                    showToast(`Skill removed.`);
                  }}
                />
                <ExperienceSection
                  totalYears={workerUser.experienceYears}
                  breakdown={workerUser.experienceBreakdown}
                />
              </div>

              {/* Right Column: Portfolio & Certifications */}
              <div className="lg:col-span-6 space-y-6">
                <WorkPortfolioSection
                  portfolio={workerUser.portfolio}
                  onAddPortfolioItem={(item) => {
                    updateWorkerProfile({
                      portfolio: [...(workerUser.portfolio || []), item],
                    });
                    showToast('New project added to your portfolio!');
                  }}
                />
                <CertificationsSection
                  certifications={workerUser.certifications}
                  onAddCertificate={(cert) => {
                    updateWorkerProfile({
                      certifications: [...(workerUser.certifications || []), cert],
                    });
                    showToast('Certificate submitted for verification review!');
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: Verification, Benefits & Growth */}
        {/* ========================================================================= */}
        {activeTab === 'verification' && (
          <section className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-darkbg-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                    <span>Verification, Welfare & Career Growth</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-darkbg-surface text-neutral-600 dark:text-neutral-400">
                      5 Cards
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Profile trust score, private document vault, Skill India training, welfare benefits, and Majdoor Mitr referrals.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Profile Completion & Private Identity Vault */}
              <div className="lg:col-span-6 space-y-6">
                <ProfileCompletionCard
                  worker={workerUser}
                  onCompleteProfile={() => setIsEditModalOpen(true)}
                />
                <PrivateVerificationCard worker={workerUser} />
                <WorkerReferralCard />
              </div>

              {/* Right Column: Skill India & Worker Benefits */}
              <div className="lg:col-span-6 space-y-6">
                <SkillIndiaCard primarySkill={workerUser.primarySkill} />
                <WorkerBenefitsCard benefits={workerUser.benefits} />
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: Privacy & Account Settings */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <section className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-darkbg-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-neutral-200 dark:bg-darkbg-surface text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                    <span>Privacy & Account Settings</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-darkbg-surface text-neutral-600 dark:text-neutral-400">
                      2 Cards
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Control who sees your profile and manage your device login session.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <ProfilePrivacyCard
                  visibility={workerUser.profileVisibility || 'all_employers'}
                  onUpdateVisibility={(vis: 'all_employers' | 'only_requested') => {
                    updateWorkerProfile({ profileVisibility: vis });
                    showToast('Privacy preferences updated.');
                  }}
                />
              </div>

              <div className="lg:col-span-5">
                <div className="bg-white dark:bg-darkbg-card rounded-3xl p-6 border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-4 text-left">
                  <div>
                    <h4 className="font-bold text-base text-neutral-900 dark:text-white">Account Session</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Logged in as <strong className="text-neutral-800 dark:text-neutral-200">{workerUser.name}</strong> ({workerUser.phone})
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-xs text-neutral-600 dark:text-neutral-400">
                    Your ROZGO session is secure. Logging out will require an OTP verification on your registered mobile number when you sign back in.
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-5 py-3 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out of ROZGO
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Share Profile Modal (QR + Link) */}
      <ShareProfileModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        worker={workerUser}
      />

      {/* Edit Profile Multi-tab Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        worker={workerUser}
        onSave={handleProfileSave}
      />
    </div>
  );
};

export default WorkerProfilePage;
