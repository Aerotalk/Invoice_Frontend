import React, { useState, useEffect } from 'react';
import { Plus, FileText, Eye, MoreHorizontal, Copy, CheckCircle2, AlertCircle, Pencil } from 'lucide-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { apiService } from '../../../services/api';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import toast from 'react-hot-toast';

export const InvoicesList: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const { currency } = usePreferencesStore();
  const navigate = useNavigate();

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await apiService.getInvoices();
      setInvoices(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleDuplicate = async (id: string) => {
    try {
      await apiService.duplicateInvoice(id);
      toast.success("Invoice duplicated successfully!");
      loadInvoices();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await apiService.updateInvoice(id, { status: 'paid' });
      toast.success("Invoice marked as Paid!");
      loadInvoices();
    } catch (e) {
      console.error(e);
    }
  };

  // Metric summaries calculation
  const metrics = React.useMemo(() => {
    if (invoices.length === 0) return { draftSum: 0, sentSum: 0, paidSum: 0, overdueSum: 0 };
    
    return {
      draftSum: invoices.filter(i => i.status === 'draft').reduce((s, i) => s + i.amountDue, 0),
      sentSum: invoices.filter(i => i.status === 'sent' || i.status === 'viewed').reduce((s, i) => s + i.amountDue, 0),
      paidSum: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amountPaid, 0),
      overdueSum: invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amountDue, 0),
    };
  }, [invoices]);

  // Define Columns
  const columns: ColumnDef<any>[] = [
    {
      header: "Invoice",
      accessorKey: "invoiceNumber",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2 select-none">
          <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-500 shrink-0">
            <FileText className="w-3.5 h-3.5 shrink-0" />
          </div>
          <div>
            <Link 
              to={`/dashboard/invoices/${row.id}`} 
              className="block text-xs font-bold text-foreground hover:text-primary hover:underline"
            >
              {row.invoiceNumber}
            </Link>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">{row.clientCompany}</span>
          </div>
        </div>
      )
    },
    {
      header: "Issued",
      accessorKey: "issueDate",
      sortable: true,
      cell: (row) => <span>{formatDate(row.issueDate)}</span>
    },
    {
      header: "Due Deadline",
      accessorKey: "dueDate",
      sortable: true,
      cell: (row) => (
        <span className={cn(
          "font-medium",
          row.status === 'overdue' ? "text-rose-500 font-bold" : "text-foreground/80"
        )}>
          {formatDate(row.dueDate)}
        </span>
      )
    },
    {
      header: "Total Billed",
      accessorKey: "total",
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-foreground">
          {formatCurrency(row.total, row.currency)}
        </span>
      )
    },
    {
      header: "Outstanding",
      accessorKey: "amountDue",
      sortable: true,
      cell: (row) => (
        <span className={cn(
          "font-bold",
          row.amountDue > 0 ? "text-amber-500" : "text-slate-400"
        )}>
          {formatCurrency(row.amountDue, row.currency)}
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
            onClick={() => setActiveMenuId(activeMenuId === row.id ? null : row.id)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground active:scale-95 transition-all select-none"
          >
            <MoreHorizontal className="w-4 h-4 shrink-0" />
          </button>
          
          {activeMenuId === row.id && (
            <>
              <div 
                onClick={() => setActiveMenuId(null)}
                className="fixed inset-0 z-40 select-none" 
              />
              <div className="absolute right-0 mt-1 w-44 bg-card border rounded-lg shadow-xl z-50 overflow-hidden divide-y text-xs font-semibold select-none">
                <Link
                  to={`/dashboard/invoices/${row.id}`}
                  onClick={() => setActiveMenuId(null)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-muted text-foreground/80 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  View Details
                </Link>
                {row.status === 'draft' && (
                  <Link
                    to={`/dashboard/invoices/${row.id}/edit`}
                    onClick={() => setActiveMenuId(null)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-muted text-indigo-500/80 hover:text-indigo-500 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    Edit Draft
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleDuplicate(row.id);
                    setActiveMenuId(null);
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-muted text-foreground/80 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  Duplicate Invoice
                </button>
                {row.status !== 'paid' && (
                  <button
                    onClick={() => {
                      handleMarkPaid(row.id);
                      setActiveMenuId(null);
                    }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-muted text-emerald-500/80 hover:text-emerald-500 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    Mark as Paid
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none animate-fade-in">
      
      {/* Page Header */}
      <PageHeader
        title="Invoices"
        description="Oversee your invoicing dashboard ledger, download custom mock print PDF layouts, or duplicate drafts."
        actions={
          <Link
            to="/dashboard/invoices/create"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/95 transition-all shadow-md shadow-indigo-500/10 active:scale-95 select-none"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </Link>
        }
      />

      {/* 2. Outstanding / Paid Summaries Metrics Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none border-b pb-6">
        <div className="p-4 rounded-xl border bg-slate-50/50 dark:bg-[#0b101c]/10">
          <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Paid Total</span>
          <span className="block text-base font-bold text-emerald-500 mt-1">{formatCurrency(metrics.paidSum, currency)}</span>
        </div>
        <div className="p-4 rounded-xl border bg-slate-50/50 dark:bg-[#0b101c]/10">
          <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Unpaid Outstanding</span>
          <span className="block text-base font-bold text-amber-500 mt-1">{formatCurrency(metrics.sentSum, currency)}</span>
        </div>
        <div className="p-4 rounded-xl border bg-slate-50/50 dark:bg-[#0b101c]/10">
          <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Overdue Pools</span>
          <span className="block text-base font-bold text-rose-500 mt-1">{formatCurrency(metrics.overdueSum, currency)}</span>
        </div>
        <div className="p-4 rounded-xl border bg-slate-50/50 dark:bg-[#0b101c]/10">
          <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Draft Value</span>
          <span className="block text-base font-bold text-slate-400 mt-1">{formatCurrency(metrics.draftSum, currency)}</span>
        </div>
      </div>

      {/* 3. DataTable */}
      <DataTable
        columns={columns}
        data={invoices}
        searchKey="invoiceNumber"
        searchPlaceholder="Filter invoices by number..."
        emptyTitle="No invoices found"
        emptyDescription="Create a draft invoice by clicking Create Invoice above."
        loading={loading}
      />

    </div>
  );
};
