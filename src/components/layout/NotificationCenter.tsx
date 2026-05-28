import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Circle, Info, CreditCard, Receipt, FileText, Check } from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { useNotificationStore } from '../../store/notificationStore';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationCenter: React.FC = () => {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'invoice': return <FileText className="w-4 h-4 text-indigo-500 shrink-0" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'system': return <Info className="w-4 h-4 text-slate-400 shrink-0" />;
      default: return <Bell className="w-4 h-4 text-amber-500 shrink-0" />;
    }
  };

  return (
    <div ref={dropdownRef} className="relative select-none">
      {/* Trigger Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative shrink-0 active:scale-95 border",
          isOpen ? "bg-muted text-foreground" : ""
        )}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-card animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2.5 w-[340px] bg-card border rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[420px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b shrink-0 bg-slate-50/50 dark:bg-[#0b101c]/10">
              <h4 className="text-sm font-bold text-foreground">Notifications</h4>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs font-semibold text-primary hover:text-primary-700 transition-colors flex items-center gap-1 active:scale-95"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-border scrollbar-thin">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    className={cn(
                      "p-4 flex gap-3 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/20 transition-all select-none relative group",
                      !notif.isRead ? "bg-primary-50/20 dark:bg-primary-500/5 font-medium" : ""
                    )}
                  >
                    {/* Icon */}
                    <div className="mt-0.5 shrink-0">
                      {getIcon(notif.type)}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-xs font-bold text-foreground truncate">{notif.title}</h5>
                        {!notif.isRead && (
                          <Circle className="w-1.5 h-1.5 fill-primary text-primary shrink-0 animate-pulse" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {notif.description}
                      </p>
                      <span className="mt-1.5 block text-[9px] font-bold text-muted-foreground select-none uppercase tracking-wider">
                        {formatDate(notif.date)}
                      </span>
                    </div>

                    {/* Mark read check shortcut */}
                    {!notif.isRead && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 bg-card border rounded hover:bg-muted text-primary transition-all shrink-0 select-none active:scale-90"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-muted-foreground select-none">
                  No notifications recorded.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-3 text-center shrink-0 bg-slate-50/50 dark:bg-[#0b101c]/10">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Showing recent {notifications.length} logs
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
