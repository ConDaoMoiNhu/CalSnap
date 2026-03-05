// Service Worker for CalSnap PWA
// ⚠️ BUMP CACHE_VERSION on every deploy to invalidate stale cache
const CACHE_VERSION = 'v2'
const CACHE_NAME = `calsnap-${CACHE_VERSION}`

const STATIC_ASSETS = [
    '/manifest.json',
    '/icon.svg',
    '/icon-maskable.svg',
    '/calsnap-logo.svg',
]

// Install: pre-cache only true static assets (no JS/CSS chunks)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    )
    self.skipWaiting()
})

// Activate: ALWAYS delete ALL old caches to prevent stale CSS/JS
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        ).then(() => self.clients.claim())
    )
})

// Fetch: cache-first for static, network-first for API + pages
self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url)

    // Skip non-GET and browser-extension requests
    if (request.method !== 'GET' || !url.protocol.startsWith('http')) return

    // 🔴 NEVER cache Next.js static chunks (_next/static) - they have content hash,
    // let browser cache handle them natively. SW caching them causes stale CSS bugs.
    if (url.pathname.startsWith('/_next/')) {
        return // Let browser handle natively
    }

    // Network-first for API routes
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request).catch(() =>
                new Response(JSON.stringify({ error: 'Bạn đang offline. Vui lòng kết nối mạng và thử lại.' }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' },
                })
            )
        )
        return
    }

    // Cache-first for true static assets only (images, icons - NOT CSS/JS)
    if (url.pathname.match(/\.(svg|png|jpg|jpeg|webp|ico|woff2?|ttf)$/) ||
        STATIC_ASSETS.includes(url.pathname)) {
        event.respondWith(
            caches.match(request).then(
                (cached) => cached ?? fetch(request).then((res) => {
                    if (res.ok) {
                        const clone = res.clone()
                        caches.open(CACHE_NAME).then((c) => c.put(request, clone))
                    }
                    return res
                })
            )
        )
        return
    }

    // Network-first for everything else (pages)
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    )
})

// Push notification handler
self.addEventListener('push', (event) => {
    if (!event.data) return
    const data = event.data.json()
    event.waitUntil(
        self.registration.showNotification(data.title ?? 'CalSnap', {
            body: data.body ?? 'Đừng quên log bữa ăn hôm nay nhé!',
            icon: '/icon.svg',
            badge: '/icon-maskable.svg',
            tag: 'calsnap-reminder',
            renotify: true,
            data: { url: data.url ?? '/' },
        })
    )
})

// Notification click: open the app
self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            const targetUrl = event.notification.data?.url ?? '/'
            for (const client of clientList) {
                if (client.url === targetUrl && 'focus' in client) return client.focus()
            }
            if (clients.openWindow) return clients.openWindow(targetUrl)
        })
    )
})
