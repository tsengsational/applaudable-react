import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('Starting React application...')

try {
  const root = document.getElementById('root')
  if (!root) {
    throw new Error('Root element not found')
  }
  
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  
  console.log('React application mounted successfully')
} catch (error) {
  console.error('Error mounting React application:', error)
} 