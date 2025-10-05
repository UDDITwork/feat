import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    console.error('🚨 ErrorBoundary: Caught error:', error)
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 ErrorBoundary: Error details:', error)
    console.error('🚨 ErrorBoundary: Error info:', errorInfo)
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fee', 
          border: '1px solid #fcc',
          margin: '20px',
          borderRadius: '8px'
        }}>
          <h2 style={{ color: '#c33' }}>🚨 Application Error</h2>
          <p>Something went wrong. Please check the console for details.</p>
          <details style={{ marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Error Details (Click to expand)
            </summary>
            <pre style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {this.state.error && this.state.error.toString()}
              {this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

