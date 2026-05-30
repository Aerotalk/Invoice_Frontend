import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Briefcase,
  UploadCloud,
  FileText,
  FolderGit,
  Eye,
  Plus
} from 'lucide-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Drawer } from '../../../components/common/Drawer';
import { apiService } from '../../../services/api';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { formatCurrency, formatDate, cn } from '../../../lib/utils';
import { ProjectInvoice } from '../../../types';
import toast from 'react-hot-toast';

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Invoice Form State
  const [invId, setInvId] = useState('');
  const [invDesc, setInvDesc] = useState('');
  const [invDate, setInvDate] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { currency } = usePreferencesStore();

  const loadProject = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiService.getProjectById(id);
      setProject(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!project || !invId || !invDesc || !invDate || !file) {
      toast.error("Please fill all details and select a document.");
      return;
    }

    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(async () => {
      try {
        const fakeUrl = `https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300&random=${Date.now()}`;
        const newInvoice: ProjectInvoice = {
          id: `inv-${Date.now()}`,
          invoiceId: invId,
          description: invDesc,
          date: invDate,
          url: fakeUrl
        };
        const updatedProj = await apiService.uploadProjectInvoice(project.id, newInvoice);
        setProject(updatedProj);
        setDrawerOpen(false);
        // Reset form
        setInvId('');
        setInvDesc('');
        setInvDate('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error("Upload failed", error);
      } finally {
        setIsUploading(false);
      }
    }, 1500);
  };

  if (loading || !project) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fade-in pb-12">
      
      {/* Back button */}
      <Link 
        to="/dashboard/projects" 
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors select-none active:scale-95 shrink-0"
      >
        <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
        Back to Projects
      </Link>

      {/* Project KPI Summary Card */}
      <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-premium flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative select-none">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 select-none">
            <h2 className="text-xl font-extrabold text-foreground tracking-tight leading-tight">{project.name}</h2>
            <StatusBadge status={project.status} />
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-semibold">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              Client: <span className="text-foreground">{project.clientName}</span>
            </span>
            {project.vendorName && (
              <span className="flex items-center gap-1">
                <FolderGit className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Vendor: <span className="text-foreground">{project.vendorName}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6 select-none border-border shrink-0">
          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Project Budget</span>
            <span className="block text-base font-extrabold text-foreground font-mono mt-0.5">{formatCurrency(project.budget, project.currency || currency)}</span>
            <span className="block text-[9px] text-muted-foreground font-semibold mt-1">Due: {formatDate(project.dueDate)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* INVOICE UPLOADS TABLE SECTION */}
        <div className="border rounded-xl bg-card shadow-premium select-none overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 select-none">
                <FileText className="w-4 h-4 text-primary" />
                Project Invoices
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Manage vendor invoices related to this project.</p>
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/95 transition-all select-none active:scale-95 shadow-md shadow-indigo-500/5"
            >
              <Plus className="w-4 h-4" />
              Upload Invoice
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Invoice ID</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {project.invoices && project.invoices.filter((inv: any) => inv && inv.invoiceId && inv.invoiceId.trim() !== '').length > 0 ? (
                  project.invoices.filter((inv: any) => inv && inv.invoiceId && inv.invoiceId.trim() !== '').map((inv: ProjectInvoice) => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(inv.date)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-foreground whitespace-nowrap">
                        {inv.invoiceId}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {inv.description}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a 
                          href={inv.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card text-primary text-[11px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                      No invoices uploaded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* UPLOAD INVOICE DRAWER */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Upload Project Invoice"
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
                className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm"
                placeholder="e.g. INV-2026"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date *</label>
              <input
                type="date"
                required
                value={invDate}
                onChange={(e) => setInvDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm"
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
              className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm"
              placeholder="Brief description of the invoice"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Document *</label>
            <input 
              type="file" 
              required
              ref={fileInputRef} 
              className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              accept="image/*,.pdf"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-muted font-medium transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              disabled={isUploading}
            >
              {isUploading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </Drawer>

    </div>
  );
};
