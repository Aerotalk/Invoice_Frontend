import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  Eye, 
  MoreHorizontal, 
  FilePlus, 
  UserCheck, 
  Briefcase, 
  User, 
  Building2, 
  Phone, 
  MapPin, 
  Globe 
} from 'lucide-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Drawer } from '../../../components/common/Drawer';
import { apiService } from '../../../services/api';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { cn } from '../../../lib/utils';

// Geographical datasets
const locationData: Record<string, Record<string, string[]>> = {
  India: {
    "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Durgapur"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane"],
    "Karnataka": ["Bengaluru", "Mysore", "Hubli", "Mangalore"],
    "Delhi": ["New Delhi", "Dwarka", "Rohini"]
  },
  "United States": {
    "California": ["San Francisco", "Los Angeles", "San Jose", "San Diego"],
    "New York": ["New York City", "Buffalo", "Rochester", "Albany"],
    "Texas": ["Houston", "Austin", "Dallas", "San Antonio"]
  },
  "United Kingdom": {
    "England": ["London", "Manchester", "Birmingham", "Leeds"],
    "Scotland": ["Edinburgh", "Glasgow", "Aberdeen"]
  },
  "United Arab Emirates": {
    "Dubai": ["Dubai City"],
    "Abu Dhabi": ["Abu Dhabi City"]
  }
};

const countryPhoneCodes = [
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+65", label: "🇸🇬 +65" }
];

// Client Form Schema
const clientSchema = zod.object({
  clientType: zod.enum(['individual', 'business']),
  name: zod.string().min(2, { message: "Name must be at least 2 characters" }),
  company: zod.string().min(2, { message: "Company name must be at least 2 characters" }),
  email: zod.string().email({ message: "Invalid email format" }),
  phoneCode: zod.string().min(1),
  phone: zod.string().min(6, { message: "Invalid phone number format" }),
  country: zod.string().min(1),
  state: zod.string().min(1),
  city: zod.string().min(1),
  avatar: zod.string().url({ message: "Avatar must be a valid Unsplash or image URL" }).optional().or(zod.literal("")),
  status: zod.enum(['active', 'inactive']),
  notes: zod.string().optional()
});

type ClientFormValues = zod.infer<typeof clientSchema>;

