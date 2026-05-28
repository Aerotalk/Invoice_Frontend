import React, { useState } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { FileCheck, ArrowRight, Plus } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { usePreferencesStore } from '../../../store/preferencesStore';

export const EstimatesList: React.FC = () => {
  const { currency } = usePreferencesStore();
  const [estimates, setEstimates] = useState<any[]>([
    { id: "EST-001", clientName: "Sarah Jenkins", company: "Acme Corporation", amount: 15000, status: "accepted", date: "2026-05-10" },
    { id: "EST-002", clientName: "Alex Rivera", company: "Vortex Labs", amount: 4800, status: "sent", date: "2026-05-20" },
    { id: "EST-003", clientName: "Marcus Vance", company: "Nova Retail", amount: 6200, status: "declined", date: "2026-05-25" },
    { id: "EST-004", clientName: "Emma Watson", company: "Apex Agency", amount: 9500, status: "draft", date: "2026-05-28" }
  ]);

  const handleConvert = (id: string) => {
    alert(`Estimates ${id} converted to an Invoice draft. Please check your Invoices tab!`);
  };

  const columns: ColumnDef<any>[] = [
    {
      header: "Estimate ID",
      accessorKey: "id",
      cell: (row) => (
        <div className="flex items-center gap-2 select-none">
          <FileCheck className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-bold text-foreground font-mono">{row.id}</span>
        </div>
      )
    },
    {
      header: "Client & Company",
      accessorKey: "clientName",
      cell: (row) => (
        <div>
          <span className="block text-xs font-bold text-foreground">{row.clientName}</span>
          <span className="block text-[10px] text-muted-foreground uppercase font-semibold">{row.company}</span>
        </div>
      )
    },
    {
      header: "Quoted Total",
      accessorKey: "amount",
      cell: (row) => <span className="font-bold font-mono">{formatCurrency(row.amount, currency)}</span>
    },
    {
      header: "Issued Date",
      accessorKey: "date",
      cell: (row) => <span>{formatDate(row.date)}</span>
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      header: "Convert",
      cell: (row) => (
        <button
          onClick={() => handleConvert(row.id)}
          disabled={row.status !== 'accepted'}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border text-[10px] font-bold text-primary hover:bg-muted transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none select-none"
        >
          Convert
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none animate-fade-in">
      <PageHeader
        title="Estimates"
        description="Oversee your client proposals, draft quotation bids, and convert accepted biddings to invoices."
        actions={
          <button 
            onClick={() => alert("Creating a new quotation estimate...")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/95 transition-all select-none active:scale-95 shadow-md shadow-indigo-500/5"
          >
            <Plus className="w-4 h-4" />
            New Estimate
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={estimates}
        searchKey="clientName"
        searchPlaceholder="Filter estimates by client..."
        emptyTitle="No estimates proposed"
        emptyDescription="Draft client bids by clicking New Estimate above."
      />
    </div>
  );
};
