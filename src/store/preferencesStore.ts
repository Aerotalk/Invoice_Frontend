import { create } from 'zustand';

interface PreferencesState {
  currency: string;
  currencySymbol: string;
  defaultTaxRate: number;
  language: 'en' | 'es' | 'fr' | 'de';
  dashboardWidgets: string[];
  setCurrency: (currency: string) => void;
  setDefaultTaxRate: (rate: number) => void;
  setLanguage: (lang: 'en' | 'es' | 'fr' | 'de') => void;
  setDashboardWidgets: (widgets: string[]) => void;
}

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥"
};

export const usePreferencesStore = create<PreferencesState>((set) => ({
  currency: "USD",
  currencySymbol: "$",
  defaultTaxRate: 10,
  language: "en",
  dashboardWidgets: ["metrics", "earnings", "status-pie", "recent-invoices", "expenses-chart"],

  setCurrency: (currency) => set({
    currency,
    currencySymbol: currencySymbols[currency] || "$"
  }),
  
  setDefaultTaxRate: (defaultTaxRate) => set({ defaultTaxRate }),
  setLanguage: (language) => set({ language }),
  setDashboardWidgets: (dashboardWidgets) => set({ dashboardWidgets }),
}));
