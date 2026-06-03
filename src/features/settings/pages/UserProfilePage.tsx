import React, { useState } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { useAuthStore } from '../../../store/authStore';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { User, Mail, ShieldAlert, Key, Save, CheckCircle2, Globe, Image, Upload, Trash2, Plus, Link } from 'lucide-react';
import { cn } from '../../../lib/utils';
import toast from 'react-hot-toast';
import { apiService } from '../../../services/api';

const presetStarlight = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="120" height="40"><rect width="120" height="40" rx="8" fill="%23064e3b"/><circle cx="20" cy="20" r="12" fill="%2310b981"/><polygon points="20,13 22,18 27,18 23,21 25,26 20,23 15,26 17,21 13,18 18,18" fill="%23ffffff"/><text x="42" y="25" fill="%23ffffff" font-family="sans-serif" font-size="12" font-weight="bold">STARLIGHT</text></svg>`;

const presetVortex = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="120" height="40"><rect width="120" height="40" rx="8" fill="%231e3a8a"/><path d="M12,20 C12,12 28,12 28,20 C28,28 12,28 12,20 Z" stroke="%233b82f6" stroke-width="3" fill="none"/><path d="M16,20 C16,15 24,15 24,20 C24,25 16,25 16,20 Z" stroke="%2360a5fa" stroke-width="2" fill="none"/><text x="42" y="25" fill="%23ffffff" font-family="sans-serif" font-size="12" font-weight="bold">VORTEX</text></svg>`;

