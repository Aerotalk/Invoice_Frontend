import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2,
  Package,
  FileText, 
  ClipboardList,
  Truck,
  FileCheck, 
  CreditCard, 
  Receipt, 
  FolderGit, 
  Clock, 
  BarChart3, 
  UserSquare2, 
  Settings, 
  Menu, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Zap,
  Box
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSidebarStore } from '../../store/sidebarStore';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { isCollapsed, toggleCollapse } = useSidebarStore();
  const { user } = useAuthStore();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", path: "/dashboard/clients", icon: Users },
    { name: "Vendors", path: "/dashboard/vendors", icon: Building2 },
    { name: "Products", path: "/dashboard/products", icon: Package },
    // { name: "Invoices", path: "/dashboard/invoices", icon: FileText },
    { name: "Quotations", path: "/dashboard/quotes", icon: ClipboardList },
    { name: "Delivery Challans", path: "/dashboard/challans", icon: Truck },
    // { name: "Payments", path: "/dashboard/payments", icon: CreditCard },
    { name: "Expenses", path: "/dashboard/expenses", icon: Receipt },
    { name: "Purchase Orders", path: "/dashboard/purchase-orders", icon: Box },
    { name: "Projects", path: "/dashboard/projects", icon: FolderGit },
    // { name: "Reports", path: "/dashboard/reports", icon: BarChart3 },
    // { name: "Team", path: "/dashboard/team", icon: UserSquare2 },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className={cn(
      "h-screen fixed top-0 left-0 z-40 bg-card border-r flex flex-col transition-all duration-300 select-none shadow-[1px_0_2px_rgba(0,0,0,0.01)]",
      isCollapsed ? "w-[72px]" : "w-[240px]",
      className
    )}>
      {/* Sidebar Header Brand */}
      <div className="h-16 flex items-center px-5 border-b shrink-0 bg-slate-50/50 dark:bg-[#0b101c]/10 relative">
        <Link to="/dashboard" className="flex items-center overflow-hidden shrink-0 group">
          {isCollapsed ? (
            <img
              src="/logo.png"
              alt="GrivetyGlobal"
              className="w-8 h-8 object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <img
              src="/logo.png"
              alt="GrivetyGlobal"
              className="h-28 max-w-[160px] object-contain group-hover:scale-105 transition-transform duration-300"
            />
          )}
        </Link>
        
        {/* Floating circular toggle badge half-on/half-off the right border */}
        <button 
          onClick={toggleCollapse}
          className="absolute -right-3.5 top-4.5 z-50 w-7 h-7 bg-card border rounded-full text-muted-foreground hover:text-foreground shadow-md transition-all active:scale-90 hidden md:flex items-center justify-center cursor-pointer select-none"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
        {menuItems.map((item, idx) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive: localActive }) => cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 select-none relative group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-indigo-500/10 dark:shadow-indigo-500/5 font-bold" 
                  : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/40"
              )}
            >
              <item.icon className={cn(
                "w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-white" : "text-slate-400 group-hover:text-foreground"
              )} />
              
              {!isCollapsed ? (
                <span className="truncate">{item.name}</span>
              ) : (
                /* Collapsed Hover Tooltip Overlay */
                <span className="absolute left-16 bg-slate-900 text-white dark:bg-card dark:text-foreground border dark:border-slate-800 text-[11px] font-bold px-2 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap z-50">
                  {item.name}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

    </aside>
  );
};
