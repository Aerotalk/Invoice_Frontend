import React, { useState } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { useAuthStore } from '../../../store/authStore';
import { usePreferencesStore } from '../../../store/preferencesStore';
import {
  Building,
  Key,
  Mail,
  Sliders,
  Eye,
  EyeOff,
  Copy,
  Save,
  Shield,
  Palette
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export const SettingsOverview: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const { currency, setCurrency, defaultTaxRate, setDefaultTaxRate } = usePreferencesStore();

  // Company Profile states
  const [compName, setCompName] = useState(user?.companyName || "InvoiceIQ Inc.");
  const [adminName, setAdminName] = useState(user?.name || "Alex Sterling");
  const [email, setEmail] = useState(user?.email || "alex@invoiceiq.app");

  // API key hide/show toggles
  const [showPubKey, setShowPubKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  const pubKey = "pk_test_51MzSInvoiceIQSecretSandboxKey2026";
  const secKey = "sk_test_51MzSInvoiceIQSecretPrivateKeyUnbreakable2026";

  const handleSaveProfile = () => {
    updateProfile({
      name: adminName,
      email: email,
      companyName: compName,
    });
    alert("Workspace Settings Profile updated successfully!");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("API Key token copied to clipboard!");
  };

  return (
    <div className="space-y-6 select-none animate-fade-in pb-12">
      <PageHeader
        title="Settings"
        description="Configure workspace profiles, set invoice branding defaults, and manage active API keys."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start select-none">

        {/* Left: General Settings Form */}
        <div className="lg:col-span-2 space-y-6 select-none">

          {/* Section 1: Company Profile Branding */}
          <div className="border rounded-xl bg-card p-6 shadow-premium space-y-4 select-none">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 select-none border-b pb-3 shrink-0">
              <Building className="w-4 h-4 text-indigo-500 shrink-0" />
              Company Branding Settings
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold select-none">
              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <label className="text-muted-foreground font-bold tracking-wide uppercase">Workspace Brand Name</label>
                <input
                  type="text"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70"
                />
              </div>
              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <label className="text-muted-foreground font-bold tracking-wide uppercase">Billing Email contact</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70"
                />
              </div>
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-muted-foreground font-bold tracking-wide uppercase">Admin Profile Name</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Invoicing Defaults Rules */}
          <div className="border rounded-xl bg-card p-6 shadow-premium space-y-4 select-none">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 select-none border-b pb-3 shrink-0">
              <Sliders className="w-4 h-4 text-indigo-500 shrink-0" />
              Invoices Default Preferences
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold select-none">
              <div className="flex flex-col gap-1.5 select-none col-span-2 sm:col-span-1">
                <label className="text-muted-foreground font-bold tracking-wide uppercase">Standard Tax VAT (%)</label>
                <input
                  type="number"
                  value={defaultTaxRate}
                  onChange={(e) => setDefaultTaxRate(parseFloat(e.target.value) || 0)}
                  className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70 text-center font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5 select-none col-span-2 sm:col-span-1">
                <label className="text-muted-foreground font-bold tracking-wide uppercase">Standard Base Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Profile Button */}
          <div className="flex justify-end select-none shrink-0">
            <button
              onClick={handleSaveProfile}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-extrabold hover:bg-primary/95 transition-all shadow-md active:scale-95 select-none shrink-0"
            >
              <Save className="w-3.5 h-3.5 shrink-0" />
              Save Settings Changes
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
