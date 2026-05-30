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
  Palette,
  Image as ImageIcon,
  Upload,
  Trash2,
  MapPin,
  Plus
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export const SettingsOverview: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const { currency, setCurrency, defaultTaxRate, setDefaultTaxRate } = usePreferencesStore();

  // Company Profile states
  const [compName, setCompName] = useState(user?.companyName || "InvoiceIQ Inc.");
  const [adminName, setAdminName] = useState(user?.name || "Alex Sterling");
  const [email, setEmail] = useState(user?.email || "alex@invoiceiq.app");
  
  // Brand & Profile enhancements
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [logos, setLogos] = useState<string[]>(user?.logos || []);
  const [addresses, setAddresses] = useState<string[]>(user?.addresses || []);
  const [newAddress, setNewAddress] = useState("");

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleAddLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (logos.length >= 5) {
      alert("You can only add up to 5 logos.");
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogos((prev) => {
          if (prev.length >= 5) return prev;
          return [...prev, reader.result as string];
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleRemoveLogo = (index: number) => {
    setLogos(logos.filter((_, i) => i !== index));
  };

  const handleAddAddress = () => {
    if (addresses.length >= 5) {
      alert("You can only add up to 5 addresses.");
      return;
    }
    if (newAddress.trim()) {
      setAddresses([...addresses, newAddress.trim()]);
      setNewAddress("");
    }
  };

  const handleRemoveAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  // API key hide/show toggles
  const [showPubKey, setShowPubKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  const pubKey = "pk_test_51MzSInvoiceIQSecretKey2026";
  const secKey = "sk_test_51MzSInvoiceIQSecretPrivateKeyUnbreakable2026";

  const handleSaveProfile = () => {
    updateProfile({
      name: adminName,
      email: email,
      companyName: compName,
      avatar: avatar,
      logos: logos,
      addresses: addresses,
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
                <label className="text-muted-foreground font-bold tracking-wide uppercase">Standard Tax (%)</label>
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

          {/* Section 3: Profile Avatar */}
          <div className="border rounded-xl bg-card p-6 shadow-premium space-y-4 select-none">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 select-none border-b pb-3 shrink-0">
              <ImageIcon className="w-4 h-4 text-indigo-500 shrink-0" />
              Profile Avatar
            </h3>
            
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden shrink-0 border-2 border-indigo-100 shadow-sm relative group">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                {avatar && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => setAvatar("")} className="p-1.5 text-white hover:text-red-400 rounded-full transition-colors" title="Remove Photo">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div className="text-xs text-muted-foreground font-medium">Upload a custom profile photo (JPEG, PNG):</div>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 border rounded-lg bg-card hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700 transition-colors shadow-sm active:scale-95">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Brand Logos (Max 5) */}
          <div className="border rounded-xl bg-card p-6 shadow-premium space-y-4 select-none">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 select-none shrink-0">
                <Palette className="w-4 h-4 text-indigo-500 shrink-0" />
                Brand Logos <span className="text-muted-foreground text-xs font-normal">({logos.length}/5)</span>
              </h3>
              {logos.length < 5 && (
                <label className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs font-bold transition-colors cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Add Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAddLogo}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {logos.map((logo, index) => (
                <div key={index} className="relative group rounded-xl border p-2 bg-slate-50/50 flex flex-col items-center justify-center aspect-square overflow-hidden hover:border-indigo-200 transition-colors">
                  <img src={logo} alt={`Brand Logo ${index + 1}`} className="max-w-full max-h-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleRemoveLogo(index)}
                      className="p-2 bg-white text-red-500 rounded-full shadow hover:bg-red-50 hover:scale-110 active:scale-95 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {logos.length === 0 && (
                <div className="col-span-full text-center py-6 text-xs text-muted-foreground font-medium border-2 border-dashed rounded-xl">
                  No logos added yet. Add up to 5 brand logos to use in your invoices.
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Billing Addresses (Max 5) */}
          <div className="border rounded-xl bg-card p-6 shadow-premium space-y-4 select-none">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 select-none shrink-0">
                <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                Billing Addresses <span className="text-muted-foreground text-xs font-normal">({addresses.length}/5)</span>
              </h3>
            </div>

            <div className="space-y-3">
              {addresses.map((address, index) => (
                <div key={index} className="flex gap-4 p-3 border rounded-xl bg-slate-50/50 items-start group">
                  <div className="flex-1 text-xs font-medium text-slate-700 whitespace-pre-wrap">
                    {address}
                  </div>
                  <button
                    onClick={() => handleRemoveAddress(index)}
                    className="p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 rounded hover:bg-white shadow-sm transition-all"
                    title="Delete Address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {addresses.length < 5 && (
                <div className="pt-2 flex flex-col gap-2">
                  <textarea
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Enter a new billing address..."
                    className="w-full px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70 min-h-[80px] resize-y"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddAddress}
                      disabled={!newAddress.trim()}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Address
                    </button>
                  </div>
                </div>
              )}
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
