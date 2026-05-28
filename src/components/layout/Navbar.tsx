import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  DollarSign, 
  LogOut, 
  User, 
  Moon, 
  Sun, 
  Clock, 
  Bot, 
  ChevronDown, 
  Globe,
  Settings,
  CreditCard
} from 'lucide-react';
import { useSidebarStore } from '../../store/sidebarStore';
import { useThemeStore } from '../../store/themeStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useTimerStore } from '../../store/timerStore';
import { useCommandStore } from '../../store/commandStore';
import { useAIStore } from '../../store/aiStore';
import { useAuthStore } from '../../store/authStore';
import { NotificationCenter } from './NotificationCenter';
import { cn } from '../../lib/utils';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { toggleMobileOpen } = useSidebarStore();
  const { toggleTheme, theme } = useThemeStore();
  const { currency, setCurrency } = usePreferencesStore();
  const { isRunning, seconds, stopAndLogTimer, taskName, projectName } = useTimerStore();
  const { setOpen: setCommandOpen } = useCommandStore();
  const { toggleOpen: toggleAIOpen } = useAIStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Time formatter helper
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Breadcrumbs logic
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p && p !== 'dashboard');
    if (paths.length === 0) return [{ label: 'Overview', active: true, href: undefined }];

    return paths.map((p, idx) => {
      const isLast = idx === paths.length - 1;
      let label = p.charAt(0).toUpperCase() + p.slice(1);
      
      // Formatting specific routes nicely
      if (label === 'Time-tracking') label = 'Time Tracking';
      if (label === 'Settings') label = 'Settings';
      if (label === 'Subscription') label = 'SaaS Subscription';
      
      return {
        label,
        active: isLast,
        href: isLast ? undefined : `/dashboard/${p}`
      };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 sticky top-0 z-30 bg-card/85 backdrop-blur-md border-b flex items-center justify-between px-4 md:px-6 select-none shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
      {/* Navbar Left: Sidebar Toggles & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileOpen}
          className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted md:hidden transition-colors border select-none active:scale-95 shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Dynamic Breadcrumbs Trails */}
        <nav className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground select-none">
          <Link to="/dashboard" className="hover:text-foreground transition-colors shrink-0">
            InvoiceIQ
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <span className="text-slate-400 shrink-0 select-none">/</span>
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-foreground transition-colors shrink-0">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground/80 font-extrabold truncate max-w-[120px]">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Navbar Right: Analytics / Controls Toolbar */}
      <div className="flex items-center gap-2.5">
        
        {/* ACTIVE TIMER METRIC (Extra Premium Feature) */}
        {isRunning && (
          <div className="flex items-center gap-2 px-3 py-1.5 border border-red-500/20 bg-rose-500/5 dark:bg-rose-500/10 rounded-lg text-xs font-bold text-rose-500 select-none shadow-glow animate-fade-in shrink-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <Clock className="w-3.5 h-3.5 animate-spin-slow shrink-0 hidden sm:inline" />
            <span className="font-mono text-[11px] font-extrabold tracking-wider">{formatTime(seconds)}</span>
            <span className="text-slate-400 font-normal hidden lg:inline max-w-[100px] truncate">
              ({projectName})
            </span>
            <button
              onClick={() => stopAndLogTimer().then(success => success && alert("Timer Entry logged successfully!"))}
              className="px-2 py-0.5 ml-1 bg-rose-500 text-white rounded text-[10px] font-extrabold hover:bg-rose-600 active:scale-95 transition-all select-none shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
            >
              Stop & Log
            </button>
          </div>
        )}

        {/* Global smart command search trigger */}
        <button
          onClick={() => setCommandOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 border bg-slate-50/50 dark:bg-[#0b101c]/20 hover:bg-muted text-xs font-medium text-muted-foreground rounded-lg select-none hover:text-foreground active:scale-95 transition-all shrink-0"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:inline">Search...</span>
          <kbd className="hidden md:inline-flex items-center px-1 rounded border text-[9px] font-semibold bg-card">
            ⌘K
          </kbd>
        </button>

        {/* AI copilot panel trigger */}
        <button
          onClick={toggleAIOpen}
          className="p-2 rounded-lg text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 transition-colors border select-none shrink-0 active:scale-95"
          title="Open AI Copilot Sidebar"
        >
          <Bot className="w-4 h-4 text-indigo-500" />
        </button>



        {/* Theme mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border select-none shrink-0 active:scale-95"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Unread Alerts Dropdown popover */}
        <NotificationCenter />

        {/* Border Spacer Divider */}
        <div className="h-6 w-px bg-border select-none shrink-0" />

        {/* User Identity profile Dropdown */}
        {user && (
          <div className="relative shrink-0 select-none">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-1.5 rounded-lg focus:outline-none transition-all duration-200"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-border shadow-sm border shrink-0 hover:scale-105 transition-transform"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            </button>
            
            {profileDropdownOpen && (
              <>
                <div 
                  onClick={() => setProfileDropdownOpen(false)}
                  className="fixed inset-0 z-40 select-none" 
                />
                
                <div className="absolute right-0 mt-2.5 w-52 bg-card border rounded-xl shadow-2xl z-50 overflow-hidden select-none divide-y text-xs">
                  {/* Bio */}
                  <div className="p-4 bg-slate-50/50 dark:bg-[#0b101c]/15">
                    <span className="block font-bold text-foreground truncate">{user.name}</span>
                    <span className="block text-[10px] text-muted-foreground truncate uppercase font-extrabold tracking-wider">{user.role} account</span>
                  </div>

                  {/* Actions */}
                  <div className="py-1">
                    <Link
                      to="/dashboard/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-muted text-foreground/80 transition-colors font-semibold"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      View Profile
                    </Link>

                  </div>

                  {/* Logout */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-rose-500/10 hover:text-rose-500 text-rose-500/90 transition-colors font-semibold text-left select-none"
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
