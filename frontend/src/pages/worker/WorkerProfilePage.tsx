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
import { RatingsReviewsSection } from '../../components/profile/RatingsReviewsSection';
import { WorkHistorySection } from '../../components/profile/WorkHistorySection';
import { WorkPortfolioSection } from '../../components/profile/WorkPortfolioSection';
import { CertificationsSection } from '../../components/profile/CertificationsSection';
import { SkillIndiaCard } from '../../components/profile/SkillIndiaCard';
import { EducationLanguagesCard } from '../../components/profile/EducationLanguagesCard';
import { PrivateVerificationCard } from '../../components/profile/PrivateVerificationCard';
import { WorkerBenefitsCard } from '../../components/profile/WorkerBenefitsCard';
import { ProfilePrivacyCard } from '../../components/profile/ProfilePrivacyCard';
import { WorkerReferralCard } from '../../components/profile/WorkerReferralCard';

export const WorkerProfilePage: React.FC = () => {
  const { workerUser, updateWorkerProfile, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-darkbg-base py-6 sm:py-10">
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

        {/* Master Profile Header Card */}
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

        {/* Responsive 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Main Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* Basic Info */}
            <BasicInfoCard 
              worker={workerUser} 
            />

            {/* About Me */}
            <AboutMeCard 
              bio={workerUser.bio} 
              onSaveBio={(newBio) => {
                updateWorkerProfile({ bio: newBio });
                showToast('About Me updated successfully!');
              }}
            />

            {/* Skills & Trades */}
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

            {/* Specialization & Experience */}
            <ExperienceSection 
              totalYears={workerUser.experienceYears} 
              breakdown={workerUser.experienceBreakdown} 
            />

            {/* Work Portfolio / "My Work" photos */}
            <WorkPortfolioSection 
              portfolio={workerUser.portfolio} 
              onAddPortfolioItem={(item) => {
                updateWorkerProfile({
                  portfolio: [...(workerUser.portfolio || []), item],
                });
                showToast('New project added to your portfolio!');
              }}
            />

            {/* Availability Slots & Working Hours */}
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

            {/* Education & Languages */}
            <EducationLanguagesCard 
              education={workerUser.educationTraining}
              languages={workerUser.languagesKnown || workerUser.languagesList}
            />

            {/* Ratings & Client Feedback Reviews */}
            <RatingsReviewsSection 
              rating={workerUser.rating}
              completedJobsCount={workerUser.completedJobsCount}
              reviews={workerUser.reviews}
            />

            {/* Completed Work History & Grievance Access */}
            <WorkHistorySection 
              works={workerUser.completedWorks || []} 
            />
          </div>

          {/* Sidebar Right Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            {/* Profile Completion Meter */}
            <ProfileCompletionCard 
              worker={workerUser} 
              onCompleteProfile={() => setIsEditModalOpen(true)}
            />

            {/* Service Radius & Location */}
            <ServiceAreaCard 
              areas={workerUser.serviceAreaList || [workerUser.location]}
              maxDistanceKm={workerUser.maxTravelDistanceKm || workerUser.serviceRadiusKm || 10}
            />

            {/* Certified Skills & Badges */}
            <CertificationsSection 
              certifications={workerUser.certifications} 
              onAddCertificate={(cert) => {
                updateWorkerProfile({
                  certifications: [...(workerUser.certifications || []), cert],
                });
                showToast('Certificate submitted for verification review!');
              }}
            />

            {/* Skill India Digital Hub Recommendations */}
            <SkillIndiaCard 
              primarySkill={workerUser.primarySkill} 
            />

            {/* Private Document & Identity Verification Status */}
            <PrivateVerificationCard 
              worker={workerUser} 
            />

            {/* Worker Benefits & Social Security Entitlements */}
            <WorkerBenefitsCard 
              benefits={workerUser.benefits} 
            />

            {/* Profile Visibility & Privacy Settings */}
            <ProfilePrivacyCard 
              visibility={workerUser.profileVisibility || 'all_employers'}
              onUpdateVisibility={(vis: 'all_employers' | 'only_requested') => {
                updateWorkerProfile({ profileVisibility: vis });
                showToast('Privacy preferences updated.');
              }}
            />

            {/* Worker Referral (Majdoor Mitr) */}
            <WorkerReferralCard />
          </div>
        </div>

        {/* Account Session & Logout Card */}
        <div className="bg-white dark:bg-darkbg-card rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-darkbg-border shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Account Session</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Logged in as <strong className="text-neutral-800 dark:text-neutral-200">{workerUser.name}</strong> ({workerUser.phone})
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            Log Out of ROZGO
          </button>
        </div>
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