export const ClientsList: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeClientMenu, setActiveClientMenu] = useState<string | null>(null);
  const { currency } = usePreferencesStore();
  const navigate = useNavigate();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      clientType: 'business',
      phoneCode: '+91',
      country: 'India',
      state: 'West Bengal',
      city: 'Kolkata',
      status: 'active',
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      notes: ""
    }
  });

  const clientType = watch("clientType");
  const selectedCountry = watch("country");
  const selectedState = watch("state");

  // Dependent location controls
  useEffect(() => {
    if (selectedCountry && locationData[selectedCountry]) {
      const statesList = Object.keys(locationData[selectedCountry]);
      const defaultState = statesList.includes("West Bengal") ? "West Bengal" : statesList[0];
      setValue("state", defaultState);
    }
  }, [selectedCountry, setValue]);

  useEffect(() => {
    if (selectedCountry && selectedState && locationData[selectedCountry]?.[selectedState]) {
      const citiesList = locationData[selectedCountry][selectedState];
      const defaultCity = citiesList.includes("Kolkata") ? "Kolkata" : citiesList[0];
      setValue("city", defaultCity);
    }
  }, [selectedState, selectedCountry, setValue]);

  // If ClientType switches to individual, auto-fill company name to bypass validation cleanly
  useEffect(() => {
    if (clientType === 'individual') {
      setValue("company", "Individual Client");
    } else {
      setValue("company", "");
    }
  }, [clientType, setValue]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await apiService.getClients();
      setClients(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const onSubmitClient = async (values: ClientFormValues) => {
    try {
      const payload = {
        clientType: values.clientType,
        name: values.name,
        company: values.clientType === 'individual' ? "Individual" : values.company,
        email: values.email,
        phone: `${values.phoneCode} ${values.phone}`,
        country: values.country,
        state: values.state,
        city: values.city,
        avatar: values.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        status: values.status,
        notes: values.notes || ""
      };
      await apiService.createClient(payload);
      alert("Client added successfully!");
      setDrawerOpen(false);
      reset({
        clientType: 'business',
        phoneCode: '+91',
        country: 'India',
        state: 'West Bengal',
        city: 'Kolkata',
        status: 'active',
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        notes: ""
      });
      loadClients();
    } catch (e) {
      console.error(e);
    }
  };

  // Define Columns for DataTable
  const columns: ColumnDef<any>[] = [
    {
      header: "Client & Company",
      accessorKey: "name",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3 select-none">
          <img 
            src={row.avatar} 
            alt={row.name} 
            className="w-8 h-8 rounded-lg object-cover border ring-1 ring-border shadow-sm shrink-0" 
          />
          <div>
            <Link 
              to={`/dashboard/clients/${row.id}`} 
              className="block text-xs font-bold text-foreground hover:text-primary hover:underline"
            >
              {row.name}
            </Link>
            <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 font-semibold">
              {row.clientType === 'individual' ? (
                <>
                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                  Individual Client
                </>
              ) : (
                <>
                  <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                  {row.company}
                </>
              )}
            </span>
          </div>
        </div>
      )
    },
    {
      header: "Email Contact",
      accessorKey: "email",
      cell: (row) => (
        <div className="text-xs select-none">
          <span className="block text-foreground/80 font-medium">{row.email}</span>
          <span className="block text-[10px] text-slate-400 font-mono">{row.phone}</span>
        </div>
      )
    },
    {
      header: "Billed Total",
      accessorKey: "totalBilled",
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-bold text-foreground font-mono select-none">
          {formatCurrency(row.totalBilled, currency)}
        </span>
      )
    },
    {
      header: "Outstanding",
      accessorKey: "outstandingAmount",
      sortable: true,
      cell: (row) => (
        <span className={cn(
          "text-xs font-bold font-mono select-none",
          row.outstandingAmount > 0 ? "text-amber-500" : "text-slate-400"
        )}>
          {formatCurrency(row.outstandingAmount, currency)}
        </span>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="relative select-none">
          <button
            onClick={() => setActiveClientMenu(activeClientMenu === row.id ? null : row.id)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground active:scale-95 transition-all select-none"
          >
            <MoreHorizontal className="w-4 h-4 shrink-0" />
          </button>
          
          {activeClientMenu === row.id && (
            <>
              <div 
                onClick={() => setActiveClientMenu(null)}
                className="fixed inset-0 z-40 select-none" 
              />
              <div className="absolute right-0 mt-1.5 w-44 bg-card border rounded-lg shadow-xl z-50 overflow-hidden divide-y text-xs font-semibold select-none">
                <Link
                  to={`/dashboard/clients/${row.id}`}
                  onClick={() => setActiveClientMenu(null)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-muted text-foreground/80 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  View Profile
                </Link>
                <Link
                  to="/dashboard/invoices/create"
                  state={{ preselectedClientId: row.id }}
                  onClick={() => setActiveClientMenu(null)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-muted text-foreground/80 transition-colors"
                >
                  <FilePlus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  Create Invoice
                </Link>
              </div>
            </>
          )}
        </div>
      )
    }
  ];

  const countries = Object.keys(locationData);
  const states = selectedCountry ? Object.keys(locationData[selectedCountry] || {}) : [];
  const cities = (selectedCountry && selectedState) ? (locationData[selectedCountry][selectedState] || []) : [];

  return (
    <div className="space-y-6 select-none animate-fade-in">
      
      {/* Page Header */}
      <PageHeader
        title="Clients"
        description="Configure client details, review outstanding contracts, and check billed timeline values."
        actions={
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/95 transition-all shadow-md shadow-indigo-500/10 active:scale-95 select-none"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        }
      />

      {/* Main Clients Table */}
      <DataTable
        columns={columns}
        data={clients}
        searchKey="name"
        searchPlaceholder="Filter clients by name..."
        emptyTitle="No clients found"
        emptyDescription="Get started by clicking Add Client on the top toolbar."
        loading={loading}
      />

      {/* 3. ADD CLIENT SLIDE-OUT DRAWER */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Create Client Profile"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmitClient)} className="flex flex-col gap-4 text-xs font-semibold select-none pb-6 pr-1 max-h-[80vh] overflow-y-auto scrollbar-thin">
          
          {/* Client Type switch controller */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border select-none">
            <button
              type="button"
              onClick={() => setValue("clientType", "individual")}
              className={cn(
                "py-1.5 text-xs font-bold rounded-lg transition-all active:scale-[0.98]",
                clientType === 'individual'
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Individual
            </button>
            <button
              type="button"
              onClick={() => setValue("clientType", "business")}
              className={cn(
                "py-1.5 text-xs font-bold rounded-lg transition-all active:scale-[0.98]",
                clientType === 'business'
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Business
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Client Name */}
            <div className={cn("flex flex-col gap-1.5 col-span-2", clientType === 'business' ? "sm:col-span-1" : "col-span-2")}>
              <label className="text-muted-foreground font-bold tracking-wide uppercase">
                {clientType === 'business' ? "Contact Full Name" : "Client Full Name"}
              </label>
              <input
                type="text"
                placeholder="Sarah Jenkins"
                {...register("name")}
                className={cn(
                  "px-3 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-primary text-xs font-medium",
                  errors.name ? "border-rose-500/70 focus:border-rose-500" : ""
                )}
              />
              {errors.name && <span className="text-[9px] text-rose-500 font-bold">{errors.name.message}</span>}
            </div>

            {/* Company Name (only for business) */}
            {clientType === 'business' && (
              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <label className="text-muted-foreground font-bold tracking-wide uppercase">Company Name</label>
                <input
                  type="text"
                  placeholder="Acme Corporation"
                  {...register("company")}
                  className={cn(
                    "px-3 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-primary text-xs font-medium",
                    errors.company ? "border-rose-500/70 focus:border-rose-500" : ""
                  )}
                />
                {errors.company && <span className="text-[9px] text-rose-500 font-bold">{errors.company.message}</span>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Contact Email */}
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
              <label className="text-muted-foreground font-bold tracking-wide uppercase">Contact Email</label>
              <input
                type="email"
                placeholder="sarah@acme.com"
                {...register("email")}
                className={cn(
                  "px-3 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-primary text-xs font-medium",
                  errors.email ? "border-rose-500/70 focus:border-rose-500" : ""
                )}
              />
              {errors.email && <span className="text-[9px] text-rose-500 font-bold">{errors.email.message}</span>}
            </div>

            {/* Phone Number with country codes */}
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
              <label className="text-muted-foreground font-bold tracking-wide uppercase">Phone Number</label>
              <div className="flex gap-2">
                <select
                  {...register("phoneCode")}
                  className="px-2 py-2 border rounded-lg bg-card/60 outline-none text-xs font-semibold focus:border-primary w-20 text-center"
                >
                  {countryPhoneCodes.map(c => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="555-0123"
                  {...register("phone")}
                  className={cn(
                    "flex-1 px-3 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-primary text-xs font-medium",
                    errors.phone ? "border-rose-500/70 focus:border-rose-500" : ""
                  )}
                />
              </div>
              {errors.phone && <span className="text-[9px] text-rose-500 font-bold">{errors.phone.message}</span>}
            </div>
          </div>

          {/* 3-Tier Dependent Geographical Dropdowns */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">Country</label>
              <select
                {...register("country")}
                className="w-full px-2 py-2 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-primary"
              >
                {countries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">State</label>
              <select
                {...register("state")}
                className="w-full px-2 py-2 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-primary"
              >
                {states.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">City</label>
              <select
                {...register("city")}
                className="w-full px-2 py-2 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-primary"
              >
                {cities.map(ct => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Avatar url */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground font-bold tracking-wide uppercase">Avatar Image URL (Optional)</label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/photo-..."
              {...register("avatar")}
              className="px-3 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-primary text-xs font-medium"
            />
            {errors.avatar && <span className="text-[9px] text-rose-500 font-bold">{errors.avatar.message}</span>}
          </div>

          {/* Status mapping */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground font-bold tracking-wide uppercase">Active Account Status</label>
            <select
              {...register("status")}
              className="px-3 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-primary text-xs font-medium"
            >
              <option value="active">Active Business Partner</option>
              <option value="inactive">Inactive / On-Hold Partner</option>
            </select>
          </div>

          {/* Custom notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground font-bold tracking-wide uppercase">Internal Notes & Terms</label>
            <textarea
              placeholder="Add payment terms, preferences, or project retainer notes..."
              rows={3}
              {...register("notes")}
              className="px-3 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-primary text-xs font-medium resize-none"
            />
          </div>

          {/* Drawer Actions */}
          <div className="flex items-center gap-3 justify-end pt-4 border-t mt-4 shrink-0 select-none">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-muted text-foreground transition-all select-none active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/95 transition-all select-none active:scale-95 shadow-md shadow-indigo-500/5"
            >
              Create Client
            </button>
          </div>

        </form>
      </Drawer>

    </div>
  );
};
