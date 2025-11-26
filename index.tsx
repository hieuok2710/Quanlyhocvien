import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Explicitly declare properties to fix TS errors
  state: ErrorBoundaryState;
  props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem', 
          color: '#e2e8f0', 
          background: '#0f172a', 
          height: '100vh', 
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <h1 style={{fontSize: '2rem', marginBottom: '1rem', color: '#f87171'}}>Đã xảy ra lỗi hệ thống</h1>
          <p style={{marginBottom: '2rem', maxWidth: '600px', lineHeight: '1.6'}}>
            Ứng dụng gặp sự cố không mong muốn. Vui lòng tải lại trang hoặc liên hệ quản trị viên nếu lỗi vẫn tiếp diễn.
          </p>
          <div style={{
            background: '#1e293b', 
            padding: '1.5rem', 
            borderRadius: '0.75rem', 
            border: '1px solid #334155',
            maxWidth: '800px',
            width: '100%',
            overflowX: 'auto',
            textAlign: 'left'
          }}>
            <pre style={{color: '#fca5a5', margin: 0, fontSize: '0.875rem'}}>
              {this.state.error?.toString()}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Removed React.StrictMode for better production stability with chart libraries
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);