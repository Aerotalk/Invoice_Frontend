import React, { useState, useEffect } from 'react';
import { Plus, Users, Eye, MoreHorizontal, FilePlus, UserCheck, Briefcase } from 'lucide-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Drawer } from '../../../components/common/Drawer';
import { apiService } from '../../../services/api';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { cn } from '../../../lib/utils';

// Client Form Schema
const clientSchema = zod.object({
  name: zod.string().min(2, { message: "Name must be at least 2 characters" }),
  company: zod.string().min(2, { message: "Company name must be at least 2 characters" }),
  email: zod.string().email({ message: "Invalid email format" }),
  phone: zod.string().min(6, { message: "Invalid phone number format" }),
  avatar: zod.string().url({ message: "Avatar must be a valid Unsplash or image URL" }).optional().or(zod.literal("")),
  status: zod.enum(['active', 'inactive']),
  notes: zod.string().optional()
});

type ClientFormValues = zod.infer<typeof clientSchema>;

export const ClientsList: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeClientMenu, setActiveClientMenu] = useState<string | null>(null);
  const { currency } = usePreferencesStore();
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      status: 'active',
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      notes: ""
    }
  });

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await apiService.getClients();
      setClients(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const onSubmitClient = async (values: ClientFormValues) => {
    try {
      const payload = {
        ...values,
        avatar: values.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        notes: values.notes || ""
      };
      await apiService.createClient(payload);
      alert("Client added successfully!");
      setDrawerOpen(false);
      reset();
      loadClients();
    } catch (e) {
      console.error(e);
    }
  };

  // Define Columns for DataTable
  const columns: ColumnDef<any>[] = [
    {
      header: "Client & Company",
      accessorKey: "name",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3 select-none">
          <img 
            src={row.avatar} 
            alt={row.name} 
            className="w-8 h-8 rounded-lg object-cover border ring-1 ring-border shadow-sm shrink-0" 
          />
          <div>
            <Link 
              to={`/dashboard/clients/${row.id}`} 
              className="block text-xs font-bold text-foreground hover:text-primary hover:underline"
            >
              {row.name}
            </Link>
            <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 font-semibold">
              <Briefcase className="w-3 h-3 shrink-0" />
              {row.company}
            </span>
          </div>
        </div>
      )
    },
    {
      header: "Email Contact",
      accessorKey: "email",
      cell: (row) => (
        <div className="text-xs select-none">
          <span className="block text-foreground/80 font-medium">{row.email}</span>
          <span className="block text-[10px] text-slate-400 font-mono">{row.phone}</span>
        </div>
      )
    },
    {
      header: "Billed Total",
      accessorKey: "totalBilled",
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-bold text-foreground font-mono select-none">
          {formatCurrency(row.totalBilled, currency)}
        </span>
      )
    },
    {
      header: "Outstanding",
      accessorKey: "outstandingAmount",
      sortable: true,
      cell: (row) => (
        <span className={cn(
          "text-xs font-bold font-mono select-none",
          row.outstandingAmount > 0 ? "text-amber-500" : "text-slate-400"
        )}>
          {formatCurrency(row.outstandingAmount, currency)}
        </span>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="relative select-none">
          <button
            onClick={() => setActiveClientMenu(activeClientMenu === row.id ? null : row.id)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground active:scale-95 transition-all select-none"
          >
            <MoreHorizontal className="w-4 h-4 shrink-0" />
          </button>
          
          {activeClientMenu === row.id && (
            <>
              <div 
                onClick={() => setActiveClientMenu(null)}
                className="fixed inset-0 z-40 select-none" 
              />
              <div className="absolute right-0 mt-1 w-44 bg-card border rounded-lg shadow-xl z-50 overflow-hidden divide-y text-xs font-semibold select-none">
                <Link
                  to={`/dashboard/clients/${row.id}`}
                  onClick={() => setActiveClientMenu(null)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-muted text-foreground/80 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  View Profile
                </Link>
                <Link
                  to="/dashboard/invoices/create"
                  state={{ preselectedClientId: row.id }}
                  onClick={() => setActiveClientMenu(null)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-muted text-foreground/80 transition-colors"
                >
                  <FilePlus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  Create Invoice
                </Link>
              </div>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none animate-fade-in">
      
      {/* Page Header */}
      <PageHeader
        title="Clients"
        description="Configure client details, review outstanding contracts, and check billed timeline values."
        actions={
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/95 transition-all shadow-md shadow-indigo-500/10 active:scale-95 select-none"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        }
      />

      {/* Main Clients Table */}
      <DataTable
        columns={columns}
        data={clients}
        searchKey="name"
        searchPlaceholder="Filter clients by name..."
        emptyTitle="No clients found"
        emptyDescription="Get started by clicking Add Client on the top toolbar."
        loading={loading}
      />

      {/* 3. ADD CLIENT SLIDE-OUT DRAWER */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Create Client Profile"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmitClient)} className="flex flex-col gap-4 text-xs font-semibold select-none pb-6">
          
          {/* Avatar Graphic indicator */}
          <div className="flex items-center gap-4 shrink-0 bg-slate-50/50 dark:bg-[#0b101c]/15 p-4 rounded-xl border select-none mb-2">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" 
              alt="Default Avatar"
              className="w-12 h-12 rounded-xl object-cover border shadow-sm shrink-0" 
            />
            <div>
              <span className="block font-bold text-foreground">Standard Unsplash Image Seeded</span>
              <span className="block text-[9px] text-muted-foreground mt-0.5">Customize via URL below if preferred</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Client Name */}
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
              <label className="text-muted-foreground font-bold tracking-wide uppercase">Client Full Name</label>
              <input
                type="text"
                placeholder="Sarah Jenkins"
                {...register("name")}
                className={cn(
                  "px-3 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-indigo-500/70 text-xs font-medium",
                  errors.name ? "border-rose-500/70 focus:border-rose-500" : ""
                )}
              />
              {errors.name && <span className="text-[9px] text-rose-500 font-bold">{errors.name.message}</span>}
            </div>

            {/* Company Name */}
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
              <label className="text-muted-foreground font-bold tracking-wide uppercase">Company Name</label>
              <input
                type="text"
                placeholder="Acme Corporation"
                {...register("company")}
                className={cn(
                  "px-3 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-indigo-500/70 text-xs font-medium",
                  errors.company ? "border-rose-500/70 focus:border-rose-500" : ""
                )}
              />
              {errors.company && <span className="text-[9px] text-rose-500 font-bold">{errors.company.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Contact Email */}
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
              <label className="text-muted-foreground font-bold tracking-wide uppercase">Contact Email</label>
              <input
                type="email"
                placeholder="sarah@acme.com"
                {...register("email")}
                className={cn(
                  "px-3 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-indigo-500/70 text-xs font-medium",
                  errors.email ? "border-rose-500/70 focus:border-rose-500" : ""
                )}
              />
              {errors.email && <span className="text-[9px] text-rose-500 font-bold">{errors.email.message}</span>}
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
              <label className="text-muted-foreground font-bold tracking-wide uppercase">Phone Number</label>
              <input
                type="text"
                placeholder="+1 (555) 234-5678"
                {...register("phone")}
                className={cn(
                  "px-3 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-indigo-500/70 text-xs font-medium",
                  errors.phone ? "border-rose-500/70 focus:border-rose-500" : ""
                )}
              />
              {errors.phone && <span className="text-[9px] text-rose-500 font-bold">{errors.phone.message}</span>}
            </div>
          </div>

          {/* Optional Avatar url */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground font-bold tracking-wide uppercase">Avatar Image URL (Optional)</label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/photo-..."
              {...register("avatar")}
              className="px-3 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-indigo-500/70 text-xs font-medium"
            />
            {errors.avatar && <span className="text-[9px] text-rose-500 font-bold">{errors.avatar.message}</span>}
          </div>

          {/* Status mapping */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground font-bold tracking-wide uppercase">Active Account Status</label>
            <select
              {...register("status")}
              className="px-3 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-indigo-500/70 text-xs font-medium"
            >
              <option value="active">Active Business Partner</option>
              <option value="inactive">Inactive / On-Hold Partner</option>
            </select>
          </div>

          {/* Custom notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground font-bold tracking-wide uppercase">Internal Notes & Terms</label>
            <textarea
              placeholder="Add payment terms, preferences, or project retainer notes..."
              rows={3}
              {...register("notes")}
              className="px-3 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-indigo-500/70 text-xs font-medium resize-none"
            />
          </div>

          {/* Drawer Actions */}
          <div className="flex items-center gap-3 justify-end pt-4 border-t mt-4 shrink-0 select-none">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-muted text-foreground transition-all select-none active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/95 transition-all select-none active:scale-95 shadow-md shadow-indigo-500/5"
            >
              Create Client
            </button>
          </div>

        </form>
      </Drawer>

    </div>
  );
};
