import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { GlobalCommandPalette } from '../components/layout/GlobalCommandPalette';
import { AICopilotDrawer } from '../components/layout/AICopilotDrawer';
import { useSidebarStore } from '../store/sidebarStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardLayout: React.FC = () => {
  const { isCollapsed, isMobileOpen, setMobileOpen } = useSidebarStore();
  const { isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();

  // Apply default theme class to document body on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Protect path: Redirect to login if unauthenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex select-none relative transition-colors duration-300">
      
      {/* Background Ambient Glows */}
      <div className={cn(
        "absolute inset-0 pointer-events-none z-0 transition-opacity duration-300 shrink-0",
        theme === 'dark' ? "ambient-gradient-dark" : "ambient-gradient"
      )} />

      {/* 1. DESKTOP SIDEBAR MENU (Hidden on Mobile) */}
      <Sidebar className="hidden md:flex shrink-0" />

      {/* 2. MOBILE MENU DRAWER OVERLAY */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex select-none">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-[2px]"
            />
            {/* Sliding Mobile Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-[240px] h-full"
            >
              <Sidebar className="w-full flex h-full border-r" />
              
              {/* Close Button overlay */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-[-44px] p-2 bg-card border rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground shadow-lg select-none active:scale-90 shrink-0"
              >
                <X className="w-4.5 h-4.5 shrink-0" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MAIN CONTAINER VIEWPORT */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 relative z-10",
        isCollapsed ? "md:pl-[72px]" : "md:pl-[240px]"
      )}>
        {/* Sticky top Nav */}
        <Navbar />

        {/* Scrollable page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-[1600px] w-full mx-auto relative select-none">
          <Outlet />
        </main>
      </div>

      {/* 4. GLOBAL SPOTLIGHT CMD+K SEARCH MENU */}
      <GlobalCommandPalette />

      {/* 5. AI ASSISTANT PANEL */}
      {/* <AICopilotDrawer /> */}
    </div>
  );
};
