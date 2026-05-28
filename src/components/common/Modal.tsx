import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className
}) => {
  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Backdrop blur fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-[3px]"
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", duration: 0.45 }}
            className={cn(
              "w-full bg-card border rounded-xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden",
              sizes[size],
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b shrink-0 bg-card">
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-all select-none active:scale-90"
              >
                <X className="w-4 h-4 shrink-0" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 text-sm leading-relaxed text-foreground scrollbar-thin">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
