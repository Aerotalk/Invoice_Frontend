import React from 'react';
import { cn } from '../../lib/utils';

export type BadgeType = 'invoice' | 'client' | 'payment' | 'project' | 'task';

interface StatusBadgeProps {
  status: string;
  type?: BadgeType;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  type = 'invoice', 
  className 
}) => {
  const norm = status.toLowerCase();

  // Color mappings
  let styles = "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700/60";
  let dotColor = "bg-slate-400";
  let label = status;

  if (norm === 'paid' || norm === 'active' || norm === 'success' || norm === 'completed') {
    styles = "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
    dotColor = "bg-emerald-500";
    label = norm === 'active' ? 'Active' : norm === 'paid' ? 'Paid' : norm === 'success' ? 'Succeeded' : 'Completed';
  } else if (norm === 'sent' || norm === 'in-progress' || norm === 'viewed') {
    styles = "bg-indigo-50 text-indigo-700 border-indigo-200/50 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20";
    dotColor = "bg-indigo-500";
    label = norm === 'sent' ? 'Sent' : norm === 'viewed' ? 'Viewed' : 'In Progress';
  } else if (norm === 'partial' || norm === 'pending' || norm === 'planning') {
    styles = "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
    dotColor = "bg-amber-500";
    label = norm === 'partial' ? 'Partially Paid' : norm === 'pending' ? 'Pending' : 'Planning';
  } else if (norm === 'overdue' || norm === 'failed' || norm === 'inactive' || norm === 'on-hold') {
    styles = "bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
    dotColor = "bg-rose-500";
    label = norm === 'overdue' ? 'Overdue' : norm === 'failed' ? 'Failed' : norm === 'inactive' ? 'Inactive' : 'On Hold';
  } else if (norm === 'draft' || norm === 'todo') {
    styles = "bg-slate-100 text-slate-600 border-slate-200/60 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/60";
    dotColor = "bg-slate-400 dark:bg-slate-500";
    label = norm === 'draft' ? 'Draft' : 'To Do';
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-[0_1px_2px_rgba(0,0,0,0.02)] select-none",
      styles,
      className
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse-slow", dotColor)} />
      {label}
    </span>
  );
};
