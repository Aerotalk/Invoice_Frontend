import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Drawer } from '../../../components/common/Drawer';
import { apiService } from '../../../services/api';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Link } from 'react-router-dom';
import { FolderGit, Plus, Briefcase, Calendar, Users, ChevronDown, Search } from 'lucide-react';
import { cn } from '../../../lib/utils';
import toast from 'react-hot-toast';

export const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { currency } = usePreferencesStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [vendorIds, setVendorIds] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [projectCurrency, setProjectCurrency] = useState(currency || 'INR');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [projectStatus, setProjectStatus] = useState<'planning' | 'in-progress' | 'on-hold'>('planning');

  // Custom multi-select states
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const [vendorSearch, setVendorSearch] = useState('');
  const [showVendorError, setShowVendorError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync project currency with preference when loaded
  useEffect(() => {
    if (currency) {
      setProjectCurrency(currency);
    }
  }, [currency]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setVendorDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projRes, cliRes, vendRes] = await Promise.all([
        apiService.getProjects(),
        apiService.getClients(),
        apiService.getVendors()
      ]);
      setProjects(projRes);
      setClients(cliRes);
      setVendors(vendRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId || vendorIds.length === 0 || !budget || !dueDate) {
      setShowVendorError(vendorIds.length === 0);
      toast.error("Please fill all required fields.");
      return;
    }

    const client = clients.find(c => c.id === clientId);
    const selectedVendors = vendors.filter(v => vendorIds.includes(v.id)).map(v => ({ id: v.id, name: v.name }));

    if (!client || selectedVendors.length === 0) return;

    setIsSubmitting(true);
    try {
      const newProj = await apiService.createProject({
        name,
        clientId,
        clientName: client.name,
        vendors: selectedVendors,
        budget: Number(budget),
        currency: projectCurrency,
        dueDate,
        status: projectStatus,
        description: description || undefined,
        teamMembers: [
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        ]
      } as any);

      setProjects([newProj, ...projects]);
      setDrawerOpen(false);
      // Reset form
      setName('');
      setClientId('');
      setVendorIds([]);
      setVendorSearch('');
      setShowVendorError(false);
      setBudget('');
      setProjectCurrency(currency || 'INR');
      setDueDate('');
      setDescription('');
      setProjectStatus('planning');
      toast.success("Project created successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fade-in">
      <PageHeader
        title="Projects"
        description="Manage client projects, track budgets, and upload vendor invoices."
        actions={
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/95 transition-all select-none active:scale-95 shadow-md shadow-indigo-500/5"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        }
      />

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 select-none">
        {projects.map((proj) => (
          <div 
            key={proj.id} 
            className="p-5 border rounded-lg bg-card text-card-foreground flex flex-col justify-between gap-5 select-none hover:border-slate-300 dark:hover:border-slate-700 transition-colors relative"
          >
            
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <Link 
                  to={`/dashboard/projects/${proj.id}`} 
                  className="block text-sm font-bold text-foreground hover:underline hover:text-primary transition-colors"
                >
                  {proj.name}
                </Link>
                <div className="text-[10px] text-muted-foreground uppercase flex flex-col gap-1 mt-2 font-semibold">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    Client: <span className="text-foreground">{proj.clientName}</span>
                  </span>
                  {proj.vendors && proj.vendors.length > 0 && (
                    <span className="flex items-start gap-1">
                      <FolderGit className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-muted-foreground mb-0.5">Vendors:</span>
                        {proj.vendors.map((v: any) => (
                          <span key={v.id} className="text-foreground">{v.name}</span>
                        ))}
                      </div>
                    </span>
                  )}
                </div>
              </div>
              <StatusBadge status={proj.status} />
            </div>

            {/* Budget & Team ring */}
            <div className="flex items-center justify-between select-none">
              <div>
                <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Project Scope</span>
                <span className="block text-xs font-bold text-foreground font-mono mt-0.5">
                  {formatCurrency(proj.budget, proj.currency || currency)}
                </span>
              </div>

              {/* Overlapping Avatars Group */}
              <div className="flex items-center -space-x-2 overflow-hidden shrink-0 select-none">
                {proj.teamMembers.map((av: string, aIdx: number) => (
                  <img
                    key={aIdx}
                    src={av}
                    alt="Team Avatar"
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-card object-cover shrink-0 select-none"
                  />
                ))}
              </div>
            </div>

            {/* Footer triggers */}
            <div className="border-t pt-4 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                Due: {formatDate(proj.dueDate)}
              </span>
              <Link 
                to={`/dashboard/projects/${proj.id}`} 
                className="text-primary hover:underline hover:underline-offset-2 flex items-center gap-1 active:scale-95"
              >
                View Details
              </Link>
            </div>

          </div>
        ))}
      </div>

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add New Project"
        size="lg"
      >
        <form onSubmit={handleCreateProject} className="space-y-5 text-sm p-2 pb-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm border-slate-300 dark:border-slate-700"
              placeholder="e.g. Website Redesign"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm border-slate-300 dark:border-slate-700"
              placeholder="Brief project scope (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client *</label>
              <select
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm cursor-pointer border-slate-300 dark:border-slate-700"
              >
                <option value="">Select Client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-7 space-y-1.5 relative" ref={dropdownRef}>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vendors *</label>
              
              {/* Dropdown Button */}
              <button
                type="button"
                onClick={() => setVendorDropdownOpen(!vendorDropdownOpen)}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg bg-card text-left text-sm cursor-pointer flex items-center justify-between transition-colors focus:border-primary",
                  vendorIds.length === 0 && showVendorError ? "border-rose-500" : "border-slate-300 dark:border-slate-700"
                )}
              >
                <span className="truncate text-xs font-medium text-foreground">
                  {vendorIds.length === 0 
                    ? "Select Vendors" 
                    : `${vendorIds.length} Vendor${vendorIds.length > 1 ? 's' : ''} Selected`}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {/* Selected vendor badges list below the button for quick view & removal */}
              {vendorIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1 max-h-20 overflow-y-auto">
                  {vendors.filter(v => vendorIds.includes(v.id)).map(v => (
                    <span 
                      key={v.id} 
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold"
                    >
                      {v.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVendorIds(vendorIds.filter(id => id !== v.id));
                        }}
                        className="hover:text-rose-500 font-extrabold focus:outline-none ml-0.5 text-[8px]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Dropdown Panel */}
              {vendorDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 border rounded-lg bg-card shadow-lg max-h-60 overflow-y-auto p-2 space-y-1 border-slate-200 dark:border-slate-800 animate-fade-in-up">
                  {/* Search bar inside dropdown */}
                  <div className="relative mb-2 shrink-0">
                    <input
                      type="text"
                      placeholder="Search vendors..."
                      value={vendorSearch}
                      onChange={(e) => setVendorSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border rounded-md bg-slate-50 dark:bg-slate-900/50 outline-none text-xs focus:border-primary border-slate-300 dark:border-slate-700"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>

                  {/* Vendor Items List */}
                  <div className="space-y-0.5 overflow-y-auto max-h-40">
                    {vendors.filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase())).length > 0 ? (
                      vendors.filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase())).map(v => {
                        const isChecked = vendorIds.includes(v.id);
                        return (
                          <label
                            key={v.id}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-xs font-semibold text-foreground select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setVendorIds(vendorIds.filter(id => id !== v.id));
                                } else {
                                  setVendorIds([...vendorIds, v.id]);
                                }
                              }}
                              className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary cursor-pointer"
                            />
                            <span>{v.name}</span>
                          </label>
                        );
                      })
                    ) : (
                      <div className="text-center py-4 text-xs text-muted-foreground">
                        No vendors found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Budget *</label>
              <div className="flex rounded-lg border border-slate-300 dark:border-slate-700 bg-card overflow-hidden focus-within:border-primary transition-colors">
                <select
                  value={projectCurrency}
                  onChange={(e) => setProjectCurrency(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700 text-xs font-bold text-foreground outline-none cursor-pointer shrink-0"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
                <input
                  type="number"
                  required
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent outline-none text-sm text-foreground"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm border-slate-300 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Initial Status</label>
            <select
              value={projectStatus}
              onChange={(e) => setProjectStatus(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary transition-colors text-sm border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-muted font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all select-none active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

