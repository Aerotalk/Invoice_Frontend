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
  Plus,
  Info,
  Pencil,
  Globe
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import toast from 'react-hot-toast';
import { apiService } from '../../../services/api';

interface AdditionalField {
  label: string;
  value: string;
}

interface BillingAddress {
  attention: string;
  street1: string;
  street2: string;
  city: string;
  pinCode: string;
  state: string;
  phone: string;
  fax: string;
  website: string;
}

export const SettingsOverview: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const { currency, setCurrency, defaultTaxRate, setDefaultTaxRate } = usePreferencesStore();

  // Company Profile states
  const [compName, setCompName] = useState(user?.companyName || 'GrivetyGlobal Inc.');
  const [adminName, setAdminName] = useState(user?.name || 'Alex Sterling');
  const [email, setEmail] = useState(user?.email || 'alex@grivetyglobal.app');

  // Company identity fields
  const [businessType, setBusinessType] = useState('');
  const [industry, setIndustry] = useState('Consulting');
  const [orgLocation, setOrgLocation] = useState('India');

  // Locale / preferences fields
  const [fiscalYear, setFiscalYear] = useState('April - March');
  const [orgLanguage, setOrgLanguage] = useState('English');
  const [commLanguage, setCommLanguage] = useState('English');
  const [timeZone, setTimeZone] = useState('(GMT 5:30) India Standard Time (Asia/Calcutta)');
  const [dateFormat, setDateFormat] = useState('dd/MM/yyyy');
  const [dateSeparator, setDateSeparator] = useState('/');
  const [companyIdType, setCompanyIdType] = useState('Company ID');
  const [companyIdValue, setCompanyIdValue] = useState('');

  // Additional Fields
  const [additionalFields, setAdditionalFields] = useState<AdditionalField[]>([{ label: '', value: '' }]);

  const handleAddField = () => {
    setAdditionalFields([...additionalFields, { label: '', value: '' }]);
  };

  const handleFieldChange = (index: number, key: 'label' | 'value', val: string) => {
    const next = [...additionalFields];
    next[index][key] = val;
    setAdditionalFields(next);
  };

  const handleRemoveField = (index: number) => {
    setAdditionalFields(additionalFields.filter((_, i) => i !== index));
  };

  // Brand & Profile enhancements
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [logos, setLogos] = useState<string[]>(user?.logos || []);

  // Structured billing address
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    attention: '',
    street1: '',
    street2: '',
    city: '',
    pinCode: '',
    state: 'West Bengal',
    phone: '',
    fax: '',
    website: '',
  });

  const handleBillingChange = (field: keyof BillingAddress, val: string) => {
    setBillingAddress(prev => ({ ...prev, [field]: val }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error('File size too large! Please choose an image smaller than 1MB.');
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
        toast.error('Failed to upload profile picture.');
        console.error(error);
      }
    }
    e.target.value = '';
  };

  const handleAddLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (logos.length >= 5) {
      toast.success('You can only add up to 5 logos.');
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error('File size too large! Please choose an image smaller than 1MB.');
        return;
      }
      try {
        const res = await apiService.uploadFile(file, 'BRANDLOGO');
        const fileUrl = typeof res === 'string' ? res : (res?.url || res?.path || '');
        let updatedLogos = logos;
        setLogos((prev) => {
          if (prev.length >= 5) return prev;
          updatedLogos = [...prev, fileUrl];
          return updatedLogos;
        });
        updateProfile({ logos: updatedLogos });
        await apiService.updateSettings({ brandLogoUrls: updatedLogos });
        toast.success("Logo uploaded successfully.");
      } catch (error) {
        toast.error('Failed to upload logo.');
        console.error(error);
      }
    }
    e.target.value = '';
  };

  const handleRemoveLogo = (index: number) => {
    setLogos(logos.filter((_, i) => i !== index));
  };

  // API key hide/show toggles
  const [showPubKey, setShowPubKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  const pubKey = 'pk_test_51MzSGrivetyGlobalSecretKey2026';
  const secKey = 'sk_test_51MzSGrivetyGlobalSecretPrivateKeyUnbreakable2026';

  const handleSaveProfile = async () => {
    try {
      await apiService.updateSettings({
        workspaceBrandName: compName,
        adminProfileName: adminName,
        billingEmailContact: email,
        profileAvatarUrl: avatar,
        brandLogoUrls: logos,
        billingAddresses: [billingAddress],
      });

      updateProfile({
        name: adminName,
        email: email,
        companyName: compName,
        avatar: avatar,
        logos: logos,
        addresses: [billingAddress],
      });
      toast.success("Workspace Settings Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update settings to the server.");
      console.error(error);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('API Key token copied to clipboard!');
  };

  const inputCls =
    'w-full px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70 placeholder:text-slate-400';
  const selectCls =
    'w-full px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70 appearance-none cursor-pointer';
  const rowCls = 'grid grid-cols-12 gap-4 items-center';
  const labelCls = 'col-span-12 sm:col-span-4 text-[11px] font-semibold text-foreground/70 flex items-center gap-1';
  const fieldCls = 'col-span-12 sm:col-span-8';

  return (
    <div className="space-y-6 select-none animate-fade-in pb-12">
      <PageHeader
        title="Settings"
        description="Configure workspace profiles, set invoice branding defaults, and manage active API keys."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start select-none">

        {/* Left: General Settings Form */}
        <div className="lg:col-span-2 space-y-6 select-none">

          {/* ─── Section 4: Profile Avatar ─── */}
          <div className="border rounded-xl bg-card p-6 shadow-premium space-y-4 select-none">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 select-none border-b pb-3 shrink-0">
              <ImageIcon className="w-4 h-4 text-primary shrink-0" />
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
                    <button onClick={() => setAvatar('')} className="p-1.5 text-white hover:text-red-400 rounded-full transition-colors" title="Remove Photo">
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
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Section 5: Brand Logos (Max 5) ─── */}
          {/* <div className="border rounded-xl bg-card p-6 shadow-premium space-y-4 select-none">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 select-none shrink-0">
                <Palette className="w-4 h-4 text-primary shrink-0" />
                Brand Logos <span className="text-muted-foreground text-xs font-normal">({logos.length}/5)</span>
              </h3>
              {logos.length < 5 && (
                <label className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs font-bold transition-colors cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Add Logo
                  <input type="file" accept="image/*" onChange={handleAddLogo} className="hidden" />
                </label>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {logos.map((logo, index) => (
                <div key={index} className="relative group rounded-xl border p-2 bg-slate-50/50 flex flex-col items-center justify-center aspect-square overflow-hidden hover:border-indigo-200 transition-colors">
                  <img src={logo} alt={`Brand Logo ${index + 1}`} className="max-w-full max-h-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => handleRemoveLogo(index)} className="p-2 bg-white text-red-500 rounded-full shadow hover:bg-red-50 hover:scale-110 active:scale-95 transition-all">
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
          */}

          {/* ─── Section 1: Company Branding Settings ─── */}
          <div className="border rounded-xl bg-card p-6 shadow-premium space-y-5 select-none">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 select-none border-b pb-3 shrink-0">
              <Building className="w-4 h-4 text-primary shrink-0" />
              Company Branding Settings
            </h3>

            {/* Workspace Brand Name */}
            <div className={rowCls}>
              <label className={labelCls}>Workspace Brand Name</label>
              <div className={fieldCls}>
                <input type="text" value={compName} onChange={e => setCompName(e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Billing Email */}
            <div className={rowCls}>
              <label className={labelCls}>Billing Email Contact</label>
              <div className={fieldCls}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Admin Name */}
            <div className={rowCls}>
              <label className={labelCls}>Admin Profile Name</label>
              <div className={fieldCls}>
                <input type="text" value={adminName} onChange={e => setAdminName(e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Business Type */}
            <div className={rowCls}>
              <label className={labelCls}>Business Type</label>
              <div className={fieldCls}>
                <select value={businessType} onChange={e => setBusinessType(e.target.value)} className={selectCls}>
                  <option value="">Select</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                  <option value="LLP">LLP</option>
                  <option value="Private Limited">Private Limited</option>
                  <option value="Public Limited">Public Limited</option>
                  <option value="OPC">One Person Company (OPC)</option>
                  <option value="HUF">Hindu Undivided Family (HUF)</option>
                  <option value="Trust / NGO">Trust / NGO</option>
                  <option value="Government">Government</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Industry */}
            <div className={rowCls}>
              <label className={labelCls}>
                Industry
                <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 text-[9px] font-bold cursor-help" title="The primary industry your business operates in.">?</span>
              </label>
              <div className={fieldCls}>
                <select value={industry} onChange={e => setIndustry(e.target.value)} className={selectCls}>
                  <option value="Consulting">Consulting</option>
                  <option value="Technology">Technology</option>
                  <option value="E-Commerce">E-Commerce</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Finance">Finance &amp; Banking</option>
                  <option value="Retail">Retail</option>
                  <option value="Media">Media &amp; Entertainment</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* ─── Section 2: Locale & Preferences ─── */}
          <div className="border rounded-xl bg-card p-6 shadow-premium space-y-5 select-none">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 select-none border-b pb-3 shrink-0">
              <Sliders className="w-4 h-4 text-primary shrink-0" />
              Invoices Default Preferences
            </h3>

            {/* Standard Tax */}
            <div className={rowCls}>
              <label className={labelCls}>Standard Tax GST (%)</label>
              <div className={fieldCls}>
                <input
                  type="number"
                  value={defaultTaxRate}
                  onChange={e => setDefaultTaxRate(parseFloat(e.target.value) || 0)}
                  className={cn(inputCls, 'font-mono')}
                />
              </div>
            </div>

            {/* Base Currency */}
            <div className={rowCls}>
              <label className={labelCls}>
                Base Currency
                <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 text-[9px] font-bold cursor-help" title="The primary currency used across invoices.">?</span>
              </label>
              <div className={cn(fieldCls, 'flex items-center gap-2')}>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className={selectCls}>
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="AED">AED</option>
                  <option value="SGD">SGD</option>
                </select>
                <button type="button" className="p-2 rounded-lg border border-indigo-200 text-primary hover:bg-indigo-50 transition-colors shrink-0" title="Currency settings">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" /></svg>
                </button>
              </div>
            </div>

            {/* Fiscal Year */}
            <div className={rowCls}>
              <label className={labelCls}>Fiscal Year</label>
              <div className={fieldCls}>
                <select value={fiscalYear} onChange={e => setFiscalYear(e.target.value)} className={selectCls}>
                  <option value="April - March">April - March</option>
                  <option value="January - December">January - December</option>
                  <option value="July - June">July - June</option>
                  <option value="October - September">October - September</option>
                </select>
              </div>
            </div>

            {/* Organization Language */}
            <div className={rowCls}>
              <label className={labelCls}>
                Organization Language
                <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 text-[9px] font-bold cursor-help" title="Default language for the organization UI.">?</span>
              </label>
              <div className={fieldCls}>
                <select value={orgLanguage} onChange={e => setOrgLanguage(e.target.value)} className={selectCls}>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Telugu">Telugu</option>
                </select>
              </div>
            </div>

            {/* Communication Languages */}
            <div className={rowCls}>
              <label className={labelCls}>
                Communication Languages
                <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 text-[9px] font-bold cursor-help" title="Languages used for sending communications to clients.">?</span>
              </label>
              <div className={fieldCls}>
                <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-card text-xs font-medium">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded text-slate-600 dark:text-slate-300 text-[11px] font-semibold">{commLanguage}</span>
                  <select
                    value={commLanguage}
                    onChange={e => setCommLanguage(e.target.value)}
                    className="flex-1 bg-transparent outline-none cursor-pointer text-slate-400 text-[11px]"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Bengali">Bengali</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Time Zone */}
            <div className={rowCls}>
              <label className={labelCls}>Time Zone</label>
              <div className={fieldCls}>
                <select value={timeZone} onChange={e => setTimeZone(e.target.value)} className={selectCls}>
                  <option value="(GMT 5:30) India Standard Time (Asia/Calcutta)">(GMT 5:30) India Standard Time (Asia/Calcutta)</option>
                  <option value="(GMT 0:00) UTC">(GMT 0:00) UTC</option>
                  <option value="(GMT -5:00) Eastern Time (US &amp; Canada)">(GMT -5:00) Eastern Time (US &amp; Canada)</option>
                  <option value="(GMT +1:00) Central European Time">(GMT +1:00) Central European Time</option>
                  <option value="(GMT +8:00) Singapore Standard Time">(GMT +8:00) Singapore Standard Time</option>
                </select>
              </div>
            </div>

            {/* Date Format */}
            <div className={rowCls}>
              <label className={labelCls}>Date Format</label>
              <div className={cn(fieldCls, 'flex items-center gap-2')}>
                <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className={cn(selectCls, 'flex-1')}>
                  <option value="dd/MM/yyyy">dd/MM/yyyy [ 01/06/2026 ]</option>
                  <option value="MM/dd/yyyy">MM/dd/yyyy [ 06/01/2026 ]</option>
                  <option value="yyyy-MM-dd">yyyy-MM-dd [ 2026-06-01 ]</option>
                  <option value="dd-MM-yyyy">dd-MM-yyyy [ 01-06-2026 ]</option>
                  <option value="dd MMM yyyy">dd MMM yyyy [ 01 Jun 2026 ]</option>
                </select>
                <select value={dateSeparator} onChange={e => setDateSeparator(e.target.value)} className={cn(selectCls, 'w-16 text-center px-1')}>
                  <option value="/">/</option>
                  <option value="-">-</option>
                  <option value=".">.</option>
                </select>
              </div>
            </div>

            {/* Company ID */}
            <div className={rowCls}>
              <label className={labelCls}>Company ID</label>
              <div className={cn(fieldCls, 'flex items-center gap-2')}>
                <select value={companyIdType} onChange={e => setCompanyIdType(e.target.value)} className={cn(selectCls, 'w-40 shrink-0')}>
                  <option value="Company ID">Company ID :</option>
                  <option value="GST Number">GST Number :</option>
                  <option value="PAN">PAN :</option>
                  <option value="CIN">CIN :</option>
                  <option value="TAN">TAN :</option>
                </select>
                <input
                  type="text"
                  value={companyIdValue}
                  onChange={e => setCompanyIdValue(e.target.value)}
                  placeholder=""
                  className={cn(inputCls, 'flex-1 font-mono')}
                />
              </div>
            </div>
          </div>

          {/* ─── Section 3: Additional Fields ─── */}
          <div className="border rounded-xl bg-card p-6 shadow-premium space-y-4 select-none">
            <h3 className="text-sm font-bold text-foreground select-none border-b pb-3 shrink-0">
              Additional Fields
            </h3>

            {/* Fields table */}
            <div className="border rounded-lg overflow-hidden text-xs">
              <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-800/60 border-b">
                <div className="px-4 py-2 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Label Name</div>
                <div className="px-4 py-2 font-bold text-[10px] uppercase tracking-widest text-muted-foreground border-l">Value</div>
              </div>
              {additionalFields.map((field, index) => (
                <div key={index} className="grid grid-cols-2 border-b last:border-b-0 group">
                  <div className="px-2 py-1.5">
                    <input
                      type="text"
                      value={field.label}
                      onChange={e => handleFieldChange(index, 'label', e.target.value)}
                      placeholder="Label"
                      className="w-full px-2 py-1.5 rounded bg-transparent border border-transparent focus:border-slate-300 dark:focus:border-slate-600 outline-none text-xs font-medium placeholder:text-slate-300"
                    />
                  </div>
                  <div className="px-2 py-1.5 border-l flex items-center gap-1">
                    <input
                      type="text"
                      value={field.value}
                      onChange={e => handleFieldChange(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 px-2 py-1.5 rounded bg-transparent border border-transparent focus:border-slate-300 dark:focus:border-slate-600 outline-none text-xs font-medium placeholder:text-slate-300"
                    />
                    {additionalFields.length > 1 && (
                      <button
                        onClick={() => handleRemoveField(index)}
                        className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 rounded transition-all shrink-0"
                        title="Remove field"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* + New Field */}
            <button
              onClick={handleAddField}
              className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 text-xs font-bold transition-colors"
            >
              <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                <Plus className="w-3 h-3" />
              </span>
              New Field
            </button>

            {/* Info banner */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-foreground/5 dark:bg-foreground/5 border border-primary/40 dark:border-primary/40 text-xs text-primary dark:text-primary font-medium">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
              <span>
                You can include the Company ID and additional fields in your organization address which will be
                displayed in your transaction PDFs.
              </span>
            </div>
          </div>

          {/* ─── Section 6: Billing Address (structured) ─── */}
          <div className="border rounded-xl bg-card p-6 shadow-premium space-y-5 select-none">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 select-none border-b pb-3 shrink-0">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              Organization Details &amp; Billing Address
            </h3>

            {/* Organization Location */}
            <div className={rowCls}>
              <label className={cn(labelCls, 'text-rose-500 font-semibold')}>Organization Location*</label>
              <div className={fieldCls}>
                <select value={orgLocation} onChange={e => setOrgLocation(e.target.value)} className={selectCls}>
                  <option value="India">India</option>
                  <option value="USA">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="UAE">UAE</option>
                  <option value="Singapore">Singapore</option>
                </select>
              </div>
            </div>

            {/* Organization Address */}
            <div className={rowCls}>
              <label className={cn(labelCls, 'self-start pt-2')}>
                Organization Address
                <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 text-[9px] font-bold cursor-help" title="Address shown on your invoices and transaction PDFs.">?</span>
              </label>
              <div className={cn(fieldCls, 'space-y-2')}>
                {/* Attention row with edit icon */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Attention"
                    value={billingAddress.attention}
                    onChange={e => handleBillingChange('attention', e.target.value)}
                    className={inputCls}
                  />
                  <button type="button" className="p-2 text-primary hover:text-primary rounded-lg border border-transparent hover:border-primary hover:bg-primary/5 active:bg-primary/10 cursor-pointer transition-all shrink-0" title="Edit address format">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Street 1"
                  value={billingAddress.street1}
                  onChange={e => handleBillingChange('street1', e.target.value)}
                  className={inputCls}
                />
                <input
                  type="text"
                  placeholder="Street 2"
                  value={billingAddress.street2}
                  onChange={e => handleBillingChange('street2', e.target.value)}
                  className={inputCls}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={billingAddress.city}
                    onChange={e => handleBillingChange('city', e.target.value)}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    placeholder="Pin Code"
                    value={billingAddress.pinCode}
                    onChange={e => handleBillingChange('pinCode', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={billingAddress.state}
                    onChange={e => handleBillingChange('state', e.target.value)}
                    className={cn(selectCls, 'border rounded-lg')}
                  >
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Phone"
                    value={billingAddress.phone}
                    onChange={e => handleBillingChange('phone', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Fax Number"
                  value={billingAddress.fax}
                  onChange={e => handleBillingChange('fax', e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Website URL */}
            <div className={rowCls}>
              <label className={labelCls}>Website URL</label>
              <div className={fieldCls}>
                <input
                  type="url"
                  placeholder="Website URL"
                  value={billingAddress.website}
                  onChange={e => handleBillingChange('website', e.target.value)}
                  className={inputCls}
                />
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
