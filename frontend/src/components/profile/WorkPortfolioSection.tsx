import React, { useState } from 'react';
import { Camera, Plus, X, Upload, ImageIcon, Eye } from 'lucide-react';
import { WorkerPortfolioItem } from '../../types';
import { Button } from '../common/Button';

interface WorkPortfolioSectionProps {
  portfolio?: WorkerPortfolioItem[];
  onAddPortfolioItem?: (item: WorkerPortfolioItem) => void;
  isEditable?: boolean;
}

export const WorkPortfolioSection: React.FC<WorkPortfolioSectionProps> = ({
  portfolio = [],
  onAddPortfolioItem,
  isEditable = true,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPhotoZoom, setSelectedPhotoZoom] = useState<WorkerPortfolioItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [photoUrl, setPhotoUrl] = useState('');
  const [description, setDescription] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: WorkerPortfolioItem = {
      id: `port-${Date.now()}`,
      title: title.trim(),
      category: category.trim(),
      photoUrl:
        photoUrl ||
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
      completedDate: 'Recent',
      description: description.trim(),
    };

    if (onAddPortfolioItem) {
      onAddPortfolioItem(newItem);
    }

    setTitle('');
    setPhotoUrl('');
    setDescription('');
    setIsAddModalOpen(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-darkbg-card rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#123B32] dark:text-rozgo-300" />
              <span>My Work Portfolio</span>
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-darkbg-surface text-neutral-600 dark:text-neutral-400">
              {portfolio.length}
            </span>
          </div>

          {isEditable && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-darkbg-border text-xs font-bold text-[#123B32] dark:text-rozgo-300 hover:bg-neutral-50 dark:hover:bg-darkbg-surface transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Work</span>
            </button>
          )}
        </div>

        {/* Portfolio Photos Grid */}
        {portfolio.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {portfolio.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPhotoZoom(item)}
                className="group relative rounded-2xl overflow-hidden aspect-square border border-neutral-200 dark:border-darkbg-border bg-neutral-100 dark:bg-neutral-800 cursor-pointer shadow-xs"
              >
                <img
                  src={item.photoUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end text-left">
                  <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider">
                    {item.category || 'Work'}
                  </span>
                  <p className="text-xs font-bold text-white line-clamp-1">{item.title}</p>
                  {item.completedDate && (
                    <span className="text-[10px] text-neutral-300">{item.completedDate}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface text-center space-y-2 border border-dashed border-neutral-200 dark:border-darkbg-border">
            <div className="w-10 h-10 rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              No portfolio photos added yet
            </p>
            <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
              Showcase your finished work to stand out and help employers book with confidence.
            </p>
            {isEditable && (
              <Button
                variant="outline"
                size="sm"
                className="font-bold border-[#123B32] text-[#123B32] mt-2"
                onClick={() => setIsAddModalOpen(true)}
              >
                + Add First Work Photo
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Work Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkbg-card rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-200 dark:border-darkbg-border animate-scaleUp text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-neutral-900 dark:text-white">
                Add Completed Work Photo
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Work Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Bathroom Sink Diverter Installation"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#123B32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Tap Repair, Concealed Piping"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#123B32]"
                />
              </div>

              {/* Photo Upload / Preview */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Work Photo
                </label>
                {photoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden h-32 border">
                    <img src={photoUrl} alt="Work Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="p-4 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-darkbg-border text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-neutral-50 dark:hover:bg-darkbg-surface">
                    <Upload className="w-5 h-5 text-neutral-400" />
                    <span className="text-xs font-bold text-[#123B32] dark:text-rozgo-300">
                      Upload from Device
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Short Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="e.g. Replaced old leaking iron pipes with heat-welded CPVC."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#123B32]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="!bg-[#123B32] text-white font-bold"
                >
                  Save to Portfolio
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Zoom Modal */}
      {selectedPhotoZoom && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPhotoZoom(null)}
        >
          <div
            className="bg-white dark:bg-darkbg-card rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl animate-scaleUp cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 sm:h-80 bg-black">
              <img
                src={selectedPhotoZoom.photoUrl}
                alt={selectedPhotoZoom.title}
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => setSelectedPhotoZoom(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-1 text-left">
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {selectedPhotoZoom.category}
              </span>
              <h4 className="text-base font-black text-neutral-900 dark:text-white">
                {selectedPhotoZoom.title}
              </h4>
              {selectedPhotoZoom.description && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 pt-1">
                  {selectedPhotoZoom.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

