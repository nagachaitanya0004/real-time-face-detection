/**
 * Purpose: Error boundary component to prevent full application crashes.
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Standard React Error Boundary.
 */
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
        <div className="p-6 bg-red-900/20 border border-red-800 rounded-lg flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="text-red-500" size={48} />
          <div>
            <h2 className="text-xl font-bold text-red-100">Something went wrong.</h2>
            <p className="text-sm text-red-400 mt-1">Try refreshing the page or checking your connection.</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-sm transition-colors"
          >
            Refresh App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
