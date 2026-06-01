import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { Drawer } from '../../../components/common/Drawer';
import { apiService } from '../../../services/api';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { 
  Plus, 
  Receipt, 
  UploadCloud, 
  Check, 
  Trash2, 
  TrendingDown, 
  Info,
  Building,
  Briefcase,
  FileCheck2,
  ListPlus,
  Eye
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import toast from 'react-hot-toast';

const expenseSchema = zod.object({
  description: zod.string().optional(),
  amount: zod.number().min(1, { message: "Amount must be greater than 0" }),
  category: zod.enum(['Software', 'Marketing', 'Rent', 'Office Supplies', 'Travel', 'Consulting', 'Purchase Order', 'Other']),
  date: zod.string(),
  expenseType: zod.enum(['goods', 'services']),
  sac: zod.string().optional(),
  gstTreatment: zod.string(),
  gstNumber: zod.string().optional(),
  sourceOfSupply: zod.string(),
  destinationOfSupply: zod.string(),
  reverseCharge: zod.boolean().optional(),
  taxId: zod.string().optional(),
  amountIs: zod.enum(['inclusive', 'exclusive']),
  isTaxDeductible: zod.boolean().optional(),
  invoiceNumber: zod.string(),
  notes: zod.string().optional(),
  clientId: zod.string().optional(),
  vendorId: zod.string().optional()
});

type ExpenseFormValues = zod.infer<typeof expenseSchema>;

interface BulkExpenseRow {
  date: string;
  category: 'Software' | 'Marketing' | 'Rent' | 'Office Supplies' | 'Travel' | 'Consulting' | 'Purchase Order' | 'Other';
  amount: number;
  clientId: string;
  projectId: string;
  isBillable: boolean;
  currency: string;
}

export const ExpensesDashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'single' | 'bulk'>('single');

  // Receipt uploader states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedReceipt, setUploadedReceipt] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bulk addition rows
  const [bulkRows, setBulkRows] = useState<BulkExpenseRow[]>([
    { date: new Date().toISOString().split('T')[0], category: 'Software', amount: 0, clientId: '', projectId: '', isBillable: false, currency: 'INR' },
    { date: new Date().toISOString().split('T')[0], category: 'Software', amount: 0, clientId: '', projectId: '', isBillable: false, currency: 'INR' },
    { date: new Date().toISOString().split('T')[0], category: 'Software', amount: 0, clientId: '', projectId: '', isBillable: false, currency: 'INR' }
  ]);

  const { currency } = usePreferencesStore();
  const [bulkSaving, setBulkSaving] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: 'Software',
      date: new Date().toISOString().split('T')[0],
      expenseType: 'services',
      sac: '',
      gstTreatment: '',
      gstNumber: '',
      sourceOfSupply: '',
      destinationOfSupply: '',
      reverseCharge: false,
      taxId: '',
      amountIs: 'exclusive',
      isTaxDeductible: true,
      invoiceNumber: '',
      notes: '',
      clientId: '',
      vendorId: ''
    }
  });

  const selectedClientId = watch("clientId");
  const categoryVal = watch("category");
  const expenseTypeVal = watch("expenseType");
  const amountIsVal = watch("amountIs");
  const gstTreatment = watch("gstTreatment");
  const isNotRegisteredBusiness = gstTreatment === 'Overseas' || gstTreatment === 'Consumer' || gstTreatment === 'Unregistered Business' || gstTreatment === '';

  // Load database metadata and assets
  const loadData = async () => {
    setLoading(true);
    try {
      const expenseRes = await apiService.getExpenses();
      const clientRes = await apiService.getClients();
      const projectsRes = await apiService.getProjects();
      const vendorsRes = await apiService.getVendors();

      setExpenses(expenseRes);
      setClients(clientRes);
      setAllProjects(projectsRes);
      setVendors(vendorsRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense record?")) return;
    try {
      await apiService.deleteExpense(id);
      toast.success("Expense deleted successfully!");
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Single Record submit
  const onSubmitExpense = async (values: ExpenseFormValues) => {
    const activeClient = clients.find(c => c.id === values.clientId);
    const activeVendor = vendors.find(v => v.id === values.vendorId);
    try {
      await apiService.createExpense({
        category: values.category,
        amount: values.amount,
        description: values.description || '',
        date: values.date,
        receiptUrl: uploadedReceipt,
        isTaxDeductible: values.isTaxDeductible || false,
        invoiceNumber: values.invoiceNumber || undefined,
        notes: values.notes || undefined,
        clientId: values.clientId || undefined,
        clientName: activeClient?.name || undefined,
        vendorId: categoryVal === 'Purchase Order' ? values.vendorId : undefined,
        vendorName: categoryVal === 'Purchase Order' ? activeVendor?.name : undefined,
        currency: currency
      });
      toast.success("Expense logged successfully!");
      setDrawerOpen(false);
      setUploadedReceipt(null);
      setUploadProgress(0);
      reset();
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Bulk addition actions
  const handleAddBulkRow = () => {
    setBulkRows([
      ...bulkRows,
      { date: new Date().toISOString().split('T')[0], category: 'Software', amount: 0, clientId: '', projectId: '', isBillable: false, currency: 'INR' }
    ]);
  };

  const handleRemoveBulkRow = (index: number) => {
    if (bulkRows.length <= 1) {
      setBulkRows([{ date: new Date().toISOString().split('T')[0], category: 'Software', amount: 0, clientId: '', projectId: '', isBillable: false, currency: 'INR' }]);
      return;
    }
    setBulkRows(bulkRows.filter((_, idx) => idx !== index));
  };

  const handleBulkRowChange = (index: number, field: keyof BulkExpenseRow, val: any) => {
    const nextRows = [...bulkRows];
    nextRows[index] = {
      ...nextRows[index],
      [field]: field === 'amount' ? Math.max(0, Number(val)) : val
    };
    if (field === 'clientId') {
      nextRows[index].projectId = ''; // Reset associated project if customer shifts
    }
    setBulkRows(nextRows);
  };

  // Submit bulk list
  const handleSaveBulkExpenses = async () => {
    const activeRows = bulkRows.filter(r => r.amount > 0);
    if (activeRows.length === 0) {
      toast.error("Please configure at least one bulk expense row with an amount greater than 0.");
      return;
    }

    setBulkSaving(true);
    try {
      const payload = activeRows.map(r => {
        const client = clients.find(c => c.id === r.clientId);
        const proj = allProjects.find(p => p.id === r.projectId);
        return {
          date: r.date,
          category: r.category,
          amount: r.amount,
          description: `Bulk: ${r.category}${client ? ` for ${client.name}` : ''}`,
          receiptUrl: null,
          isTaxDeductible: true,
          clientId: r.clientId || undefined,
          clientName: client?.name || undefined,
          projectId: r.projectId || undefined,
          projectName: proj?.name || undefined,
          isBillable: r.isBillable,
          currency: r.currency
        };
      });

      await apiService.createExpensesBulk(payload);
      toast.success(`${payload.length} expenses batch-saved successfully!`);
      setDrawerOpen(false);
      setBulkRows([
        { date: new Date().toISOString().split('T')[0], category: 'Software', amount: 0, clientId: '', projectId: '', isBillable: false, currency: 'INR' },
        { date: new Date().toISOString().split('T')[0], category: 'Software', amount: 0, clientId: '', projectId: '', isBillable: false, currency: 'INR' },
        { date: new Date().toISOString().split('T')[0], category: 'Software', amount: 0, clientId: '', projectId: '', isBillable: false, currency: 'INR' }
      ]);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to batch-save bulk expenses.");
    } finally {
      setBulkSaving(false);
    }
  };

  // Real Receipt capture
  const handleReceiptUploadClick = () => {
    const input = document.getElementById('receipt-upload-input');
    if (input) {
      input.click();
    }
  };

  const processFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }
    setIsUploading(true);
    setUploadProgress(30);
    try {
      const response = await apiService.uploadFile(file);
      setUploadedReceipt(response.url || `/uploads/${response.filename}`);
      setUploadProgress(100);
      toast.success("Receipt uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload receipt");
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Recharts outflows distribution math
  const chartData = React.useMemo(() => {
    const categories: Record<string, number> = {
      Software: 0, Marketing: 0, Rent: 0, 'Office Supplies': 0, Travel: 0, Consulting: 0, Other: 0
    };
    
    expenses.forEach(e => {
      if (categories[e.category] !== undefined) {
        categories[e.category] += e.amount;
      }
    });

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#64748b'];

    return Object.keys(categories).map((key, idx) => ({
      name: key,
      value: categories[key],
      color: colors[idx]
    })).filter(item => item.value > 0);
  }, [expenses]);

  const stats = React.useMemo(() => {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const deductible = expenses.filter(e => e.isTaxDeductible).reduce((s, e) => s + e.amount, 0);
    return { total, deductible };
  }, [expenses]);

  // Expanded Datatable Columns
  const columns: ColumnDef<any>[] = [
    {
      header: "Expense details & category",
      accessorKey: "description",
      cell: (row) => (
        <div className="flex items-center gap-2.5 select-none text-xs">
          <div className="p-2 rounded bg-indigo-500/10 text-indigo-500 shrink-0">
            <Receipt className="w-3.5 h-3.5 shrink-0" />
          </div>
          <div>
            <span className="block font-bold text-foreground">{row.description}</span>
            <div className="flex items-center gap-2.5 mt-0.5 select-none">
              <span className="text-[9px] text-indigo-500 uppercase font-bold tracking-wider">{row.category}</span>
              {row.invoiceNumber && (
                <span className="text-[9px] text-muted-foreground font-mono font-bold select-none border-l pl-2"># {row.invoiceNumber}</span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Customer & Project Mappings",
      cell: (row) => (
        <div className="text-xs select-none">
          {row.clientName ? (
            <div className="space-y-0.5">
              <span className="font-bold text-foreground flex items-center gap-1">
                <Building className="w-3 h-3 text-slate-400" />
                {row.clientName}
              </span>
              {row.projectName && (
                <span className="text-[9px] font-semibold text-muted-foreground flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-indigo-400" />
                  {row.projectName}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 text-[10px]">Independent Expense</span>
          )}
        </div>
      )
    },
    {
      header: "Settled Date",
      accessorKey: "date",
      cell: (row) => <span>{formatDate(row.date)}</span>
    },
    {
      header: "Tax Deductible",
      accessorKey: "isTaxDeductible",
      cell: (row) => (
        <span className={cn(
          "inline-flex items-center gap-1 text-[10px] font-bold select-none px-2 py-0.5 border rounded-full",
          row.isTaxDeductible 
            ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/15" 
            : "text-slate-400 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700/60"
        )}>
          {row.isTaxDeductible ? "Yes - Written off" : "No"}
        </span>
      )
    },
    {
      header: "Billable",
      cell: (row) => (
        <span className={cn(
          "inline-flex items-center gap-1 text-[10px] font-bold select-none px-2 py-0.5 border rounded-full",
          row.isBillable 
            ? "text-primary bg-primary/10 border-primary/15" 
            : "text-slate-400 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700/60"
        )}>
          {row.isBillable ? "Billable" : "Non-Billable"}
        </span>
      )
    },
    {
      header: "Outflow Cost",
      accessorKey: "amount",
      sortable: true,
      cell: (row) => (
        <span className="font-bold font-mono text-foreground text-xs">
          {formatCurrency(row.amount, row.currency || currency)}
        </span>
      )
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.receiptUrl || row.category === 'Purchase Order' ? (
            <button
              onClick={() => window.open(row.receiptUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank')}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded border hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-bold text-primary transition-colors active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              View PDF
            </button>
          ) : (
            <span className="text-[10px] text-slate-400">No Receipt</span>
          )}
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 rounded hover:bg-rose-500/10 text-rose-500 active:scale-90 transition-all select-none cursor-pointer"
            title="Delete Expense"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none animate-fade-in">
      <PageHeader
        title="Expenses"
        description="Audit operating outflows, log batch calculations, upload receipts, and check client billings."
        actions={
          <button
            onClick={() => {
              reset();
              setUploadedReceipt(null);
              setUploadProgress(0);
              setActiveFormTab('single');
              setDrawerOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/95 transition-all select-none active:scale-95 shadow-md shadow-indigo-500/5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Log Expense
          </button>
        }
      />

      {/* KPI Cards and Categorized Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
        <div className="flex flex-col gap-4 select-none">
          <div className="p-5 border rounded-xl bg-card shadow-premium relative">
            <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Expenses Outflow</span>
            <span className="block text-2xl font-extrabold text-foreground font-mono mt-2">{formatCurrency(stats.total, currency)}</span>
            <TrendingDown className="absolute top-4 right-4 w-4 h-4 text-rose-500 shrink-0" />
          </div>
          <div className="p-5 border rounded-xl bg-card shadow-premium relative">
            <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tax-Deductible Value</span>
            <span className="block text-2xl font-extrabold text-emerald-500 font-mono mt-2">{formatCurrency(stats.deductible, currency)}</span>
            <Info className="absolute top-4 right-4 w-4 h-4 text-emerald-500 shrink-0" />
          </div>
        </div>

        <div className="border rounded-xl bg-card p-5 shadow-premium lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Outflow Categories</h3>
            <p className="text-xs text-muted-foreground font-medium">Categorized cost metrics summaries</p>
          </div>
          
          <div className="h-[140px] w-full mt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      borderColor: 'var(--border)', 
                      borderRadius: '8px',
                      fontSize: '10px'
                    }} 
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={30}>
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground select-none">
                No expense metrics recorded.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <DataTable
        columns={columns}
        data={expenses}
        searchKey="description"
        searchPlaceholder="Filter expenses description..."
        emptyTitle="No expenses logged"
        emptyDescription="Start logging company purchases by clicking Log Expense above."
        loading={loading}
      />

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Log Expense Outflow"
        size="2xl"
      >
        <div className="flex flex-col h-[82vh] text-xs font-semibold select-none relative">
          
          {/* Navigation Tabs headers */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 select-none shrink-0 gap-1.5">
            <button
              onClick={() => setActiveFormTab('single')}
              className={cn(
                "px-4 py-2 text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer select-none",
                activeFormTab === 'single'
                  ? "bg-primary text-primary-foreground shadow shadow-indigo-500/10 font-black"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
              Record Expense
            </button>
            <button
              onClick={() => {
                setActiveFormTab('bulk');
                // Refresh seed rows
                setBulkRows([
                  { date: new Date().toISOString().split('T')[0], category: 'Software', amount: 0, clientId: '', projectId: '', isBillable: false, currency: 'INR' },
                  { date: new Date().toISOString().split('T')[0], category: 'Software', amount: 0, clientId: '', projectId: '', isBillable: false, currency: 'INR' },
                  { date: new Date().toISOString().split('T')[0], category: 'Software', amount: 0, clientId: '', projectId: '', isBillable: false, currency: 'INR' }
                ]);
              }}
              className={cn(
                "px-4 py-2 text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer select-none",
                activeFormTab === 'bulk'
                  ? "bg-primary text-primary-foreground shadow shadow-indigo-500/10 font-black"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <ListPlus className="w-3.5 h-3.5 shrink-0" />
              Bulk Add Expenses
            </button>
          </div>

          {/* Tab 1 Content: Single Record Expense */}
          {activeFormTab === 'single' && (
            <form onSubmit={handleSubmit(onSubmitExpense)} className="flex-1 flex flex-col justify-between select-none h-full">
              <div className="flex-1 overflow-y-auto pr-1 pb-6 space-y-5 scrollbar-thin">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  
                  {/* Left input parameters column */}
                  <div className="lg:col-span-2 space-y-5">
                    
                    {/* Date */}
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <label className="col-span-12 sm:col-span-4 text-[11px] font-medium text-rose-500">Date*</label>
                      <div className="col-span-12 sm:col-span-8">
                        <input
                          type="date"
                          {...register("date")}
                          className="w-full px-3 py-2 border rounded border-slate-300 dark:border-slate-700 bg-card outline-none text-xs focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Category Name */}
                    <div className="grid grid-cols-12 gap-4 items-start">
                      <label className="col-span-12 sm:col-span-4 text-[11px] font-medium text-rose-500 pt-2">Category Name*</label>
                      <div className="col-span-12 sm:col-span-8 flex flex-col gap-2">
                        <select
                          {...register("category")}
                          className="w-full px-3 py-2 border rounded border-slate-300 dark:border-slate-700 bg-card outline-none text-xs focus:border-primary appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select Category</option>
                          <option value="Software">Software & SaaS</option>
                          <option value="Marketing">Marketing / ADS</option>
                          <option value="Rent">Workspace Rent</option>
                          <option value="Office Supplies">Office Stationery</option>
                          <option value="Travel">Flights & Lodgings</option>
                          <option value="Consulting">Consulting Advisory</option>
                          <option value="Purchase Order">Purchase Order</option>
                          <option value="Other">Miscellaneous Outflow</option>
                        </select>
                        <button type="button" className="flex items-center gap-1 text-[11px] text-primary font-medium hover:underline self-start">
                          <ListPlus className="w-3.5 h-3.5" /> Itemize
                        </button>
                      </div>
                    </div>

                    {categoryVal === 'Purchase Order' && (
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <label className="col-span-12 sm:col-span-4 text-[11px] font-medium text-rose-500 pt-2">Vendor Name*</label>
                        <div className="col-span-12 sm:col-span-8 flex flex-col gap-2">
                          <select
                            {...register("vendorId", { required: categoryVal === 'Purchase Order' })}
                            className="w-full px-3 py-2 border rounded border-slate-300 dark:border-slate-700 bg-card outline-none text-xs focus:border-primary appearance-none cursor-pointer"
                          >
                            <option value="">Select Vendor</option>
                            {vendors.map(v => (
                              <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                          </select>
                          {errors.vendorId && <span className="text-[9px] text-rose-500 font-bold block">Vendor is required</span>}
                        </div>
                      </div>
                    )}

                    {/* Amount */}
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <label className="col-span-12 sm:col-span-4 text-[11px] font-medium text-rose-500">Amount*</label>
                      <div className="col-span-12 sm:col-span-8">
                        <div className="flex border rounded border-slate-300 dark:border-slate-700 bg-card overflow-hidden">
                          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center shrink-0 cursor-pointer">
                            INR <span className="ml-1 text-[8px]">▼</span>
                          </div>
                          <input
                            type="number"
                            step="any"
                            {...register("amount", { valueAsNumber: true })}
                            className={cn(
                              "w-full px-3 py-2 bg-card outline-none text-xs focus:bg-slate-50 dark:focus:bg-slate-900",
                              errors.amount ? "bg-rose-50 dark:bg-rose-950/20" : ""
                            )}
                          />
                        </div>
                        {errors.amount && <span className="text-[9px] text-rose-500 mt-1 block">{errors.amount.message}</span>}
                      </div>
                    </div>

                    {/* Expense Type */}
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <label className="col-span-12 sm:col-span-4 text-[11px] font-medium text-rose-500">Expense Type*</label>
                      <div className="col-span-12 sm:col-span-8 flex items-center gap-4 text-[11px] font-medium text-foreground">
                        <label className="flex items-center gap-1.5 cursor-pointer select-none group">
                          <input type="radio" value="goods" {...register("expenseType")} className="sr-only" />
                          <div className={cn(
                            "w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all group-focus-within:ring-2 group-focus-within:ring-primary/20",
                            expenseTypeVal === 'goods'
                              ? "border-primary bg-card"
                              : "border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
                          )}>
                            {expenseTypeVal === 'goods' && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                          </div>
                          <span>Goods</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer select-none group">
                          <input type="radio" value="services" {...register("expenseType")} className="sr-only" />
                          <div className={cn(
                            "w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all group-focus-within:ring-2 group-focus-within:ring-primary/20",
                            expenseTypeVal === 'services'
                              ? "border-primary bg-card"
                              : "border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
                          )}>
                            {expenseTypeVal === 'services' && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                          </div>
                          <span>Services</span>
                        </label>
                      </div>
                    </div>

                    {/* SAC */}
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <label className="col-span-12 sm:col-span-4 text-[11px] font-medium text-foreground/80">SAC</label>
                      <div className="col-span-12 sm:col-span-8">
                        <input
                          type="text"
                          {...register("sac")}
                          className="w-full px-3 py-2 border rounded border-slate-300 dark:border-slate-700 bg-card outline-none text-xs focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* GST Treatment */}
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <label className="col-span-12 sm:col-span-4 text-[11px] font-medium text-rose-500">GST Treatment*</label>
                      <div className="col-span-12 sm:col-span-8">
                        <select
                          {...register("gstTreatment")}
                          className="w-full px-3 py-2 border rounded border-slate-300 dark:border-slate-700 bg-card outline-none text-xs focus:border-primary appearance-none cursor-pointer"
                        >
                          <option value="">Select GST Treatment</option>
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
                      </div>
                    </div>

                    {/* GST Number — shown for Unregistered Business */}
                    {!isNotRegisteredBusiness && (
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <label className="col-span-12 sm:col-span-4 text-[11px] font-medium text-foreground/80">GST Number</label>
                        <div className="col-span-12 sm:col-span-8">
                          <input
                            type="text"
                            placeholder="e.g. 22AAAAA0000A1Z5"
                            {...register("gstNumber")}
                            className="w-full px-3 py-2 border rounded border-slate-300 dark:border-slate-700 bg-card outline-none text-xs focus:border-primary font-mono tracking-wider uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-sans"
                          />
                        </div>
                      </div>
                    )}

                    {/* Source of Supply */}
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <label className="col-span-12 sm:col-span-4 text-[11px] font-medium text-rose-500">Source of Supply*</label>
                      <div className="col-span-12 sm:col-span-8">
                        <select
                          {...register("sourceOfSupply")}
                          className="w-full px-3 py-2 border rounded border-slate-300 dark:border-slate-700 bg-card outline-none text-[11px] focus:border-primary appearance-none cursor-pointer text-slate-500"
                        >
                          <option value="">State/Province</option>
                          <option value="West Bengal">[WB] - West Bengal</option>
                          <option value="Maharashtra">[MH] - Maharashtra</option>
                          <option value="Delhi">[DL] - Delhi</option>
                        </select>
                      </div>
                    </div>

                    {/* Destination of Supply */}
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <label className="col-span-12 sm:col-span-4 text-[11px] font-medium text-rose-500">Destination of Supply*</label>
                      <div className="col-span-12 sm:col-span-8">
                        <select
                          {...register("destinationOfSupply")}
                          className="w-full px-3 py-2 border rounded border-slate-300 dark:border-slate-700 bg-card outline-none text-[11px] focus:border-primary appearance-none cursor-pointer text-slate-500"
                        >
                          <option value="">State/Province</option>
                          <option value="West Bengal">[WB] - West Bengal</option>
                          <option value="Maharashtra">[MH] - Maharashtra</option>
                          <option value="Delhi">[DL] - Delhi</option>
                        </select>
                      </div>
                    </div>

                    {/* Reverse Charge */}
                    <div className="grid grid-cols-12 gap-4 items-center mt-1">
                      <label className="col-span-12 sm:col-span-4 text-[11px] font-medium text-foreground/80">Reverse Charge</label>
                      <div className="col-span-12 sm:col-span-8 flex items-center gap-2">
                        <input type="checkbox" {...register("reverseCharge")} className="w-3.5 h-3.5 rounded border accent-primary" />
                        <span className="text-[11px] text-foreground font-medium">This transaction is applicable for reverse charge</span>
                      </div>
                    </div>

                    {/* Tax */}
                    <div className="grid grid-cols-12 gap-4 items-center mt-1">
                      <label className="col-span-12 sm:col-span-4 text-[11px] font-medium text-foreground/80">Tax</label>
                      <div className="col-span-12 sm:col-span-8">
                        <select
                          {...register("taxId")}
                          className="w-full px-3 py-2 border rounded border-slate-300 dark:border-slate-700 bg-card outline-none text-[11px] focus:border-primary appearance-none cursor-pointer text-slate-500"
                        >
                          <option value="">Select a Tax</option>
                          <option value="Non-Taxable">Non-Taxable</option>
                          
                          <optgroup label="Tax">
                            <option value="IGST0">IGST0 [0%]</option>
                            <option value="IGST5">IGST5 [5%]</option>
                            <option value="IGST12">IGST12 [12%]</option>
                            <option value="IGST18">IGST18 [18%]</option>
                            <option value="IGST28">IGST28 [28%]</option>
                            <option value="IGST40">IGST40 [40%]</option>
                          </optgroup>
                          
                          <optgroup label="Tax Group">
                            <option value="GST0">GST0 [0%]</option>
                            <option value="GST5">GST5 [5%]</option>
                            <option value="GST12">GST12 [12%]</option>
                            <option value="GST18">GST18 [18%]</option>
                            <option value="GST28">GST28 [28%]</option>
                            <option value="GST40">GST40 [40%]</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    {/* Amount Is */}
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <label className="col-span-12 sm:col-span-4 text-[11px] font-medium text-foreground/80">Amount Is</label>
                      <div className="col-span-12 sm:col-span-8 flex items-center gap-4 text-[11px] font-medium text-foreground">
                        <label className="flex items-center gap-1.5 cursor-pointer select-none group">
                          <input type="radio" value="inclusive" {...register("amountIs")} className="sr-only" />
                          <div className={cn(
                            "w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all group-focus-within:ring-2 group-focus-within:ring-primary/20",
                            amountIsVal === 'inclusive'
                              ? "border-primary bg-card"
                              : "border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
                          )}>
                            {amountIsVal === 'inclusive' && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                          </div>
                          <span>Tax Inclusive</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer select-none group">
                          <input type="radio" value="exclusive" {...register("amountIs")} className="sr-only" />
                          <div className={cn(
                            "w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all group-focus-within:ring-2 group-focus-within:ring-primary/20",
                            amountIsVal === 'exclusive'
                              ? "border-primary bg-card"
                              : "border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
                          )}>
                            {amountIsVal === 'exclusive' && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                          </div>
                          <span>Tax Exclusive</span>
                        </label>
                      </div>
                    </div>

                    <div className="my-6 border-b border-dashed border-slate-200 dark:border-slate-800" />

                    {/* Invoice# */}
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <label className="col-span-12 sm:col-span-4 text-[11px] font-medium text-rose-500">Invoice#*</label>
                      <div className="col-span-12 sm:col-span-8">
                        <input
                          type="text"
                          {...register("invoiceNumber")}
                          className="w-full px-3 py-2 border rounded border-slate-300 dark:border-slate-700 bg-card outline-none text-xs focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="grid grid-cols-12 gap-4 items-start">
                      <label className="col-span-12 sm:col-span-4 text-[11px] font-medium text-foreground/80 pt-2">Notes</label>
                      <div className="col-span-12 sm:col-span-8">
                        <textarea
                          rows={3}
                          maxLength={500}
                          placeholder="Max. 500 characters"
                          {...register("notes")}
                          className="w-full px-3 py-2 border rounded border-slate-300 dark:border-slate-700 bg-card outline-none text-xs focus:border-primary resize-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="my-6 border-b border-dashed border-slate-200 dark:border-slate-800" />

                    {/* Customer Name */}
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <label className="col-span-12 sm:col-span-4 text-[11px] font-medium text-foreground/80">Customer Name</label>
                      <div className="col-span-12 sm:col-span-8 flex gap-0">
                        <select
                          {...register("clientId")}
                          className="w-full px-3 py-2 border border-r-0 rounded-l border-slate-300 dark:border-slate-700 bg-card outline-none text-[11px] focus:border-primary appearance-none cursor-pointer text-slate-500"
                        >
                          <option value="">Select or add a customer</option>
                          {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                          ))}
                        </select>
                        <button type="button" className="px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-r flex items-center justify-center shrink-0 border border-blue-500 transition-colors">
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Right dropzone attachment column */}
                  <div className="lg:col-span-1 flex flex-col pt-2">
                    <input 
                      id="receipt-upload-input"
                      type="file" 
                      className="hidden" 
                      accept="image/*,.pdf" 
                      onChange={handleFileChange} 
                    />
                    <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-xl bg-card shadow-sm flex flex-col items-center justify-center text-center">
                      <div 
                        onClick={handleReceiptUploadClick}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className={cn(
                          "w-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 select-none",
                          uploadedReceipt ? "" : ""
                        )}
                      >
                        {isUploading ? (
                          <div className="w-full space-y-3 select-none py-4">
                            <span className="block text-xs font-bold text-primary">Uploading...</span>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-primary transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          </div>
                        ) : uploadedReceipt ? (
                          <div className="flex flex-col items-center gap-3 animate-fade-in select-none py-4">
                            <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full">
                              <Check className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-emerald-500">Capture Completed!</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center select-none w-full">
                            <div className="w-16 h-16 rounded-xl bg-indigo-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20 overflow-hidden relative">
                               <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-600"></div>
                               <svg className="w-8 h-8 relative z-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                                 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 7h2v6h-2zm0 8h2v2h-2z" opacity="0.3"/>
                                 <path d="M14 10H10v5h4v-5zm-2 3.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5z"/>
                               </svg>
                            </div>
                            <span className="text-[13px] font-bold text-foreground mb-1">Drag or Drop your Receipts</span>
                            <span className="text-[10px] text-slate-400 mb-6">Maximum file size allowed is 10MB</span>
                            
                            <div className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-xs font-semibold text-foreground/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700/50">
                              <UploadCloud className="w-4 h-4 shrink-0 text-slate-500" />
                              Upload your Files
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Drawer footer actions */}
              <div className="flex items-center gap-3 justify-start pt-4 border-t border-slate-200 dark:border-slate-800 shrink-0 select-none bg-card relative z-50 mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600 transition-colors select-none active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                      Saving...
                    </>
                  ) : (
                    "Save (Alt+S)"
                  )}
                </button>
                <button
                  type="button"
                  className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-foreground text-xs font-bold rounded hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors select-none active:scale-95"
                >
                  Save and New <span className="text-[10px] text-muted-foreground ml-0.5">(Alt+N)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-foreground text-xs font-bold rounded hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors select-none active:scale-95"
                >
                  Cancel
                </button>
              </div>

            </form>
          )}

          {/* Tab 2 Content: Bulk Add Expenses */}
          {activeFormTab === 'bulk' && (
            <div className="flex-1 flex flex-col justify-between select-none h-full">
              <div className="flex-1 overflow-y-auto pr-1 pb-6 space-y-4 scrollbar-thin select-none">
                
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                  
                  {/* Grid Table */}
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b text-[10px] text-muted-foreground uppercase font-bold tracking-wider select-none">
                        <th className="py-2.5 px-3 w-40">Date *</th>
                        <th className="py-2.5 px-3">Category *</th>
                        <th className="py-2.5 px-3 w-44">Amount *</th>
                        <th className="py-2.5 px-3">Customer Name</th>
                        <th className="py-2.5 px-3">Projects</th>
                        <th className="py-2.5 px-3 text-center w-20">Billable</th>
                        <th className="py-2.5 px-3 text-center w-12">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {bulkRows.map((row, index) => {
                        const rowProjects = row.clientId 
                          ? allProjects.filter(p => p.clientId === row.clientId) 
                          : [];
                        
                        return (
                          <tr key={index} className="hover:bg-slate-50/20 transition-colors animate-fade-in select-none">
                            
                            {/* Date Picker */}
                            <td className="py-2 px-2.5">
                              <input
                                type="date"
                                value={row.date}
                                onChange={(e) => handleBulkRowChange(index, 'date', e.target.value)}
                                className="w-full px-2 py-1.5 border rounded bg-card outline-none focus:border-primary text-xs font-semibold"
                              />
                            </td>

                            {/* Category selector */}
                            <td className="py-2 px-2.5">
                              <select
                                value={row.category}
                                onChange={(e) => handleBulkRowChange(index, 'category', e.target.value)}
                                className="w-full px-2 py-1.5 border rounded bg-card outline-none focus:border-primary text-xs font-semibold cursor-pointer"
                              >
                                <option value="Software">Software & SaaS</option>
                                <option value="Marketing">Marketing / ADS</option>
                                <option value="Rent">Studio Rent</option>
                                <option value="Office Supplies">Office Stationery</option>
                                <option value="Travel">Flights / Lodgings</option>
                                <option value="Consulting">Consulting Advisory</option>
                                <option value="Other">Miscellaneous Outflow</option>
                              </select>
                            </td>

                            {/* Amount and local currency */}
                            <td className="py-2 px-2.5">
                              <div className="flex rounded border bg-card overflow-hidden">
                                <select
                                  value={row.currency}
                                  onChange={(e) => handleBulkRowChange(index, 'currency', e.target.value)}
                                  className="px-1 py-1 bg-slate-50 dark:bg-slate-900 border-r text-[10px] outline-none font-bold cursor-pointer shrink-0"
                                >
                                  <option value="INR">INR (₹)</option>
                                  <option value="USD">USD ($)</option>
                                  <option value="EUR">EUR (€)</option>
                                  <option value="GBP">GBP (£)</option>
                                </select>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={row.amount || ""}
                                  onChange={(e) => handleBulkRowChange(index, 'amount', e.target.value)}
                                  className="w-full px-2 py-1 bg-card outline-none text-right font-semibold font-mono"
                                />
                              </div>
                            </td>

                            {/* Customer Client Selector */}
                            <td className="py-2 px-2.5">
                              <select
                                value={row.clientId}
                                onChange={(e) => handleBulkRowChange(index, 'clientId', e.target.value)}
                                className="w-full px-2 py-1.5 border rounded bg-card outline-none focus:border-primary text-xs font-semibold cursor-pointer"
                              >
                                <option value="">Independent</option>
                                {clients.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            </td>

                            {/* Projects dynamically filtered by Client */}
                            <td className="py-2 px-2.5">
                              <select
                                disabled={!row.clientId}
                                value={row.projectId}
                                onChange={(e) => handleBulkRowChange(index, 'projectId', e.target.value)}
                                className="w-full px-2 py-1.5 border rounded bg-card outline-none focus:border-primary text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <option value="">Select project</option>
                                {rowProjects.map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            </td>

                            {/* Billable checkbox */}
                            <td className="py-2 px-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={row.isBillable}
                                onChange={(e) => handleBulkRowChange(index, 'isBillable', e.target.checked)}
                                className="w-3.5 h-3.5 rounded border accent-indigo-500 cursor-pointer"
                              />
                            </td>

                            {/* Row deletion actions */}
                            <td className="py-2 px-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveBulkRow(index)}
                                className="p-1 rounded hover:bg-rose-500/10 text-rose-500 transition-colors select-none active:scale-90"
                              >
                                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                              </button>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                </div>

                {/* Add row */}
                <button
                  type="button"
                  onClick={handleAddBulkRow}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-dashed rounded-lg bg-card text-[11px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-primary active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add More Expenses
                </button>

              </div>

              {/* Bulk Drawer footers */}
              <div className="flex items-center gap-3 justify-end pt-4 border-t shrink-0 select-none bg-card relative z-50 mt-4">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-muted text-foreground transition-all select-none active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={bulkSaving}
                  onClick={handleSaveBulkExpenses}
                  className="px-4 py-2 bg-primary text-primary-foreground font-extrabold rounded-lg hover:bg-primary/95 transition-all select-none active:scale-95 shadow-md shadow-indigo-500/10 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {bulkSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin shrink-0 animate-pulse" />
                      Saving...
                    </>
                  ) : (
                    "Save Bulk Expenses"
                  )}
                </button>
              </div>

            </div>
          )}

        </div>
      </Drawer>

    </div>
  );
};
