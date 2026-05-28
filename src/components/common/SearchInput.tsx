import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChangeValue: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeValue,
  placeholder = "Search dashboard...",
  className,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus shortcut helper
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={cn("relative w-full max-w-md group select-none", className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-indigo-500 transition-colors">
        <Search className="w-4 h-4" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-14 py-2 text-sm border bg-card/60 backdrop-blur-sm rounded-lg outline-none focus:bg-card focus:border-indigo-500/70 dark:focus:border-indigo-500/50 transition-all duration-300 placeholder:text-muted-foreground shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
        {...props}
      />
      
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1.5 pointer-events-none">
        {value ? (
          <button
            type="button"
            onClick={() => onChangeValue("")}
            className="pointer-events-auto p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border bg-muted text-[10px] text-muted-foreground font-semibold font-mono tracking-wide shadow-[0_1px_1px_rgba(0,0,0,0.01)]">
            <span className="text-[9px]">⌘</span>K
          </kbd>
        )}
      </div>
    </div>
  );
};
