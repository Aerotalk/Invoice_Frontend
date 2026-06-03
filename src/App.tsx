import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes';
import { useAuthStore } from './store/authStore';
import { usePreferencesStore } from './store/preferencesStore';
import { apiService } from './services/api';
import './App.css';

// Initialise TanStack query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

function App() {
  const fetchMe = useAuthStore(state => state.fetchMe);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const setCurrency = usePreferencesStore(state => state.setCurrency);
  const setDefaultTaxRate = usePreferencesStore(state => state.setDefaultTaxRate);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMe();
      apiService.getSettings().then(settings => {
        if (settings) {
          if (settings.standardBaseCurrency) setCurrency(settings.standardBaseCurrency);
          if (settings.standardTaxGst !== undefined) setDefaultTaxRate(settings.standardTaxGst);
        }
      }).catch(console.error);
    }
  }, [isAuthenticated, fetchMe, setCurrency, setDefaultTaxRate]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
