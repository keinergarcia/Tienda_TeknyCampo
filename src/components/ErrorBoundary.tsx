import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="font-display font-bold text-2xl text-gray-900 mb-4">
              Algo salio mal
            </h1>
            <p className="text-gray-600 mb-2">
              Ocurrio un error inesperado. Por favor, intenta recargar la pagina.
            </p>
            {this.state.error && (
              <p className="text-sm text-gray-400 mb-6 font-mono bg-gray-100 p-3 rounded-lg truncate">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recargar Pagina
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
