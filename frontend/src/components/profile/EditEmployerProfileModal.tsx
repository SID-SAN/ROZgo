import React, { useState } from 'react';
import {
  X,
  User,
  Building2,
  MapPin,
  Clock,
  Phone,
  Check,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { EmployerType, WorkLocationItem } from '../../types';

interface EditEmployerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_TRADES = [
  { id: 'plumber', label: 'Plumber', icon: '🔧' },
  { id: 'electrician', label: 'Electrician', icon: '⚡' },
  { id: 'carpenter', label: 'Carpenter', icon: '🪚' },
  { id: 'painter', label: 'Painter', icon: '🎨' },
  { id: 'mason', label: 'Mason / Rajmistri', icon: '🧱' },
  { id: 'daily_helper', label: 'Daily Helper / Beldar', icon: '🛠️' },
  { id: 'domestic_help', label: 'Domestic Help / Maid', icon: '🧹' },
  { id: 'ac_repair', label: 'AC & Appliance Repair', icon: '❄️' },
  { id: 'driver', label: 'Driver', icon: '🚗' },
  { id: 'gardener', label: 'Gardener / Mali', icon: '🌱' },
  { id: 'welder', label: 'Welder / Fabrication', icon: '⚙️' },
  { id: 'pest_control', label: 'Pest Control', icon: '🛡️' },
];

export const EditEmployerProfileModal: React.FC<EditEmployerProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { employerUser, updateEmployerProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'basic' | 'business' | 'preferences' | 'locations' | 'contact'>('basic');

  // Form states initialized with employerUser
  const [name, setName] = useState(employerUser.name || '');
  const [email, setEmail] = useState(employerUser.email || '');
  const [bio, setBio] = useState(employerUser.bio || '');
  const [avatar, setAvatar] = useState(employerUser.avatar || '');

  const [employerType, setEmployerType] = useState<EmployerType>(employerUser.employerType || 'individual');
  const [businessName, setBusinessName] = useState(employerUser.businessName || '');
  const [businessType, setBusinessType] = useState(employerUser.businessType || 'Retail & Local Commerce');
  const [employeeCount, setEmployeeCount] = useState(employerUser.employeeCount || '1–5 employees');
  const [designation, setDesignation] = useState(employerUser.designation || '');
  const [hiringPurpose, setHiringPurpose] = useState(employerUser.hiringPurpose || 'Home maintenance and renovation');

  const [selectedTrades, setSelectedTrades] = useState<string[]>(
    employerUser.hiringPreferences?.frequentlyNeededTrades || ['plumber', 'electrician']
  );
  const [hiringFrequency, setHiringFrequency] = useState(
    employerUser.hiringPreferences?.hiringFrequency || 'occasional'
  );
  const [workersUsuallyNeeded, setWorkersUsuallyNeeded] = useState(
    employerUser.hiringPreferences?.workersUsuallyNeeded || '1'
  );
  const [preferredWorkTimes, setPreferredWorkTimes] = useState<string[]>(
    employerUser.hiringPreferences?.preferredWorkTimes || ['Morning', 'Afternoon']
  );

  const [locations, setLocations] = useState<WorkLocationItem[]>(employerUser.workLocations || []);
  const [newLocLabel, setNewLocLabel] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');
  const [newLocCity, setNewLocCity] = useState(employerUser.location.split(',')[0]?.trim() || 'Gurgaon');

  const [preferredCommunication, setPreferredCommunication] = useState<'call' | 'app' | 'whatsapp'>(
    employerUser.preferredCommunication || 'call'
  );
  const [languagesSpoken, setLanguagesSpoken] = useState<string[]>(
    employerUser.languagesSpoken || ['Hindi', 'English']
  );
  const [emergencyContactName, setEmergencyContactName] = useState(employerUser.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(employerUser.emergencyContactPhone || '');

  if (!isOpen) return null;

  const toggleTrade = (tradeId: string) => {
    setSelectedTrades((prev) => {
      if (prev.includes(tradeId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== tradeId);
      }
      return [...prev, tradeId];
    });
  };

  const toggleLanguage = (lang: string) => {
    setLanguagesSpoken((prev) => {
      if (prev.includes(lang)) {
        if (prev.length === 1) return prev;
        return prev.filter((l) => l !== lang);
      }
      return [...prev, lang];
    });
  };

  const handleAddLocation = () => {
    if (!newLocAddress.trim()) return;
    const newLoc: WorkLocationItem = {
      id: `loc-${Date.now()}`,
      label: newLocLabel.trim() || `Site ${locations.length + 1}`,
      addressLine: newLocAddress.trim(),
      city: newLocCity.trim() || 'Gurgaon',
      state: 'Haryana',
      pincode: '122001',
      isDefault: locations.length === 0,
    };
    setLocations((prev) => [...prev, newLoc]);
    setNewLocLabel('');
    setNewLocAddress('');
  };

  const handleRemoveLocation = (locId: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== locId));
  };

  const handleSetDefaultLocation = (locId: string) => {
    setLocations((prev) =>
      prev.map((l) => ({
        ...l,
        isDefault: l.id === locId,
      }))
    );
  };

  const handleSave = () => {
    const defaultLoc = locations.find((l) => l.isDefault) || locations[0];
    const updatedDisplayLocation = defaultLoc
      ? `${defaultLoc.addressLine.split(',')[0]}, ${defaultLoc.city}`
      : employerUser.location;

    updateEmployerProfile({
      name: name.trim() || employerUser.name,
      email: email.trim() || undefined,
      bio: bio.trim() || undefined,
      avatar: avatar.trim() || employerUser.avatar,
      employerType,
      businessName: businessName.trim() || undefined,
      businessType: ['business', 'company'].includes(employerType) ? businessType : undefined,
      employeeCount: ['business', 'company'].includes(employerType) ? employeeCount : undefined,
      designation: employerType === 'company' ? designation : undefined,
      hiringPurpose: employerType === 'individual' ? hiringPurpose : undefined,
      location: updatedDisplayLocation,
      workLocations: locations,
      hiringPreferences: {
        frequentlyNeededTrades: selectedTrades,
        hiringFrequency,
        workersUsuallyNeeded,
        preferredWorkTimes,
      },
      preferredCommunication,
      languagesSpoken,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-darkbg-card rounded-3xl border border-neutral-200 dark:border-darkbg-border w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-left">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-darkbg-border flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-neutral-900 dark:text-white">Edit Employer Profile</h3>
            <span className="text-xs text-neutral-500 font-mono">Employer ID: {employerUser.employerId}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-darkbg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 dark:border-darkbg-border px-6 gap-2 overflow-x-auto text-xs font-bold">
          {[
            { id: 'basic', label: 'Basic & Bio', icon: User },
            { id: 'business', label: 'Category & Details', icon: Building2 },
            { id: 'preferences', label: 'Hiring Needs', icon: Clock },
            { id: 'locations', label: 'Work Sites', icon: MapPin },
            { id: 'contact', label: 'Communication', icon: Phone },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-rozgo-900 text-rozgo-900 dark:border-rozgo-400 dark:text-rozgo-300'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: Basic & Bio */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Full Name / Contact Person
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Profile Photo URL
                </label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  About You / Household / Organization Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short introduction for local workers..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-sm leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Category & Details */}
          {activeTab === 'business' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Employer Category
                </label>
                <select
                  value={employerType}
                  onChange={(e) => setEmployerType(e.target.value as EmployerType)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-sm font-semibold capitalize"
                >
                  <option value="individual">Individual / Household</option>
                  <option value="business">Shop / Small Business</option>
                  <option value="company">Office / Company</option>
                  <option value="contractor">Building Contractor</option>
                  <option value="property_manager">Property / Society Manager</option>
                  <option value="other">Other Entity</option>
                </select>
              </div>

              {employerType === 'individual' ? (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Primary Hiring Purpose
                  </label>
                  <input
                    type="text"
                    value={hiringPurpose}
                    onChange={(e) => setHiringPurpose(e.target.value)}
                    placeholder="e.g. Home maintenance, renovation, domestic chores"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-sm"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Organization / Business / Society Name
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Apex Hardware / DLF Phase 4 RWA"
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-sm font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Business Sector / Nature
                      </label>
                      <input
                        type="text"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-darkbg-border text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Designation / Role
                      </label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="Owner, Manager, Admin"
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-darkbg-border text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Hiring Needs */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Frequently Needed Trades
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_TRADES.map((trade) => {
                    const isChecked = selectedTrades.includes(trade.id);
                    return (
                      <button
                        key={trade.id}
                        type="button"
                        onClick={() => toggleTrade(trade.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                          isChecked
                            ? 'border-rozgo-900 bg-rozgo-50 dark:bg-darkbg-card dark:border-rozgo-400'
                            : 'border-neutral-200 dark:border-darkbg-border'
                        }`}
                      >
                        <span>{trade.icon}</span>
                        <span>{trade.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Hiring Frequency
                  </label>
                  <select
                    value={hiringFrequency}
                    onChange={(e) => setHiringFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-darkbg-border text-xs font-semibold"
                  >
                    <option value="occasional">When Needed (Occasional)</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily / Regular</option>
                    <option value="project">Project-based</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Typical Workers Needed
                  </label>
                  <select
                    value={workersUsuallyNeeded}
                    onChange={(e) => setWorkersUsuallyNeeded(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-darkbg-border text-xs font-semibold"
                  >
                    <option value="1">1 Worker</option>
                    <option value="2-5">2–5 Workers (Crew)</option>
                    <option value="6-10">6–10 Workers</option>
                    <option value="10+">10+ Workers (Majdoor Mitr)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Work Sites & Locations */}
          {activeTab === 'locations' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                  Saved Work Sites ({locations.length})
                </span>
                <div className="space-y-2">
                  {locations.map((loc) => (
                    <div
                      key={loc.id}
                      className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 dark:text-white">{loc.label}</span>
                          {loc.isDefault && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rozgo-100 text-rozgo-900 dark:bg-rozgo-900/60 dark:text-rozgo-300">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-500">{loc.addressLine}, {loc.city}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!loc.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultLocation(loc.id)}
                            className="text-xs font-bold text-rozgo-900 dark:text-rozgo-300 hover:underline"
                          >
                            Set Primary
                          </button>
                        )}
                        {locations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLocation(loc.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Site Form */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-darkbg-surface border border-neutral-300 dark:border-darkbg-border space-y-2">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                  + Add New Work Site
                </span>
                <input
                  type="text"
                  placeholder="Label (e.g. Warehouse 2 / DLF Phase 5 Flat)"
                  value={newLocLabel}
                  onChange={(e) => setNewLocLabel(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl text-xs border"
                />
                <input
                  type="text"
                  placeholder="Street Address / Colony"
                  value={newLocAddress}
                  onChange={(e) => setNewLocAddress(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl text-xs border"
                />
                <div className="flex items-center justify-between pt-1">
                  <input
                    type="text"
                    placeholder="City"
                    value={newLocCity}
                    onChange={(e) => setNewLocCity(e.target.value)}
                    className="w-1/2 px-3 py-1.5 rounded-xl text-xs border"
                  />
                  <Button variant="primary" size="sm" onClick={handleAddLocation}>
                    Add Site
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Communication & Contact */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Preferred Communication Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'call', label: 'Direct Phone Call' },
                    { id: 'app', label: 'App Notifications' },
                    { id: 'whatsapp', label: 'WhatsApp' },
                  ].map((comm) => (
                    <button
                      key={comm.id}
                      type="button"
                      onClick={() => setPreferredCommunication(comm.id as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border text-center transition-all ${
                        preferredCommunication === comm.id
                          ? 'border-rozgo-900 bg-rozgo-900 text-white'
                          : 'border-neutral-200 dark:border-darkbg-border'
                      }`}
                    >
                      {comm.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Languages Spoken
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Hindi', 'English', 'Punjabi', 'Bengali', 'Tamil', 'Telugu', 'Gujarati'].map((lang) => {
                    const isChecked = languagesSpoken.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                          isChecked
                            ? 'border-rozgo-900 bg-rozgo-900 text-white'
                            : 'border-neutral-200 dark:border-darkbg-border'
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Contact person"
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="Phone number"
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-darkbg-border flex items-center justify-end gap-3">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSave} rightIcon={<Check className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

