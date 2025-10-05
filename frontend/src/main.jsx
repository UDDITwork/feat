console.log('🚀 main.jsx: Starting application...')

console.log('📦 main.jsx: Importing React...')
import React from 'react'
console.log('✅ main.jsx: React imported successfully')

console.log('📦 main.jsx: Importing ReactDOM...')
import ReactDOM from 'react-dom/client'
console.log('✅ main.jsx: ReactDOM imported successfully')

console.log('📦 main.jsx: Importing BrowserRouter...')
import { BrowserRouter } from 'react-router-dom'
console.log('✅ main.jsx: BrowserRouter imported successfully')

console.log('📦 main.jsx: Importing Toaster...')
import { Toaster } from 'react-hot-toast'
console.log('✅ main.jsx: Toaster imported successfully')

console.log('📦 main.jsx: Importing App component...')
import App from './App.jsx'
console.log('✅ main.jsx: App component imported successfully')

console.log('📦 main.jsx: Importing CSS...')
import './index.css'
console.log('✅ main.jsx: CSS imported successfully')

console.log('🎯 main.jsx: Looking for root element...')
const rootElement = document.getElementById('root')
console.log('🎯 main.jsx: Root element found:', rootElement)

if (!rootElement) {
  console.error('❌ main.jsx: Root element not found!')
  throw new Error('Root element not found')
}

console.log('🎯 main.jsx: Creating React root...')
const root = ReactDOM.createRoot(rootElement)
console.log('✅ main.jsx: React root created successfully')

console.log('🎯 main.jsx: Rendering application...')
root.render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
console.log('✅ main.jsx: Application rendered successfully!')
