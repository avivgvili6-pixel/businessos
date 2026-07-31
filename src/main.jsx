import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// PWA - register service worker (production only; dev noisy on HMR).
// Use import.meta.env.BASE_URL so it works both at root ("/") and
// under a GitHub Pages sub-path ("/businessos/").
if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js', { scope: import.meta.env.BASE_URL }).catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
