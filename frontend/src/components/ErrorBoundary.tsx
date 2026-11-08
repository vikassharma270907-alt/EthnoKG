import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
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
    console.error('EthnoKG ErrorBoundary caught an unhandled exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-[#090a0f] text-zinc-100">
          <div className="max-w-lg w-full p-8 rounded-2xl bg-[#111319] border border-zinc-800 shadow-2xl text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 shadow-lg shadow-amber-950/20">
              <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
            </div>

            <h2 className="text-xl font-bold tracking-tight text-white mb-2">
              {this.props.fallbackTitle || 'Component Rendering Interrupted'}
            </h2>

            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              EthnoKG encountered an unexpected error while rendering this visualization. Your data session remains safe in memory.
            </p>

            {this.state.error && (
              <div className="w-full text-left mb-6 p-3 rounded-xl bg-[#161822] border border-zinc-800 font-mono text-[11px] text-zinc-400 overflow-x-auto max-h-32 scrollbar-thin">
                <span className="text-rose-400">{this.state.error.name}:</span> {this.state.error.message}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <button
                onClick={this.handleReload}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-zinc-200 to-slate-100 hover:from-white hover:to-zinc-200 text-zinc-950 flex items-center gap-2 shadow-md shadow-black/40 transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-zinc-900" />
                <span>Reload Platform</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
