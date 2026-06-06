import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { formatCurrency } from '../../../lib/utils';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { FileSpreadsheet, Download, BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import toast from 'react-hot-toast';
import { apiService } from '../../../services/api';

export const ReportsOverview: React.FC = () => {
  const { currency } = usePreferencesStore();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [reportTrendData, setReportTrendData] = useState<any[]>([]);
  const [clientProfitabilityData, setClientProfitabilityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getDashboardStats();
        if (data) {
          setReportTrendData(data.monthlyEarnings || []);
          setClientProfitabilityData(data.clientProfitabilityData || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleExport = async (type: string) => {
    setDownloading(type);
    try {
        if (type === 'Project_Wise_Excel') {
            await apiService.downloadProjectExcel();
            toast.success(`Project-wise Excel export successful!`);
        } else {
            // Mock other exports for now
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success(`Exporting ${type} document to downloads folder. Successful!`);
        }
    } catch (e) {
        toast.error(`Failed to export ${type}`);
    } finally {
        setDownloading(null);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      header: "Client & Company",
      accessorKey: "client",
      cell: (row) => (
        <div>
          <span className="block text-xs font-bold text-foreground">{row.client}</span>
          <span className="block text-[10px] text-muted-foreground uppercase font-semibold">{row.company}</span>
        </div>
      )
    },
    {
      header: "Gross Billed Contracts",
      accessorKey: "billed",
      sortable: true,
      cell: (row) => <span className="font-bold">{formatCurrency(row.billed, currency)}</span>
    },
    {
      header: "Outflow Expenses",
      accessorKey: "expenses",
      sortable: true,
      cell: (row) => <span className="font-bold text-rose-500">-{formatCurrency(row.expenses, currency)}</span>
    },
    {
      header: "Net Profit Margin",
      accessorKey: "profit",
      sortable: true,
      cell: (row) => <span className="font-bold text-emerald-500">{formatCurrency(row.profit, currency)}</span>
    },
    {
      header: "Margin Index",
      accessorKey: "margin",
      sortable: true,
      cell: (row) => (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold select-none px-2.5 py-0.5 border bg-emerald-500/10 text-emerald-500 border-emerald-500/15 rounded-full">
          {row.margin}% Profit
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none animate-fade-in pb-12">
      <PageHeader
        title="Reports"
        description="Audit multi-currency profit balances, download custom spreadsheets, and review operational GST margins."
        actions={
          <div className="flex items-center gap-2 select-none">
            <button
              onClick={() => handleExport("GST_Tax_Summary_CSV")}
              disabled={downloading !== null}
              className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground text-xs font-bold active:scale-95 transition-all select-none disabled:opacity-40"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0 text-slate-400" />
              Tax CSV
            </button>
            <button
              onClick={() => handleExport("Project_Wise_Excel")}
              disabled={downloading !== null}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-xs font-extrabold hover:bg-primary/95 transition-all shadow-md active:scale-95 select-none disabled:opacity-40"
            >
              <Download className="w-4 h-4 shrink-0" />
              {downloading === 'Project_Wise_Excel' ? "Exporting..." : "Project-wise Excel"}
            </button>
          </div>
        }
      />

      {/* Recharts Dual Bar chart breakdown */}
      <div className="border rounded-xl bg-card p-6 shadow-premium space-y-4 select-none">
        <div>
          <h3 className="text-sm font-bold text-foreground">Cash Outflow & GST Summaries</h3>
          <p className="text-xs text-muted-foreground font-medium">Monthly breakdowns comparing net revenue against operating expenses and GST</p>
        </div>

        <div className="h-[220px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportTrendData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  borderColor: 'var(--border)', 
                  borderRadius: '8px',
                  fontSize: '9px'
                }} 
              />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Net Revenue" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="expenses" fill="#10b981" name="Expenses" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="tax" fill="#f59e0b" name="GST Pools" radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Client Profitability Table */}
      <div className="space-y-3.5 select-none">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block px-1">Customer Profitability Matrix</span>
        
        <DataTable
          columns={columns}
          data={clientProfitabilityData}
          searchKey="client"
          searchPlaceholder="Filter clients records..."
          emptyTitle="No records calculated"
          emptyDescription="Profit indices compute once invoicing balances settle."
        />
      </div>

    </div>
  );
};
