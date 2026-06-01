import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Users,
  Eye,
  MoreHorizontal,
  FilePlus,
  User,
  Building2,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Landmark,
  Sparkles,
  AlertCircle,
  Copy,
  CheckCircle2,
  Trash2,
  Upload,
  BookOpen,
  Layers,
  MapPin
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
import toast from 'react-hot-toast';

// Geographical datasets for premium select dropdowns
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

// Expanded Zod validation schema matching Zoho-like advanced capabilities
const clientSchema = zod.object({
  clientType: zod.enum(['individual', 'business']),
  salutation: zod.string(),
  firstName: zod.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: zod.string().min(1, { message: "Last name must be at least 1 character" }),
  company: zod.string(),
  displayName: zod.string().min(2, { message: "Display name must be at least 2 characters" }),
  currency: zod.string().min(1, { message: "Currency is required" }),
  email: zod.string().email({ message: "Invalid email format" }),
  workPhoneCode: zod.string(),
  workPhone: zod.string(),
  mobileCode: zod.string(),
  mobile: zod.string(),
  language: zod.string().min(1, { message: "Language is required" }),

  // Tab 1: Other Details
  gstTreatment: zod.string().min(1, { message: "GST Treatment is required" }),
  gstNumber: zod.string().optional(),
  placeOfSupply: zod.string().min(1, { message: "Place of Supply is required" }),
  taxPreference: zod.enum(['Taxable', 'Tax Exempt']),
  pan: zod.string(),
  paymentTerms: zod.string(),
  enablePortal: zod.boolean(),
  website: zod.string(),
  department: zod.string(),
  designation: zod.string(),

  // Tab 2: Address (Billing)
  billingAttention: zod.string(),
  billingStreet1: zod.string(),
  billingStreet2: zod.string(),
  billingCountry: zod.string(),
  billingState: zod.string(),
  billingCity: zod.string(),
  billingZip: zod.string(),
  billingPhone: zod.string(),
  billingFax: zod.string(),

  // Tab 2: Address (Shipping)
  shippingAttention: zod.string(),
  shippingStreet1: zod.string(),
  shippingStreet2: zod.string(),
  shippingCountry: zod.string(),
  shippingState: zod.string(),
  shippingCity: zod.string(),
  shippingZip: zod.string(),
  shippingPhone: zod.string(),
  shippingFax: zod.string(),

  // Tab 5: Remarks
  remarks: zod.string()
});

type ClientFormValues = zod.infer<typeof clientSchema>;

