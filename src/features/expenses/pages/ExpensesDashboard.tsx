import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
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
  DollarSign,
  PieChart as PieIcon
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const expenseSchema = zod.object({
  description: zod.string().min(2, { message: "Description must be at least 2 characters" }),
  amount: zod.number().min(1, { message: "Amount must be greater than 0" }),
  category: zod.enum(['Software', 'Marketing', 'Rent', 'Office Supplies', 'Travel', 'Consulting', 'Other']),
  date: zod.string(),
  isTaxDeductible: zod.boolean(),
});

type ExpenseFormValues = zod.infer<typeof expenseSchema>;

export const ExpensesDashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedReceipt, setUploadedReceipt] = useState<string | null>(null);
  const { currency } = usePreferencesStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: 'Software',
      date: new Date().toISOString().split('T')[0],
      isTaxDeductible: true
    }
  });

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const res = await apiService.getExpenses();
      setExpenses(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense record?")) return;
    try {
      await apiService.deleteExpense(id);
      alert("Expense deleted successfully!");
      loadExpenses();
    } catch (e) {
      console.error(e);
    }
  };

  const onSubmitExpense = async (values: ExpenseFormValues) => {
    try {
      await apiService.createExpense({
        ...values,
        receiptUrl: uploadedReceipt
      });
      alert("Expense logged successfully!");
      setDrawerOpen(false);
      setUploadedReceipt(null);
      setUploadProgress(0);
      reset();
      loadExpenses();
    } catch (e) {
      console.error(e);
    }
  };

  // Mock Receipt upload simulation
  const handleReceiptUploadClick = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadedReceipt("https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300"); // seed mockup thumbnail
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  // Aggregated Expenses Chart Data
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

  const columns: ColumnDef<any>[] = [
    {
      header: "Expense Details",
      accessorKey: "description",
      cell: (row) => (
        <div className="flex items-center gap-2.5 select-none">
          <div className="p-2 rounded bg-indigo-500/10 text-indigo-500 shrink-0">
            <Receipt className="w-3.5 h-3.5 shrink-0" />
          </div>
          <div>
            <span className="block text-xs font-bold text-foreground">{row.description}</span>
            <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{row.category}</span>
          </div>
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
          {row.isTaxDeductible ? "Yes - Write off" : "No"}
        </span>
      )
    },
    {
      header: "Billing Total",
      accessorKey: "amount",
      sortable: true,
      cell: (row) => (
        <span className="font-bold font-mono text-foreground">
          {formatCurrency(row.amount, currency)}
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
          className="text-[10px] font-bold text-primary hover:underline"
        >
          View Attachment
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
          className="p-1 rounded hover:bg-rose-500/10 text-rose-500 active:scale-90 transition-all select-none"
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
        description="Audit company operating outflows, check tax-deductible writes offs, and upload PDF receipts."
        actions={
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/95 transition-all select-none active:scale-95 shadow-md shadow-indigo-500/5"
          >
            <Plus className="w-4 h-4" />
            Log Expense
          </button>
        }
      />

      {/* Recharts Bar summary chart + KPI card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
        
        {/* Analytics Card */}
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

        {/* Categories Distribution Bar Chart */}
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

      {/* Expenses Ledger Data Table */}
      <DataTable
        columns={columns}
        data={expenses}
        searchKey="description"
        searchPlaceholder="Filter expenses description..."
        emptyTitle="No expenses logged"
        emptyDescription="Start logging company purchases by clicking Log Expense above."
        loading={loading}
      />

      {/* LOG EXPENSE SLIDE-OUT DRAWER */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Log Expense Entry"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmitExpense)} className="flex flex-col gap-4 text-xs font-semibold select-none pb-6">
          
          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground font-bold tracking-wide uppercase">Expense Description</label>
            <input
              type="text"
              placeholder="Vercel Team Enterprise Retainer Subscription"
              {...register("description")}
              className={cn(
                "px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70",
                errors.description ? "border-rose-500/70" : ""
              )}
            />
            {errors.description && <span className="text-[9px] text-rose-500 font-bold">{errors.description.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1 select-none">
              <label className="text-muted-foreground font-bold tracking-wide uppercase">Outflow Amount ({currency})</label>
              <input
                type="number"
                placeholder="299"
                {...register("amount", { valueAsNumber: true })}
                className={cn(
                  "px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70",
                  errors.amount ? "border-rose-500/70" : ""
                )}
              />
              {errors.amount && <span className="text-[9px] text-rose-500 font-bold">{errors.amount.message}</span>}
            </div>

            {/* Category selection */}
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1 select-none">
              <label className="text-muted-foreground font-bold tracking-wide uppercase">Outflow Category</label>
              <select
                {...register("category")}
                className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70"
              >
                <option value="Software">Software & SaaS</option>
                <option value="Marketing">Marketing / ADS</option>
                <option value="Rent">Workspace Studio Rent</option>
                <option value="Office Supplies">Office Stationery</option>
                <option value="Travel">Flights & Lodgings</option>
                <option value="Consulting">Consulting Advisory</option>
                <option value="Other">Miscellaneous Outflow</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1 select-none">
              <label className="text-muted-foreground font-bold tracking-wide uppercase">Purchasing Date</label>
              <input
                type="date"
                {...register("date")}
                className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70"
              />
            </div>

            {/* Tax Deductible checkbox */}
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1 select-none justify-center">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-foreground select-none mt-4">
                <input
                  type="checkbox"
                  {...register("isTaxDeductible")}
                  className="w-3.5 h-3.5 rounded border accent-indigo-500"
                />
                Tax Deductible Write-Off
              </label>
            </div>
          </div>

          {/* MOCK RECEIPT UPLOADER COMPONENT (Extra Premium Feature) */}
          <div className="flex flex-col gap-1.5 select-none">
            <label className="text-muted-foreground font-bold tracking-wide uppercase">Attach Receipt PDF/Image</label>
            
            <div 
              onClick={handleReceiptUploadClick}
              className={cn(
                "p-6 border border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative select-none",
                uploadedReceipt 
                  ? "bg-emerald-500/5 border-emerald-500/20" 
                  : "bg-slate-50/50 hover:bg-muted dark:bg-[#0b101c]/40 hover:border-indigo-500/30"
              )}
            >
              {isUploading ? (
                // Uploading progress
                <div className="w-full max-w-[200px] space-y-2 select-none">
                  <span className="block text-[10px] font-bold text-indigo-500">Processing receipt attachments...</span>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : uploadedReceipt ? (
                // Success attachment preview
                <div className="flex flex-col items-center gap-2 animate-fade-in select-none">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 rounded-full shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-500">Receipt Attachment Captured!</span>
                  <span className="text-[9px] text-muted-foreground font-mono select-none">receipt_invoice_seed.jpg</span>
                </div>
              ) : (
                // Default drag slot
                <div className="flex flex-col items-center select-none shrink-0 text-muted-foreground">
                  <UploadCloud className="w-6 h-6 mb-2 text-slate-400 group-hover:text-indigo-500" />
                  <span className="text-[11px] font-bold text-foreground">Click to upload mock attachments</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Supports PDF, JPG, PNG formats up to 4MB</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
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
              className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/95 transition-all select-none active:scale-95"
            >
              Log Expense
            </button>
          </div>

        </form>
      </Drawer>

    </div>
  );
};
