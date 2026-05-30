import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Clock, 
  CreditCard, 
  FileText, 
  FolderGit, 
  Edit3, 
  Save, 
  FilePlus,
  Activity,
  User,
  Briefcase
} from 'lucide-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { apiService } from '../../../services/api';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

export const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payments' | 'projects'>('overview');
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const { currency } = usePreferencesStore();

  const loadClientData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiService.getClientById(id);
      setData(res);
      setNoteText(res.client.notes || "");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientData();
  }, [id]);

  const handleSaveNote = async () => {
    if (!id || !data) return;
    setSavingNote(true);
    try {
      await apiService.updateClient(id, { notes: noteText });
      alert("Client internal notes updated!");
      // Reload context
      const updated = await apiService.getClientById(id);
      setData(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNote(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-[320px]" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  const { client, invoices, payments, projects } = data;

  // Invoices Columns
  const invoiceColumns: ColumnDef<any>[] = [
    {
      header: "Invoice Number",
      accessorKey: "invoiceNumber",
      cell: (row) => (
        <Link to={`/dashboard/invoices/${row.id}`} className="font-bold text-primary hover:underline">
          {row.invoiceNumber}
        </Link>
      )
    },
    {
      header: "Issue Date",
      accessorKey: "issueDate",
      cell: (row) => <span>{formatDate(row.issueDate)}</span>
    },
    {
      header: "Total",
      accessorKey: "total",
      cell: (row) => <span className="font-bold text-foreground select-none">{formatCurrency(row.total, row.currency)}</span>
    },
    {
      header: "Amount Paid",
      accessorKey: "amountPaid",
      cell: (row) => <span className="font-bold text-emerald-500 select-none">{formatCurrency(row.amountPaid, row.currency)}</span>
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => <StatusBadge status={row.status} />
    }
  ];

  // Payments Columns
  const paymentColumns: ColumnDef<any>[] = [
    {
      header: "Receipt ID",
      accessorKey: "id",
      cell: (row) => <span className="text-slate-400 select-none">{row.id}</span>
    },
    {
      header: "Settled Invoice",
      accessorKey: "invoiceNumber",
      cell: (row) => (
        <Link to={`/dashboard/invoices/${row.invoiceId}`} className="font-bold hover:underline">
          {row.invoiceNumber}
        </Link>
      )
    },
    {
      header: "Amount Paid",
      accessorKey: "amount",
      cell: (row) => <span className="font-bold text-emerald-500 select-none">+{formatCurrency(row.amount, row.currency)}</span>
    },
    {
      header: "Method",
      accessorKey: "method",
      cell: (row) => <span className="capitalize">{row.method.replace('_', ' ')}</span>
    },
    {
      header: "Settlement Date",
      accessorKey: "date",
      cell: (row) => <span>{formatDate(row.date)}</span>
    }
  ];

  return (
    <div className="space-y-6 select-none animate-fade-in pb-12">
      
      {/* Back button */}
      <Link 
        to="/dashboard/clients" 
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors select-none active:scale-95"
      >
        <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
        Back to Clients
      </Link>

      {/* 2. Client Profile Summary Card */}
      <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6 relative select-none">
        <div className="flex items-center gap-4">
          <img 
            src={client.avatar} 
            alt={client.name} 
            className="w-14 h-14 rounded-xl object-cover border ring-1 ring-border shadow-md shrink-0" 
          />
          <div>
            <h2 className="text-xl font-extrabold text-foreground leading-tight">{client.name}</h2>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground font-semibold uppercase">
              {client.clientType === 'individual' ? (
                <>
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  Individual Client
                </>
              ) : (
                <>
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {client.company}
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 select-none text-[11px] font-semibold text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {client.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {client.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-start gap-3 md:gap-1.5 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 select-none border-border">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Relationship Status</span>
          <StatusBadge status={client.status} />
          <span className="text-[10px] text-muted-foreground font-semibold block mt-1">Joined: {formatDate(client.createdAt)}</span>
        </div>
      </div>

      {/* 3. Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 select-none">
        <div className="p-5 border rounded-xl bg-card shadow-premium relative">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Billed Contracts</span>
          <span className="block text-xl font-bold text-foreground mt-2">{formatCurrency(client.totalBilled, currency)}</span>
          <FileText className="absolute top-4 right-4 w-4 h-4 text-slate-400" />
        </div>
        <div className="p-5 border rounded-xl bg-card shadow-premium relative">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Outstanding Balances</span>
          <span className={cn(
            "block text-xl font-bold mt-2",
            client.outstandingAmount > 0 ? "text-amber-500" : "text-emerald-500"
          )}>
            {formatCurrency(client.outstandingAmount, currency)}
          </span>
          <CreditCard className="absolute top-4 right-4 w-4 h-4 text-slate-400" />
        </div>
        <div className="p-5 border rounded-xl bg-card shadow-premium relative">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Projects Log</span>
          <span className="block text-xl font-bold text-foreground mt-2">{projects.length} Total</span>
          <FolderGit className="absolute top-4 right-4 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* 4. Tab Sub-Navigation Menu */}
      <div className="flex border-b text-xs font-semibold text-muted-foreground overflow-x-auto whitespace-nowrap scrollbar-none select-none">
        {[
          { id: 'overview', label: 'Relationship Overview' },
          { id: 'invoices', label: `Invoices Ledger (${invoices.length})` },
          { id: 'payments', label: `Payments Logs (${payments.length})` },
          { id: 'projects', label: `Projects Mapped (${projects.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-4 py-3 border-b-2 transition-all select-none",
              activeTab === tab.id 
                ? "border-primary text-primary font-bold" 
                : "border-transparent hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 5. Tab Content rendering */}
      <div className="select-none">
        
        {/* TAB 1: OVERVIEW & NOTES */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
            
            {/* Interactive Notes Notepad */}
            <div className="border rounded-xl bg-card p-5 shadow-premium lg:col-span-2 flex flex-col justify-between h-[340px]">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 select-none">
                  <Edit3 className="w-4 h-4 text-indigo-500 shrink-0" />
                  Client Internal Billing Notes
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Customize payment schedules, sprint terms, or contract guidelines below.</p>
              </div>
              
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write specific billing instructions, project retainers descriptions..."
                className="flex-1 w-full mt-4 p-3 border rounded-lg bg-slate-50/50 dark:bg-[#0b101c]/40 outline-none focus:bg-card focus:border-indigo-500/70 text-xs font-medium resize-none leading-relaxed"
              />
              
              <div className="border-t pt-4 mt-4 flex items-center justify-between shrink-0 select-none">
                <span className="text-[10px] text-muted-foreground font-semibold">Changes are saved to local database</span>
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-extrabold hover:bg-primary/95 transition-all shadow-md active:scale-95 disabled:opacity-40"
                >
                  <Save className="w-3.5 h-3.5 shrink-0" />
                  {savingNote ? "Saving..." : "Save Note"}
                </button>
              </div>
            </div>

            {/* Client Activity Timeline */}
            <div className="border rounded-xl bg-card p-5 shadow-premium flex flex-col justify-between h-[340px]">
              <div className="border-b pb-3 shrink-0">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 select-none">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  Timeline Activity Logs
                </h3>
              </div>

              <div className="flex-1 mt-4 overflow-y-auto space-y-4 pr-1 scrollbar-thin select-none text-xs">
                {invoices.map((inv: any, index: number) => (
                  <div key={index} className="flex gap-3 relative select-none">
                    {/* timeline bullet */}
                    <div className="relative shrink-0 flex flex-col items-center">
                      <span className={cn(
                        "w-2 h-2 rounded-full mt-1.5 z-10 shrink-0",
                        inv.status === 'paid' ? "bg-emerald-500" : "bg-slate-400"
                      )} />
                      {index < invoices.length - 1 && (
                        <div className="w-px h-full bg-border absolute top-3.5 z-0" />
                      )}
                    </div>
                    {/* Log text */}
                    <div>
                      <span className="block font-bold text-foreground">
                        Invoice {inv.invoiceNumber} {inv.status === 'paid' ? "paid fully" : "issued and pending"}
                      </span>
                      <span className="block text-[10px] text-muted-foreground uppercase font-bold mt-0.5">
                        Amount: {formatCurrency(inv.total, inv.currency)} • {formatDate(inv.issueDate)}
                      </span>
                    </div>
                  </div>
                ))}
                
                {invoices.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground select-none">
                    No timeline logs captured.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: INVOICES LIST */}
        {activeTab === 'invoices' && (
          <div className="animate-fade-in select-none">
            <DataTable
              columns={invoiceColumns}
              data={invoices}
              emptyTitle="No client invoices"
              emptyDescription="This client has no recorded invoices generated."
              pageSize={6}
            />
          </div>
        )}

        {/* TAB 3: PAYMENTS LIST */}
        {activeTab === 'payments' && (
          <div className="animate-fade-in select-none">
            <DataTable
              columns={paymentColumns}
              data={payments}
              emptyTitle="No payment settled"
              emptyDescription="There are no payment histories logged for this account."
              pageSize={6}
            />
          </div>
        )}

        {/* TAB 4: PROJECTS GRID */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 select-none animate-fade-in">
            {projects.map((proj: any) => (
              <div 
                key={proj.id} 
                className="p-5 border rounded-xl bg-card shadow-premium flex flex-col justify-between gap-4 select-none hover:-translate-y-0.5 transition-transform group"
              >
                <div className="flex items-start justify-between border-b pb-3">
                  <div>
                    <Link to={`/dashboard/projects/${proj.id}`} className="block text-sm font-bold text-foreground hover:underline hover:text-primary">
                      {proj.name}
                    </Link>
                    <span className="block text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                      Budget: {formatCurrency(proj.budget, currency)}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border bg-slate-50 dark:bg-slate-800 text-muted-foreground uppercase font-bold tracking-wider">
                    {proj.status.replace('-', ' ')}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-bold mb-1.5 select-none">
                    <span>Task Progress</span>
                    <span className="text-foreground">{proj.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500" 
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                {/* Project items footer summary */}
                <div className="flex items-center justify-between border-t pt-3 mt-1 text-[11px] font-semibold text-muted-foreground">
                  <span>{proj.tasks.filter((t: any) => t.status === 'completed').length}/{proj.tasks.length} Completed</span>
                  <Link to={`/dashboard/projects/${proj.id}`} className="text-primary hover:underline hover:underline-offset-2 flex items-center gap-1 active:scale-95">
                    Open Board
                  </Link>
                </div>
              </div>
            ))}

            {projects.length === 0 && (
              <div className="col-span-full border rounded-xl py-12 text-center text-sm text-muted-foreground bg-card select-none">
                No active projects mapped to this account.
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
