import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { Drawer } from '../../../components/common/Drawer';
import { apiService } from '../../../services/api';
import {
  UserPlus,
  Mail,
  Shield,
  Users,
  Check,
  Activity,
  UserCheck,
  Calendar
} from 'lucide-react';
import { cn, formatDate } from '../../../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import toast from 'react-hot-toast';

const inviteSchema = zod.object({
  email: zod.string().email({ message: "Invalid email format" }),
  role: zod.enum(['admin', 'manager', 'accountant', 'viewer']),
});

type InviteFormValues = zod.infer<typeof inviteSchema>;

export const TeamDashboard: React.FC = () => {
  const [members, setMembers] = useState<any[]>([
    { id: "m-1", name: "Alex Sterling", email: "alex@grivetyglobal.app", role: "admin", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", status: "active", activeDate: "Today" },
    { id: "m-2", name: "Sarah Jenkins", email: "sarah@acme.com", role: "manager", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", status: "active", activeDate: "1 hour ago" },
    { id: "m-3", name: "David Chen", email: "david@starlight.io", role: "accountant", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", status: "active", activeDate: "Yesterday" }
  ]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'viewer' }
  });

  const loadLogs = async () => {
    setLoading(true);
    try {
      const audit = await apiService.getAuditLogs();
      setLogs(audit);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleInviteSubmit = async (values: InviteFormValues) => {
    try {
      const emailName = values.email.split('@')[0];
      const nextMember = {
        id: `m-${Date.now()}`,
        name: emailName.charAt(0).toUpperCase() + emailName.slice(1) + " (Invited)",
        email: values.email,
        role: values.role,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        status: "pending",
        activeDate: "Never"
      };

      setMembers([...members, nextMember]);
      toast.success(`Invitation link dispatched successfully to ${values.email}!`);
      setDrawerOpen(false);
      reset();
    } catch (e) {
      console.error(e);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/15 text-[9px] font-extrabold uppercase select-none tracking-wide flex items-center gap-1 w-fit"><Shield className="w-2.5 h-2.5 shrink-0" />Admin</span>;
      case 'manager': return <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/15 text-[9px] font-extrabold uppercase select-none tracking-wide flex items-center gap-1 w-fit"><Shield className="w-2.5 h-2.5 shrink-0" />Manager</span>;
      case 'accountant': return <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 text-[9px] font-extrabold uppercase select-none tracking-wide flex items-center gap-1 w-fit"><Shield className="w-2.5 h-2.5 shrink-0" />Accountant</span>;
      default: return <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:border-slate-700/60 text-[9px] font-extrabold uppercase select-none tracking-wide flex items-center gap-1 w-fit"><Shield className="w-2.5 h-2.5 shrink-0" />Viewer</span>;
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in pb-12">
      <PageHeader
        title="Team Management"
        description="Invite company accounts, configure detailed role-based access lists, and review system audit trails."
        actions={
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/95 transition-all select-none active:scale-95 shadow-md shadow-indigo-500/5"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        }
      />

      {/* Member List Grid & System Log Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start select-none">

        {/* Left: Member Cards */}
        <div className="lg:col-span-2 space-y-4 select-none">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block px-1">Workspace Members ({members.length})</span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-5 border rounded-xl bg-card text-card-foreground shadow-premium flex items-center justify-between gap-4 select-none"
              >
                <div className="flex items-center gap-3 select-none">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-lg object-cover border ring-1 ring-border shadow-sm shrink-0"
                  />
                  <div>
                    <span className="block text-xs font-bold text-foreground">{member.name}</span>
                    <span className="block text-[10px] text-muted-foreground font-mono mt-0.5 truncate max-w-[140px]">{member.email}</span>
                    <div className="mt-2.5 shrink-0">
                      {getRoleBadge(member.role)}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 select-none">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-extrabold border select-none uppercase tracking-wide",
                    member.status === 'active'
                      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/15"
                      : "text-amber-500 bg-amber-500/10 border-amber-500/15"
                  )}>
                    {member.status}
                  </span>
                  <span className="block text-[9px] text-slate-400 font-semibold mt-2">Active: {member.activeDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MEMBER INVITE SLIDE-OUT DRAWER */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Invite Member to Workspace"
        size="sm"
      >
        <form onSubmit={handleSubmit(handleInviteSubmit)} className="space-y-4 text-xs font-semibold select-none pb-6">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground font-bold tracking-wide uppercase">Member Contact E-mail</label>
            <div className="relative group">
              <input
                type="email"
                required
                placeholder="developer@GrivetyGlobal.app"
                {...register("email")}
                className={cn(
                  "w-full px-3 py-2 pl-8 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70",
                  errors.email ? "border-rose-500/70" : ""
                )}
              />
              <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>
            {errors.email && <span className="text-[9px] text-rose-500 font-bold">{errors.email.message}</span>}
          </div>

          {/* Role selector */}
          <div className="flex flex-col gap-1.5 select-none">
            <label className="text-muted-foreground font-bold tracking-wide uppercase">Access Role Permissions</label>
            <select
              {...register("role")}
              className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70"
            >
              <option value="admin">Admin - Full access credentials</option>
              <option value="manager">Manager - Mapped clients & invoices access</option>
              <option value="accountant">Accountant - Invoices & payments ledgers only</option>
              <option value="viewer">Viewer - Read-only dashboard viewer</option>
            </select>
          </div>

          {/* Bullet points info */}
          <div className="p-4 rounded-xl border bg-slate-50/50 dark:bg-[#0b101c]/15 text-[10px] font-semibold text-muted-foreground select-none shrink-0 space-y-1.5 leading-relaxed">
            <span className="block font-bold text-foreground">Invitation details checklist:</span>
            <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" />Member receives secure login invitation key via mail</div>
            <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" />Permissions can be modified later in settings section</div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end pt-4 border-t select-none shrink-0 mt-4">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-muted text-foreground transition-all select-none active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/95 transition-all select-none active:scale-95 shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  Dispatching...
                </>
              ) : (
                "Dispatch Link"
              )}
            </button>
          </div>

        </form>
      </Drawer>

    </div>
  );
};
