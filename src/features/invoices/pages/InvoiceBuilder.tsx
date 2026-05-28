import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  Send, 
  ArrowLeft, 
  FileText, 
  Percent, 
  DollarSign, 
  Zap,
  Sparkles
} from 'lucide-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { apiService } from '../../../services/api';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

interface LineItemInput {
  description: string;
  quantity: number;
  rate: number;
}

export const InvoiceBuilder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currency: globalCurrency, defaultTaxRate } = usePreferencesStore();

  // Seeding list
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  
  const [items, setItems] = useState<LineItemInput[]>([
    { description: "Product Design Consulting", quantity: 1, rate: 2500 }
  ]);
  const [taxRate, setTaxRate] = useState(defaultTaxRate);
  const [discountRate, setDiscountRate] = useState(0);
  const [currency, setCurrency] = useState(globalCurrency);
  const [notes, setNotes] = useState("Thank you for your business! We appreciate the partnership.");
  const [terms, setTerms] = useState("Due within 30 days of invoice generation date.");
  const [loading, setLoading] = useState(false);

  // Load clients & preload state
  useEffect(() => {
    const init = async () => {
      try {
        const clientList = await apiService.getClients();
        setClients(clientList);
        
        // Auto-increment invoice number seed
        const invs = await apiService.getInvoices();
        const nextId = `INV-2026-${(invs.length + 1).toString().padStart(3, '0')}`;
        setInvoiceNumber(nextId);

        // Preload state check
        const preselectedId = location.state?.preselectedClientId;
        if (preselectedId && clientList.some((c: any) => c.id === preselectedId)) {
          setSelectedClientId(preselectedId);
        } else if (clientList.length > 0) {
          setSelectedClientId(clientList[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, [location]);

  // Update currency when global change occurs
  useEffect(() => {
    setCurrency(globalCurrency);
  }, [globalCurrency]);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  // Add Item Row
  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, rate: 0 }]);
  };

  // Delete Item Row
  const handleDeleteItem = (idx: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  // Edit Row Fields
  const handleEditItem = (idx: number, field: keyof LineItemInput, val: any) => {
    setItems(items.map((item, i) => {
      if (i === idx) {
        return {
          ...item,
          [field]: field === 'description' ? val : parseFloat(val) || 0
        };
      }
      return item;
    }));
  };

  // Shift Row position Up/Down
  const handleMoveItem = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === items.length - 1) return;

    const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
    const nextList = [...items];
    const temp = nextList[idx];
    nextList[idx] = nextList[nextIdx];
    nextList[nextIdx] = temp;
    setItems(nextList);
  };

  // Calculations Formulas
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const discountAmount = subtotal * (discountRate / 100);
  const taxableSubtotal = subtotal - discountAmount;
  const taxAmount = taxableSubtotal * (taxRate / 100);
  const finalTotal = taxableSubtotal + taxAmount;

  const handleSaveInvoice = async (status: 'draft' | 'sent') => {
    if (!selectedClientId) {
      alert("Please select a client first!");
      return;
    }
    if (items.some(i => !i.description.trim())) {
      alert("Please ensure all line item descriptions are filled!");
      return;
    }

    setLoading(true);
    try {
      await apiService.createInvoice({
        invoiceNumber,
        clientId: selectedClientId,
        clientName: selectedClient?.name || "",
        clientCompany: selectedClient?.company || "",
        clientEmail: selectedClient?.email || "",
        issueDate,
        dueDate,
        items: items.map(item => ({
          ...item,
          total: item.quantity * item.rate
        })),
        currency,
        taxRate,
        discountRate,
        notes,
        terms,
        isRecurring: false,
        status
      });
      alert(status === 'sent' ? "Invoice issued and email sent successfully!" : "Invoice saved as Draft!");
      navigate("/dashboard/invoices");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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
        
        {/* Top actions */}
        <div className="flex items-center gap-2 select-none shrink-0">
          <button
            onClick={() => handleSaveInvoice('draft')}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground text-xs font-extrabold active:scale-95 transition-all select-none disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </button>
          <button
            onClick={() => handleSaveInvoice('sent')}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-extrabold hover:bg-primary/95 transition-all shadow-md active:scale-95 select-none disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            Send Invoice
          </button>
        </div>
      </div>

      {/* Split builder workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start select-none">
        
        {/* 1. LEFT WORKSPACE: Form editor */}
        <div className="border rounded-xl bg-card p-6 shadow-premium space-y-6 select-none max-h-[82vh] overflow-y-auto scrollbar-thin">
          
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 select-none">
            <FileText className="w-4 h-4 text-indigo-500" />
            Invoice Parameters
          </h3>

          <div className="grid grid-cols-2 gap-4 border-b pb-6 select-none">
            {/* Client Picker */}
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1 select-none">
              <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Recipient Client</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-slate-50/50 dark:bg-[#0b101c]/40 outline-none text-xs font-semibold focus:border-indigo-500/70"
              >
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                ))}
              </select>
            </div>

            {/* Invoice ID */}
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1 select-none">
              <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Invoice ID Code</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-slate-50/50 dark:bg-[#0b101c]/40 outline-none text-xs font-semibold focus:border-indigo-500/70"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-b pb-6 select-none">
            {/* Issue Date */}
            <div className="flex flex-col gap-1.5 col-span-3 sm:col-span-1 select-none">
              <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-slate-50/50 dark:bg-[#0b101c]/40 outline-none text-xs font-semibold"
              />
            </div>
            
            {/* Due Date */}
            <div className="flex flex-col gap-1.5 col-span-3 sm:col-span-1 select-none">
              <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Due Deadline</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-slate-50/50 dark:bg-[#0b101c]/40 outline-none text-xs font-semibold"
              />
            </div>

            {/* Currency selector */}
            <div className="flex flex-col gap-1.5 col-span-3 sm:col-span-1 select-none">
              <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Billing Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-slate-50/50 dark:bg-[#0b101c]/40 outline-none text-xs font-semibold"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>

          {/* DYNAMIC LINE ITEMS EDITOR */}
          <div className="space-y-3.5 select-none">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Line Items</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-2.5 py-1 border rounded bg-slate-50 dark:bg-slate-800 text-[10px] font-bold hover:bg-muted text-primary select-none active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                Add Row
              </button>
            </div>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin select-none">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50/40 dark:bg-slate-800/10 p-3 rounded-lg border relative select-none">
                  
                  {/* Sorting triggers */}
                  <div className="flex flex-col gap-1.5 shrink-0 select-none">
                    <button type="button" onClick={() => handleMoveItem(idx, 'up')} className="text-slate-400 hover:text-foreground active:scale-75"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => handleMoveItem(idx, 'down')} className="text-slate-400 hover:text-foreground active:scale-75"><ArrowDown className="w-3.5 h-3.5" /></button>
                  </div>

                  {/* Inputs */}
                  <div className="flex-1 grid grid-cols-6 gap-2 select-none">
                    <input
                      type="text"
                      placeholder="Line item description..."
                      value={item.description}
                      onChange={(e) => handleEditItem(idx, 'description', e.target.value)}
                      className="col-span-3 px-2 py-1.5 border rounded bg-card outline-none text-xs font-semibold focus:border-indigo-500/70"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleEditItem(idx, 'quantity', e.target.value)}
                      className="col-span-1 px-2 py-1.5 border rounded bg-card outline-none text-xs font-semibold text-center focus:border-indigo-500/70"
                    />
                    <input
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) => handleEditItem(idx, 'rate', e.target.value)}
                      className="col-span-2 px-2 py-1.5 border rounded bg-card outline-none text-xs font-semibold text-right focus:border-indigo-500/70"
                    />
                  </div>

                  {/* Delete row */}
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(idx)}
                      className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500 transition-colors select-none active:scale-90"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Discounts & Taxes Modifiers */}
          <div className="grid grid-cols-2 gap-4 border-t pt-6 select-none">
            {/* Tax */}
            <div className="flex flex-col gap-1.5 select-none">
              <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">VAT / Tax Rate (%)</label>
              <div className="relative group">
                <input
                  type="number"
                  min={0}
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 pl-8 border rounded-lg bg-slate-50/50 dark:bg-[#0b101c]/40 outline-none text-xs font-semibold focus:border-indigo-500/70"
                />
                <Percent className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            </div>

            {/* Discount */}
            <div className="flex flex-col gap-1.5 select-none">
              <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Discount Rate (%)</label>
              <div className="relative group">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discountRate}
                  onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 pl-8 border rounded-lg bg-slate-50/50 dark:bg-[#0b101c]/40 outline-none text-xs font-semibold focus:border-indigo-500/70"
                />
                <Percent className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            </div>
          </div>

        </div>

        {/* 2. RIGHT WORKSPACE: Realistic Paper Print Preview */}
        <div className="space-y-3.5 select-none sticky top-20 max-h-[82vh] flex flex-col">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 px-2">Live Template Mockup</span>
          
          <div className="bg-white text-slate-900 border rounded-2xl p-8 shadow-2xl relative select-none font-sans min-h-[500px] flex flex-col justify-between overflow-y-auto scrollbar-none flex-1">
            
            {/* Paper Header */}
            <div className="flex justify-between border-b pb-6 select-none shrink-0 items-start">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6.5 h-6.5 rounded-md bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                    <Zap className="w-3.5 h-3.5 text-white fill-white/10" />
                  </div>
                  <span className="text-sm font-extrabold tracking-tight text-slate-900 font-mono">InvoiceIQ</span>
                </div>
                <span className="text-[9px] text-slate-400 font-semibold block mt-1.5">100 Pine Street, San Francisco, CA 94111</span>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold tracking-tight text-slate-950 uppercase select-none">INVOICE</h2>
                <span className="text-[10px] font-bold text-slate-700 block mt-1 font-mono">{invoiceNumber || "INV-SEED"}</span>
              </div>
            </div>

            {/* Billing details info */}
            <div className="grid grid-cols-2 gap-4 mt-6 text-xs select-none shrink-0 border-b pb-6">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Billed To:</span>
                <span className="font-bold text-slate-800 block mt-1">{selectedClient?.name || "Client Name"}</span>
                <span className="text-slate-500 block mt-0.5 font-semibold">{selectedClient?.company || "Company Name"}</span>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{selectedClient?.email || "billing@client.com"}</span>
              </div>
              
              <div className="text-right">
                <div className="flex justify-end gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Issue Date</span>
                    <span className="font-semibold text-slate-700 mt-0.5 block">{formatDate(issueDate)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Due Date</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{formatDate(dueDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line items details Table */}
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
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-medium max-w-[200px] truncate">{item.description || "Description Placeholder"}</td>
                      <td className="py-2.5 text-center font-semibold font-mono">{item.quantity}</td>
                      <td className="py-2.5 text-right font-semibold font-mono">{formatCurrency(item.rate, currency)}</td>
                      <td className="py-2.5 text-right font-bold font-mono text-slate-950">{formatCurrency(item.quantity * item.rate, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Subtotal summaries */}
            <div className="mt-8 border-t pt-4 select-none shrink-0 flex flex-col gap-1.5 items-end text-xs font-semibold text-slate-500">
              <div className="flex justify-between w-48 font-semibold">
                <span>Subtotal:</span>
                <span className="text-slate-800 font-mono">{formatCurrency(subtotal, currency)}</span>
              </div>
              {discountRate > 0 && (
                <div className="flex justify-between w-48 text-rose-500 font-semibold">
                  <span>Discount ({discountRate}%):</span>
                  <span className="font-mono">-{formatCurrency(discountAmount, currency)}</span>
                </div>
              )}
              {taxRate > 0 && (
                <div className="flex justify-between w-48 font-semibold">
                  <span>VAT / Tax ({taxRate}%):</span>
                  <span className="text-slate-800 font-mono">+{formatCurrency(taxAmount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between w-48 text-sm font-bold text-slate-950 border-t pt-2 mt-1 select-none">
                <span>Total Due ({currency}):</span>
                <span className="font-mono text-primary-600">{formatCurrency(finalTotal, currency)}</span>
              </div>
            </div>

            {/* Note & footer terms */}
            <div className="mt-8 pt-4 border-t shrink-0 select-none text-[9px] text-slate-400 font-medium leading-relaxed max-w-sm">
              <span className="block font-bold text-slate-500 uppercase tracking-wider mb-1">Notes & Instructions</span>
              <p>{notes || "No custom notes written."}</p>
              <span className="block mt-2 font-bold text-slate-500 uppercase tracking-wider mb-1">Terms</span>
              <p>{terms}</p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
