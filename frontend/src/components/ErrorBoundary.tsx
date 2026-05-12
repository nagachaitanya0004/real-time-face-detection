import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children?: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-xl flex flex-col items-center gap-3 text-center">
          <AlertCircle className="text-red-500" size={32} />
          <div>
            <h4 className="text-sm font-bold text-red-200">{this.props.title || 'Component Error'}</h4>
            <p className="text-xs text-red-400 mt-1">Recovery failed. Please refresh.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