const presetApex = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="120" height="40"><rect width="120" height="40" rx="8" fill="%237c2d12"/><polygon points="12,28 20,12 28,28 20,22" fill="%23f97316"/><text x="42" y="25" fill="%23ffffff" font-family="sans-serif" font-size="12" font-weight="bold">APEX LABS</text></svg>`;

const presetAvatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
];

export const UserProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const { language, setLanguage } = usePreferencesStore();

  const [name, setName] = useState(user?.name || "Alex Sterling");
  const [email, setEmail] = useState(user?.email || "alex@grivetyglobal.app");
  const [role] = useState(user?.role || "admin");
  const [avatar, setAvatar] = useState(user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");

  const [notifInvoices, setNotifInvoices] = useState(true);
  const [notifPayments, setNotifPayments] = useState(true);

  const [logos, setLogos] = useState<string[]>(user?.logos || []);
  const [urlInput, setUrlInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddPreset = (presetUrl: string) => {
    if (logos.length >= 5) {
      toast.success("You can add up to 5 logos only!");
      return;
    }
    setLogos([...logos, presetUrl]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (logos.length >= 5) {
      toast.success("You can add up to 5 logos only!");
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error("File size too large! Please choose an image smaller than 1MB.");
      return;
    }

    try {
      const res = await apiService.uploadFile(file, 'BRANDLOGO');
      const fileUrl = typeof res === 'string' ? res : (res?.url || res?.path || '');
      const newLogos = [...logos, fileUrl];
      setLogos(newLogos);
      updateProfile({ logos: newLogos });
      await apiService.updateSettings({ brandLogoUrls: newLogos });
      toast.success("Logo uploaded successfully.");
    } catch (error) {
      toast.error("Failed to upload logo.");
      console.error(error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error("File size too large! Please choose a profile picture smaller than 1MB.");
      return;
    }

    try {
      const res = await apiService.uploadFile(file, 'AVATAR');
      const fileUrl = typeof res === 'string' ? res : (res?.url || res?.path || '');
      setAvatar(fileUrl);
      updateProfile({ avatar: fileUrl });
      await apiService.updateSettings({ profileAvatarUrl: fileUrl });
      toast.success("Profile picture uploaded successfully.");
    } catch (error) {
      toast.error("Failed to upload profile picture.");
      console.error(error);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (logos.length >= 5) {
      toast.success("You can add up to 5 logos only!");
      return;
    }
    setLogos([...logos, urlInput.trim()]);
    setUrlInput("");
  };

  const handleDeleteLogo = (index: number) => {
    setLogos(logos.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    updateProfile({
      name,
      email,
      avatar,
      logos
    });

    try {
      await apiService.updateSettings({
        profileAvatarUrl: avatar,
        brandLogoUrls: logos
      });
      toast.success("User Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to sync profile settings with cloud.");
      console.error(error);
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 select-none animate-fade-in pb-12">
      <PageHeader
        title="Account Profile"
        description="Review personal bio credentials, configure alert email schedules, and choose languages."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 select-none">
        
        {/* Left: Settings details */}
        <div className="lg:col-span-2 space-y-6 select-none">
          
          <div className="p-6 border rounded-xl bg-card shadow-premium space-y-4 select-none">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b pb-3 shrink-0">
              <User className="w-4 h-4 text-indigo-500" />
              General Details
            </h3>

            {/* Avatar uploader */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0 bg-slate-50/50 dark:bg-[#0b101c]/15 p-4 rounded-xl border select-none mb-2">
              <div className="relative group shrink-0 select-none">
                {avatar ? (
                  <img 
                    src={avatar} 
                    alt="User Avatar"
                    className="w-16 h-16 rounded-xl object-cover border shadow-md shrink-0 transition-transform duration-300 group-hover:scale-105" 
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl border bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold shrink-0">
                    No Photo
                  </div>
                )}
              </div>
              <div className="space-y-2 select-none flex-1">
                <span className="block font-bold text-foreground text-xs uppercase tracking-wider">Account Identity Avatar</span>
                
                {/* Horizontal preset picker */}
                <div className="flex items-center gap-2 select-none">
                  {presetAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={cn(
                        "w-8 h-8 rounded-lg overflow-hidden border-2 transition-all active:scale-90 select-none cursor-pointer",
                        avatar === url ? "border-primary scale-105 ring-2 ring-primary/20" : "border-transparent hover:border-slate-300"
                      )}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 select-none flex-wrap">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg bg-card hover:bg-muted text-foreground/80 hover:text-foreground text-[10px] font-bold cursor-pointer select-none transition-colors active:scale-95 duration-150 shadow-sm border-dashed">
                    <Upload className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    Upload Custom Photo
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden" 
                    />
                  </label>

                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar("")}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded hover:bg-rose-500/10 text-rose-500 text-[10px] font-bold active:scale-95 transition-all select-none cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                      Remove
                    </button>
                  )}
                </div>
                <span className="block text-[8px] text-muted-foreground font-semibold">Supports PNG, JPG or SVG presets or custom uploads (Max 1MB)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold select-none">
              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1 select-none">
                <label className="text-muted-foreground font-bold tracking-wide uppercase">Profile Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70"
                />
              </div>
              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1 select-none">
                <label className="text-muted-foreground font-bold tracking-wide uppercase">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70"
                />
              </div>
              
              <div className="flex flex-col gap-1.5 select-none col-span-2">
                <label className="text-muted-foreground font-bold tracking-wide uppercase">Role Level</label>
                <input
                  type="text"
                  disabled
                  value={role.toUpperCase()}
                  className="px-3 py-2 border rounded-lg bg-slate-50/50 dark:bg-slate-800/10 font-mono outline-none text-xs font-bold"
                />
              </div>
            </div>

            {/* Language */}
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold border-t pt-4 select-none">
              <div className="flex flex-col gap-1.5 select-none col-span-2 sm:col-span-1">
                <label className="text-muted-foreground font-bold tracking-wide uppercase flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />Default App Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Español (ES)</option>
                  <option value="fr">Français (FR)</option>
                  <option value="de">Deutsch (DE)</option>
                </select>
              </div>
            </div>

          </div>

          {/* Workspace Logos & Branding */}
          <div className="p-6 border rounded-xl bg-card shadow-premium space-y-5 select-none">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b pb-3 shrink-0">
              <Image className="w-4 h-4 text-indigo-500" />
              Workspace Logos & Custom Branding
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload or configure up to 5 custom branding logos. These logos will be selectable when creating new invoices, replacing the standard GrivetyGlobal brand symbol.
            </p>

            {/* Grid of 5 logo slots */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 select-none">
              {[0, 1, 2, 3, 4].map((index) => {
                const logo = logos[index];
                return (
                  <div 
                    key={index}
                    className="aspect-[4/3] rounded-lg border relative flex items-center justify-center p-2 bg-slate-50/50 dark:bg-slate-800/10 group transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
                  >
                    {logo ? (
                      <>
                        <img 
                          src={logo} 
                          alt={`Logo #${index + 1}`} 
                          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 backdrop-blur-[1px]">
                          <button
                            type="button"
                            onClick={() => handleDeleteLogo(index)}
                            className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow hover:scale-110 active:scale-95 duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[8px] font-bold bg-indigo-500/20 text-indigo-400 select-none">
                          #{index + 1}
                        </span>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-center select-none font-semibold">
                        <span className="text-[10px] uppercase tracking-wider">Empty Slot</span>
                        <span className="text-[9px] mt-0.5">#{index + 1}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {logos.length < 5 ? (
              <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload Slot */}
                  <div className="flex flex-col gap-1.5 select-none">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Upload Logo File</label>
                    <label className="border-2 border-dashed rounded-lg p-3 hover:bg-muted/30 cursor-pointer flex flex-col items-center justify-center text-center transition-colors active:scale-99 select-none h-[72px]">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                      <Upload className="w-4 h-4 text-indigo-500 shrink-0 mb-1" />
                      <span className="text-[10px] font-bold text-foreground">Upload Image</span>
                      <span className="text-[8px] text-muted-foreground mt-0.5">PNG, JPG or SVG (Max 1MB)</span>
                    </label>
                  </div>

                  {/* Add URL Field */}
                  <div className="flex flex-col gap-1.5 select-none justify-between h-[90px]">
                    <div className="flex flex-col gap-1.5 select-none">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Or Add online Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://example.com/logo.png"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          className="flex-1 px-3 py-1.5 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-indigo-500/70"
                        />
                        <button
                          type="button"
                          onClick={handleAddUrl}
                          className="px-3 border rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground active:scale-95 transition-all text-xs font-extrabold shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preset SVGs for Instant Mock */}
                <div className="flex flex-col gap-1.5 select-none border-t pt-3">
                  <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Quick Logo Presets</label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleAddPreset(presetStarlight)}
                      className="px-3 py-2 border rounded-lg hover:bg-muted bg-white dark:bg-slate-900 flex items-center gap-2 hover:border-emerald-500/50 transition-colors group text-[10px] font-bold text-foreground shadow-sm"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 group-hover:animate-pulse" />
                      Emerald Starlight
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPreset(presetVortex)}
                      className="px-3 py-2 border rounded-lg hover:bg-muted bg-white dark:bg-slate-900 flex items-center gap-2 hover:border-blue-500/50 transition-colors group text-[10px] font-bold text-foreground shadow-sm"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 group-hover:animate-pulse" />
                      Blue Vortex
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPreset(presetApex)}
                      className="px-3 py-2 border rounded-lg hover:bg-muted bg-white dark:bg-slate-900 flex items-center gap-2 hover:border-orange-500/50 transition-colors group text-[10px] font-bold text-foreground shadow-sm"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 group-hover:animate-pulse" />
                      Orange Apex
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 border border-indigo-500/20 bg-indigo-500/5 rounded-lg text-[10px] text-indigo-400 font-bold flex items-center gap-2 mt-4 select-none animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                All 5 branding logo slots are filled. Delete an existing logo to add another.
              </div>
            )}
          </div>

          <div className="flex justify-end select-none shrink-0">
             <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-extrabold hover:bg-primary/95 transition-all shadow-md active:scale-95 select-none shrink-0 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 shrink-0" />
                  Save Account Profile
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right: Notifications preferences checklist */}
        <div className="border rounded-xl bg-card p-5 shadow-premium space-y-4 select-none h-fit">
          <h3 className="text-sm font-bold text-foreground border-b pb-3 shrink-0">
            Email Notifications
          </h3>

          <div className="space-y-3.5 select-none text-xs font-semibold">
            <label className="flex items-center gap-2.5 cursor-pointer font-medium text-foreground select-none">
              <input
                type="checkbox"
                checked={notifInvoices}
                onChange={() => setNotifInvoices(!notifInvoices)}
                className="w-3.5 h-3.5 rounded border accent-indigo-500"
              />
              Email me when an invoice is viewed
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer font-medium text-foreground select-none">
              <input
                type="checkbox"
                checked={notifPayments}
                onChange={() => setNotifPayments(!notifPayments)}
                className="w-3.5 h-3.5 rounded border accent-indigo-500"
              />
              Email me on successfully paid balance settlements
            </label>
          </div>

          <div className="p-3.5 rounded-xl border bg-slate-50/50 dark:bg-[#0b101c]/15 text-[10px] font-semibold text-muted-foreground select-none shrink-0 space-y-1.5 leading-relaxed mt-4">
            <span className="block font-bold text-foreground flex items-center gap-1.5"><Key className="w-3.5 h-3.5 text-indigo-500 shrink-0" />Account Security</span>
            <p>Email alerts map directly to your primary credentials alex@grivetyglobal.app</p>
          </div>
        </div>

      </div>

    </div>
  );
};
