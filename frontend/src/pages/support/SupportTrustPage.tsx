import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  HelpCircle,
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronUp,
  Ban,
  PhoneCall,
  Lock,
  HeartHandshake,
  MessageSquare,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const SupportTrustPage: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Smooth scroll to anchor with header offset
  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const headerOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      window.history.pushState(null, '', `/support#${sectionId}`);
    }
  }, []);

  // Handle hash on initial load or URL change
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      const timer = setTimeout(() => {
        scrollToSection(hash);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash, scrollToSection]);

  // FAQ Data
  const faqs = [
    {
      category: 'general',
      categoryLabel: 'Getting Started',
      q: 'What is ROZGO?',
      a: 'ROZGO connects workers with people and businesses looking for their services. It is an open cooperative platform that helps blue-collar workers and daily-wage professionals build permanent digital identities and connect directly with local employers without middlemen commission cuts.',
    },
    {
      category: 'general',
      categoryLabel: 'Getting Started',
      q: 'How does ROZGO work?',
      a: 'Employers can create a work request, discover suitable workers and contact them. Workers can discover relevant work opportunities and decide whether they want to accept them. Direct communication and negotiation are encouraged so both sides agree clearly before confirming.',
    },
    {
      category: 'general',
      categoryLabel: 'Getting Started',
      q: 'Is ROZGO an employer?',
      a: 'ROZGO is a platform that helps workers and employers connect. The actual work arrangement, timing and payment are agreed directly between the worker and employer. ROZGO is not an employer or labor contractor.',
    },
    {
      category: 'workers',
      categoryLabel: 'For Workers',
      q: 'How do I create a worker account?',
      a: 'Registration takes under 2 minutes: Enter your mobile number, verify via OTP, choose your trade/skills (e.g. Plumber, Electrician, Carpenter), set your standard daily wage, and specify your service area.',
    },
    {
      category: 'workers',
      categoryLabel: 'For Workers',
      q: 'What is my ROZGO Labour Number?',
      a: 'Your ROZGO Labour Number is your unique worker ID (e.g., RZG-104582) used to identify your profile on ROZGO across India for life.',
    },
    {
      category: 'workers',
      categoryLabel: 'For Workers',
      q: 'How do I get verified?',
      a: 'Navigate to: Profile → Verification → Choose verification method (Aadhaar OTP, DigiLocker, or Skill India Certificate) → Submit details → Verification badge.',
    },
    {
      category: 'workers',
      categoryLabel: 'For Workers',
      q: 'How can I find work?',
      a: 'You can discover work through ROZGO in two ways: Go to "Find Work" in your dashboard to view matching job requests in your locality, and employers searching for your trade skills can discover your profile and call you directly.',
    },
    {
      category: 'workers',
      categoryLabel: 'For Workers',
      q: 'Can I reject a work request?',
      a: 'Yes. You can reject a request if the opportunity does not work for you.',
    },
    {
      category: 'workers',
      categoryLabel: 'For Workers',
      q: 'Can I negotiate with the employer?',
      a: 'Workers and employers can discuss the work, timing, payment and number of workers before confirming a booking.',
    },
    {
      category: 'employers',
      categoryLabel: 'For Employers',
      q: 'How do I hire a worker?',
      a: 'Follow the 6-step flow: Create Work Request → Select Service → Enter Work Details → View Recommended Workers → Contact Worker → Confirm Booking.',
    },
    {
      category: 'employers',
      categoryLabel: 'For Employers',
      q: 'Can I hire more than one worker?',
      a: 'Yes. You can use the Majdoor Mitr multiple-worker option to request groups of workers for renovation, construction, or bulk labor tasks.',
    },
    {
      category: 'employers',
      categoryLabel: 'For Employers',
      q: 'Can I directly hire a worker?',
      a: "Yes. If you know the worker's ROZGO Labour Number, you can use it to find or request that worker, subject to the platform's booking and availability rules.",
    },
    {
      category: 'employers',
      categoryLabel: 'For Employers',
      q: 'How do I cancel or reject a request?',
      a: 'You can cancel unconfirmed work requests at any time from your My Requests page. For confirmed bookings, please notify the worker promptly.',
    },
    {
      category: 'bookings',
      categoryLabel: 'Bookings',
      q: 'When is a booking confirmed?',
      a: 'Only after both sides complete the required confirmation process.',
    },
    {
      category: 'bookings',
      categoryLabel: 'Bookings',
      q: 'What happens after booking?',
      a: 'The workflow progresses through 5 clear stages: Booking Confirmed ↓ Work Takes Place ↓ Work Completed ↓ Booking Closed ↓ Rating & Review.',
    },
    {
      category: 'bookings',
      categoryLabel: 'Bookings',
      q: 'Can the agreed price change?',
      a: 'Any changes to the agreed work, timing or payment should be discussed and mutually agreed before proceeding.',
    },
    {
      category: 'verification',
      categoryLabel: 'Verification',
      q: 'Why should I verify my profile?',
      a: 'Verification helps build trust between workers and employers, boosting profile visibility and booking confidence.',
    },
    {
      category: 'verification',
      categoryLabel: 'Verification',
      q: 'Can employers see my Aadhaar?',
      a: 'Sensitive identity documents should not be publicly visible to employers. Only verified trust badges are displayed.',
    },
    {
      category: 'verification',
      categoryLabel: 'Verification',
      q: 'What happens if verification fails?',
      a: 'You can review the reason provided and try again with clearer or corrected information.',
    },
  ];

  const filteredFaqs = faqs.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const communityStandards = [
    { icon: HeartHandshake, title: 'Respect', desc: 'Treat everyone respectfully regardless of their job, background or position.' },
    { icon: ShieldCheck, title: 'Safety', desc: 'Do not put another person in unnecessary danger. Maintain safe working conditions.' },
    { icon: MessageSquare, title: 'Honest Communication', desc: 'Provide accurate information about the work, timing, location and requirements.' },
    { icon: DollarSign, title: 'Fair Dealing', desc: 'Discuss and agree on payment and work conditions clearly before starting work.' },
    { icon: Ban, title: 'No Harassment', desc: 'Harassment, threats, abuse or intimidation are not acceptable on ROZGO.' },
    { icon: AlertCircle, title: 'No Discrimination', desc: 'Do not discriminate against people based on protected characteristics.' },
    { icon: Lock, title: 'Respect Privacy', desc: 'Do not misuse another person\'s personal contact information or identity details.' },
    { icon: CheckCircle2, title: 'Keep Commitments', desc: 'Try to honour confirmed bookings or communicate as early as possible if circumstances change.' },
  ];

  const prohibitedList = [
    'Harassment of any kind',
    'Threats of violence or retaliation',
    'Abuse or verbal hostility',
    'Fraud, scamming, or deceptive offers',
    'Fake identities or impersonating others',
    'Misleading or inaccurate job descriptions',
    'Misuse of personal information or documents',
    'Extortion or demanding unauthorized fees',
    'Illegal or unlawful work activities',
    'Discriminatory behaviour',
    'Repeated abusive cancellations',
    'Attempting to bypass platform safety systems',
  ];

  const termsList = [
    {
      num: '1',
      title: 'About ROZGO',
      desc: 'ROZGO is a platform intended to connect workers and employers. ROZGO is not an employer, contractor, or employment agency. The actual work arrangement, timing, and payment are agreed directly between the worker and employer.',
    },
    {
      num: '2',
      title: 'User Accounts',
      desc: 'Users are responsible for: (a) Providing accurate information, (b) Keeping account credentials secure, (c) Using only their own account and Labour Number, and (d) Updating important information when necessary.',
    },
    {
      num: '3',
      title: 'Worker & Employer Responsibilities',
      desc: 'Workers should provide accurate skills and experience, communicate honestly, honour confirmed work where possible, and maintain professional conduct. Employers should provide accurate work information, clearly communicate requirements, respect workers, honour agreed payment terms, and maintain safe working conditions.',
    },
    {
      num: '4',
      title: 'Bookings',
      desc: 'ROZGO facilitates the connection and booking workflow between workers and employers. The parties should review the agreed work, timing, number of workers and payment before confirming the booking.',
    },
    {
      num: '5',
      title: 'Payments',
      desc: 'Payment arrangements should be clearly agreed between the worker and employer before work begins. Any ROZGO payment functionality will be governed by the applicable payment terms. ROZGO does not guarantee payment outcomes without direct mutual agreement.',
    },
    {
      num: '6',
      title: 'User Conduct',
      desc: 'Users must not harass others, provide fraudulent information, misuse the platform, attempt unauthorized access, use ROZGO for illegal activity, or abuse the reporting system.',
    },
    {
      num: '7',
      title: 'Verification',
      desc: 'ROZGO may provide verification features to help establish trust. A verification badge should not be interpreted as a guarantee of a user\'s character, skills or future behaviour.',
    },
    {
      num: '8',
      title: 'Reviews & Ratings',
      desc: 'Ratings and reviews should reflect genuine experiences and must not contain threats, harassment or intentionally misleading information.',
    },
    {
      num: '9',
      title: 'Account Suspension',
      desc: 'ROZGO may restrict or suspend accounts when necessary under its policies, particularly for fraud, abuse, safety violations, repeated serious misconduct, or illegal activity.',
    },
    {
      num: '10',
      title: 'Privacy',
      desc: 'ROZGO collects and uses personal information according to its Privacy Policy. Contact details and verification files are treated with strict confidentiality.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafcfa] dark:bg-darkbg-base text-neutral-900 dark:text-neutral-100 font-sans transition-colors">
      {/* PAGE HERO */}
      <section className="bg-gradient-to-b from-rozgo-50/80 via-white to-[#fafcfa] dark:from-darkbg-surface dark:via-darkbg-base dark:to-darkbg-base pt-12 pb-14 border-b border-neutral-200/80 dark:border-darkbg-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rozgo-100 dark:bg-rozgo-900/60 text-rozgo-900 dark:text-rozgo-200 text-xs sm:text-sm font-bold shadow-soft">
            <ShieldCheck className="w-4 h-4 text-rozgo-700 dark:text-rozgo-300" />
            <span>ROZGO Safe & Trusted Community</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-rozgo-900 dark:text-white tracking-tight">
            Support & Trust
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            We're here to help you use ROZGO safely and confidently.
          </p>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
        {/* ========================================================== */}
        {/* SECTION 1 — HELP CENTER & FAQs                             */}
        {/* ========================================================== */}
        <section id="faq" className="scroll-mt-28 space-y-6">
          <div className="border-b border-neutral-200 dark:border-darkbg-border pb-4 space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-rozgo-900 dark:text-white">
              Help Center & FAQs
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Find quick answers to common questions about ROZGO.
            </p>
          </div>

          {/* Search FAQ */}
          <div className="bg-white dark:bg-darkbg-card p-4 rounded-2xl border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rozgo-900 dark:text-rozgo-300">
              <Search className="w-4 h-4" />
              <span>Search for help</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="How can we help you?"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rozgo-900"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'general', label: 'Getting Started' },
              { id: 'workers', label: 'For Workers' },
              { id: 'employers', label: 'For Employers' },
              { id: 'bookings', label: 'Bookings' },
              { id: 'verification', label: 'Verification' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-rozgo-900 text-white shadow-soft'
                    : 'bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-darkbg-surface'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Accordion FAQ Items */}
          <div className="space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={faq.q}
                    className="bg-white dark:bg-darkbg-card rounded-2xl border border-neutral-200 dark:border-darkbg-border overflow-hidden shadow-soft transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-neutral-50 dark:hover:bg-darkbg-surface transition-colors"
                    >
                      <span className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white pr-4">
                        {faq.q}
                      </span>
                      <span className="p-1 rounded-full bg-neutral-100 dark:bg-darkbg-surface text-neutral-600 dark:text-neutral-300 flex-shrink-0">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed border-t border-neutral-100 dark:border-darkbg-border animate-fadeIn">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border space-y-3">
                <p className="font-bold text-neutral-900 dark:text-white text-base">No results found.</p>
                <p className="text-xs text-neutral-500">Try another search keyword.</p>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================== */}
        {/* SECTION 2 — COMMUNITY STANDARDS                             */}
        {/* ========================================================== */}
        <section id="community-standards" className="scroll-mt-28 space-y-6">
          <div className="border-b border-neutral-200 dark:border-darkbg-border pb-4 space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-rozgo-900 dark:text-white">
              ROZGO Community Standards
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              ROZGO works best when workers and employers treat each other with respect.
            </p>
          </div>

          {/* Core Principles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {communityStandards.map((std) => {
              const IconComp = std.icon;
              return (
                <div
                  key={std.title}
                  className="p-5 rounded-2xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-1.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rozgo-50 dark:bg-darkbg-surface text-rozgo-900 dark:text-rozgo-300 flex items-center justify-center">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-base text-rozgo-900 dark:text-white">
                      {std.title}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {std.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Prohibited Behaviour */}
          <div className="bg-red-50/50 dark:bg-red-950/20 p-5 rounded-2xl border border-red-200/80 dark:border-red-900/50 space-y-3">
            <div className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-600" />
              <h4 className="font-black text-base text-red-900 dark:text-red-200">
                What Is Not Allowed
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {prohibitedList.map((item) => (
                <div
                  key={item}
                  className="p-2.5 rounded-xl bg-white dark:bg-darkbg-card border border-red-100 dark:border-darkbg-border text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2 shadow-soft"
                >
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* SECTION 3 — TERMS OF SERVICE                               */}
        {/* ========================================================== */}
        <section id="terms" className="scroll-mt-28 space-y-6">
          <div className="border-b border-neutral-200 dark:border-darkbg-border pb-4 space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-rozgo-900 dark:text-white">
              Terms of Service
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Please read these terms before using ROZGO.
            </p>
          </div>

          {/* Terms Articles */}
          <div className="space-y-3">
            {termsList.map((term) => (
              <div
                key={term.num}
                className="p-5 rounded-2xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-rozgo-100 dark:bg-darkbg-surface text-rozgo-900 dark:text-rozgo-300 text-xs font-bold flex items-center justify-center">
                    {term.num}
                  </span>
                  <h4 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                    {term.title}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed pl-8">
                  {term.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Terms Version */}
          <div className="pt-3 border-t border-neutral-200 dark:border-darkbg-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
            <p className="font-semibold">Terms of Service • Version 1.0</p>
            <p>Last Updated: September 2026</p>
          </div>
        </section>
      </div>
    </div>
  );
};
