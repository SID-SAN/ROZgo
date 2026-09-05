import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { GrievanceProvider } from './context/GrievanceContext';

import { Header } from './components/navigation/Header';
import { Footer } from './components/navigation/Footer';
import { MobileNav } from './components/navigation/MobileNav';

// Auto scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Pages
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RoleSelectPage } from './pages/auth/RoleSelectPage';
import { WorkerOnboardingPage } from './pages/auth/WorkerOnboardingPage';
import { EmployerOnboardingPage } from './pages/auth/EmployerOnboardingPage';

import { WorkerDashboardPage } from './pages/worker/WorkerDashboardPage';
import { FindWorkPage } from './pages/worker/FindWorkPage';
import { WorkerProfilePage } from './pages/worker/WorkerProfilePage';
import { PublicWorkerProfilePage } from './pages/worker/PublicWorkerProfilePage';
import { CompletedWorksPage } from './pages/worker/CompletedWorksPage';
import { WorkerVerificationPage } from './pages/worker/WorkerVerificationPage';

import { AdminVerificationPage } from './pages/admin/AdminVerificationPage';

import { EmployerHomePage } from './pages/employer/EmployerHomePage';
import { CreateWorkRequestPage } from './pages/employer/CreateWorkRequestPage';
import { WorkerMatchPage } from './pages/employer/WorkerMatchPage';
import { MyRequestsPage } from './pages/employer/MyRequestsPage';
import { EmployerProfilePage } from './pages/employer/EmployerProfilePage';

import { AboutPage } from './pages/about/AboutPage';

// Grievance Pages
import { GrievanceLandingPage } from './pages/grievance/GrievanceLandingPage';
import { RaiseGrievancePage } from './pages/grievance/RaiseGrievancePage';
import { MyGrievancesPage } from './pages/grievance/MyGrievancesPage';
import { GrievanceDetailPage } from './pages/grievance/GrievanceDetailPage';
import { AdminGrievancePage } from './pages/grievance/AdminGrievancePage';
import { AdminGrievanceDetailPage } from './pages/grievance/AdminGrievanceDetailPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BookingProvider>
            <GrievanceProvider>
              <BrowserRouter>
                <ScrollToTop />
                <div className="flex flex-col min-h-screen bg-[#fafcfa] dark:bg-darkbg-base text-neutral-900 dark:text-neutral-100 font-sans antialiased transition-colors selection:bg-rozgo-200 dark:selection:bg-rozgo-800">
                  {/* Global Accessible Header */}
                  <Header />

                  {/* Main Content Viewport */}
                  <main className="flex-1 pb-16 lg:pb-0">
                    <Routes>
                      {/* Public & Landing */}
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/about" element={<AboutPage />} />

                      {/* Grievance & Redressal Journeys */}
                      <Route path="/help" element={<GrievanceLandingPage />} />
                      <Route path="/grievances" element={<GrievanceLandingPage />} />
                      <Route path="/grievances/new" element={<RaiseGrievancePage />} />
                      <Route path="/grievances/my" element={<MyGrievancesPage />} />
                      <Route path="/grievances/:id" element={<GrievanceDetailPage />} />
                      <Route path="/admin/grievances" element={<AdminGrievancePage />} />
                      <Route path="/admin/grievances/:id" element={<AdminGrievanceDetailPage />} />

                      {/* Auth & Onboarding */}
                      <Route path="/auth/login" element={<LoginPage />} />
                      <Route path="/auth/create-account" element={<RoleSelectPage />} />
                      <Route path="/auth/onboarding" element={<WorkerOnboardingPage />} />
                      <Route path="/auth/employer-onboard" element={<EmployerOnboardingPage />} />
                      <Route path="/auth/employer-register" element={<EmployerOnboardingPage />} />

                      {/* Worker Journeys */}
                      <Route path="/worker/dashboard" element={<WorkerDashboardPage />} />
                      <Route path="/worker/find-work" element={<FindWorkPage />} />
                      <Route path="/worker/completed-works" element={<CompletedWorksPage />} />
                      <Route path="/worker/profile" element={<WorkerProfilePage />} />
                      <Route path="/worker/:labourId" element={<PublicWorkerProfilePage />} />
                      <Route path="/worker/verify" element={<WorkerVerificationPage />} />

                      {/* Admin Verification Console */}
                      <Route path="/admin/verification" element={<AdminVerificationPage />} />

                      {/* Employer Journeys */}
                      <Route path="/employer" element={<EmployerHomePage />} />
                      <Route path="/employer/request" element={<CreateWorkRequestPage />} />
                      <Route path="/employer/match" element={<WorkerMatchPage />} />
                      <Route path="/employer/requests" element={<MyRequestsPage />} />
                      <Route path="/employer/profile" element={<EmployerProfilePage />} />

                      {/* Legacy / Catch-all redirects */}
                      <Route path="/profile" element={<WorkerProfilePage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>

                  {/* Global Cooperative Footer */}
                  <Footer />

                  {/* Bottom navigation for mobile */}
                  <MobileNav />
                </div>
              </BrowserRouter>
            </GrievanceProvider>
          </BookingProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
