import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 select-none">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Oops! Something went wrong
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
              An unexpected error occurred while rendering this page. Don't worry, your data is safe.
            </p>
            
            <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4 mb-8 text-left overflow-x-auto">
              <code className="text-xs text-red-500 break-words">
                {this.state.error?.message || "Unknown rendering error"}
              </code>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center w-full gap-2 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/25"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
