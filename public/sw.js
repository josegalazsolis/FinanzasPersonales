const CACHE = 'finanzas-v1'
const PRECACHE = ['/icon.svg', '/manifest.json']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const pathname = new URL(e.request.url).pathname
  if (PRECACHE.includes(pathname)) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)))
  }
})
