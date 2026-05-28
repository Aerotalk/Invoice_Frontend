import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: number;
  isCurrency?: boolean;
  currencyCode?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  loading?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  isCurrency = true,
  currencyCode = 'USD',
  icon: Icon,
  trend,
  description,
  loading = false,
  color = 'primary'
}) => {
  const getGlowStyle = () => {
    switch (color) {
      case 'success': return 'hover:shadow-glow-success border-emerald-500/10 dark:border-emerald-500/5 hover:border-emerald-500/20';
      case 'warning': return 'hover:shadow-glow border-amber-500/10 dark:border-amber-500/5 hover:border-amber-500/20';
      case 'danger': return 'hover:shadow-glow border-rose-500/10 dark:border-rose-500/5 hover:border-rose-500/20';
      default: return 'hover:shadow-glow border-primary-500/10 dark:border-primary-500/5 hover:border-primary-500/20';
    }
  };

  const getIconColor = () => {
    switch (color) {
      case 'success': return 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/5';
      case 'warning': return 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/5';
      case 'danger': return 'text-rose-500 bg-rose-500/10 dark:bg-rose-500/5';
      default: return 'text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/5';
    }
  };

  const formattedValue = isCurrency ? formatCurrency(value, currencyCode) : value.toLocaleString();

  if (loading) {
    return (
      <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-premium select-none animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="mt-4 h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="mt-2 h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "p-6 rounded-xl border bg-card text-card-foreground shadow-premium transition-all duration-300 relative overflow-hidden group select-none hover:-translate-y-[2px]",
        getGlowStyle()
      )}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-primary-500/10 transition-all duration-300" />
      
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground/80 transition-colors">
          {title}
        </span>
        <div className={cn("p-2 rounded-lg transition-transform duration-300 group-hover:scale-110", getIconColor())}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold tracking-tight text-foreground transition-all duration-300 group-hover:text-gradient">
          {formattedValue}
        </h3>
        {trend && (
          <span className={cn(
            "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border shadow-[0_1px_1px_rgba(0,0,0,0.01)]",
            trend.isPositive 
              ? "text-success bg-emerald-500/10 border-emerald-500/10" 
              : "text-rose-500 bg-rose-500/10 border-rose-500/10"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>

      {(description || trend) && (
        <p className="mt-2 text-xs text-muted-foreground transition-colors group-hover:text-muted-foreground/80">
          {description || (trend?.isPositive ? "Up from last month" : "Down from last month")}
        </p>
      )}
    </motion.div>
  );
};
