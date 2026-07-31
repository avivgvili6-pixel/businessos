import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// PWA - register service worker (production only; dev noisy on HMR)
if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
