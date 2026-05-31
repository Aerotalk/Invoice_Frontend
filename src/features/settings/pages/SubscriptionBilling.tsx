import React, { useState } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  HelpCircle, 
  AlertCircle,
  TrendingUp,
  Download
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import toast from 'react-hot-toast';

export const SubscriptionBilling: React.FC = () => {
  const { currency } = usePreferencesStore();

  const billingHistory = [
    { id: "TXN-B-998", date: "2026-05-01", description: "Pro Plan Subscription - Monthly Retainer", amount: 89, status: "success" },
    { id: "TXN-B-997", date: "2026-04-01", description: "Pro Plan Subscription - Monthly Retainer", amount: 89, status: "success" },
    { id: "TXN-B-996", date: "2026-03-01", description: "Pro Plan Subscription - Monthly Retainer", amount: 89, status: "success" }
  ];

  const plans = [
    { name: "Starter", price: 29, limit: "$10K Billed/mo", features: ["1 Team Seat", "Unlimited Invoices", "Basic Reporting"], isCurrent: false },
    { name: "Growth Pro", price: 89, limit: "$100K Billed/mo", features: ["5 Team Seats", "Active Time Trackers", "Custom API webhooks", "AI Copilot Audits"], isCurrent: true },
    { name: "Enterprise Scale", price: 299, limit: "Unlimited limits", features: ["Unlimited Seats", "Advanced Audits Trails", "Dedicated support manager"], isCurrent: false }
  ];

  const columns: ColumnDef<any>[] = [
    {
      header: "Invoice Reference",
      accessorKey: "id",
      cell: (row) => <span className="font-mono text-slate-400 select-none">{row.id}</span>
    },
    {
      header: "Billing Period",
      accessorKey: "date",
      cell: (row) => <span>{formatDate(row.date)}</span>
    },
    {
      header: "Scope Description",
      accessorKey: "description",
      cell: (row) => <span className="text-foreground/80 font-medium">{row.description}</span>
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (row) => <span className="font-bold font-mono">{formatCurrency(row.amount, currency)}</span>
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      header: "Action",
      cell: (row) => (
        <button
          onClick={() => toast.success(`Downloading billing invoice receipt PDF file: ${row.id}...`)}
          className="p-1 rounded border hover:bg-muted text-muted-foreground hover:text-foreground transition-all select-none active:scale-95 shrink-0"
          title="Download Receipt PDF"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none animate-fade-in pb-12">
      <PageHeader
        title="Subscription & Billing"
        description="Monitor active SaaS plans limits usage, download historical payment receipts, or adjust Stripe plan tiers."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start select-none">
        
        {/* Left: Active profile & meters */}
        <div className="lg:col-span-2 space-y-6 select-none">
          
          {/* Active Plan summary */}
          <div className="p-6 border rounded-xl bg-card shadow-premium flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative select-none overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl shrink-0">
                <CreditCard className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Active SaaS Tier</span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">Growth Pro Plan</h3>
                <span className="text-[10px] text-muted-foreground font-semibold">Active plan maturates: Jun 01, 2026</span>
              </div>
            </div>

            <div className="flex items-baseline gap-1 bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-lg border shrink-0">
              <span className="text-xl font-bold text-foreground font-mono">{formatCurrency(89, currency)}</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">/month</span>
            </div>
          </div>

          {/* Usage Meters */}
          <div className="p-6 border rounded-xl bg-card shadow-premium space-y-5 select-none">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b pb-3 shrink-0">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              Workspace Limit Usage Meters
            </h3>

            {/* Meter 1: Team Seats */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>Team Seats Capacity</span>
                <span className="text-foreground">3 / 5 Seats logged</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-3/5 transition-all duration-300" />
              </div>
            </div>

            {/* Meter 2: Billed volumes */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>Monthly Billed capacity</span>
                <span className="text-foreground">$80K / $100K limits</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full w-[80%] transition-all duration-300" />
              </div>
            </div>
          </div>

        </div>

        {/* Right: Stripe Plan Cards Grid */}
        <div className="border rounded-xl bg-card p-5 shadow-premium space-y-5 select-none">
          <div className="border-b pb-3 shrink-0">
            <h3 className="text-sm font-bold text-foreground">Available SaaS Tiers</h3>
          </div>

          <div className="space-y-4 select-none">
            {plans.map((p, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "p-4 border rounded-xl flex flex-col gap-3 select-none hover:-translate-y-0.5 transition-transform cursor-pointer relative overflow-hidden",
                  p.isCurrent 
                    ? "border-primary-500 bg-primary-500/5 dark:bg-primary-500/10 shadow-glow" 
                    : "bg-slate-50/50 dark:bg-[#0b101c]/10"
                )}
              >
                {p.isCurrent && (
                  <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-bl select-none">Current</span>
                )}
                
                <div className="flex items-baseline justify-between select-none">
                  <span className="block text-xs font-bold text-foreground">{p.name}</span>
                  <div className="flex items-baseline gap-0.5 select-none font-mono">
                    <span className="text-sm font-bold text-foreground">{formatCurrency(p.price, currency)}</span>
                    <span className="text-[9px] text-muted-foreground font-semibold">/mo</span>
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground font-semibold uppercase">{p.limit}</div>
                
                <div className="space-y-1 mt-1">
                  {p.features.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                      <Check className="w-3 h-3 text-indigo-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Receipts Table */}
      <div className="space-y-3.5 select-none">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block px-1">Billing Payments Receipts</span>
        
        <DataTable
          columns={columns}
          data={billingHistory}
          emptyTitle="No transactions history"
          emptyDescription="Historical invoices receipts logged settle here."
        />
      </div>

    </div>
  );
};
