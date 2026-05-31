import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Modal } from '../../../components/common/Modal';
import { apiService } from '../../../services/api';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { 
  DollarSign, 
  ArrowDownLeft, 
  CheckCircle2, 
  Percent, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import toast from 'react-hot-toast';

export const PaymentsDashboard: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);
  const { currency } = usePreferencesStore();

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await apiService.getPayments();
      setPayments(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleOpenRefund = (id: string) => {
    setSelectedPaymentId(id);
    setRefundModalOpen(true);
  };

  const handleConfirmRefund = async () => {
    if (!selectedPaymentId) return;
    setIsRefunding(true);
    try {
      await apiService.refundPayment(selectedPaymentId);
      toast.success("Payment refunded successfully! Balances adjusted.");
      setRefundModalOpen(false);
      loadPayments();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefunding(false);
    }
  };

  // KPI Calculations
  const stats = React.useMemo(() => {
    if (payments.length === 0) return { gross: 0, succeeded: 0, refunded: 0 };
    const gross = payments.filter(p => p.status === 'success').reduce((s, p) => s + p.amount, 0);
    const succeeded = payments.filter(p => p.status === 'success').length;
    const refunded = payments.filter(p => p.status === 'refunded').reduce((s, p) => s + p.amount, 0);
    return { gross, succeeded, refunded };
  }, [payments]);

  const columns: ColumnDef<any>[] = [
    {
      header: "Receipt ID",
      accessorKey: "id",
      cell: (row) => <span className="font-mono text-slate-400 select-none">{row.id}</span>
    },
    {
      header: "Client & Company",
      accessorKey: "clientName",
      cell: (row) => (
        <div>
          <span className="block text-xs font-bold text-foreground">{row.clientName}</span>
          <span className="block text-[9px] text-muted-foreground uppercase font-semibold">{row.clientCompany}</span>
        </div>
      )
    },
    {
      header: "Invoice Reference",
      accessorKey: "invoiceNumber",
      cell: (row) => (
        <Link to={`/dashboard/invoices/${row.invoiceId}`} className="font-bold text-primary hover:underline">
          {row.invoiceNumber}
        </Link>
      )
    },
    {
      header: "Settled Amount",
      accessorKey: "amount",
      sortable: true,
      cell: (row) => (
        <span className={cn(
          "font-bold font-mono",
          row.status === 'refunded' ? "text-slate-400 line-through" : "text-emerald-500"
        )}>
          {formatCurrency(row.amount, row.currency)}
        </span>
      )
    },
    {
      header: "Gateway Processor",
      accessorKey: "method",
      cell: (row) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-extrabold uppercase bg-slate-50 dark:bg-slate-800 text-muted-foreground select-none">
          {row.method.replace('_', ' ')}
        </span>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      header: "Refund Action",
      cell: (row) => (
        <button
          onClick={() => handleOpenRefund(row.id)}
          disabled={row.status === 'refunded'}
          className="p-1 rounded hover:bg-rose-500/10 text-rose-500 active:scale-90 transition-all disabled:opacity-40 disabled:pointer-events-none select-none"
          title="Process Transaction Refund"
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none animate-fade-in">
      <PageHeader
        title="Payments"
        description="Oversee incoming merchant settlements, process client refunds, and check gross volumes."
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b pb-6 select-none">
        <div className="p-5 border rounded-xl bg-card shadow-premium relative">
          <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gross Volume</span>
          <span className="block text-2xl font-extrabold text-foreground font-mono mt-2">{formatCurrency(stats.gross, currency)}</span>
          <DollarSign className="absolute top-4 right-4 w-4 h-4 text-emerald-500" />
        </div>
        <div className="p-5 border rounded-xl bg-card shadow-premium relative">
          <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Refund Rate Pool</span>
          <span className="block text-2xl font-extrabold text-rose-500 font-mono mt-2">-{formatCurrency(stats.refunded, currency)}</span>
          <RotateCcw className="absolute top-4 right-4 w-4 h-4 text-rose-500" />
        </div>
        <div className="p-5 border rounded-xl bg-card shadow-premium relative">
          <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Succeeded Tickets</span>
          <span className="block text-2xl font-extrabold text-foreground font-mono mt-2">{stats.succeeded} Transfers</span>
          <CheckCircle2 className="absolute top-4 right-4 w-4 h-4 text-indigo-500" />
        </div>
      </div>

      {/* Transactions Data Table */}
      <DataTable
        columns={columns}
        data={payments}
        searchKey="clientName"
        searchPlaceholder="Filter receipts by customer..."
        emptyTitle="No payments recorded"
        emptyDescription="Settlements appear here once clients pay their invoice links."
        loading={loading}
      />

      {/* CONFIRM REFUND MODAL OVERLAY */}
      <Modal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        title="Confirm Transaction Refund"
        size="sm"
      >
        <div className="space-y-4 select-none text-xs font-semibold">
          <div className="flex items-center gap-3 bg-rose-500/10 text-rose-500 p-4 rounded-xl border border-rose-500/20 shrink-0">
            <Info className="w-5.5 h-5.5 shrink-0" />
            <p className="leading-relaxed">
              **WARNING**: Refunding this transaction will immediately mark the payment record as Refunded and increment the invoice's outstanding due balance. This action cannot be undone.
            </p>
          </div>
          
          <p className="text-foreground/80 leading-relaxed font-medium">
            Are you sure you want to refund payment record **{selectedPaymentId}**? The client profile billed metrics will instantly recalculate.
          </p>

          <div className="flex items-center gap-3 justify-end pt-4 border-t select-none shrink-0">
            <button
              onClick={() => setRefundModalOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-muted text-foreground transition-all select-none active:scale-95"
            >
              Abort Refund
            </button>
            <button
              onClick={handleConfirmRefund}
              disabled={isRefunding}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all font-bold select-none active:scale-95 shadow-md shadow-rose-500/10 disabled:opacity-50"
            >
              {isRefunding ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  Refunding...
                </>
              ) : (
                "Confirm & Refund"
              )}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
