import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  
  const saved = localStorage.getItem('GrivetyGlobal_theme');
  if (saved !== 'light') {
    localStorage.setItem('GrivetyGlobal_theme', 'light');
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
    }
  }
  return 'light';
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('GrivetyGlobal_theme', nextTheme);
    
    // Apply DOM updates directly
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return { theme: nextTheme };
  }),
  setTheme: (theme) => set(() => {
    localStorage.setItem('GrivetyGlobal_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme };
  })
}));
