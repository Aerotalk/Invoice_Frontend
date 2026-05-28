import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  FilePlus, 
  UserPlus, 
  Clock, 
  PlusCircle, 
  Moon, 
  Sun, 
  CreditCard, 
  DollarSign, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCommandStore } from '../../store/commandStore';
import { useThemeStore } from '../../store/themeStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useTimerStore } from '../../store/timerStore';
import { cn } from '../../lib/utils';

interface CommandItem {
  id: string;
  title: string;
  category: 'Actions' | 'Navigation' | 'Settings';
  icon: React.ComponentType<any>;
  shortcut?: string[];
  action: () => void;
}

export const GlobalCommandPalette: React.FC = () => {
  const { isOpen, setOpen } = useCommandStore();
  const { toggleTheme, theme } = useThemeStore();
  const { setCurrency } = usePreferencesStore();
  const { startTimer } = useTimerStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const commands: CommandItem[] = [
    // Actions Category
    {
      id: "action-create-invoice",
      title: "Create New Invoice",
      category: "Actions",
      icon: FilePlus,
      shortcut: ["N", "I"],
      action: () => { navigate("/dashboard/invoices/create"); setOpen(false); }
    },
    {
      id: "action-add-client",
      title: "Add Client Account",
      category: "Actions",
      icon: UserPlus,
      shortcut: ["N", "C"],
      action: () => { navigate("/dashboard/clients"); setOpen(false); } // Will trigger Clients drawer
    },
    {
      id: "action-start-timer",
      title: "Start Active Time Tracker",
      category: "Actions",
      icon: Clock,
      shortcut: ["T", "S"],
      action: () => { startTimer("proj-1", "Acme Portal Redesign", "Dashboard Audit"); setOpen(false); }
    },
    {
      id: "action-log-expense",
      title: "Log Expense Entry",
      category: "Actions",
      icon: PlusCircle,
      action: () => { navigate("/dashboard/expenses"); setOpen(false); }
    },
    // Navigation Category
    {
      id: "nav-invoices",
      title: "Go to Invoices Ledger",
      category: "Navigation",
      icon: ArrowRight,
      action: () => { navigate("/dashboard/invoices"); setOpen(false); }
    },
    {
      id: "nav-projects",
      title: "Go to Projects Kanban",
      category: "Navigation",
      icon: ArrowRight,
      action: () => { navigate("/dashboard/projects"); setOpen(false); }
    },
    {
      id: "nav-reports",
      title: "Open Financial Reports",
      category: "Navigation",
      icon: ArrowRight,
      action: () => { navigate("/dashboard/reports"); setOpen(false); }
    },
    // Settings Category
    {
      id: "set-theme",
      title: `Toggle Dark / Light Theme (Current: ${theme})`,
      category: "Settings",
      icon: theme === 'dark' ? Sun : Moon,
      shortcut: ["T", "G"],
      action: () => { toggleTheme(); setOpen(false); }
    },
    {
      id: "set-curr-usd",
      title: "Set Active Currency to USD ($)",
      category: "Settings",
      icon: DollarSign,
      action: () => { setCurrency("USD"); setOpen(false); }
    },
    {
      id: "set-curr-eur",
      title: "Set Active Currency to EUR (€)",
      category: "Settings",
      icon: DollarSign,
      action: () => { setCurrency("EUR"); setOpen(false); }
    }
  ];

  // Filter commands by query
  const filtered = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) || 
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  // Global key triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!isOpen);
        setQuery("");
        setSelectedIndex(0);
      }
      
      if (!isOpen) return;

      if (e.key === 'Escape') {
        setOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filtered]);

  // Focus input when loaded
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle scroll offset
  useEffect(() => {
    const activeEl = containerRef.current?.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh] select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-[2px]"
          />

          {/* Palette Box */}
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-xl bg-card border rounded-xl shadow-2xl relative z-10 flex flex-col overflow-hidden max-h-[460px]"
          >
            {/* Input Spot */}
            <div className="relative border-b shrink-0 flex items-center bg-card">
              <Search className="absolute left-4 w-4 h-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                placeholder="Type a command or search pages..."
                className="w-full pl-12 pr-4 py-4 text-sm bg-transparent outline-none border-none placeholder:text-muted-foreground text-foreground"
              />
            </div>

            {/* List Spot */}
            <div 
              ref={containerRef}
              className="flex-1 overflow-y-auto p-2 space-y-3.5 scrollbar-thin max-h-[320px] bg-slate-50/20 dark:bg-[#0b101c]/10"
            >
              {filtered.length > 0 ? (
                // Group by Category
                ['Actions', 'Navigation', 'Settings'].map(category => {
                  const items = filtered.filter(item => item.category === category);
                  if (items.length === 0) return null;

                  return (
                    <div key={category} className="space-y-1">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground select-none">
                        {category}
                      </div>
                      
                      {items.map((cmd) => {
                        const globalIndex = filtered.indexOf(cmd);
                        const isSelected = selectedIndex === globalIndex;

                        return (
                          <div
                            key={cmd.id}
                            data-active={isSelected}
                            onClick={cmd.action}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={cn(
                              "flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-lg cursor-pointer transition-colors select-none",
                              isSelected 
                                ? "bg-primary text-primary-foreground font-bold" 
                                : "text-foreground/80 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <cmd.icon className={cn("w-4 h-4 shrink-0", isSelected ? "text-white animate-pulse" : "text-muted-foreground")} />
                              <span>{cmd.title}</span>
                            </div>
                            
                            {cmd.shortcut && (
                              <div className="flex items-center gap-1 shrink-0">
                                {cmd.shortcut.map((key, kIdx) => (
                                  <kbd 
                                    key={kIdx} 
                                    className={cn(
                                      "px-1 py-0.5 rounded border text-[9px] font-mono tracking-wider shadow-[0_1px_1px_rgba(0,0,0,0.02)]",
                                      isSelected ? "bg-primary-700/50 border-primary-500/20 text-white" : "bg-muted text-muted-foreground"
                                    )}
                                  >
                                    {key}
                                  </kbd>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-sm text-muted-foreground select-none">
                  No matching shortcuts found.
                </div>
              )}
            </div>

            {/* Footer tips */}
            <div className="border-t shrink-0 p-3 flex items-center justify-between text-[10px] font-semibold text-muted-foreground bg-slate-50/50 dark:bg-[#0c1221]/80 select-none">
              <div className="flex items-center gap-2">
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
                <span>esc to exit</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                <span>Search powered by AI keys</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
