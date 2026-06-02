import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  FileText,
  FolderGit,
  Eye,
  Plus,
  Users,
  StickyNote,
  Receipt,
  XCircle,
  Save,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  UserPlus,
  UploadCloud,
} from 'lucide-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Drawer } from '../../../components/common/Drawer';
import { apiService } from '../../../services/api';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { formatCurrency, formatDate, cn } from '../../../lib/utils';
import { ProjectInvoice, ProjectEntity } from '../../../types';
import toast from 'react-hot-toast';

const ENTITY_TAGS = [
  'Site Engineer',
  'Vendor',
  'Contractor',
  'Manager',
  'Consultant',
  'Supervisor',
  'Labour',
  'Other',
];

const EXPENSE_TYPES = [
  'Software',
  'Marketing',
  'Rent',
  'Office Supplies',
  'Travel',
  'Consulting',
  'Purchase Order',
  'Other',
];

const invStatusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending: {
    label: 'Pending',
    icon: <Clock className="w-3 h-3" />,
    className: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  sent: {
    label: 'Sent',
    icon: <Send className="w-3 h-3" />,
    className: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  },
  paid: {
    label: 'Paid',
    icon: <CheckCircle2 className="w-3 h-3" />,
    className: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
};

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Drawer states
  const [invoiceDrawerOpen, setInvoiceDrawerOpen] = useState(false);
  const [entityDrawerOpen, setEntityDrawerOpen] = useState(false);
  const [expenseDrawerOpen, setExpenseDrawerOpen] = useState(false);

  // Invoice Form State
  const [invId, setInvId] = useState('');
  const [invDesc, setInvDesc] = useState('');
  const [invDate, setInvDate] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invStatus, setInvStatus] = useState<'pending' | 'sent' | 'paid'>('pending');
  const [invVendorTag, setInvVendorTag] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Entity Form State
  const [entityName, setEntityName] = useState('');
  const [entityTag, setEntityTag] = useState('');
  const [entityRemarks, setEntityRemarks] = useState('');

  // Notes state (People + Notes)
  const [notePerson, setNotePerson] = useState('');
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Expense Form State
  const [expName, setExpName] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expType, setExpType] = useState('Other');
  const [expVendorId, setExpVendorId] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSavingExpense, setIsSavingExpense] = useState(false);

  const { currency } = usePreferencesStore();

  const loadAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [projRes, expRes, vendRes] = await Promise.all([
        apiService.getProjectById(id),
        apiService.getProjectExpenses(id),
        apiService.getVendors(),
      ]);
      setProject(projRes);
      setExpenses(expRes);
      setVendors(vendRes);

      // Seed notes from project
      const notesRaw: string = projRes?.notes || '';
      const parts = notesRaw.split('||');
      setNotePerson(parts[0] || '');
      setNoteText(parts[1] || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  // ─── Invoice Upload ──────────────────────────────────────────────────────
  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!project || !invId || !invDesc || !invDate) {
      toast.error('Please fill all required fields.');
      return;
    }

    setIsUploading(true);
    try {
      let fileUrl = '';
      if (file) {
        const uploaded = await apiService.uploadFile(file);
        fileUrl = uploaded.url || `/uploads/${uploaded.filename}`;
      } else {
        fileUrl = `https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300&random=${Date.now()}`;
      }

      const newInvoice: ProjectInvoice = {
        id: `inv-${Date.now()}`,
        invoiceId: invId,
        description: invDesc,
        date: invDate,
        url: fileUrl,
        amount: invAmount ? Number(invAmount) : undefined,
        status: invStatus,
        vendorTag: invVendorTag || undefined,
      };
      await apiService.uploadProjectInvoice(project.id, newInvoice);
      toast.success('Invoice uploaded!');
      setInvoiceDrawerOpen(false);
      setInvId(''); setInvDesc(''); setInvDate(''); setInvAmount(''); setInvStatus('pending'); setInvVendorTag('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadAll();
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Entity Add ──────────────────────────────────────────────────────────
  const handleAddEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityName || !entityTag) { toast.error('Name and tag are required.'); return; }

    const newEntity: ProjectEntity = {
      id: `ent-${Date.now()}`,
      name: entityName,
      tag: entityTag,
      remarks: entityRemarks || undefined,
    };
    const updatedEntities = [...(project.entities || []), newEntity];
    try {
      await apiService.updateProject(project.id, { entities: updatedEntities });
      toast.success('Entity added!');
      setEntityDrawerOpen(false);
      setEntityName(''); setEntityTag(''); setEntityRemarks('');
      loadAll();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save entity');
    }
  };

  const handleDeleteEntity = async (entityId: string) => {
    if (!project) return;
    const updatedEntities = (project.entities || []).filter((en: ProjectEntity) => en.id !== entityId);
    try {
      await apiService.updateProject(project.id, { entities: updatedEntities });
      toast.success('Entity removed');
      loadAll();
    } catch (e) {
      toast.error('Failed to remove entity');
    }
  };

  // ─── Notes Save ──────────────────────────────────────────────────────────
  const handleSaveNote = async () => {
    if (!project) return;
    setSavingNote(true);
    try {
      await apiService.updateProject(project.id, { notes: `${notePerson}||${noteText}` });
      toast.success('Notes saved!');
    } catch (e) {
      toast.error('Failed to save notes');
    } finally {
      setSavingNote(false);
    }
  };

  // ─── Expense Add ─────────────────────────────────────────────────────────
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expName || !expAmount) { toast.error('Name and amount are required.'); return; }
    const vendor = vendors.find(v => v.id === expVendorId);
    setIsSavingExpense(true);
    try {
      await apiService.createExpense({
        description: expName,
        category: expType,
        amount: Number(expAmount),
        date: expDate,
        projectId: project.id,
        projectName: project.name || project.projectName,
        vendorId: expVendorId || undefined,
        vendorName: vendor?.name || undefined,
        notes: expDesc || undefined,
        currency,
        receiptUrl: null,
        isTaxDeductible: false,
        invoiceNumber: '',
      });
      toast.success('Expense logged!');
      setExpenseDrawerOpen(false);
      setExpName(''); setExpDesc(''); setExpType('Other'); setExpVendorId(''); setExpAmount('');
      setExpDate(new Date().toISOString().split('T')[0]);
      loadAll();
    } catch (err) {
      console.error(err);
      toast.error('Failed to log expense');
    } finally {
      setIsSavingExpense(false);
    }
  };

  // ─── Close Project ────────────────────────────────────────────────────────
  const handleCloseProject = async () => {
    if (!project || !confirm('Are you sure you want to close this project?')) return;
    setIsClosing(true);
    try {
      await apiService.updateProject(project.id, { status: 'completed' });
      toast.success('Project closed!');
      loadAll();
    } catch (e) {
      toast.error('Failed to close project');
    } finally {
      setIsClosing(false);
    }
  };

  // ─── Filtered invoices (non-empty) ───────────────────────────────────────
  const validInvoices: ProjectInvoice[] = (project?.invoices || []).filter(
    (inv: any) => inv && inv.invoiceId && inv.invoiceId.trim() !== ''
  );

  const projectVendors: { id: string; name: string }[] = project?.vendors || [];

  if (loading || !project) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fade-in pb-16">

      {/* Back button */}
      <Link
        to="/dashboard/projects"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors select-none active:scale-95 shrink-0"
      >
        <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
        Back to Projects
      </Link>

      {/* ── Project Header KPI Card ── */}
      <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-premium flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative select-none">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap select-none">
            <h2 className="text-xl font-extrabold text-foreground tracking-tight leading-tight">
              {project.name || project.projectName}
            </h2>
            <StatusBadge status={project.status} />
          </div>

          {project.description && (
            <p className="text-xs text-muted-foreground mt-1.5 font-medium max-w-lg">{project.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-muted-foreground font-semibold">
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              Client: <span className="text-foreground ml-0.5">{project.clientName || project.customer?.displayName}</span>
            </span>
            {projectVendors.length > 0 && (
              <span className="flex items-center gap-1.5">
                <FolderGit className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Vendors:&nbsp;
                <span className="text-foreground">{projectVendors.map((v: any) => v.name || v.displayName).join(', ')}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6 select-none border-border shrink-0">
          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Project Estimation</span>
            <span className="block text-base font-extrabold text-foreground font-mono mt-0.5">
              {formatCurrency(project.budget, project.currency || currency)}
            </span>
            <span className="block text-[9px] text-muted-foreground font-semibold mt-1">
              Due: {formatDate(project.dueDate)}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2×2 Panel Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── PANEL 1: Transactions ── */}
        <div className="border rounded-xl bg-card shadow-premium overflow-hidden flex flex-col">
          <div className="p-5 flex items-center justify-between border-b shrink-0">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                Transactions
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Vendor invoices linked to this project.</p>
            </div>
            <button
              onClick={() => setInvoiceDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-extrabold hover:bg-primary/95 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Upload
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[520px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tag</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {validInvoices.length > 0 ? (
                  validInvoices.map((inv: ProjectInvoice) => {
                    const st = inv.status || 'pending';
                    const stConf = invStatusConfig[st];
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3 text-xs font-semibold text-foreground whitespace-nowrap">
                          <div>
                            <span className="block font-bold">{inv.invoiceId}</span>
                            <span className="block text-[10px] text-muted-foreground font-medium leading-tight">{inv.description}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-muted-foreground whitespace-nowrap">
                          {inv.vendorTag ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-bold">
                              {inv.vendorTag}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(inv.date)}
                        </td>
                        <td className="py-2.5 px-3 text-xs font-bold text-foreground font-mono text-right whitespace-nowrap">
                          {inv.amount != null ? formatCurrency(inv.amount, project.currency || currency) : '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold',
                            stConf.className
                          )}>
                            {stConf.icon}
                            {stConf.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <a
                            href={inv.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border bg-card text-primary text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-95"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </a>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-xs text-muted-foreground">
                      No transactions uploaded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── PANEL 2: List of Entities ── */}
        <div className="border rounded-xl bg-card shadow-premium overflow-hidden flex flex-col">
          <div className="p-5 flex items-center justify-between border-b shrink-0">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                List of Entities
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">People & vendors involved in this project.</p>
            </div>
            <button
              onClick={() => setEntityDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-extrabold hover:bg-primary/95 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tag</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Remarks</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Auto-seed from project vendors */}
                {projectVendors.map((v: any) => (
                  <tr key={`v-${v.id}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 text-xs font-semibold text-foreground">{v.name || v.displayName}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 text-[10px] font-bold">Vendor</span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-muted-foreground">—</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-[10px] text-slate-400">System</span>
                    </td>
                  </tr>
                ))}

                {/* User-added entities */}
                {(project.entities || []).map((en: ProjectEntity) => (
                  <tr key={en.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 text-xs font-semibold text-foreground">{en.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-500 text-[10px] font-bold">{en.tag}</span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-muted-foreground max-w-[160px] truncate">{en.remarks || '—'}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteEntity(en.id)}
                        className="p-1 rounded hover:bg-rose-500/10 text-rose-500 active:scale-90 transition-all"
                        title="Remove entity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {projectVendors.length === 0 && (project.entities || []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-xs text-muted-foreground">
                      No entities added yet. Click "+ Add" to add people or vendors.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── PANEL 3: Notes ── */}
        <div className="border rounded-xl bg-card shadow-premium p-5 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <StickyNote className="w-4 h-4 text-primary" />
              Notes
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Add internal notes and assign them to a person.</p>
          </div>

          <div className="grid grid-cols-12 gap-3 flex-1">
            {/* People column */}
            <div className="col-span-4 flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">People</label>
              <input
                type="text"
                value={notePerson}
                onChange={(e) => setNotePerson(e.target.value)}
                placeholder="e.g. Rohit"
                className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-xs border-slate-300 dark:border-slate-700"
              />
            </div>

            {/* Notes column */}
            <div className="col-span-8 flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Notes</label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write internal notes, reminders, or remarks..."
                rows={4}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50/50 dark:bg-slate-900/30 outline-none focus:border-primary transition-colors text-xs border-slate-300 dark:border-slate-700 resize-none leading-relaxed font-medium"
              />
            </div>
          </div>

          <div className="border-t pt-3 flex items-center justify-end">
            <button
              onClick={handleSaveNote}
              disabled={savingNote}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-extrabold hover:bg-primary/95 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 shrink-0" />
              {savingNote ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>

        {/* ── PANEL 4: Expenses ── */}
        <div className="border rounded-xl bg-card shadow-premium overflow-hidden flex flex-col">
          <div className="p-5 flex items-center justify-between border-b shrink-0">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-primary" />
                Expenses
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Operating costs linked to this project.</p>
            </div>
            <button
              onClick={() => setExpenseDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-extrabold hover:bg-primary/95 transition-all active:scale-95 shadow-sm"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[480px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Desc.</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">People</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.length > 0 ? (
                  expenses.map((exp: any) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 text-xs font-semibold text-foreground max-w-[130px] truncate">
                        {exp.description || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground max-w-[120px] truncate">
                        {exp.notes || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-foreground font-medium">
                        {exp.vendorName || exp.clientName || '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-xs font-bold text-foreground font-mono text-right whitespace-nowrap">
                        {formatCurrency(exp.amount, exp.currency || currency)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-muted-foreground">
                      No expenses linked to this project yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Close Project ── */}
      <div className="flex justify-end">
        <button
          onClick={handleCloseProject}
          disabled={isClosing || project.status === 'completed'}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-bold transition-all active:scale-95',
            project.status === 'completed'
              ? 'border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed'
              : 'border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20'
          )}
        >
          <XCircle className="w-4 h-4 shrink-0" />
          {project.status === 'completed' ? 'Project Closed' : isClosing ? 'Closing...' : 'Close Project'}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          DRAWER 1: Upload Invoice / Transaction
      ═══════════════════════════════════════════════════════════ */}
      <Drawer
        isOpen={invoiceDrawerOpen}
        onClose={() => setInvoiceDrawerOpen(false)}
        title="Upload Transaction"
        size="md"
      >
        <form onSubmit={handleInvoiceSubmit} className="space-y-5 text-sm p-2 pb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice ID *</label>
              <input
                type="text"
                required
                value={invId}
                onChange={(e) => setInvId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm border-slate-300 dark:border-slate-700"
                placeholder="e.g. PO090"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date *</label>
              <input
                type="date"
                required
                value={invDate}
                onChange={(e) => setInvDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm border-slate-300 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description *</label>
            <input
              type="text"
              required
              value={invDesc}
              onChange={(e) => setInvDesc(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm border-slate-300 dark:border-slate-700"
              placeholder="Brief description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</label>
              <input
                type="number"
                value={invAmount}
                onChange={(e) => setInvAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm border-slate-300 dark:border-slate-700"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
              <select
                value={invStatus}
                onChange={(e) => setInvStatus(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          {projectVendors.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vendor Tag</label>
              <select
                value={invVendorTag}
                onChange={(e) => setInvVendorTag(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                <option value="">— None —</option>
                {projectVendors.map((v: any) => (
                  <option key={v.id} value={v.name || v.displayName}>{v.name || v.displayName}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Document (optional)</label>
            <input
              type="file"
              ref={fileInputRef}
              className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer border-slate-300 dark:border-slate-700"
              accept="image/*,.pdf"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={() => setInvoiceDrawerOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-muted font-medium transition-colors text-sm"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
              disabled={isUploading}
            >
              {isUploading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </Drawer>

      {/* ═══════════════════════════════════════════════════════════
          DRAWER 2: Add Entity
      ═══════════════════════════════════════════════════════════ */}
      <Drawer
        isOpen={entityDrawerOpen}
        onClose={() => setEntityDrawerOpen(false)}
        title="Add Entity"
        size="sm"
      >
        <form onSubmit={handleAddEntity} className="space-y-5 text-sm p-2 pb-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name *</label>
            <input
              type="text"
              required
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm border-slate-300 dark:border-slate-700"
              placeholder="e.g. Ashish"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type / Tag *</label>
            <select
              required
              value={entityTag}
              onChange={(e) => setEntityTag(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              <option value="">Select type</option>
              {ENTITY_TAGS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Remarks</label>
            <input
              type="text"
              value={entityRemarks}
              onChange={(e) => setEntityRemarks(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm border-slate-300 dark:border-slate-700"
              placeholder="e.g. Reimburse 10, PO980 to pay"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={() => setEntityDrawerOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-muted font-medium transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Entity
            </button>
          </div>
        </form>
      </Drawer>

      {/* ═══════════════════════════════════════════════════════════
          DRAWER 3: Log Expense
      ═══════════════════════════════════════════════════════════ */}
      <Drawer
        isOpen={expenseDrawerOpen}
        onClose={() => setExpenseDrawerOpen(false)}
        title="Log Project Expense"
        size="md"
      >
        <form onSubmit={handleAddExpense} className="space-y-5 text-sm p-2 pb-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expense Name *</label>
            <input
              type="text"
              required
              value={expName}
              onChange={(e) => setExpName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm border-slate-300 dark:border-slate-700"
              placeholder="e.g. Camera, Bus fare"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
            <input
              type="text"
              value={expDesc}
              onChange={(e) => setExpDesc(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm border-slate-300 dark:border-slate-700"
              placeholder="Additional details"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type *</label>
              <select
                value={expType}
                onChange={(e) => setExpType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                {EXPENSE_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date *</label>
              <input
                type="date"
                required
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm border-slate-300 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">People (Vendor)</label>
              <select
                value={expVendorId}
                onChange={(e) => setExpVendorId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                <option value="">— None —</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount *</label>
              <input
                type="number"
                required
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm border-slate-300 dark:border-slate-700"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Pre-filled read-only project info */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs font-semibold text-primary flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            Will be linked to: <span className="font-bold">{project.name || project.projectName}</span>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={() => setExpenseDrawerOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-muted font-medium transition-colors text-sm"
              disabled={isSavingExpense}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm active:scale-95"
              disabled={isSavingExpense}
            >
              {isSavingExpense && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isSavingExpense ? 'Saving...' : 'Log Expense'}
            </button>
          </div>
        </form>
      </Drawer>

    </div>
  );
};
