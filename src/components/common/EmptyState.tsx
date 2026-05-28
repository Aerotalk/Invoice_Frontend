import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  action,
  className
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed rounded-xl bg-card/40 backdrop-blur-sm select-none",
        className
      )}
    >
      {Icon ? (
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800/80 text-muted-foreground mb-4 shrink-0 transition-transform hover:rotate-6 duration-300">
          <Icon className="w-8 h-8" />
        </div>
      ) : (
        // Premium default Vector graphic
        <svg className="w-16 h-16 text-muted-foreground/60 mb-4 animate-bounce-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
      )}

      <h3 className="text-lg font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-300 hover:shadow-premium select-none active:scale-[0.98]"
        >
          {action.icon && <action.icon className="w-4 h-4 shrink-0" />}
          {action.label}
        </button>
      )}
    </motion.div>
  );
};
