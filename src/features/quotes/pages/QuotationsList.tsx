import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  MoreHorizontal, 
  Sparkles, 
  Upload, 
  X, 
  ChevronDown, 
  Check, 
  Calculator, 
  Layers, 
  AlertCircle,
  Eye,
  Settings,
  Calendar,
  FileCheck2,
  UserSquare2,
  FolderKanban,
  FileText
} from 'lucide-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Drawer } from '../../../components/common/Drawer';
import { apiService } from '../../../services/api';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { cn } from '../../../lib/utils';
import toast from 'react-hot-toast';

// Zod schema designed to prevent input/output type conflicts in form bindings
const quoteSchema = zod.object({
  quoteNumber: zod.string().min(2, { message: "Quote number must be at least 2 characters" }),
  referenceNumber: zod.string(),
  clientId: zod.string().min(1, { message: "Customer is required" }),
  quoteDate: zod.string().min(1, { message: "Quote date is required" }),
  expiryDate: zod.string(),
  salesperson: zod.string(),
  projectId: zod.string(),
  subject: zod.string(),
  customerNotes: zod.string(),
  terms: zod.string(),
  discountRate: zod.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, {
    message: "Discount must be between 0% and 100%"
  }),
  taxType: zod.enum(['tds', 'tcs']),
  taxRate: zod.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Tax rate must be positive"
  }),
  adjustment: zod.string().refine((val) => !isNaN(Number(val)), {
    message: "Adjustment must be a number"
  })
});

type QuoteFormValues = zod.infer<typeof quoteSchema>;

interface QuoteItemInput {
  productId: string;
  name: string;
  quantity: number;
  rate: number;
  taxRate: number;
  total: number;
}

