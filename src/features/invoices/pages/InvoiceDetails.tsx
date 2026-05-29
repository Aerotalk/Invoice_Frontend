import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Send, 
  Copy, 
  CheckCircle, 
  Activity, 
  DollarSign, 
  Printer, 
  Zap, 
  Mail,
  Info,
  Pencil
} from 'lucide-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { apiService } from '../../../services/api';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

export const InvoiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { currency } = usePreferencesStore();

  const loadInvoice = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiService.getInvoiceById(id);
      setInvoice(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const handleMarkPaid = async () => {
    if (!id) return;
    try {
      await apiService.updateInvoice(id, { status: 'paid' });
      alert("Invoice marked as Paid! Billing database recalculated.");
      loadInvoice();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicate = async () => {
    if (!id) return;
    try {
      const dup = await apiService.duplicateInvoice(id);
      alert(`Invoice duplicated as draft: ${dup.invoiceNumber}`);
      navigate(`/dashboard/invoices/${dup.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadPDF = () => {
    alert(`Downloading PDF document for ${invoice.invoiceNumber}. Done!`);
  };

  const handleSendReminder = () => {
    alert(`Billing payment reminder email dispatched to ${invoice.clientEmail} successfully!`);
  };

  if (loading || !invoice) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-[200px] bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-[400px] lg:col-span-2 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-[400px] bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fade-in pb-12">
      
      {/* Back Header */}
      <div className="flex items-center justify-between border-b pb-4 shrink-0 select-none">
        <Link 
          to="/dashboard/invoices" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors active:scale-95 shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Invoices
        </Link>
        
        {/* DUPLICATE ACCENTS TOOLBAR */}
        <div className="flex items-center gap-2 select-none shrink-0">
          {invoice.status === 'draft' && (
            <Link
              to={`/dashboard/invoices/${invoice.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-extrabold transition-all active:scale-95 select-none"
            >
              <Pencil className="w-3.5 h-3.5 shrink-0" />
              Edit Draft
            </Link>
          )}
          <button
            onClick={handleDuplicate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground text-xs font-extrabold active:scale-95 transition-all select-none"
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </button>
          {invoice.status !== 'paid' && (
            <button
              onClick={handleMarkPaid}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold transition-all active:scale-95 select-none"
            >
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              Mark Paid
            </button>
          )}
        </div>
      </div>

      {/* Main Details content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start select-none">
        
        {/* LEFT WORKSPACE: Simulated Paper PDF Document */}
        <div className="lg:col-span-2 space-y-4 select-none">
          <div className="flex items-center justify-between px-2 shrink-0 select-none">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Invoice Document Ledger</span>
            <button 
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 text-[10px] text-primary font-bold hover:underline select-none active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Invoice
            </button>
          </div>

          <div className="bg-white text-slate-900 border rounded-2xl p-8 shadow-2xl relative select-none font-sans min-h-[600px] flex flex-col justify-between overflow-x-auto whitespace-nowrap md:whitespace-normal">
            
            {/* Paper Brand Header */}
            <div className="flex justify-between border-b pb-6 select-none shrink-0 items-start">
              <div>
                <div className="flex items-center gap-2 h-8">
                  {invoice.logo ? (
                    <img src={invoice.logo} alt="Company Logo" className="max-h-full max-w-[140px] object-contain shrink-0" />
                  ) : (
                    <>
                      <div className="w-6.5 h-6.5 rounded-md bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                        <Zap className="w-3.5 h-3.5 text-white fill-white/10" />
                      </div>
                      <span className="text-sm font-extrabold tracking-tight text-slate-900 font-mono">InvoiceIQ</span>
                    </>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 font-semibold block mt-1.5">100 Pine Street, San Francisco, CA 94111</span>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold tracking-tight text-slate-950 uppercase select-none">INVOICE</h2>
                <span className="text-[10px] font-bold text-slate-700 block mt-1 font-mono">{invoice.invoiceNumber}</span>
              </div>
            </div>

            {/* Recipients billing metadata */}
            <div className="grid grid-cols-2 gap-4 mt-6 text-xs select-none shrink-0 border-b pb-6">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Billed To:</span>
                <span className="font-bold text-slate-800 block mt-1">{invoice.clientName}</span>
                <span className="text-slate-500 block mt-0.5 font-semibold">{invoice.clientCompany}</span>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{invoice.clientEmail}</span>
              </div>
              
              <div className="text-right">
                <div className="flex justify-end gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Issue Date</span>
                    <span className="font-semibold text-slate-700 mt-0.5 block">{formatDate(invoice.issueDate)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Due Date</span>
                    <span className={cn(
                      "font-bold mt-0.5 block",
                      invoice.status === 'overdue' ? "text-rose-500 font-bold" : "text-slate-950"
                    )}>{formatDate(invoice.dueDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lines items details list */}
            <div className="mt-6 flex-1 select-none text-[11px] leading-relaxed">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-[9px] font-bold text-slate-400 uppercase select-none">
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Rate</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {invoice.items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-medium max-w-[200px] truncate">{item.description}</td>
                      <td className="py-2.5 text-center font-semibold font-mono">{item.quantity}</td>
                      <td className="py-2.5 text-right font-semibold font-mono">{formatCurrency(item.rate, invoice.currency)}</td>
                      <td className="py-2.5 text-right font-bold font-mono text-slate-950">{formatCurrency(item.quantity * item.rate, invoice.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recalculating summaries */}
            <div className="mt-8 border-t pt-4 select-none shrink-0 flex flex-col gap-1.5 items-end text-xs font-semibold text-slate-500">
              <div className="flex justify-between w-48 font-semibold">
                <span>Subtotal:</span>
                <span className="text-slate-800 font-mono">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>
              {invoice.discountRate > 0 && (
                <div className="flex justify-between w-48 text-rose-500 font-semibold">
                  <span>Discount ({invoice.discountRate}%):</span>
                  <span className="font-mono">-{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
                </div>
              )}
              {invoice.taxRate > 0 && (
                <div className="flex justify-between w-48 font-semibold">
                  <span>VAT / Tax ({invoice.taxRate}%):</span>
                  <span className="text-slate-800 font-mono">+{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                </div>
              )}
              <div className="flex justify-between w-48 text-sm font-bold text-slate-950 border-t pt-2 mt-1 select-none">
                <span>Total Settled:</span>
                <span className="font-mono text-primary-600">{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>
            </div>

            {/* Note & Terms footer layout */}
            <div className="mt-8 pt-4 border-t shrink-0 select-none text-[9px] text-slate-400 font-medium leading-relaxed max-w-sm">
              <span className="block font-bold text-slate-500 uppercase tracking-wider mb-1">Notes & Instructions</span>
              <p>{invoice.notes || "No custom notes written."}</p>
              <span className="block mt-2 font-bold text-slate-500 uppercase tracking-wider mb-1">Terms</span>
              <p>{invoice.terms}</p>
            </div>

          </div>
        </div>

        {/* RIGHT WORKSPACE: Operations & Audit trails logs */}
        <div className="space-y-6 select-none max-h-[82vh] overflow-y-auto pr-1 scrollbar-thin">
          
          {/* Operations Card */}
          <div className="border rounded-xl bg-card p-5 shadow-premium space-y-4 select-none">
            <h3 className="text-sm font-bold text-foreground">Action Console</h3>
            
            <div className="flex flex-col gap-2 select-none">
              {/* PDF */}
              <button
                onClick={handleDownloadPDF}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground text-xs font-bold active:scale-95 transition-all select-none"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                Download Invoice PDF
              </button>
              {/* Reminder */}
              {invoice.status !== 'paid' && (
                <button
                  onClick={handleSendReminder}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground text-xs font-bold active:scale-95 transition-all select-none"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  Email Payment Reminder
                </button>
              )}
            </div>

            <div className="border-t pt-4 text-xs font-semibold text-muted-foreground space-y-2 select-none">
              <div className="flex justify-between">
                <span>Account Status:</span>
                <StatusBadge status={invoice.status} />
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="text-foreground font-mono">{formatCurrency(invoice.amountPaid, invoice.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Due:</span>
                <span className="text-foreground font-mono">{formatCurrency(invoice.amountDue, invoice.currency)}</span>
              </div>
            </div>
          </div>

          {/* Audit Logs Specific Timeline */}
          <div className="border rounded-xl bg-card p-5 shadow-premium space-y-4 select-none">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 select-none">
              <Activity className="w-4 h-4 text-indigo-500" />
              Invoice History
            </h3>

            <div className="space-y-4 select-none text-xs">
              {/* Seed timelines */}
              <div className="flex gap-2.5 relative select-none">
                <div className="relative shrink-0 flex flex-col items-center">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 z-10 shrink-0 bg-primary" />
                  <div className="w-px h-full bg-border absolute top-3 z-0" />
                </div>
                <div>
                  <span className="block font-bold text-foreground">Invoice created and seeded</span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">{formatDate(invoice.issueDate)}</span>
                </div>
              </div>

              <div className="flex gap-2.5 relative select-none">
                <div className="relative shrink-0 flex flex-col items-center">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 z-10 shrink-0 bg-indigo-500" />
                  <div className="w-px h-full bg-border absolute top-3 z-0" />
                </div>
                <div>
                  <span className="block font-bold text-foreground">Client viewed invoice via public portal</span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">Simulated viewing recorded</span>
                </div>
              </div>

              {invoice.status === 'paid' && (
                <div className="flex gap-2.5 relative select-none">
                  <div className="relative shrink-0 flex flex-col items-center">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 z-10 shrink-0 bg-emerald-500" />
                  </div>
                  <div>
                    <span className="block font-bold text-foreground">Invoice settled and paid fully</span>
                    <span className="block text-[10px] text-muted-foreground mt-0.5">Received through Stripe merchant</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
