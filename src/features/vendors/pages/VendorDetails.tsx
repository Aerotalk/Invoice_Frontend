import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Clock, 
  CreditCard, 
  FileText, 
  Edit3, 
  Save, 
  Activity,
  User,
  Briefcase,
  Globe,
  MapPin,
  Building2,
  Bookmark,
  ExternalLink
} from 'lucide-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { apiService } from '../../../services/api';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

export const VendorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'details'>('overview');
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const { currency } = usePreferencesStore();

  const loadVendorData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiService.getVendorById(id);
      setData(res);
      setNoteText(res.vendor.notes || "");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, [id]);

  const handleSaveNote = async () => {
    if (!id || !data) return;
    setSavingNote(true);
    try {
      await apiService.updateVendor(id, { notes: noteText });
      alert("Vendor internal notes updated!");
      const updated = await apiService.getVendorById(id);
      setData(updated);
    } catch (e) {
      console.error(e);
      alert("Failed to save notes.");
    } finally {
      setSavingNote(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-[320px]" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  const { vendor, expenses } = data;

  // Expenses Columns
  const expenseColumns: ColumnDef<any>[] = [
    {
      header: "Expense ID",
      accessorKey: "id",
      cell: (row) => <span className="text-slate-400 select-none text-[11px]">{row.id}</span>
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-slate-50 dark:bg-slate-800 text-foreground border-slate-200 dark:border-slate-700">
          {row.category}
        </span>
      )
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (row) => <span className="text-xs font-semibold text-foreground/90">{row.description}</span>
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (row) => <span className="font-bold text-foreground select-none">{formatCurrency(row.amount, currency)}</span>
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: (row) => <span>{formatDate(row.date)}</span>
    },
    {
      header: "Tax Deductible",
      accessorKey: "isTaxDeductible",
      cell: (row) => (
        <span className={cn(
          "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full select-none border",
          row.isTaxDeductible 
            ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50" 
            : "text-slate-400 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"
        )}>
          {row.isTaxDeductible ? "Yes" : "No"}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none animate-fade-in pb-12">
      
      {/* Back button */}
      <Link 
        to="/dashboard/vendors" 
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors select-none active:scale-95"
      >
        <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
        Back to Vendors
      </Link>

      {/* Vendor Profile Summary Card */}
      <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6 relative select-none">
        <div className="flex items-center gap-4">
          <img 
            src={vendor.avatar || "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=150"} 
            alt={vendor.name} 
            className="w-14 h-14 rounded-xl object-cover border ring-1 ring-border shadow-md shrink-0" 
          />
          <div>
            <h2 className="text-xl font-extrabold text-foreground leading-tight">{vendor.name}</h2>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground font-semibold uppercase">
              {vendor.vendorType === 'individual' ? (
                <>
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  Individual Vendor
                </>
              ) : (
                <>
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {vendor.company || "Business Vendor"}
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 select-none text-[11px] font-semibold text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {vendor.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {vendor.phone}
              </span>
              {vendor.website && (
                <a 
                  href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline hover:underline-offset-2"
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  {vendor.website}
                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-start gap-3 md:gap-1.5 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 select-none border-border">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Relationship Status</span>
          <StatusBadge status={vendor.status} />
          <span className="text-[10px] text-muted-foreground font-semibold block mt-1">Joined: {formatDate(vendor.createdAt)}</span>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 select-none">
        <div className="p-5 border rounded-xl bg-card shadow-premium relative">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Billed Expenses</span>
          <span className="block text-xl font-bold text-foreground mt-2">{formatCurrency(vendor.totalBilled || 0, currency)}</span>
          <FileText className="absolute top-4 right-4 w-4 h-4 text-slate-400" />
        </div>
        <div className="p-5 border rounded-xl bg-card shadow-premium relative">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Outstanding Bills Due</span>
          <span className={cn(
            "block text-xl font-bold mt-2",
            (vendor.outstandingAmount || 0) > 0 ? "text-amber-500" : "text-emerald-500"
          )}>
            {formatCurrency(vendor.outstandingAmount || 0, currency)}
          </span>
          <CreditCard className="absolute top-4 right-4 w-4 h-4 text-slate-400" />
        </div>
        <div className="p-5 border rounded-xl bg-card shadow-premium relative">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Mapped Expenses</span>
          <span className="block text-xl font-bold text-foreground mt-2">{expenses.length} Recorded</span>
          <Bookmark className="absolute top-4 right-4 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Tab Sub-Navigation Menu */}
      <div className="flex border-b text-xs font-semibold text-muted-foreground overflow-x-auto whitespace-nowrap scrollbar-none select-none">
        {[
          { id: 'overview', label: 'Relationship Overview' },
          { id: 'expenses', label: `Expenses Mapped (${expenses.length})` },
          { id: 'details', label: 'Advanced Specifications' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-4 py-3 border-b-2 transition-all select-none",
              activeTab === tab.id 
                ? "border-primary text-primary font-bold" 
                : "border-transparent hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content rendering */}
      <div className="select-none">
        
        {/* TAB 1: OVERVIEW & NOTES */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
            
            {/* Interactive Notes Notepad */}
            <div className="border rounded-xl bg-card p-5 shadow-premium lg:col-span-2 flex flex-col justify-between h-[340px]">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 select-none">
                  <Edit3 className="w-4 h-4 text-indigo-500 shrink-0" />
                  Vendor Internal Notes & Directives
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Define purchase guidelines, delivery terms, or standard contract specifications below.</p>
              </div>
              
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write custom supply instructions, internal vendor agreement details..."
                className="flex-1 w-full mt-4 p-3 border rounded-lg bg-slate-50/50 dark:bg-[#0b101c]/40 outline-none focus:bg-card focus:border-indigo-500/70 text-xs font-medium resize-none leading-relaxed"
              />
              
              <div className="border-t pt-4 mt-4 flex items-center justify-between shrink-0 select-none">
                <span className="text-[10px] text-muted-foreground font-semibold">Changes are saved to local database</span>
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-extrabold hover:bg-primary/95 transition-all shadow-md active:scale-95 disabled:opacity-40"
                >
                  <Save className="w-3.5 h-3.5 shrink-0" />
                  {savingNote ? "Saving..." : "Save Note"}
                </button>
              </div>
            </div>

            {/* Vendor Activity Timeline */}
            <div className="border rounded-xl bg-card p-5 shadow-premium flex flex-col justify-between h-[340px]">
              <div className="border-b pb-3 shrink-0">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 select-none">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  Timeline Activity Logs
                </h3>
              </div>

              <div className="flex-1 mt-4 overflow-y-auto space-y-4 pr-1 scrollbar-thin select-none text-xs">
                <div className="flex gap-3 relative select-none">
                  <div className="relative shrink-0 flex flex-col items-center">
                    <span className="w-2 h-2 rounded-full mt-1.5 z-10 shrink-0 bg-emerald-500" />
                    {expenses.length > 0 && <div className="w-px h-full bg-border absolute top-3.5 z-0" />}
                  </div>
                  <div>
                    <span className="block font-bold text-foreground">Vendor profile registered</span>
                    <span className="block text-[10px] text-muted-foreground uppercase font-bold mt-0.5">
                      Status: {vendor.status} • {formatDate(vendor.createdAt)}
                    </span>
                  </div>
                </div>

                {expenses.map((exp: any, index: number) => (
                  <div key={index} className="flex gap-3 relative select-none">
                    <div className="relative shrink-0 flex flex-col items-center">
                      <span className="w-2 h-2 rounded-full mt-1.5 z-10 shrink-0 bg-indigo-500" />
                      {index < expenses.length - 1 && (
                        <div className="w-px h-full bg-border absolute top-3.5 z-0" />
                      )}
                    </div>
                    <div>
                      <span className="block font-bold text-foreground">
                        Expense filed: {exp.category}
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-normal max-w-xs">{exp.description}</p>
                      <span className="block text-[10px] text-muted-foreground uppercase font-bold mt-1">
                        Amount: {formatCurrency(exp.amount, currency)} • {formatDate(exp.date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: EXPENSES LIST */}
        {activeTab === 'expenses' && (
          <div className="animate-fade-in select-none">
            <DataTable
              columns={expenseColumns}
              data={expenses}
              emptyTitle="No expenses mapped"
              emptyDescription="There are no recorded expenses or bills mapped to this vendor."
              pageSize={6}
            />
          </div>
        )}

        {/* TAB 3: ADVANCED SPECIFICATIONS */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none animate-fade-in">
            
            {/* Core & Corporate Metadata */}
            <div className="p-5 border rounded-xl bg-card shadow-premium space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b pb-2 select-none">
                <Building2 className="w-4 h-4 text-indigo-500" />
                Corporate Metadata & Settings
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">Display Name</span>
                  <span className="block font-semibold text-foreground mt-0.5">{vendor.displayName || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">Vendor Currency</span>
                  <span className="block font-semibold text-foreground mt-0.5">{vendor.currency || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">Vendor Language</span>
                  <span className="block font-semibold text-foreground mt-0.5">{vendor.language || "English"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">Permanent Account Number (PAN)</span>
                  <span className="block font-semibold text-foreground mt-0.5">{vendor.pan || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">Payment Terms</span>
                  <span className="block font-semibold text-foreground mt-0.5">{vendor.paymentTerms || "Due on Receipt"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">Department / Section</span>
                  <span className="block font-semibold text-foreground mt-0.5">{vendor.department || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">Designation</span>
                  <span className="block font-semibold text-foreground mt-0.5">{vendor.designation || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">Portal Enabled</span>
                  <span className="block font-semibold text-foreground mt-0.5">{vendor.enablePortal ? "Yes" : "No"}</span>
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-2 border-t space-y-3">
                <span className="block text-[10px] font-bold text-muted-foreground uppercase">Social Channels</span>
                <div className="flex flex-col gap-2">
                  {vendor.socialX && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded">X (Twitter)</span>
                      <span className="text-xs font-semibold">{vendor.socialX}</span>
                    </div>
                  )}
                  {vendor.socialFacebook && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded">Facebook</span>
                      <span className="text-xs font-semibold">{vendor.socialFacebook}</span>
                    </div>
                  )}
                  {vendor.skype && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded">Skype</span>
                      <span className="text-xs font-semibold">{vendor.skype}</span>
                    </div>
                  )}
                  {!vendor.socialX && !vendor.socialFacebook && !vendor.skype && (
                    <span className="text-xs text-muted-foreground">No social channel configurations captured.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Geographical Address specifications */}
            <div className="p-5 border rounded-xl bg-card shadow-premium space-y-5">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b pb-2 select-none">
                <MapPin className="w-4 h-4 text-indigo-500" />
                Registered Address specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Billing Address */}
                <div className="space-y-2 text-xs">
                  <span className="block text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider">Billing Address</span>
                  {vendor.billingAddress && (vendor.billingAddress.street1 || vendor.billingAddress.city) ? (
                    <div className="space-y-1 text-foreground/80 font-medium">
                      {vendor.billingAddress.attention && <p className="font-bold text-foreground">Attn: {vendor.billingAddress.attention}</p>}
                      {vendor.billingAddress.street1 && <p>{vendor.billingAddress.street1}</p>}
                      {vendor.billingAddress.street2 && <p>{vendor.billingAddress.street2}</p>}
                      <p>{vendor.billingAddress.city || ""}{vendor.billingAddress.state ? `, ${vendor.billingAddress.state}` : ""}{vendor.billingAddress.zip ? ` - ${vendor.billingAddress.zip}` : ""}</p>
                      {vendor.billingAddress.country && <p className="font-bold">{vendor.billingAddress.country}</p>}
                      {vendor.billingAddress.phone && <p className="text-[10px] text-muted-foreground mt-1">Phone: {vendor.billingAddress.phone}</p>}
                      {vendor.billingAddress.fax && <p className="text-[10px] text-muted-foreground">Fax: {vendor.billingAddress.fax}</p>}
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">No billing address recorded.</span>
                  )}
                </div>

                {/* Shipping Address */}
                <div className="space-y-2 text-xs">
                  <span className="block text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider">Shipping Address</span>
                  {vendor.shippingAddress && (vendor.shippingAddress.street1 || vendor.shippingAddress.city) ? (
                    <div className="space-y-1 text-foreground/80 font-medium">
                      {vendor.shippingAddress.attention && <p className="font-bold text-foreground">Attn: {vendor.shippingAddress.attention}</p>}
                      {vendor.shippingAddress.street1 && <p>{vendor.shippingAddress.street1}</p>}
                      {vendor.shippingAddress.street2 && <p>{vendor.shippingAddress.street2}</p>}
                      <p>{vendor.shippingAddress.city || ""}{vendor.shippingAddress.state ? `, ${vendor.shippingAddress.state}` : ""}{vendor.shippingAddress.zip ? ` - ${vendor.shippingAddress.zip}` : ""}</p>
                      {vendor.shippingAddress.country && <p className="font-bold">{vendor.shippingAddress.country}</p>}
                      {vendor.shippingAddress.phone && <p className="text-[10px] text-muted-foreground mt-1">Phone: {vendor.shippingAddress.phone}</p>}
                      {vendor.shippingAddress.fax && <p className="text-[10px] text-muted-foreground">Fax: {vendor.shippingAddress.fax}</p>}
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">No shipping address recorded.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Fields & Contact Persons */}
            <div className="p-5 border rounded-xl bg-card shadow-premium space-y-4 md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Secondary Contact Persons */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-indigo-500 uppercase tracking-wider border-b pb-1">Additional Contact Persons</h4>
                  <div className="space-y-3">
                    {vendor.contactPersons && vendor.contactPersons.length > 0 ? (
                      vendor.contactPersons.map((contact: any) => (
                        <div key={contact.id} className="p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-foreground">{contact.salutation} {contact.firstName} {contact.lastName}</span>
                            <div className="text-[11px] text-muted-foreground mt-0.5 flex flex-col gap-0.5">
                              <span>Email: {contact.email}</span>
                              <span>Phone: {contact.phone}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic block">No additional contact persons registered.</span>
                    )}
                  </div>
                </div>

                {/* Zoho-like Custom Fields */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-indigo-500 uppercase tracking-wider border-b pb-1">Custom Classification Fields</h4>
                  <div className="space-y-2">
                    {vendor.customFields && vendor.customFields.length > 0 ? (
                      vendor.customFields.map((field: any) => (
                        <div key={field.id} className="flex justify-between items-center p-2.5 rounded-lg border bg-slate-50/50 dark:bg-slate-900/30 text-xs">
                          <span className="text-muted-foreground font-bold uppercase text-[10px]">{field.label}</span>
                          <span className="font-semibold text-foreground">{field.value || "Not Set"}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic block">No custom field definitions recorded.</span>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
