import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 p-4 text-white">
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-8 max-w-lg w-full shadow-2xl text-center space-y-5">
            <div className="h-14 w-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <AlertOctagon className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">Application Interface Error</h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                An unexpected UI rendering exception occurred in this component view.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-left overflow-x-auto text-[11px] font-mono text-rose-300 max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="text-xs font-semibold border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Reload Page
              </Button>

              <Button
                onClick={this.handleReset}
                className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Home className="h-3.5 w-3.5 mr-1.5" />
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
