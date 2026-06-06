import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CreditCard, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  Calendar, 
  Bot, 
  RefreshCw, 
  ChevronRight, 
  Clock, 
  DollarSign
} from 'lucide-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { MetricCard } from '../../../components/common/MetricCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { apiService } from '../../../services/api';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { useTimerStore } from '../../../store/timerStore';
import { useAIStore } from '../../../store/aiStore';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell
} from 'recharts';

export const DashboardOverview: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const { currency, currencySymbol } = usePreferencesStore();
  const { startTimer } = useTimerStore();
  const { setOpen: setAIOpen } = useAIStore();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiService.getDashboardStats();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currency]);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-[300px] bg-slate-200 dark:bg-slate-800 rounded-xl lg:col-span-2" />
          <div className="h-[300px] bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  const { stats = {}, monthlyEarnings = [], statusPieData = [], recentInvoices = [], recentPayments = [] } = data || {};

  return (
    <div className="space-y-6 select-none animate-fade-in">
      {/* 1. Page Header with Controls */}
      <PageHeader
        title="Overview"
        description="Monitor real-time business revenues, outstanding balances, and active timelines."
        actions={
          <div className="flex items-center gap-2 select-none">
            {/* Refresh */}
            <button 
              onClick={loadData}
              className="p-2 border rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all select-none active:scale-90"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4 shrink-0" />
            </button>
            {/* Range */}
            <div className="relative group select-none">
              <button className="flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                <Calendar className="w-3.5 h-3.5" />
                <span>{dateRange}</span>
              </button>
              <div className="absolute right-0 mt-1 w-32 bg-card border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-xs">
                {['Today', 'Last 7 Days', 'Last 30 Days', 'This Year'].map(r => (
                  <button 
                    key={r}
                    onClick={() => setDateRange(r)}
                    className="w-full text-left px-3 py-2 hover:bg-muted transition-colors font-semibold"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
      />

      {/* 2. KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        <MetricCard
          title="Total Revenue"
          value={stats?.totalRevenue || 0}
          currencyCode={currency}
          icon={CreditCard}
          trend={{ value: 12.4, isPositive: true }}
          color="success"
        />
        <MetricCard
          title="Outstanding Balance"
          value={stats?.outstandingInvoices || 0}
          currencyCode={currency}
          icon={DollarSign}
          trend={{ value: 4.2, isPositive: false }}
          color="warning"
        />
        <MetricCard
          title="Invoices Paid"
          value={stats?.paidInvoicesCount || 0}
          isCurrency={false}
          icon={FileText}
          description="Fully settled transactions"
          color="primary"
        />
        <MetricCard
          title="Overdue Accounts"
          value={stats?.overdueInvoicesCount || 0}
          isCurrency={false}
          icon={AlertTriangle}
          description="Invoices past maturity"
          color="danger"
        />
      </div>

      {/* 3. Recharts Section (Area + Pie) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
        
        {/* Earnings Area Chart */}
        <div className="border rounded-xl bg-card p-5 lg:col-span-2 shadow-premium flex flex-col justify-between">
          <div className="flex items-center justify-between border-b pb-4 shrink-0">
            <div>
              <h3 className="text-sm font-bold text-foreground">Cash Flow Performance</h3>
              <p className="text-xs text-muted-foreground">Monthly revenue compared with operational expenses</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-primary-600 rounded-full shrink-0" />
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-500 rounded-full shrink-0" />
                <span>Expenses</span>
              </div>
            </div>
          </div>
          <div className="h-[260px] w-full mt-4 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyEarnings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)', 
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: 'var(--foreground)'
                  }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expenses" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Distribution Pie */}
        <div className="border rounded-xl bg-card p-5 shadow-premium flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Invoices Status</h3>
            <p className="text-xs text-muted-foreground">Distribution of issued invoices</p>
          </div>
          <div className="h-[200px] w-full flex items-center justify-center relative mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusPieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)', 
                    borderRadius: '8px',
                    fontSize: '11px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Summary */}
            <div className="absolute flex flex-col items-center select-none pointer-events-none">
              <span className="text-2xl font-bold text-foreground">{(recentInvoices?.length || 0) + 1}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Count</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold select-none border-t pt-4">
            {(statusPieData || []).map((d: any, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Recent Transactions & Invoices lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
        
        {/* Recent Invoices list */}
        <div className="border rounded-xl bg-card p-5 lg:col-span-2 shadow-premium flex flex-col justify-between">
          <div className="flex items-center justify-between border-b pb-4 shrink-0">
            <div>
              <h3 className="text-sm font-bold text-foreground">Recent Invoices</h3>
              <p className="text-xs text-muted-foreground">Most recently generated billing invoices</p>
            </div>
            <Link 
              to="/dashboard/invoices" 
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 active:scale-95 shrink-0"
            >
              View all
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 flex-1 divide-y divide-border overflow-x-auto whitespace-nowrap">
            {(recentInvoices || []).map((inv: any) => (
              <div key={inv?.id || Math.random()} className="py-3 flex items-center justify-between gap-4 select-none hover:bg-slate-50/20 dark:hover:bg-slate-800/10 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <Link to={`/dashboard/invoices/${inv?.id}`} className="block text-xs font-bold text-foreground hover:text-primary hover:underline">
                      {inv?.invoiceNumber || 'INV-XXX'}
                    </Link>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">{inv?.clientCompany || 'Unknown'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 shrink-0">
                  <span className="text-xs font-bold text-foreground">{formatCurrency(inv?.total, inv?.currency)}</span>
                  <StatusBadge status={inv?.status || 'draft'} />
                  <span className="text-[10px] text-muted-foreground font-semibold">{formatDate(inv?.issueDate || '')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments (Transactions) list */}
        <div className="border rounded-xl bg-card p-5 shadow-premium flex flex-col justify-between">
          <div className="flex items-center justify-between border-b pb-4 shrink-0">
            <div>
              <h3 className="text-sm font-bold text-foreground">Recent Settlements</h3>
              <p className="text-xs text-muted-foreground">Real-time payment logs</p>
            </div>
            <Link 
              to="/dashboard/payments" 
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 active:scale-95 shrink-0"
            >
              View all
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 flex-1 divide-y divide-border">
            {(recentPayments || []).map((p: any) => (
              <div key={p?.id || Math.random()} className="py-3 flex items-center justify-between gap-4 select-none">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-foreground truncate max-w-[120px]">{p?.clientName || 'Payment'}</span>
                    <span className="block text-[9px] text-slate-500 tracking-tight">{p?.method?.replace('_', ' ') || 'Bank Transfer'}</span>
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <span className="block text-xs font-extrabold text-emerald-500">+{formatCurrency(p?.amount, p?.currency)}</span>
                  <span className="block text-[9px] text-muted-foreground font-semibold">{formatDate(p?.date || '')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Extra Premium Suggestions Widget */}
      {/* <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 select-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg shrink-0">
            <Bot className="w-5 h-5 shrink-0 animate-bounce-slow" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              GrivetyGlobal AI Copilot Assistant Ready
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-500 text-[8px] font-extrabold select-none uppercase tracking-wider">New</span>
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">Let the AI copilot audit your outstanding ledger or auto-draft email follow-ups.</p>
          </div>
        </div>
        <button
          onClick={() => setAIOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-extrabold hover:bg-primary/95 transition-all select-none active:scale-95 shrink-0 text-center shadow-md shadow-indigo-500/5"
        >
          Activate Copilot
        </button>
      </div> */}

    </div>
  );
};
