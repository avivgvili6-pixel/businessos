// Holistic Fitness OS - Service Worker
// Simple strategy: network-first for HTML, cache-first for assets, offline fallback.

const CACHE_NAME = 'hfos-v1'
// Detect the deployment base from the SW's own URL (works at "/" and at
// "/businessos/" without needing a build-time template)
const BASE = new URL(self.registration?.scope || './', self.location.href).pathname
const OFFLINE_FALLBACK = BASE
const CORE_ASSETS = [BASE, BASE + 'manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return // let external requests through (OpenFoodFacts etc)

  // HTML - network first, fallback to cache
  if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then(c => c.put(request, clone)).catch(() => {})
          return res
        })
        .catch(() => caches.match(request).then(m => m || caches.match(OFFLINE_FALLBACK)))
    )
    return
  }

  // Assets - cache first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      if (res.ok) {
        const clone = res.clone()
        caches.open(CACHE_NAME).then(c => c.put(request, clone)).catch(() => {})
      }
      return res
    }).catch(() => cached))
  )
})
