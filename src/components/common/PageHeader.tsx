import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  className
}) => {
  return (
    <div className={cn("flex flex-col gap-3 md:flex-row md:items-center md:justify-between pb-6 select-none", className)}>
      <div className="flex-1 min-w-0">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
            </Link>
            {breadcrumbs.map((item, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {item.href ? (
                  <Link to={item.href} className="hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-foreground/80 font-semibold">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground transition-all duration-300">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2 md:line-clamp-none">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 shrink-0 mt-3 md:mt-0 overflow-x-auto whitespace-nowrap pb-1 md:pb-0 scrollbar-none">
          {actions}
        </div>
      )}
    </div>
  );
};
