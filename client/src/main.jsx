/**
 * Main entry point for the Harmonize application.
 * This file initializes the React application and renders the root App component.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Create and render the root React component
// Using StrictMode to catch potential problems in the application
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
