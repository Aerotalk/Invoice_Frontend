import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  Download,
  Calendar,
  FileText,
  Package,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  XCircle,
  Clock,
} from 'lucide-react';
import { apiService } from '../../../services/api';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { formatCurrency, formatDate, cn } from '../../../lib/utils';
import toast from 'react-hot-toast';

export const PurchaseOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { currency } = usePreferencesStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiService.getPurchaseOrderById(id)
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
        <div className="h-24 bg-slate-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const po = data;

  return (
    <div className="space-y-6 select-none animate-fade-in pb-12">

      {/* Back button */}
      <Link
        to="/dashboard/purchase-orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors select-none active:scale-95"
      >
        <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
        Back to Purchase Orders
      </Link>

      {/* Purchase Order Profile Summary Card */}
      <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6 relative select-none">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30 shrink-0">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-foreground leading-tight">{po.purchaseOrderId}</h2>
            <div className="flex items-center gap-2.5 mt-1 text-xs text-muted-foreground font-semibold uppercase">
              <span className="bg-muted px-2 py-0.5 rounded border font-mono">{po.vendor?.vendorId?.substring(0, 8)}...</span>
              <span>|</span>
              <span>Ordered for:</span>
              <span className="text-foreground">{po.forProject?.name || 'Direct Purchase'}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 select-none text-[11px] font-semibold text-muted-foreground">
              <span>Status:</span>
              <StatusBadge
                status={po.status === 'completed' ? 'completed' : 'pending'}
                className="uppercase"
              />
              <span>Date:</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {formatDate(po.date)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={async () => {
              if (!id) return;
              try {
                const toastId = toast.loading("Downloading PDF...");
                const blob = await apiService.downloadPurchaseOrderPdf(id);
                const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
                const a = document.createElement('a');
                a.href = url;
                a.download = `${po.purchaseOrderId || 'PurchaseOrder'}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => window.URL.revokeObjectURL(url), 60000);
                toast.dismiss(toastId);
              } catch (err) {
                console.error(err);
                toast.error("Failed to download PDF");
              }
            }}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={async () => {
              if (!id) return;
              try {
                const toastId = toast.loading("Opening PDF...");
                const blob = await apiService.downloadPurchaseOrderPdf(id);
                const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
                window.open(url, '_blank');
                setTimeout(() => window.URL.revokeObjectURL(url), 60000);
                toast.dismiss(toastId);
              } catch (err) {
                console.error(err);
                toast.error("Failed to load PDF");
              }
            }}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95"
            title="View PDF"
          >
            <FileText className="w-4 h-4" />
          </button>
          {po.status !== 'completed' && (
            <button className="p-2 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all active:scale-95">
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Left Column: Details & Items */}
        <div className="md:col-span-3 space-y-6">

          {/* Purchase Order Summary */}
          <div className="border rounded-xl bg-card">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                Purchase Order Summary
              </h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs font-semibold">
              <div>
                <p className="text-muted-foreground mb-1">Order ID</p>
                <p className="text-foreground font-mono bg-muted px-2 py-1 rounded inline-block">{po.purchaseOrderId}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Purchase Date</p>
                <p className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {formatDate(po.date)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Expected Delivery</p>
                <p className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {formatDate(po.deliveryDate || '')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Vendor</p>
                <p className="text-foreground font-bold">{po.vendor?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Project</p>
                <p className="text-foreground font-bold">{po.forProject?.name || 'Direct Purchase'}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Status</p>
                <StatusBadge
                  status={po.status === 'completed' ? 'completed' : 'pending'}
                  className="uppercase text-xs"
                />
              </div>
            </div>
          </div>

          {/* Purchase Order Items */}
          <div className="border rounded-xl bg-card">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                Purchase Order Items ({po.items?.length || 0})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                    <tr className="border-b border-border/70 bg-muted/50 uppercase text-slate-500">
                        <th className="px-4 py-3 text-left font-bold">Item Description</th>
                        <th className="px-4 py-3 text-center font-bold">Quantity</th>
                        <th className="px-4 py-3 text-center font-bold">Rate</th>
                        <th className="px-4 py-3 text-right font-bold">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        po.items?.length > 0 ? (
                            po.items.map((item: any, idx: number) => (
                                <tr key={idx} className="border-b border-border/70 hover:bg-muted/20">
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-foreground">{item.name}</div>
                                        <div className="text-slate-500 text-xs mt-1">HSN/SAC: {item.hsnSac || 'N/A'}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold">{item.quantity} {item.unit || 'Nos'}</td>
                                    <td className="px-4 py-3 text-center font-bold">{formatCurrency(item.price || item.rate, currency)}</td>
                                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(item.total, currency)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-semibold">
                                    No items found
                                </td>
                            </tr>
                        )
                    }
                </tbody>
                <tfoot className="border-t border-border/70 bg-muted/50">
                    <tr>
                        <td colSpan={3} className="px-4 py-3 text-right font-bold text-foreground">Subtotal:</td>
                        <td className="px-4 py-3 text-right font-bold text-foreground">{formatCurrency(po.subtotal, currency)}</td>
                    </tr>
                    <tr>
                        <td colSpan={3} className="px-4 py-3 text-right font-bold text-foreground">Total Tax (GST):</td>
                        <td className="px-4 py-3 text-right font-bold text-foreground">{formatCurrency(po.taxAmount || po.gstAmount, currency)}</td>
                    </tr>
                    <tr>
                        <td colSpan={3} className="px-4 py-3 text-right font-bold text-foreground">Total Amount:</td>
                        <td className="px-4 py-3 text-right font-bold text-foreground">{formatCurrency(po.totalAmount, currency)}</td>
                    </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Meta Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="border rounded-xl bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b pb-2">
              <Package className="w-4 h-4 text-indigo-500" />
              Transportation
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Transport Mode</p>
                <p className="text-xs font-semibold text-foreground mt-0.5">{po.transportMode || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Delivery Location</p>
                <p className="text-xs font-semibold text-foreground mt-0.5">{po.deliveryLocation || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Place of Supply</p>
                <p className="text-xs font-semibold text-foreground mt-0.5">{po.placeOfSupply || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">EU PO/WO Number</p>
                <p className="text-xs font-semibold text-foreground mt-0.5">{po.euPoWoNumber || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <div className="border rounded-xl bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b pb-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              Terms & Conditions
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {po.termsAndConditions || po.terms || 'No terms specified for this purchase order.'}
            </p>
          </div>
        </div>

      </div>
    </div>
    );
};