export const QuotationsList: React.FC = () => {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [salespersons, setSalespersons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeQuoteMenu, setActiveQuoteMenu] = useState<string | null>(null);

  // Dynamic input controls
  const [isCustomQuoteCode, setIsCustomQuoteCode] = useState(false);
  const [newSalesperson, setNewSalesperson] = useState("");
  const [salespersonDropdownOpen, setSalespersonDropdownOpen] = useState(false);

  // File Upload states
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string }>>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Dynamic row builder states
  const [itemRows, setItemRows] = useState<QuoteItemInput[]>([
    { productId: "", name: "", quantity: 1, rate: 0, taxRate: 0, total: 0 }
  ]);

  // Quick search filter input state
  const [globalSearch, setGlobalSearch] = useState("");

  const { currency } = usePreferencesStore();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      quoteNumber: '',
      referenceNumber: '',
      clientId: '',
      quoteDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      salesperson: '',
      projectId: '',
      subject: '',
      customerNotes: 'Looking forward for your business.',
      terms: 'Payments must be settled within the defined quote validity period.',
      discountRate: '0',
      taxType: 'tds',
      taxRate: '10',
      adjustment: '0'
    }
  });

  const selectedClientId = watch("clientId");
  const discountRateVal = watch("discountRate");
  const taxTypeVal = watch("taxType");
  const taxRateVal = watch("taxRate");
  const adjustmentVal = watch("adjustment");

  // Load backend dependencies
  const loadData = async () => {
    setLoading(true);
    try {
      const quotesRes = await apiService.getQuotes();
      const clientsRes = await apiService.getClients();
      const productsRes = await apiService.getProducts();
      const salespersonsRes = await apiService.getSalespersons();
      
      // We'll also fetch projects from DB directly
      const projectsRes = await apiService.getProjects();

      setQuotes(quotesRes);
      setClients(clientsRes);
      setProducts(productsRes);
      setSalespersons(salespersonsRes);
      setAllProjects(projectsRes);

      // Pre-generate standard Quote Number
      const nextNum = `QT-${String((quotesRes.length || 0) + 1).padStart(6, '0')}`;
      setValue("quoteNumber", nextNum);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter projects dynamically based on the selected Client ID
  const filteredProjects = selectedClientId 
    ? allProjects.filter(p => p.clientId === selectedClientId) 
    : [];

  // Recalculations hook for Grand Total summaries
  const subtotal = itemRows.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = subtotal * (Number(discountRateVal || 0) / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (Number(taxRateVal || 0) / 100);
  
  // Tax subtraction for TDS, addition for TCS
  const total = taxTypeVal === 'tds' 
    ? taxableAmount - taxAmount + Number(adjustmentVal || 0) 
    : taxableAmount + taxAmount + Number(adjustmentVal || 0);

  // Dynamic row builder methods
  const handleAddRow = () => {
    setItemRows([...itemRows, { productId: "", name: "", quantity: 1, rate: 0, taxRate: 0, total: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    if (itemRows.length <= 1) {
      setItemRows([{ productId: "", name: "", quantity: 1, rate: 0, taxRate: 0, total: 0 }]);
      return;
    }
    setItemRows(itemRows.filter((_, idx) => idx !== index));
  };

  const handleRowChange = (index: number, field: keyof QuoteItemInput, val: any) => {
    const nextRows = [...itemRows];
    const row = nextRows[index];

    if (field === 'productId') {
      const prod = products.find(p => p.id === val);
      if (prod) {
        row.productId = prod.id;
        row.name = prod.name;
        row.rate = prod.sellingPrice;
        row.total = row.quantity * prod.sellingPrice;
      } else {
        row.productId = "";
        row.name = "";
        row.rate = 0;
        row.total = 0;
      }
    } else if (field === 'quantity') {
      const q = Math.max(0, Number(val));
      row.quantity = q;
      row.total = q * row.rate;
    } else if (field === 'rate') {
      const r = Math.max(0, Number(val));
      row.rate = r;
      row.total = row.quantity * r;
    } else if (field === 'taxRate') {
      row.taxRate = Number(val);
    } else if (field === 'name') {
      row.name = val;
    }

    setItemRows(nextRows);
  };

  // Salesperson insertion inline helper
  const handleAddSalesperson = async () => {
    const trimmed = newSalesperson.trim();
    if (!trimmed) return;
    if (salespersons.includes(trimmed)) {
      setValue("salesperson", trimmed);
      setNewSalesperson("");
      setSalespersonDropdownOpen(false);
      return;
    }

    try {
      const nextStaff = await apiService.createSalesperson(trimmed);
      setSalespersons(nextStaff);
      setValue("salesperson", trimmed);
      setNewSalesperson("");
      setSalespersonDropdownOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Mock Upload attachments helper
  const handleMockUploadFile = () => {
    if (uploadedFiles.length >= 3) {
      toast.error("Maximum of 3 file attachments allowed.");
      return;
    }
    setUploadingFile(true);
    setTimeout(() => {
      const files = ['quotation_draft_sheet.xlsx', 'scope_of_work_v3.pdf', 'technical_schematic.dwg'];
      const chosen = files[Math.floor(Math.random() * files.length)];
      const size = `${(Math.random() * 5 + 1).toFixed(1)} MB`;
      setUploadedFiles([...uploadedFiles, { name: chosen, size }]);
      setUploadingFile(false);
    }, 600);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, idx) => idx !== index));
  };

  // Submit quote
  const onSubmitQuote = async (values: QuoteFormValues) => {
    const activeClient = clients.find(c => c.id === values.clientId);
    const activeProject = allProjects.find(p => p.id === values.projectId);

    // Verify row items aren't completely empty
    const filteredItems = itemRows.filter(r => r.name.trim() !== "");
    if (filteredItems.length === 0) {
      toast.error("Please configure at least one dynamic item with details.");
      return;
    }

    try {
      const payload = {
        quoteNumber: values.quoteNumber,
        referenceNumber: values.referenceNumber,
        clientId: values.clientId,
        clientName: activeClient?.name || "Unknown Client",
        clientCompany: activeClient?.company || "Unknown Company",
        quoteDate: values.quoteDate,
        expiryDate: values.expiryDate || undefined,
        salesperson: values.salesperson || undefined,
        projectId: values.projectId || undefined,
        projectName: activeProject?.name || undefined,
        subject: values.subject || undefined,
        items: filteredItems.map((r, index) => ({
          id: `qi-${Date.now()}-${index}`,
          productId: r.productId || "custom",
          name: r.name,
          quantity: r.quantity,
          rate: r.rate,
          total: r.total
        })),
        subtotal,
        discountRate: Number(values.discountRate),
        discountAmount,
        taxType: values.taxType,
        taxRate: Number(values.taxRate),
        taxAmount,
        adjustment: Number(values.adjustment),
        total,
        status: "sent" as const, // Sent default on Save & Send
        customerNotes: values.customerNotes,
        terms: values.terms
      };

      await apiService.createQuote(payload);
      toast.success("Quotation registered successfully!");
      setDrawerOpen(false);
      reset();
      setItemRows([{ productId: "", name: "", quantity: 1, rate: 0, taxRate: 0, total: 0 }]);
      setUploadedFiles([]);
      loadData();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save quote details.");
    }
  };

  // Quick draft action
  const handleSaveAsDraft = async () => {
    const quoteNum = watch("quoteNumber");
    const clId = watch("clientId");
    if (!clId) {
      toast.error("Please select a customer to save this quote.");
      return;
    }

    const activeClient = clients.find(c => c.id === clId);
    const activeProject = allProjects.find(p => p.id === watch("projectId"));
    const filteredItems = itemRows.filter(r => r.name.trim() !== "");

    try {
      const payload = {
        quoteNumber: quoteNum,
        referenceNumber: watch("referenceNumber"),
        clientId: clId,
        clientName: activeClient?.name || "Unknown Client",
        clientCompany: activeClient?.company || "Unknown Company",
        quoteDate: watch("quoteDate"),
        expiryDate: watch("expiryDate") || undefined,
        salesperson: watch("salesperson") || undefined,
        projectId: watch("projectId") || undefined,
        projectName: activeProject?.name || undefined,
        subject: watch("subject") || undefined,
        items: filteredItems.map((r, index) => ({
          id: `qi-${Date.now()}-${index}`,
          productId: r.productId || "custom",
          name: r.name,
          quantity: r.quantity,
          rate: r.rate,
          total: r.total
        })),
        subtotal,
        discountRate: Number(discountRateVal),
        discountAmount,
        taxType: taxTypeVal,
        taxRate: Number(taxRateVal),
        taxAmount,
        adjustment: Number(adjustmentVal),
        total,
        status: "draft" as const,
        customerNotes: watch("customerNotes"),
        terms: watch("terms")
      };

      await apiService.createQuote(payload);
      toast.success("Quotation saved as draft successfully!");
      setDrawerOpen(false);
      reset();
      setItemRows([{ productId: "", name: "", quantity: 1, rate: 0, taxRate: 0, total: 0 }]);
      setUploadedFiles([]);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Filter quotes dynamically by global search query
  const filteredQuotes = quotes.filter(q => 
    q.quoteNumber.toLowerCase().includes(globalSearch.toLowerCase()) ||
    q.clientName.toLowerCase().includes(globalSearch.toLowerCase()) ||
    q.clientCompany.toLowerCase().includes(globalSearch.toLowerCase()) ||
    (q.subject && q.subject.toLowerCase().includes(globalSearch.toLowerCase())) ||
    (q.salesperson && q.salesperson.toLowerCase().includes(globalSearch.toLowerCase()))
  );

  // Table Columns Setup
  const columns: ColumnDef<any>[] = [
    {
      header: "Quote Number",
      accessorKey: "quoteNumber",
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-primary select-none text-xs">
          {row.quoteNumber}
        </span>
      )
    },
    {
      header: "Customer & Corporate",
      accessorKey: "clientName",
      sortable: true,
      cell: (row) => (
        <div className="select-none text-xs">
          <span className="block font-bold text-foreground">{row.clientName}</span>
          <span className="block text-[10px] text-muted-foreground uppercase font-semibold mt-0.5">{row.clientCompany}</span>
        </div>
      )
    },
    {
      header: "Quote Date",
      accessorKey: "quoteDate",
      sortable: true,
      cell: (row) => <span>{formatDate(row.quoteDate)}</span>
    },
    {
      header: "Expiry Date",
      accessorKey: "expiryDate",
      cell: (row) => <span>{row.expiryDate ? formatDate(row.expiryDate) : "Open Ended"}</span>
    },
    {
      header: "Salesperson",
      accessorKey: "salesperson",
      cell: (row) => <span className="font-medium text-xs text-foreground/80">{row.salesperson || "N/A"}</span>
    },
    {
      header: "Quoted Total",
      accessorKey: "total",
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-extrabold text-foreground select-none">
          {formatCurrency(row.total, currency)}
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
            onClick={() => setActiveQuoteMenu(activeQuoteMenu === row.id ? null : row.id)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground active:scale-95 transition-all select-none cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4 shrink-0" />
          </button>
          
          {activeQuoteMenu === row.id && (
            <>
              <div 
                onClick={() => setActiveQuoteMenu(null)}
                className="fixed inset-0 z-40 select-none" 
              />
              <div className="absolute right-full -top-8 mr-2 w-44 bg-card border rounded-lg shadow-xl z-50 overflow-hidden divide-y text-xs font-semibold select-none">
                <button
                  type="button"
                  onClick={() => {
                    setActiveQuoteMenu(null);
                    window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-foreground/80 transition-colors text-left"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  View PDF
                </button>

                {row.status === 'sent' && (
                  <button
                    type="button"
                    onClick={async () => {
                      setActiveQuoteMenu(null);
                      try {
                        await apiService.updateQuote(row.id, { status: "accepted" });
                        toast.success("Quote marked as accepted!");
                        loadData();
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 transition-colors text-left"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    Mark Accepted
                  </button>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`Are you sure you want to delete ${row.quoteNumber}?`)) {
                      setActiveQuoteMenu(null);
                      try {
                        await apiService.deleteQuote(row.id);
                        toast.success("Quotation deleted successfully!");
                        loadData();
                      } catch (err) {
                        console.error(err);
                      }
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-colors text-left font-semibold cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  Delete Quote
                </button>
              </div>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none animate-fade-in">
      
      {/* Search and Action Header Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">Quotations</h2>
          <p className="text-xs text-muted-foreground mt-1">Configure supply scopes, deliver product quotes, handle taxes (TDS/TCS), and monitor deal conversions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Custom Search in Quotes bar matching Zoho exact header specifications */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search in Quotes ( / )"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-64 pl-8 pr-3 py-1.5 border rounded-lg bg-card text-xs font-medium outline-none focus:border-primary shadow-sm hover:border-slate-300 dark:hover:border-slate-800 transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            {globalSearch && (
              <button 
                onClick={() => setGlobalSearch("")} 
                className="absolute right-2.5 top-2.5 p-0.5 rounded hover:bg-muted text-muted-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              reset();
              const nextNum = `QT-${String((quotes.length || 0) + 1).padStart(6, '0')}`;
              setValue("quoteNumber", nextNum);
              setItemRows([{ productId: "", name: "", quantity: 1, rate: 0, taxRate: 0, total: 0 }]);
              setUploadedFiles([]);
              setIsCustomQuoteCode(false);
              setDrawerOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/95 transition-all shadow-md active:scale-95 select-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Quotation
          </button>
        </div>
      </div>

      {/* Main Quotations Datatable */}
      <DataTable
        columns={columns}
        data={filteredQuotes}
        emptyTitle="No quotations recorded"
        emptyDescription="Configure customer quotes, dynamic inventory line items, and taxes by mapping a new Quotation."
        loading={loading}
      />

      {/* Extra Large Sliding setup drawer form */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="New Quote"
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmitQuote)} className="flex flex-col h-[82vh] text-xs font-semibold select-none relative">
          
          <div className="flex-1 overflow-y-auto pr-2 pb-6 space-y-6 scrollbar-thin">
            
            {/* Customer select box */}
            <div className="bg-slate-50/50 dark:bg-slate-900/35 p-4 rounded-xl border space-y-4">
              <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider flex items-center gap-1 border-b pb-2">
                <UserSquare2 className="w-3.5 h-3.5 shrink-0" />
                1. Customer & Company Specifications
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <select
                    {...register("clientId")}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-primary appearance-none cursor-pointer",
                      errors.clientId ? "border-rose-500/70" : ""
                    )}
                  >
                    <option value="">Select a customer</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                    ))}
                  </select>
                  {errors.clientId && <span className="text-[9px] text-rose-500 font-bold">{errors.clientId.message}</span>}
                </div>
              </div>
            </div>

            {/* Quote details, dates, salesperson */}
            <div className="bg-card p-4 rounded-xl border space-y-4">
              <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider flex items-center gap-1 border-b pb-2">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                2. Quote Codes & Timeframes
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Quote Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">
                    Quote# <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex rounded-lg overflow-hidden border">
                    <input
                      type="text"
                      disabled={!isCustomQuoteCode}
                      {...register("quoteNumber")}
                      className="w-full px-3 py-2 bg-card outline-none focus:border-primary text-xs font-semibold disabled:bg-slate-100 dark:disabled:bg-slate-900/60 disabled:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomQuoteCode(!isCustomQuoteCode)}
                      className={cn(
                        "px-3 border-l flex items-center justify-center transition-colors hover:bg-muted text-slate-500 shrink-0 cursor-pointer",
                        isCustomQuoteCode ? "text-primary bg-primary/5" : ""
                      )}
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {errors.quoteNumber && <span className="text-[9px] text-rose-500 font-bold">{errors.quoteNumber.message}</span>}
                </div>

                {/* Reference Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Reference#</label>
                  <input
                    type="text"
                    placeholder="E.g., PO-12345"
                    {...register("referenceNumber")}
                    className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium"
                  />
                </div>

                {/* Quote Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Quote Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    {...register("quoteDate")}
                    className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-semibold"
                  />
                </div>

                {/* Expiry Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Expiry Date</label>
                  <input
                    type="date"
                    {...register("expiryDate")}
                    className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Dynamic Project Mapping & Salesperson */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                {/* Salesperson Dropdown with custom inline addition */}
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Salesperson</label>
                  <div className="flex gap-2">
                    <select
                      {...register("salesperson")}
                      className="flex-1 px-3 py-2 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-primary appearance-none cursor-pointer"
                    >
                      <option value="">Select a Salesperson</option>
                      {salespersons.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setSalespersonDropdownOpen(!salespersonDropdownOpen)}
                      className="px-3 border rounded-lg hover:bg-muted text-slate-500 active:scale-95 transition-all text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {salespersonDropdownOpen && (
                    <div className="absolute bottom-full left-0 z-50 mb-1 w-full p-2 bg-card border rounded-lg shadow-xl flex gap-1 items-center border-slate-200 dark:border-slate-800">
                      <input
                        type="text"
                        placeholder="Add new salesperson..."
                        value={newSalesperson}
                        onChange={(e) => setNewSalesperson(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border rounded bg-card outline-none text-[11px] font-semibold focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={handleAddSalesperson}
                        className="px-2.5 py-1.5 rounded bg-primary text-white text-[10px] font-bold active:scale-95 shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>

                {/* Project selector dynamically filtered by Client */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Project Name</label>
                  <select
                    disabled={!selectedClientId}
                    {...register("projectId")}
                    className="w-full px-3 py-2 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-primary appearance-none cursor-pointer disabled:bg-slate-100 dark:disabled:bg-slate-900/60 disabled:text-slate-400"
                  >
                    <option value="">Select a project</option>
                    {filteredProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {!selectedClientId && (
                    <span className="text-[10px] text-amber-500 font-semibold tracking-wide flex items-center gap-1.5 mt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      Select a customer to associate a project.
                    </span>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5 mt-4">
                <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px] flex items-center gap-1">
                  Subject
                  <AlertCircle className="w-3 h-3 text-slate-400" />
                </label>
                <textarea
                  placeholder="Let your customer know what this Quote is for"
                  {...register("subject")}
                  className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium resize-none h-[42px] leading-relaxed"
                />
              </div>

            </div>

            {/* Line Item Table builder */}
            <div className="bg-card rounded-xl border overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b">
                <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 shrink-0" />
                  3. Line Item Calculation Table
                </span>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Headers */}
                <div className="grid grid-cols-12 gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-wider border-b pb-2 select-none hidden sm:grid">
                  <div className="col-span-4">Item Details</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right flex items-center justify-end gap-1">Rate <Calculator className="w-3 h-3" /></div>
                  <div className="col-span-2 text-center flex items-center justify-center gap-1">Tax <AlertCircle className="w-3 h-3 text-slate-400" /></div>
                  <div className="col-span-1 text-right">Amount</div>
                  <div className="col-span-1 hidden"></div>
                </div>

                {/* Rows */}
                <div className="space-y-3.5">
                  {itemRows.map((row, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center border-b pb-3 sm:pb-0 sm:border-b-0">
                      
                      {/* Product select + description */}
                      <div className="col-span-12 sm:col-span-4 flex flex-col gap-1">
                        <select
                          value={row.productId}
                          onChange={(e) => handleRowChange(index, "productId", e.target.value)}
                          className="w-full px-2 py-1.5 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-primary cursor-pointer"
                        >
                          <option value="">Choose a registered item</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Or type a custom service / supply item detail description..."
                          value={row.name}
                          onChange={(e) => handleRowChange(index, "name", e.target.value)}
                          className="w-full px-2 py-1 border rounded bg-slate-50/50 dark:bg-slate-900/25 outline-none text-[11px] font-medium focus:border-primary mt-1"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="col-span-6 sm:col-span-2">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 sm:hidden">Quantity</span>
                        <input
                          type="number"
                          step="any"
                          value={row.quantity}
                          onChange={(e) => handleRowChange(index, "quantity", e.target.value)}
                          className="w-full px-2.5 py-1.5 border rounded-lg bg-card outline-none text-xs font-semibold text-center focus:border-primary"
                        />
                      </div>

                      {/* Rate */}
                      <div className="col-span-6 sm:col-span-2">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 sm:hidden text-right">Rate</span>
                        <input
                          type="number"
                          step="any"
                          value={row.rate}
                          onChange={(e) => handleRowChange(index, "rate", e.target.value)}
                          className="w-full px-2.5 py-1.5 border rounded-lg bg-card outline-none text-xs font-semibold text-right focus:border-primary"
                        />
                      </div>

                      {/* Tax */}
                      <div className="col-span-6 sm:col-span-2">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 sm:hidden text-center">Tax</span>
                        <select
                          value={row.taxRate}
                          onChange={(e) => handleRowChange(index, "taxRate", e.target.value)}
                          className="w-full px-1 py-1.5 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-primary text-center appearance-none cursor-pointer"
                        >
                          <option value={0}>Select a Tax</option>
                          <option value={5}>GST5 [5%]</option>
                          <option value={12}>GST12 [12%]</option>
                          <option value={18}>GST18 [18%]</option>
                        </select>
                      </div>

                      {/* Amount */}
                      <div className="col-span-10 sm:col-span-1 text-right">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 sm:hidden">Amount</span>
                        <span className="text-xs font-bold text-foreground block pr-2 select-none mt-1 sm:mt-0">
                          {formatCurrency(row.total, currency)}
                        </span>
                      </div>

                      {/* Delete */}
                      <div className="col-span-2 sm:col-span-1 text-center mt-1 sm:mt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 shrink-0" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Item footer triggers */}
                <div className="border-t pt-4 mt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground text-[10px] font-bold active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-primary shrink-0" />
                    Add New Row
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // Bulk pre-fill mock
                      if (products.length > 0) {
                        const bulk = products.slice(0, 3).map(p => ({
                          productId: p.id,
                          name: p.name,
                          quantity: 1,
                          rate: p.sellingPrice,
                          taxRate: 0,
                          total: p.sellingPrice
                        }));
                        setItemRows([...itemRows.filter(r => r.productId), ...bulk]);
                        toast.success("Added top products catalog in bulk!");
                      }
                    }}
                    className="px-3 py-1.5 text-[10px] font-extrabold text-primary hover:underline hover:underline-offset-2 cursor-pointer"
                  >
                    Add Items in Bulk
                  </button>
                </div>
              </div>
            </div>

            {/* Calculations & Customer notes container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Customer notes & Terms */}
              <div className="space-y-4 select-none">
                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Customer Notes</label>
                  <textarea
                    placeholder="Enter customer specific greetings..."
                    {...register("customerNotes")}
                    className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium resize-none h-16 leading-relaxed"
                  />
                </div>

                {/* Terms */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Terms & Conditions</label>
                  <textarea
                    placeholder="Define contract terms and validity period..."
                    {...register("terms")}
                    className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium resize-none h-16 leading-relaxed"
                  />
                </div>

                {/* Mock File Attachment dropzone */}
                <div className="flex flex-col justify-start border-t pt-3">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px] mb-1.5">Attach File(s) to Quote</label>
                  
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={handleMockUploadFile}
                        disabled={uploadingFile}
                        className="w-full border-2 border-dashed rounded-lg py-3 flex flex-col items-center justify-center cursor-pointer select-none bg-slate-50/20 dark:bg-slate-900/10 hover:bg-slate-50/50 hover:border-slate-300 transition-all border-slate-200 dark:border-slate-800 disabled:opacity-40"
                      >
                        <Upload className="w-4 h-4 text-primary shrink-0 mb-1" />
                        <span className="text-[9px] font-bold text-foreground">{uploadingFile ? "Attaching..." : "Upload File"}</span>
                      </button>
                    </div>

                    <div className="col-span-2 flex flex-col gap-1 text-[10px] font-semibold overflow-y-auto max-h-16 pr-1 scrollbar-thin">
                      {uploadedFiles.map((f, idx) => (
                        <div key={idx} className="flex justify-between items-center p-1 rounded border bg-slate-50 dark:bg-slate-800/20 text-[10px]">
                          <span className="truncate max-w-[120px] text-foreground/80">{f.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-slate-400 text-[8px]">{f.size}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(idx)}
                              className="text-slate-400 hover:text-rose-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {uploadedFiles.length === 0 && (
                        <span className="text-slate-400 text-[9px] italic block pl-1">You can upload a maximum of 3 files, 10MB each.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculations Block summary */}
              <div className="p-5 border rounded-xl bg-slate-50/30 dark:bg-slate-900/10 space-y-4 select-none">
                
                {/* Sub Total */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Sub Total</span>
                  <span className="font-extrabold text-foreground">{formatCurrency(subtotal, currency)}</span>
                </div>

                {/* Discount Percentage Rate */}
                <div className="flex justify-between items-center gap-4 text-xs border-t pt-3">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Discount</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="any"
                      placeholder="0"
                      {...register("discountRate")}
                      className="w-16 px-2 py-1 border rounded bg-card outline-none text-right font-semibold focus:border-primary text-xs"
                    />
                    <span className="font-bold text-slate-400">%</span>
                    <span className="font-bold text-foreground ml-2">-{formatCurrency(discountAmount, currency)}</span>
                  </div>
                </div>

                {/* TDS / TCS selector */}
                <div className="flex justify-between items-center gap-4 text-xs border-t pt-3">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold uppercase text-[10px] text-slate-500 select-none">
                      <input
                        type="radio"
                        value="tds"
                        checked={taxTypeVal === 'tds'}
                        onChange={() => setValue("taxType", "tds")}
                        className="w-3.5 h-3.5 accent-primary"
                      />
                      <span>TDS</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold uppercase text-[10px] text-slate-500 select-none">
                      <input
                        type="radio"
                        value="tcs"
                        checked={taxTypeVal === 'tcs'}
                        onChange={() => setValue("taxType", "tcs")}
                        className="w-3.5 h-3.5 accent-primary"
                      />
                      <span>TCS</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select
                      {...register("taxRate")}
                      className="px-2 py-1 border rounded bg-card outline-none text-xs font-semibold focus:border-primary appearance-none cursor-pointer"
                    >
                      <option value="0">Select a Tax</option>
                      <option value="5">Standard (5%)</option>
                      <option value="10">GST (10%)</option>
                      <option value="15">Surcharge (15%)</option>
                      <option value="18">GST (18%)</option>
                    </select>
                    <span className="font-bold text-slate-400 shrink-0">Rate</span>
                    <span className={cn(
                      "font-bold ml-2",
                      taxTypeVal === 'tds' ? "text-rose-500" : "text-emerald-500"
                    )}>
                      {taxTypeVal === 'tds' ? "-" : "+"}{formatCurrency(taxAmount, currency)}
                    </span>
                  </div>
                </div>

                {/* Adjustment Input */}
                <div className="flex justify-between items-center gap-4 text-xs border-t pt-3">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Adjustment</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      {...register("adjustment")}
                      className="w-24 px-2.5 py-1 border rounded bg-card outline-none text-right font-semibold focus:border-primary text-xs"
                    />
                    <span className="font-bold text-slate-400">Adj</span>
                    <span className="font-bold text-foreground ml-2">
                      {Number(adjustmentVal) >= 0 ? "+" : ""}{formatCurrency(Number(adjustmentVal || 0), currency)}
                    </span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center text-sm border-t-2 border-dashed pt-4 select-none">
                  <span className="text-foreground font-extrabold uppercase tracking-wider text-xs">Total ( {currency} )</span>
                  <span className="font-extrabold text-foreground text-base tracking-tight">{formatCurrency(total, currency)}</span>
                </div>

              </div>
            </div>

          </div>

          {/* Drawer Actions Footer */}
          <div className="border-t pt-4 flex items-center justify-between bg-card z-10 shrink-0 select-none">
            <div />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground text-xs font-bold transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAsDraft}
                disabled={isSubmitting}
                className="px-4 py-2 border rounded-lg bg-card hover:bg-muted text-foreground/90 text-xs font-extrabold transition-all active:scale-95 shadow-sm disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-extrabold hover:bg-primary/95 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    Saving...
                  </>
                ) : (
                  "Save and Send"
                )}
              </button>
            </div>
          </div>

        </form>
      </Drawer>

    </div>
  );
};
