import React, { useState } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { useAuthStore } from '../../../store/authStore';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { User, Mail, ShieldAlert, Key, Save, CheckCircle2, Globe } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const UserProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const { language, setLanguage } = usePreferencesStore();

  const [name, setName] = useState(user?.name || "Alex Sterling");
  const [email, setEmail] = useState(user?.email || "alex@invoiceiq.app");
  const [role] = useState(user?.role || "admin");
  const [avatar, setAvatar] = useState(user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");

  const [notifInvoices, setNotifInvoices] = useState(true);
  const [notifPayments, setNotifPayments] = useState(true);

  const handleSave = () => {
    updateProfile({
      name,
      email,
      avatar
    });
    alert("User Profile updated successfully!");
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
            <div className="flex items-center gap-4 shrink-0 bg-slate-50/50 dark:bg-[#0b101c]/15 p-4 rounded-xl border select-none mb-2">
              <img 
                src={avatar} 
                alt="User Avatar"
                className="w-12 h-12 rounded-xl object-cover border shadow-sm shrink-0" 
              />
              <div>
                <span className="block font-bold text-foreground">Interactive Avatar</span>
                <span className="block text-[9px] text-muted-foreground mt-0.5">Supply any public Unsplash URL below to update</span>
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
              
              <div className="flex flex-col gap-1.5 select-none col-span-2 sm:col-span-1">
                <label className="text-muted-foreground font-bold tracking-wide uppercase">Role Level</label>
                <input
                  type="text"
                  disabled
                  value={role.toUpperCase()}
                  className="px-3 py-2 border rounded-lg bg-slate-50/50 dark:bg-slate-800/10 font-mono outline-none text-xs font-bold"
                />
              </div>

              <div className="flex flex-col gap-1.5 select-none col-span-2 sm:col-span-1">
                <label className="text-muted-foreground font-bold tracking-wide uppercase">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70"
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

          <div className="flex justify-end select-none shrink-0">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-extrabold hover:bg-primary/95 transition-all shadow-md active:scale-95 select-none shrink-0"
            >
              <Save className="w-3.5 h-3.5 shrink-0" />
              Save Account Profile
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
            <p>Email alerts map directly to your primary credentials alex@invoiceiq.app</p>
          </div>
        </div>

      </div>

    </div>
  );
};
