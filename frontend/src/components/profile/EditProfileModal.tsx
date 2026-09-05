import React, { useState } from 'react';
import {
  X,
  User,
  Briefcase,
  FileText,
  Clock,
  Globe,
  Save,
  Info,
  ShieldCheck,
  Plus,
  Trash2
} from 'lucide-react';
import { WorkerProfile, WorkerLanguageItem } from '../../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: WorkerProfile;
  onSave: (updated: Partial<WorkerProfile>) => void;
}

const AVAILABLE_SKILLS: { id: string; label: string }[] = [
  { id: 'plumber', label: 'Plumber' },
  { id: 'electrician', label: 'Electrician' },
  { id: 'carpenter', label: 'Carpenter' },
  { id: 'painter', label: 'Painter' },
  { id: 'mason', label: 'Mason' },
  { id: 'driver', label: 'Driver' },
  { id: 'domestic_help', label: 'Domestic Help' },
  { id: 'ac_technician', label: 'AC Technician' },
  { id: 'gardener', label: 'Gardener' },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  worker,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'about' | 'availability' | 'languages'>('personal');

  // Form states
  const [name, setName] = useState(worker.name);
  const [age, setAge] = useState(worker.dobOrAge || '32');
  const [gender, setGender] = useState(worker.gender || 'male');
  const [city, setCity] = useState(worker.city || (worker.location.includes(',') ? worker.location.split(',')[1].trim() : worker.location));
  const [area, setArea] = useState(worker.location.includes(',') ? worker.location.split(',')[0].trim() : worker.location);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(worker.serviceRadiusKm || worker.maxTravelDistanceKm || 10);
  
  const [primarySkill, setPrimarySkill] = useState<string>(worker.primarySkill);
  const [secondarySkills, setSecondarySkills] = useState<string[]>(worker.secondarySkills || worker.skills.slice(1) || []);
  const [experienceYears, setExperienceYears] = useState(String(worker.experienceYears || 5));
  const [dailyRate, setDailyRate] = useState(String(worker.dailyRate || 800));
  const [hourlyRate, setHourlyRate] = useState(String(worker.hourlyRate || 150));
  
  const [bio, setBio] = useState(worker.bio || '');

  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'busy' | 'unavailable'>(
    worker.availability === 'Available Today' ? 'available' : worker.availability === 'Busy' ? 'busy' : 'unavailable'
  );

  const [languages, setLanguages] = useState<WorkerLanguageItem[]>(
    worker.languagesKnown?.length
      ? worker.languagesKnown
      : (worker.languagesList?.length ? worker.languagesList : [
          { name: 'Hindi', proficiency: 'Fluent' as const },
          { name: 'Marathi', proficiency: 'Fluent' as const },
          { name: 'English', proficiency: 'Conversational' as const },
        ])
  );

  const [newLangName, setNewLangName] = useState('');
  const [newLangProficiency, setNewLangProficiency] = useState<'Fluent' | 'Conversational' | 'Basic'>('Fluent');

  if (!isOpen) return null;

  const handleToggleSecondarySkill = (skill: string) => {
    if (skill === primarySkill) return;
    if (secondarySkills.includes(skill)) {
      setSecondarySkills(secondarySkills.filter((s) => s !== skill));
    } else {
      setSecondarySkills([...secondarySkills, skill]);
    }
  };

  const handleAddLanguage = () => {
    if (!newLangName.trim()) return;
    setLanguages([...languages, { name: newLangName.trim(), proficiency: newLangProficiency }]);
    setNewLangName('');
  };

  const handleRemoveLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const isToday = availabilityStatus === 'available';
    const avail: 'Available Today' | 'Busy' | 'Available Tomorrow' =
      availabilityStatus === 'available'
        ? 'Available Today'
        : availabilityStatus === 'busy'
        ? 'Busy'
        : 'Available Tomorrow';

    const currentSchedule = worker.weeklySchedule || [
      { day: 'Today', status: 'available' as const, hours: '9:00 AM – 6:00 PM' },
      { day: 'Tomorrow', status: 'available' as const, hours: '9:00 AM – 6:00 PM' },
      { day: 'Sunday', status: 'unavailable' as const, hours: 'Rest day' },
    ];

    const updatedWeeklySchedule = currentSchedule.map((slot, idx) =>
      idx === 0 || slot.day.toLowerCase() === 'today'
        ? { ...slot, status: (isToday ? 'available' : 'unavailable') as 'available' | 'unavailable' }
        : slot
    );

    const updated: Partial<WorkerProfile> = {
      ...(worker.isVerified ? {} : { name: name.trim() }),
      dobOrAge: age,
      gender: gender,
      location: area.trim() ? `${area.trim()}, ${city.trim()}` : city.trim(),
      city: city.trim(),
      serviceRadiusKm: Number(serviceRadiusKm),
      maxTravelDistanceKm: Number(serviceRadiusKm),
      primarySkill,
      secondarySkills,
      skills: [primarySkill, ...secondarySkills],
      experienceYears: parseInt(experienceYears, 10) || 0,
      dailyRate: parseInt(dailyRate, 10) || 0,
      hourlyRate: parseInt(hourlyRate, 10) || 0,
      bio: bio.trim(),
      availability: avail,
      availableToday: isToday,
      weeklySchedule: updatedWeeklySchedule,
      languagesKnown: languages,
      languagesList: languages,
    };

    onSave(updated);
    onClose();
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'professional', label: 'Trade & Skills', icon: Briefcase },
    { id: 'about', label: 'About Me', icon: FileText },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'languages', label: 'Languages', icon: Globe },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-darkbg-surface w-full max-w-2xl rounded-3xl border border-neutral-200 dark:border-darkbg-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#123B32] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <User className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Edit Worker Profile</h3>
              <p className="text-xs text-emerald-200">Keep your details fresh for higher employer hiring</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-neutral-200 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-base overflow-x-auto no-scrollbar px-3 pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap rounded-t-xl transition-all border-b-2 ${
                  isActive
                    ? 'bg-white dark:bg-darkbg-surface text-[#123B32] dark:text-emerald-400 border-[#123B32] dark:border-emerald-400 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-left">
          {/* TAB 1: PERSONAL */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Full Legal Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={worker.isVerified}
                    className={`w-full text-sm rounded-xl px-3.5 py-2.5 border ${
                      worker.isVerified
                        ? 'bg-neutral-100 dark:bg-darkbg-base text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-darkbg-border cursor-not-allowed'
                        : 'bg-white dark:bg-darkbg-base border-neutral-300 dark:border-darkbg-border text-neutral-900 dark:text-white focus:border-[#123B32]'
                    } outline-none transition-colors`}
                  />
                  {worker.isVerified && (
                    <span className="absolute right-3 top-3 text-emerald-600 flex items-center gap-1 text-xs font-medium">
                      <ShieldCheck className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                </div>
                {worker.isVerified && (
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3 text-[#123B32]" />
                    To modify a verified name, please raise a request with ROZGO verification support.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full text-sm rounded-xl px-3.5 py-2.5 border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-base text-neutral-900 dark:text-white outline-none focus:border-[#123B32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full text-sm rounded-xl px-3.5 py-2.5 border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-base text-neutral-900 dark:text-white outline-none focus:border-[#123B32]"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    City / District
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-sm rounded-xl px-3.5 py-2.5 border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-base text-neutral-900 dark:text-white outline-none focus:border-[#123B32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Locality / Hub
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full text-sm rounded-xl px-3.5 py-2.5 border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-base text-neutral-900 dark:text-white outline-none focus:border-[#123B32]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Max Travel Distance
                  </label>
                  <span className="text-xs font-bold text-[#123B32] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg">
                    {serviceRadiusKm} km
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="35"
                  step="1"
                  value={serviceRadiusKm}
                  onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                  className="w-full accent-[#123B32]"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Employers within this radius from your hub will receive your profile.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: TRADE & SKILLS */}
          {activeTab === 'professional' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Primary Trade / Skill
                </label>
                <select
                  value={primarySkill}
                  onChange={(e) => setPrimarySkill(e.target.value)}
                  className="w-full text-sm rounded-xl px-3.5 py-2.5 border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-base text-neutral-900 dark:text-white outline-none focus:border-[#123B32]"
                >
                  {AVAILABLE_SKILLS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  Secondary / Additional Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SKILLS.filter((s) => s.id !== primarySkill).map((s) => {
                    const isSelected = secondarySkills.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleToggleSecondarySkill(s.id)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all ${
                          isSelected
                            ? 'bg-[#123B32] text-white border-[#123B32]'
                            : 'bg-neutral-50 dark:bg-darkbg-base text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-darkbg-border hover:border-neutral-400'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Experience (Yrs)
                  </label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2.5 border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-base text-neutral-900 dark:text-white outline-none focus:border-[#123B32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Daily Wage (₹)
                  </label>
                  <input
                    type="number"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2.5 border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-base text-neutral-900 dark:text-white outline-none focus:border-[#123B32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Hourly Wage (₹)
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2.5 border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-base text-neutral-900 dark:text-white outline-none focus:border-[#123B32]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ABOUT ME */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  About Me / Work Summary
                </label>
                <textarea
                  rows={6}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Introduce yourself to employers. Mention your work ethics, reliability, types of projects done, and equipment you own..."
                  className="w-full text-sm rounded-2xl p-4 border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-base text-neutral-900 dark:text-white outline-none focus:border-[#123B32] transition-colors leading-relaxed"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Tip: A warm, clear introduction helps you get 40% more work inquiries.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: AVAILABILITY */}
          {activeTab === 'availability' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Today&apos;s Availability Status
                </label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Select your availability for today. If marked unavailable/busy, daily jobs will be hidden.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'available', label: 'Available Today', desc: 'Ready for booking today', color: 'emerald' },
                  { id: 'busy', label: 'Busy on Job', desc: 'Currently assigned', color: 'amber' },
                  { id: 'unavailable', label: 'Not Available Today', desc: 'Resting / On leave', color: 'red' },
                ].map((st) => {
                  const isSelected = availabilityStatus === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setAvailabilityStatus(st.id as any)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#123B32] bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-[#123B32]'
                          : 'border-neutral-200 dark:border-darkbg-border bg-white dark:bg-darkbg-base hover:border-neutral-300'
                      }`}
                    >
                      <p className="font-bold text-xs text-neutral-900 dark:text-white">{st.label}</p>
                      <p className="text-[10px] text-neutral-500 mt-1">{st.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="p-3.5 bg-neutral-50 dark:bg-darkbg-base rounded-2xl border border-neutral-200 dark:border-darkbg-border">
                <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Regular Working Hours</p>
                <p className="text-xs text-neutral-500 mt-0.5">8:00 AM – 6:00 PM</p>
              </div>
            </div>
          )}

          {/* TAB 5: LANGUAGES */}
          {activeTab === 'languages' && (
            <div className="space-y-4">
              <div className="space-y-2">
                {languages.map((lang, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-darkbg-base border border-neutral-200 dark:border-darkbg-border"
                  >
                    <div>
                      <p className="font-bold text-xs text-neutral-900 dark:text-white">{lang.name}</p>
                      <p className="text-[10px] text-[#123B32] dark:text-emerald-400 font-semibold">{lang.proficiency}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove language"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Language Row */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="e.g. Marathi, Telugu"
                  value={newLangName}
                  onChange={(e) => setNewLangName(e.target.value)}
                  className="flex-1 text-xs rounded-xl px-3 py-2 border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-base text-neutral-900 dark:text-white outline-none focus:border-[#123B32]"
                />
                <select
                  value={newLangProficiency}
                  onChange={(e) => setNewLangProficiency(e.target.value as any)}
                  className="text-xs rounded-xl px-3 py-2 border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-base text-neutral-900 dark:text-white outline-none"
                >
                  <option value="Native">Native</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Basic">Basic</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="px-3.5 py-2 rounded-xl bg-[#123B32] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#0c2721]"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-base/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#123B32] text-white hover:bg-[#0c2721] transition-all shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
