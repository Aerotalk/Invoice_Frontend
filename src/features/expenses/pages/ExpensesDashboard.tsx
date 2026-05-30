import React, { useState, useEffect } from 'react';
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
  ListPlus
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const expenseSchema = zod.object({
  description: zod.string().min(2, { message: "Description must be at least 2 characters" }),
  amount: zod.number().min(1, { message: "Amount must be greater than 0" }),
  category: zod.enum(['Software', 'Marketing', 'Rent', 'Office Supplies', 'Travel', 'Consulting', 'Other']),
  date: zod.string(),
  isTaxDeductible: zod.boolean(),
  invoiceNumber: zod.string(),
  notes: zod.string(),
  clientId: zod.string()
});

type ExpenseFormValues = zod.infer<typeof expenseSchema>;

interface BulkExpenseRow {
  date: string;
  category: 'Software' | 'Marketing' | 'Rent' | 'Office Supplies' | 'Travel' | 'Consulting' | 'Other';
  amount: number;
  clientId: string;
  projectId: string;
  isBillable: boolean;
  currency: string;
}

export const ExpensesDashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'single' | 'bulk'>('single');

  // Receipt uploader states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedReceipt, setUploadedReceipt] = useState<string | null>(null);

  // Bulk addition rows
  const [bulkRows, setBulkRows] = useState<BulkExpenseRow[]>([
    { date: new Date().toISOString().split('T')[0], category: 'Software', amount: 0, clientId: '', projectId: '', isBillable: false, currency: 'INR' },
    { date: new Date().toISOString().split('T')[0], category: 'Software', amount: 0, clientId: '', projectId: '', isBillable: false, currency: 'INR' },
    { date: new Date().toISOString().split('T')[0], category: 'Software', amount: 0, clientId: '', projectId: '', isBillable: false, currency: 'INR' }
  ]);

  const { currency } = usePreferencesStore();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: 'Software',
      date: new Date().toISOString().split('T')[0],
      isTaxDeductible: true,
      invoiceNumber: '',
      notes: '',
      clientId: ''
    }
  });

  const selectedClientId = watch("clientId");

  // Load database metadata and assets
  const loadData = async () => {
    setLoading(true);
    try {
      const expenseRes = await apiService.getExpenses();
      const clientRes = await apiService.getClients();
      const projectsRes = await apiService.getProjects();

      setExpenses(expenseRes);
      setClients(clientRes);
      setAllProjects(projectsRes);
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
      alert("Expense deleted successfully!");
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Single Record submit
  const onSubmitExpense = async (values: ExpenseFormValues) => {
    const activeClient = clients.find(c => c.id === values.clientId);
    try {
      await apiService.createExpense({
        category: values.category,
        amount: values.amount,
        description: values.description,
        date: values.date,
        receiptUrl: uploadedReceipt,
        isTaxDeductible: values.isTaxDeductible,
        invoiceNumber: values.invoiceNumber || undefined,
        notes: values.notes || undefined,
        clientId: values.clientId || undefined,
        clientName: activeClient?.name || undefined,
        currency: currency
      });
      alert("Expense logged successfully!");
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
      alert("Please configure at least one bulk expense row with an amount greater than 0.");
      return;
    }

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
      alert(`${payload.length} expenses batch-saved successfully!`);
      setDrawerOpen(false);
      setBulkRows([
        { date: new Date().toISOString().split('T')[0], category: 'Software', amount: 0, clientId: '', projectId: '', isBillable: false, currency: 'INR' },
        { date: new Date().toISOString().split('T')[0], category: 'Software', amount: 0, clientId: '', projectId: '', isBillable: false, currency: 'INR' },
        { date: new Date().toISOString().split('T')[0], category: 'Software', amount: 0, clientId: '', projectId: '', isBillable: false, currency: 'INR' }
      ]);
      loadData();
    } catch (e) {
      console.error(e);
      alert("Failed to batch-save bulk expenses.");
    }
  };

  // Simulated Receipt capture
  const handleReceiptUploadClick = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadedReceipt("https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300"); // mockup image
          return 100;
        }
        return prev + 25;
      });
    }, 150);
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
      header: "Receipt Image",
      accessorKey: "receiptUrl",
      cell: (row) => row.receiptUrl ? (
        <a 
          href={row.receiptUrl} 
          target="_blank" 
          rel="noreferrer"
          className="text-[10px] font-bold text-primary hover:underline font-mono"
        >
          View Receipt
        </a>
      ) : (
        <span className="text-[10px] text-slate-400">No Attachment</span>
      )
    },
    {
      header: "Delete",
      cell: (row) => (
        <button
          onClick={() => handleDelete(row.id)}
          className="p-1 rounded hover:bg-rose-500/10 text-rose-500 active:scale-90 transition-all select-none cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 shrink-0" />
        </button>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                  
                  {/* Left input parameters column */}
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">Expense Description *</label>
                      <input
                        type="text"
                        placeholder="Vercel cloud hosting subscription"
                        {...register("description")}
                        className={cn(
                          "px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-primary",
                          errors.description ? "border-rose-500/70" : ""
                        )}
                      />
                      {errors.description && <span className="text-[9px] text-rose-500 font-bold">{errors.description.message}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Date */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">Purchasing Date *</label>
                        <input
                          type="date"
                          {...register("date")}
                          className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-primary"
                        />
                      </div>
                      
                      {/* Category */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">Category *</label>
                        <select
                          {...register("category")}
                          className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-semibold cursor-pointer focus:border-primary"
                        >
                          <option value="Software">Software & SaaS</option>
                          <option value="Marketing">Marketing / ADS</option>
                          <option value="Rent">Workspace Rent</option>
                          <option value="Office Supplies">Office Stationery</option>
                          <option value="Travel">Flights & Lodgings</option>
                          <option value="Consulting">Consulting Advisory</option>
                          <option value="Other">Miscellaneous Outflow</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Amount */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">Outflow Amount *</label>
                        <input
                          type="number"
                          placeholder="299"
                          {...register("amount", { valueAsNumber: true })}
                          className={cn(
                            "px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-primary",
                            errors.amount ? "border-rose-500/70" : ""
                          )}
                        />
                        {errors.amount && <span className="text-[9px] text-rose-500 font-bold">{errors.amount.message}</span>}
                      </div>

                      {/* Invoice# */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">Invoice#</label>
                        <input
                          type="text"
                          placeholder="E.g., INV-9988"
                          {...register("invoiceNumber")}
                          className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">Customer Name</label>
                      <select
                        {...register("clientId")}
                        className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-semibold cursor-pointer focus:border-primary"
                      >
                        <option value="">Independent (No Client)</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">Notes (Max 500 characters)</label>
                      <textarea
                        rows={3}
                        maxLength={500}
                        placeholder="Configure any specific details..."
                        {...register("notes")}
                        className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-primary resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 cursor-pointer font-bold text-foreground select-none mt-2">
                      <input
                        type="checkbox"
                        {...register("isTaxDeductible")}
                        className="w-3.5 h-3.5 rounded border accent-indigo-500 cursor-pointer"
                      />
                      <label className="cursor-pointer text-[10px] uppercase tracking-wider">Tax Deductible Write-Off</label>
                    </div>

                  </div>

                  {/* Right dropzone attachment column */}
                  <div className="flex flex-col gap-2">
                    <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">Attach Outflow Receipt Image</label>
                    
                    <div 
                      onClick={handleReceiptUploadClick}
                      className={cn(
                        "p-12 border border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative select-none bg-slate-50/50 hover:bg-muted dark:bg-[#0b101c]/40 hover:border-indigo-500/30",
                        uploadedReceipt ? "bg-emerald-500/5 border-emerald-500/25" : ""
                      )}
                    >
                      {isUploading ? (
                        <div className="w-full max-w-[180px] space-y-2 select-none">
                          <span className="block text-[10px] font-bold text-indigo-500">Uploading invoice attachment...</span>
                          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        </div>
                      ) : uploadedReceipt ? (
                        <div className="flex flex-col items-center gap-2 animate-fade-in select-none">
                          <div className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 rounded-full shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-bold text-emerald-500">Capture Completed!</span>
                          <span className="text-[9px] text-muted-foreground font-mono">receipt_invoice_seed.jpg</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center select-none shrink-0 text-muted-foreground">
                          <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                          <span className="text-[11px] font-bold text-foreground">Drag & Drop your receipts here</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">PDF, PNG, JPG accepted (max 4MB)</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>

              {/* Drawer footer actions */}
              <div className="flex items-center gap-3 justify-end pt-4 border-t shrink-0 select-none bg-card relative z-50 mt-4">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-muted text-foreground transition-all select-none active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground font-extrabold rounded-lg hover:bg-primary/95 transition-all select-none active:scale-95 shadow-md shadow-indigo-500/5 cursor-pointer"
                >
                  Record Expense
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
                  onClick={handleSaveBulkExpenses}
                  className="px-4 py-2 bg-primary text-primary-foreground font-extrabold rounded-lg hover:bg-primary/95 transition-all select-none active:scale-95 shadow-md shadow-indigo-500/10 cursor-pointer"
                >
                  Save Bulk Expenses
                </button>
              </div>

            </div>
          )}

        </div>
      </Drawer>

    </div>
  );
};