interface ContactPerson {
  id: string;
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface CustomField {
  id: string;
  label: string;
  value: string;
}

export const ClientsList: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeClientMenu, setActiveClientMenu] = useState<string | null>(null);

  // Interactive form tab control
  const [activeFormTab, setActiveFormTab] = useState<'other' | 'address' | 'contacts' | 'custom' | 'remarks'>('other');

  // Custom states for interactive elements in the drawer
  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([
    { id: 'cf-1', label: 'GSTIN', value: '' },
    { id: 'cf-2', label: 'Industry', value: 'Technology' }
  ]);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{ name: string; size: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Secondary Contact Form row state
  const [newContact, setNewContact] = useState({
    salutation: 'Mr.',
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  // Dynamic feedback indicators
  const [copiedBilling, setCopiedBilling] = useState(false);

  const { currency } = usePreferencesStore();
  const navigate = useNavigate();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      clientType: 'business',
      salutation: 'Mr.',
      firstName: '',
      lastName: '',
      company: '',
      displayName: '',
      currency: 'INR',
      email: '',
      workPhoneCode: '+91',
      workPhone: '',
      mobileCode: '+91',
      mobile: '',
      language: 'English',
      gstTreatment: '',
      gstNumber: '',
      placeOfSupply: '',
      taxPreference: 'Taxable',
      pan: '',
      paymentTerms: 'Due on Receipt',
      enablePortal: false,
      website: '',
      department: '',
      designation: '',
      billingCountry: 'India',
      billingState: 'West Bengal',
      billingCity: 'Kolkata',
      shippingCountry: 'India',
      shippingState: 'West Bengal',
      shippingCity: 'Kolkata',
      remarks: ''
    }
  });

  const clientType = watch("clientType");
  const watchFirstName = watch("firstName");
  const watchLastName = watch("lastName");
  const watchCompany = watch("company");
  const billingCountry = watch("billingCountry");
  const billingState = watch("billingState");
  const shippingCountry = watch("shippingCountry");
  const shippingState = watch("shippingState");
  const gstTreatment = watch("gstTreatment");
  const isNotRegisteredBusiness = gstTreatment === 'Overseas' || gstTreatment === 'Consumer' || gstTreatment === 'Unregistered Business';

  // Load clients
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

  // Auto derivation of client display name
  useEffect(() => {
    if (clientType === 'individual') {
      const derived = `${watchFirstName || ''} ${watchLastName || ''}`.trim();
      setValue("displayName", derived);
    } else {
      setValue("displayName", watchCompany || '');
    }
  }, [clientType, watchFirstName, watchLastName, watchCompany, setValue]);

  // Billing address dependents
  useEffect(() => {
    if (billingCountry && locationData[billingCountry]) {
      const statesList = Object.keys(locationData[billingCountry]);
      const defaultState = statesList.includes("West Bengal") ? "West Bengal" : statesList[0];
      setValue("billingState", defaultState);
    }
  }, [billingCountry, setValue]);

  useEffect(() => {
    if (billingCountry && billingState && locationData[billingCountry]?.[billingState]) {
      const citiesList = locationData[billingCountry][billingState];
      const defaultCity = citiesList.includes("Kolkata") ? "Kolkata" : citiesList[0];
      setValue("billingCity", defaultCity);
    }
  }, [billingState, billingCountry, setValue]);

  // Shipping address dependents
  useEffect(() => {
    if (shippingCountry && locationData[shippingCountry]) {
      const statesList = Object.keys(locationData[shippingCountry]);
      const defaultState = statesList.includes("West Bengal") ? "West Bengal" : statesList[0];
      setValue("shippingState", defaultState);
    }
  }, [shippingCountry, setValue]);

  useEffect(() => {
    if (shippingCountry && shippingState && locationData[shippingCountry]?.[shippingState]) {
      const citiesList = locationData[shippingCountry][shippingState];
      const defaultCity = citiesList.includes("Kolkata") ? "Kolkata" : citiesList[0];
      setValue("shippingCity", defaultCity);
    }
  }, [shippingState, shippingCountry, setValue]);

  // Address copy action
  const handleCopyBillingToShipping = () => {
    const billAttention = watch("billingAttention") || "";
    const billSt1 = watch("billingStreet1") || "";
    const billSt2 = watch("billingStreet2") || "";
    const billZip = watch("billingZip") || "";
    const billPhone = watch("billingPhone") || "";
    const billFax = watch("billingFax") || "";

    setValue("shippingAttention", billAttention);
    setValue("shippingStreet1", billSt1);
    setValue("shippingStreet2", billSt2);
    setValue("shippingCountry", billingCountry);
    setValue("shippingState", billingState);
    setValue("shippingCity", watch("billingCity"));
    setValue("shippingZip", billZip);
    setValue("shippingPhone", billPhone);
    setValue("shippingFax", billFax);

    setCopiedBilling(true);
    setTimeout(() => setCopiedBilling(false), 2000);
  };

  // Add primary secondary contact
  const handleAddContact = () => {
    if (!newContact.firstName || !newContact.lastName) return;
    const item: ContactPerson = {
      id: `cp-${Date.now()}`,
      ...newContact
    };
    setContactPersons([...contactPersons, item]);
    setNewContact({
      salutation: 'Mr.',
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    });
  };

  const handleRemoveContact = (id: string) => {
    setContactPersons(contactPersons.filter(c => c.id !== id));
  };

  // Add Custom field row
  const handleAddCustomField = () => {
    const item: CustomField = {
      id: `cf-${Date.now()}`,
      label: 'New Field',
      value: ''
    };
    setCustomFields([...customFields, item]);
  };

  const handleUpdateCustomField = (id: string, updates: Partial<CustomField>) => {
    setCustomFields(customFields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  // Simulating document uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 3 - uploadedDocuments.length;
    if (files.length > remaining) {
      toast.error(`You can only attach up to 3 files (max ${remaining} more).`);
      return;
    }
    const newDocs: Array<{ name: string; size: string }> = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const size = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      newDocs.push({ name: file.name, size });
    }
    setUploadedDocuments([...uploadedDocuments, ...newDocs]);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveDocument = (index: number) => {
    setUploadedDocuments(uploadedDocuments.filter((_, idx) => idx !== index));
  };

  // Form submission
  const onSubmitClient = async (values: ClientFormValues) => {
    try {
      const fullName = `${values.salutation ? values.salutation + ' ' : ''}${values.firstName} ${values.lastName}`.trim();

      const payload = {
        clientType: values.clientType,
        name: fullName,
        company: values.clientType === 'individual' ? "Individual Client" : (values.company || "Individual Client"),
        email: values.email,
        phone: values.mobile ? `${values.mobileCode} ${values.mobile}` : `${values.workPhoneCode} ${values.workPhone}`,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        status: "active" as const,
        notes: values.remarks || "",

        // Advanced Custom details mapping
        displayName: values.displayName,
        currency: values.currency,
        language: values.language,
        gstTreatment: values.gstTreatment,
        gstNumber: values.gstNumber,
        placeOfSupply: values.placeOfSupply,
        taxPreference: values.taxPreference,
        pan: values.pan,
        paymentTerms: values.paymentTerms,
        enablePortal: values.enablePortal,
        website: values.website,
        department: values.department,
        designation: values.designation,

        // Addresses
        billingAddress: {
          attention: values.billingAttention,
          street1: values.billingStreet1,
          street2: values.billingStreet2,
          country: values.billingCountry,
          state: values.billingState,
          city: values.billingCity,
          zip: values.billingZip,
          phone: values.billingPhone,
          fax: values.billingFax
        },
        shippingAddress: {
          attention: values.shippingAttention,
          street1: values.shippingStreet1,
          street2: values.shippingStreet2,
          country: values.shippingCountry,
          state: values.shippingState,
          city: values.shippingCity,
          zip: values.shippingZip,
          phone: values.shippingPhone,
          fax: values.shippingFax
        },
        contactPersons,
        customFields,
        documentsCount: uploadedDocuments.length
      };

      await apiService.createClient(payload);
      toast.success("Client profile added successfully!");
      setDrawerOpen(false);
      reset();
      setContactPersons([]);
      setUploadedDocuments([]);
      loadClients();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save client details.");
    }
  };

  // Modern clean columns inheriting Inter sans-serif (removes AI-looking font-mono)
  const columns: ColumnDef<any>[] = [
    {
      header: "Client & Company",
      accessorKey: "name",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3 select-none">
          {/*<img
            src={row.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
            alt={row.name}
            className="w-8.5 h-8.5 rounded-lg object-cover border ring-1 ring-border shadow-sm shrink-0"
          />*/}
          <div>
            <Link
              to={`/dashboard/clients/${row.id}`}
              className="block text-xs font-bold text-foreground hover:text-primary hover:underline transition-colors"
            >
              {row.name}
            </Link>
            <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 font-semibold mt-0.5">
              {row.clientType === 'individual' ? (
                <>
                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                  Individual Client
                </>
              ) : (
                <>
                  <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
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
          <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">{row.phone}</span>
        </div>
      )
    },
    {
      header: "Billed Total",
      accessorKey: "totalBilled",
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-bold text-foreground select-none">
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
          "text-xs font-bold select-none",
          row.outstandingAmount > 0 ? "text-amber-500 font-extrabold" : "text-slate-400 font-medium"
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
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground active:scale-95 transition-all select-none cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4 shrink-0" />
          </button>

          {activeClientMenu === row.id && (
            <>
              <div
                onClick={() => setActiveClientMenu(null)}
                className="fixed inset-0 z-40 select-none"
              />
              <div className="absolute right-full -top-8 mr-2 w-44 bg-card border rounded-lg shadow-xl z-50 overflow-hidden divide-y text-xs font-semibold select-none">
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
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`Are you sure you want to delete ${row.name}? This will also delete all associated invoices and projects.`)) {
                      setActiveClientMenu(null);
                      try {
                        await apiService.deleteClient(row.id);
                        toast.success("Client profile deleted successfully!");
                        loadClients();
                      } catch (err) {
                        console.error(err);
                        toast.error("Failed to delete client.");
                      }
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-colors text-left font-semibold cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  Delete Client
                </button>
              </div>
            </>
          )}
        </div>
      )
    }
  ];

  // Helper arrays for selects
  const billingCountries = Object.keys(locationData);
  const billingStates = billingCountry ? Object.keys(locationData[billingCountry] || {}) : [];
  const billingCities = (billingCountry && billingState) ? (locationData[billingCountry][billingState] || []) : [];

  const shippingCountries = Object.keys(locationData);
  const shippingStates = shippingCountry ? Object.keys(locationData[shippingCountry] || {}) : [];
  const shippingCities = (shippingCountry && shippingState) ? (locationData[shippingCountry][shippingState] || []) : [];

  return (
    <div className="space-y-6 select-none animate-fade-in">

      {/* Page Header */}
      <PageHeader
        title="Clients"
        description="Configure client details, review outstanding contracts, and check billed timeline values."
        actions={
          <button
            onClick={() => {
              setActiveFormTab('other');
              setDrawerOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/95 transition-all shadow-md shadow-indigo-500/10 active:scale-95 select-none cursor-pointer"
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

      {/* Advanced High-Fidelity Add Client Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Create Customer Profile"
        size="xl" // Larger modal size to fit all premium details elegantly
      >
        <form onSubmit={handleSubmit(onSubmitClient)} className="flex flex-col h-[82vh] text-xs font-semibold select-none">

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto pr-2 pb-6 space-y-6 scrollbar-thin">

            {/* --- SECTION 1: CORE CLIENT CLASSIFICATION --- */}
            <div className="bg-slate-50/50 dark:bg-slate-900/35 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  1. Classification & Relationship
                </span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/50">
                  New Partner Setup
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Type Toggle */}
                <div className="flex flex-col gap-2">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">
                    Customer Type
                  </label>
                  <div className="grid grid-cols-2 p-0.5 bg-slate-100 dark:bg-slate-900 rounded-lg border text-center">
                    <button
                      type="button"
                      onClick={() => setValue("clientType", "business")}
                      className={cn(
                        "py-1.5 text-xs font-bold rounded-md transition-all active:scale-[0.98]",
                        clientType === 'business'
                          ? "bg-card text-foreground shadow-sm border border-slate-200/50 dark:border-slate-800/60"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Business
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("clientType", "individual")}
                      className={cn(
                        "py-1.5 text-xs font-bold rounded-md transition-all active:scale-[0.98]",
                        clientType === 'individual'
                          ? "bg-card text-foreground shadow-sm border border-slate-200/50 dark:border-slate-800/60"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Individual
                    </button>
                  </div>
                </div>

                {/* Display Name Helper */}
                <div className="flex flex-col gap-1.5 justify-end">
                  <div className="flex items-center justify-between">
                    <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">
                      Display Name <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[9px] text-slate-400 font-normal">Auto-derived based on name</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Display Name"
                      {...register("displayName")}
                      className={cn(
                        "w-full pl-8 pr-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium",
                        errors.displayName ? "border-rose-500/70" : ""
                      )}
                    />
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 absolute left-2.5 top-2.5" />
                  </div>
                  {errors.displayName && <span className="text-[9px] text-rose-500 font-bold">{errors.displayName.message}</span>}
                </div>
              </div>
            </div>

            {/* --- SECTION 2: PRIMARY CONTACT & COMPANY --- */}
            <div className="bg-card p-4 rounded-xl border space-y-4">
              <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider flex items-center gap-1 border-b pb-2">
                <User className="w-3.5 h-3.5 shrink-0" />
                2. Contact Identification
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Salutation + First Name + Last Name Group */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">
                    Primary Contact Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      {...register("salutation")}
                      className="px-2 py-2 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-primary w-18 text-center shrink-0"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Miss">Miss</option>
                      <option value="Dr.">Dr.</option>
                    </select>

                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="First Name"
                        {...register("firstName")}
                        className={cn(
                          "w-full px-2.5 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium",
                          errors.firstName ? "border-rose-500/70" : ""
                        )}
                      />
                    </div>

                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Last Name"
                        {...register("lastName")}
                        className={cn(
                          "w-full px-2.5 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium",
                          errors.lastName ? "border-rose-500/70" : ""
                        )}
                      />
                    </div>
                  </div>
                  {(errors.firstName || errors.lastName) && (
                    <span className="text-[9px] text-rose-500 font-bold">
                      {errors.firstName?.message || errors.lastName?.message}
                    </span>
                  )}
                </div>

                {/* Company Name (Disabled or adapted if individual) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">
                    Company Name {clientType === 'business' && <span className="text-rose-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={clientType === 'individual' ? "N/A (Individual Client)" : "Acme Corp"}
                      disabled={clientType === 'individual'}
                      {...register("company")}
                      className={cn(
                        "w-full pl-8 pr-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium disabled:bg-slate-100 dark:disabled:bg-slate-900/60 disabled:text-slate-400",
                        errors.company ? "border-rose-500/70" : ""
                      )}
                    />
                    <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                  {errors.company && <span className="text-[9px] text-rose-500 font-bold">{errors.company.message}</span>}
                </div>

                {/* Contact Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="billing@company.com"
                      {...register("email")}
                      className={cn(
                        "w-full pl-8 pr-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium",
                        errors.email ? "border-rose-500/70" : ""
                      )}
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                  {errors.email && <span className="text-[9px] text-rose-500 font-bold">{errors.email.message}</span>}
                </div>

                {/* Department */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">Department</label>
                        <input
                          type="text"
                          placeholder="Finance / Billing"
                          {...register("department")}
                          className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium"
                        />
                      </div>

                      {/* Designation */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">Designation</label>
                        <input
                          type="text"
                          placeholder="VP Finance"
                          {...register("designation")}
                          className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium"
                        />
                      </div>

                {/* Customer Language */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">
                    Customer Language <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register("language")}
                      className="w-full pl-8 pr-3 py-2 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-primary appearance-none cursor-pointer"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Arabic">Arabic</option>
                    </select>
                    <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                  {errors.language && <span className="text-[9px] text-rose-500 font-bold">{errors.language.message}</span>}
                </div>

                {/* Work Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Work Phone</label>
                  <div className="flex gap-1.5">
                    <select
                      {...register("workPhoneCode")}
                      className="px-2 py-2 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-primary w-20 text-center shrink-0 cursor-pointer"
                    >
                      {countryPhoneCodes.map(c => (
                        <option key={`work-${c.code}`} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="022-254879"
                      {...register("workPhone")}
                      className="flex-1 px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Mobile Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Mobile Number</label>
                  <div className="flex gap-1.5">
                    <select
                      {...register("mobileCode")}
                      className="px-2 py-2 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-primary w-20 text-center shrink-0 cursor-pointer"
                    >
                      {countryPhoneCodes.map(c => (
                        <option key={`mob-${c.code}`} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="98765-43210"
                      {...register("mobile")}
                      className="flex-1 px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Currency selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">
                    Currency <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register("currency")}
                      className="w-full pl-8 pr-3 py-2 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-primary cursor-pointer"
                    >
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - Great British Pound</option>
                      <option value="AED">AED - UAE Dirham</option>
                      <option value="SGD">SGD - Singapore Dollar</option>
                    </select>
                    <Landmark className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

              </div>
            </div>

            {/* --- SECTION 3: TABBED CONTAINER FOR ADDITIONAL METADATA --- */}
            <div className="border rounded-xl bg-card overflow-hidden shadow-sm">

              {/* Tabs Navigation */}
              <div className="flex border-b bg-slate-50/50 dark:bg-slate-900/10 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground overflow-x-auto whitespace-nowrap scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveFormTab('other')}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-3 border-b-2 select-none transition-colors duration-200 cursor-pointer",
                    activeFormTab === 'other' ? "border-primary text-primary bg-card" : "border-transparent hover:text-foreground"
                  )}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Other Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormTab('address')}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-3 border-b-2 select-none transition-colors duration-200 cursor-pointer",
                    activeFormTab === 'address' ? "border-primary text-primary bg-card" : "border-transparent hover:text-foreground"
                  )}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Address Mapping
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormTab('contacts')}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-3 border-b-2 select-none transition-colors duration-200 cursor-pointer",
                    activeFormTab === 'contacts' ? "border-primary text-primary bg-card" : "border-transparent hover:text-foreground"
                  )}
                >
                  <Users className="w-3.5 h-3.5" />
                  Contact Persons ({contactPersons.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormTab('custom')}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-3 border-b-2 select-none transition-colors duration-200 cursor-pointer",
                    activeFormTab === 'custom' ? "border-primary text-primary bg-card" : "border-transparent hover:text-foreground"
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Custom Fields ({customFields.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormTab('remarks')}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-3 border-b-2 select-none transition-colors duration-200 cursor-pointer",
                    activeFormTab === 'remarks' ? "border-primary text-primary bg-card" : "border-transparent hover:text-foreground"
                  )}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Internal Remarks
                </button>
              </div>

              {/* Tabs Content */}
              <div className="p-4 bg-card">

                {/* TAB 1: OTHER DETAILS */}
                {activeFormTab === 'other' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {/* GST Treatment */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">
                          GST Treatment <span className="text-rose-500">*</span>
                        </label>
                        <select
                          {...register("gstTreatment")}
                          className={cn(
                            "w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-semibold cursor-pointer appearance-none",
                            errors.gstTreatment ? "border-rose-500/70" : ""
                          )}
                        >
                          <option value="" disabled>Select a GST treatment</option>
                          <option value="Registered Business - Regular">Registered Business - Regular</option>
                          <option value="Registered Business - Composition">Registered Business - Composition</option>
                          <option value="Unregistered Business">Unregistered Business</option>
                          <option value="Consumer">Consumer</option>
                          <option value="Overseas">Overseas</option>
                          <option value="Special Economic Zone">Special Economic Zone</option>
                          <option value="Deemed Export">Deemed Export</option>
                          <option value="Non-GST Supply">Non-GST Supply</option>
                          <option value="Out Of Scope">Out Of Scope</option>
                          <option value="Tax Deductor">Tax Deductor</option>
                        </select>
                        {errors.gstTreatment && <span className="text-[9px] text-rose-500 font-bold">{errors.gstTreatment.message}</span>}
                      </div>

                      {/* GST Number — only for Registered Business */}
                      {!isNotRegisteredBusiness && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">
                            GST Number <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 29ABCDE1234F1Z5"
                            {...register("gstNumber")}
                            className={cn(
                              "w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium",
                              errors.gstNumber ? "border-rose-500/70" : ""
                            )}
                          />
                          {errors.gstNumber && <span className="text-[9px] text-rose-500 font-bold">{errors.gstNumber.message}</span>}
                        </div>
                      )}

                      {/* Place of Supply */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">
                          Place of Supply <span className="text-rose-500">*</span>
                        </label>
                        <select
                          {...register("placeOfSupply")}
                          className={cn(
                            "w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-semibold cursor-pointer appearance-none",
                            errors.placeOfSupply ? "border-rose-500/70" : ""
                          )}
                        >
                          <option value="" disabled>Select a state</option>
                          <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                          <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                          <option value="Assam">Assam</option>
                          <option value="Bihar">Bihar</option>
                          <option value="Chandigarh">Chandigarh</option>
                          <option value="Chhattisgarh">Chhattisgarh</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Goa">Goa</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Haryana">Haryana</option>
                          <option value="Himachal Pradesh">Himachal Pradesh</option>
                          <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                          <option value="Jharkhand">Jharkhand</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Kerala">Kerala</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Odisha">Odisha</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Telangana">Telangana</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="West Bengal">West Bengal</option>
                        </select>
                        {errors.placeOfSupply && <span className="text-[9px] text-rose-500 font-bold">{errors.placeOfSupply.message}</span>}
                      </div>

                      {/* PAN */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1">
                          <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">PAN</label>
                          <span className="text-slate-400 group relative">
                            <AlertCircle className="w-2.5 h-2.5" />
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder="ABCDE1234F"
                          {...register("pan")}
                          className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium"
                        />
                      </div>

                      {/* Tax Preference */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">
                          Tax Preference <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex items-center gap-4 h-full pt-1.5">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              value="Taxable"
                              {...register("taxPreference")}
                              className="text-primary focus:ring-primary h-3.5 w-3.5 border-slate-300"
                            />
                            <span className="text-xs font-medium text-foreground">Taxable</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              value="Tax Exempt"
                              {...register("taxPreference")}
                              className="text-primary focus:ring-primary h-3.5 w-3.5 border-slate-300"
                            />
                            <span className="text-xs font-medium text-foreground">Tax Exempt</span>
                          </label>
                        </div>
                      </div>

                      {/* Payment Terms */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">Payment Terms</label>
                        <div className="relative">
                          <select
                            {...register("paymentTerms")}
                            className="w-full pl-8 pr-3 py-2 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-primary cursor-pointer"
                          >
                            <option value="Due on Receipt">Due on Receipt</option>
                            <option value="Net 15">Net 15 days</option>
                            <option value="Net 30">Net 30 days</option>
                            <option value="Net 45">Net 45 days</option>
                            <option value="Net 60">Net 60 days</option>
                          </select>
                          <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>
                      </div>

                      {/* Website */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">Website URL</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="www.clientwebsite.com"
                            {...register("website")}
                            className="w-full pl-8 pr-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium"
                          />
                          <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>
                      </div>
                    </div>

                    {/* Document Uploads section */}
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center justify-between border-t pt-3">
                        <span className="text-[10px] font-extrabold uppercase text-muted-foreground">Documents Attachment</span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-foreground border rounded transition-all active:scale-95 cursor-pointer shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" /> Attach File
                        </button>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {uploadedDocuments.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 border rounded-lg bg-slate-50/50 dark:bg-slate-900/10 text-[10px]">
                            <span className="font-semibold truncate max-w-[120px] text-slate-700 dark:text-slate-300">{doc.name}</span>
                            <div className="flex items-center gap-1.5 shrink-0 ml-1">
                              <span className="text-slate-400">{doc.size}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(idx)}
                                className="text-rose-500 hover:text-rose-700 transition-colors cursor-pointer shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {uploadedDocuments.length === 0 && (
                          <div className="col-span-3 py-6 border border-dashed rounded-lg text-center text-slate-400 text-[10px]">
                            No documents attached. You can attach up to 3 files (Max 10MB each).
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 2: ADDRESS MAPPING */}
                {activeFormTab === 'address' && (
                  <div className="space-y-6 animate-fade-in">

                    {/* Copy Button Toolbar */}
                    <div className="flex items-center justify-between bg-indigo-50/40 dark:bg-indigo-950/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-indigo-500" />
                        Quickly replicate your details across addresses
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyBillingToShipping}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] transition-all shadow-sm shrink-0 cursor-pointer active:scale-95",
                          copiedBilling ? "bg-emerald-600 hover:bg-emerald-700" : ""
                        )}
                      >
                        {copiedBilling ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy Billing to Shipping
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-border">

                      {/* Left: Billing Address */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider flex items-center gap-1">
                          Billing Address
                        </span>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] text-slate-400 uppercase font-bold">Attention / Point of contact</label>
                          <input
                            type="text"
                            placeholder="Accounts Payable"
                            {...register("billingAttention")}
                            className="w-full px-2.5 py-1.5 border rounded-md bg-card outline-none focus:border-primary text-xs"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] text-slate-400 uppercase font-bold">Street 1</label>
                          <input
                            type="text"
                            placeholder="Line 1 Address"
                            {...register("billingStreet1")}
                            className="w-full px-2.5 py-1.5 border rounded-md bg-card outline-none focus:border-primary text-xs"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] text-slate-400 uppercase font-bold">Street 2</label>
                          <input
                            type="text"
                            placeholder="Line 2 Address"
                            {...register("billingStreet2")}
                            className="w-full px-2.5 py-1.5 border rounded-md bg-card outline-none focus:border-primary text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400 uppercase font-bold">Country</label>
                            <select
                              {...register("billingCountry")}
                              className="px-2 py-1.5 border rounded-md bg-card outline-none text-xs font-semibold focus:border-primary cursor-pointer"
                            >
                              {billingCountries.map(c => (
                                <option key={`bill-c-${c}`} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400 uppercase font-bold">State</label>
                            <select
                              {...register("billingState")}
                              className="px-2 py-1.5 border rounded-md bg-card outline-none text-xs font-semibold focus:border-primary cursor-pointer"
                            >
                              {billingStates.map(s => (
                                <option key={`bill-s-${s}`} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400 uppercase font-bold">City</label>
                            <select
                              {...register("billingCity")}
                              className="px-2 py-1.5 border rounded-md bg-card outline-none text-xs font-semibold focus:border-primary cursor-pointer"
                            >
                              {billingCities.map(ct => (
                                <option key={`bill-ct-${ct}`} value={ct}>{ct}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400 uppercase font-bold">Zip Code</label>
                            <input
                              type="text"
                              placeholder="700091"
                              {...register("billingZip")}
                              className="w-full px-2.5 py-1.5 border rounded-md bg-card outline-none focus:border-primary text-xs"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400 uppercase font-bold">Phone</label>
                            <input
                              type="text"
                              placeholder="033-241587"
                              {...register("billingPhone")}
                              className="w-full px-2.5 py-1.5 border rounded-md bg-card outline-none focus:border-primary text-xs"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400 uppercase font-bold">Fax</label>
                            <input
                              type="text"
                              placeholder="FAX-2458"
                              {...register("billingFax")}
                              className="w-full px-2.5 py-1.5 border rounded-md bg-card outline-none focus:border-primary text-xs"
                            />
                          </div>
                        </div>

                      </div>

                      {/* Right: Shipping Address */}
                      <div className="space-y-3 md:pl-6 pt-6 md:pt-0">
                        <span className="text-[10px] font-extrabold uppercase text-indigo-500 tracking-wider flex items-center gap-1">
                          Shipping Address
                        </span>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] text-slate-400 uppercase font-bold">Attention / Point of contact</label>
                          <input
                            type="text"
                            placeholder="Warehouse / Operations"
                            {...register("shippingAttention")}
                            className="w-full px-2.5 py-1.5 border rounded-md bg-card outline-none focus:border-primary text-xs"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] text-slate-400 uppercase font-bold">Street 1</label>
                          <input
                            type="text"
                            placeholder="Line 1 Address"
                            {...register("shippingStreet1")}
                            className="w-full px-2.5 py-1.5 border rounded-md bg-card outline-none focus:border-primary text-xs"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] text-slate-400 uppercase font-bold">Street 2</label>
                          <input
                            type="text"
                            placeholder="Line 2 Address"
                            {...register("shippingStreet2")}
                            className="w-full px-2.5 py-1.5 border rounded-md bg-card outline-none focus:border-primary text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400 uppercase font-bold">Country</label>
                            <select
                              {...register("shippingCountry")}
                              className="px-2 py-1.5 border rounded-md bg-card outline-none text-xs font-semibold focus:border-primary cursor-pointer"
                            >
                              {shippingCountries.map(c => (
                                <option key={`ship-c-${c}`} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400 uppercase font-bold">State</label>
                            <select
                              {...register("shippingState")}
                              className="px-2 py-1.5 border rounded-md bg-card outline-none text-xs font-semibold focus:border-primary cursor-pointer"
                            >
                              {shippingStates.map(s => (
                                <option key={`ship-s-${s}`} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400 uppercase font-bold">City</label>
                            <select
                              {...register("shippingCity")}
                              className="px-2 py-1.5 border rounded-md bg-card outline-none text-xs font-semibold focus:border-primary cursor-pointer"
                            >
                              {shippingCities.map(ct => (
                                <option key={`ship-ct-${ct}`} value={ct}>{ct}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400 uppercase font-bold">Zip Code</label>
                            <input
                              type="text"
                              placeholder="700091"
                              {...register("shippingZip")}
                              className="w-full px-2.5 py-1.5 border rounded-md bg-card outline-none focus:border-primary text-xs"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400 uppercase font-bold">Phone</label>
                            <input
                              type="text"
                              placeholder="033-241587"
                              {...register("shippingPhone")}
                              className="w-full px-2.5 py-1.5 border rounded-md bg-card outline-none focus:border-primary text-xs"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400 uppercase font-bold">Fax</label>
                            <input
                              type="text"
                              placeholder="FAX-2458"
                              {...register("shippingFax")}
                              className="w-full px-2.5 py-1.5 border rounded-md bg-card outline-none focus:border-primary text-xs"
                            />
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                )}

                {/* TAB 3: CONTACT PERSONS */}
                {activeFormTab === 'contacts' && (
                  <div className="space-y-4 animate-fade-in">

                    {/* Add secondary contact row form */}
                    <div className="bg-slate-50/60 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800/60">
                      <span className="block text-[10px] font-extrabold uppercase text-slate-500 mb-2">
                        Add New Secondary Contact Person
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">

                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] text-slate-400 uppercase font-bold">Salutation</label>
                          <select
                            value={newContact.salutation}
                            onChange={(e) => setNewContact({ ...newContact, salutation: e.target.value })}
                            className="px-2 py-1.5 border rounded bg-card outline-none text-xs cursor-pointer"
                          >
                            <option value="Mr.">Mr.</option>
                            <option value="Mrs.">Mrs.</option>
                            <option value="Ms.">Ms.</option>
                            <option value="Miss">Miss</option>
                            <option value="Dr.">Dr.</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] text-slate-400 uppercase font-bold">First Name</label>
                          <input
                            type="text"
                            placeholder="John"
                            value={newContact.firstName}
                            onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                            className="px-2 py-1 border rounded bg-card outline-none text-xs"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] text-slate-400 uppercase font-bold">Last Name</label>
                          <input
                            type="text"
                            placeholder="Doe"
                            value={newContact.lastName}
                            onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
                            className="px-2 py-1 border rounded bg-card outline-none text-xs"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] text-slate-400 uppercase font-bold">Email Address</label>
                          <input
                            type="email"
                            placeholder="john@doe.com"
                            value={newContact.email}
                            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                            className="px-2 py-1 border rounded bg-card outline-none text-xs"
                          />
                        </div>

                        <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                          <button
                            type="button"
                            onClick={handleAddContact}
                            className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/95 transition-all text-xs cursor-pointer shrink-0 active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Row
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* Secondary Contacts List */}
                    <div className="border rounded-lg overflow-hidden bg-card">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b">
                          <tr>
                            <th className="p-2 font-bold uppercase text-slate-400 tracking-wider">Contact Person</th>
                            <th className="p-2 font-bold uppercase text-slate-400 tracking-wider">Email Address</th>
                            <th className="p-2 font-bold uppercase text-slate-400 tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {contactPersons.map((cp) => (
                            <tr key={cp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                              <td className="p-2 font-semibold text-slate-700 dark:text-slate-200">
                                {cp.salutation} {cp.firstName} {cp.lastName}
                              </td>
                              <td className="p-2 text-slate-500 font-medium">{cp.email}</td>
                              <td className="p-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveContact(cp.id)}
                                  className="text-rose-500 hover:text-rose-700 transition-colors cursor-pointer shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {contactPersons.length === 0 && (
                            <tr>
                              <td colSpan={3} className="py-6 text-center text-slate-400 font-normal">
                                No secondary contacts registered.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>
                )}

                {/* TAB 4: CUSTOM FIELDS */}
                {activeFormTab === 'custom' && (
                  <div className="space-y-4 animate-fade-in">

                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-[10px] font-extrabold uppercase text-slate-500">Dynamic Key-Value Attributes</span>
                      <button
                        type="button"
                        onClick={handleAddCustomField}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-foreground border rounded transition-all active:scale-95 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        Add Custom Field
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {customFields.map((cf) => (
                        <div key={cf.id} className="flex gap-2 items-center bg-slate-50/30 dark:bg-slate-900/10 p-2 border rounded-lg relative group">

                          <div className="flex-1">
                            <input
                              type="text"
                              value={cf.label}
                              placeholder="Label (e.g. GSTIN)"
                              onChange={(e) => handleUpdateCustomField(cf.id, { label: e.target.value })}
                              className="w-full px-2 py-1 border rounded bg-card outline-none text-[10px] font-bold text-indigo-500 uppercase tracking-wider"
                            />
                          </div>

                          <div className="flex-1">
                            <input
                              type="text"
                              value={cf.value}
                              placeholder="Value"
                              onChange={(e) => handleUpdateCustomField(cf.id, { value: e.target.value })}
                              className="w-full px-2 py-1 border rounded bg-card outline-none text-[10px] text-slate-600 dark:text-slate-300 font-medium"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveCustomField(cf.id)}
                            className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer shrink-0 ml-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      ))}
                      {customFields.length === 0 && (
                        <div className="col-span-2 py-8 border border-dashed rounded-lg text-center text-slate-400 text-[10px]">
                          No custom metadata attributes declared.
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* TAB 5: REMARKS */}
                {activeFormTab === 'remarks' && (
                  <div className="space-y-3 animate-fade-in">
                    <span className="block text-[10px] font-extrabold uppercase text-slate-500">
                      Internal Remarks & Relationship Notes
                    </span>
                    <p className="text-[10px] text-slate-400 font-normal">Add private notes regarding client preferences, onboarding timeline, or contract guidelines. These are never shown on customer invoices.</p>

                    <textarea
                      placeholder="Write specific business details here..."
                      rows={5}
                      {...register("remarks")}
                      className="w-full p-3 border rounded-lg bg-slate-50/30 dark:bg-slate-900/10 outline-none focus:bg-card focus:border-primary text-xs font-medium resize-none leading-relaxed"
                    />
                  </div>
                )}

              </div>

            </div>

          </div>

          {/* Drawer Actions Footer (Fixed position) */}
          <div className="flex items-center gap-3 justify-end pt-4 border-t mt-auto shrink-0 select-none bg-card">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-muted text-foreground transition-all select-none active:scale-95 cursor-pointer font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-primary text-primary-foreground font-extrabold rounded-lg hover:bg-primary/95 transition-all select-none active:scale-95 shadow-md shadow-indigo-500/5 cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin shrink-0" />
                  Creating...
                </>
              ) : (
                "Create Client"
              )}
            </button>
          </div>

        </form>
      </Drawer>

    </div>
  );
};
