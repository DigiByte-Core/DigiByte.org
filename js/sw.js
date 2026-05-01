/* DigiByte Service Worker — v2026.05 (futuristic redesign) */
const CACHE = 'dgb-v2026-05-22';
const PRECACHE = [
	'/',
	'/index.html',
	'/offline.html',
	'/css/tokens.css',
	'/css/base.css',
	'/css/components.css',
	'/css/sections.css',
	'/css/utilities.css',
	'/js/app.js',
	'/js/hero-network.js',
	'/js/coin-3d.js',
	'/js/chain-dashboard.js',
	'/js/news-feed.js',
	'/js/github-release.js',
	'/js/lang-router.js',
	'/images/logo.svg',
	'/images/digibyte_symbol_06c.svg',
	'/manifest.json',
];

self.addEventListener('install', (event) => {
	event.waitUntil((async () => {
		const cache = await caches.open(CACHE);
		try { await cache.addAll(PRECACHE); } catch (e) { /* tolerate missing */ }
		self.skipWaiting();
	})());
});

self.addEventListener('activate', (event) => {
	event.waitUntil((async () => {
		const keys = await caches.keys();
		await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
		await self.clients.claim();
	})());
});

self.addEventListener('fetch', (event) => {
	const req = event.request;
	if (req.method !== 'GET') return;
	const url = new URL(req.url);

	// Don't cache stats/* (always live)
	if (url.pathname.startsWith('/stats/')) {
		event.respondWith(fetch(req).catch(() => caches.match(req)));
		return;
	}

	// Network-first for HTML and same-origin JS/CSS so code updates win immediately;
	// cache-first for everything else (images, fonts, third-party).
	const isHTML = req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html');
	const isCode = url.origin === self.location.origin && /\.(?:js|mjs|css)$/i.test(url.pathname);
	if (isHTML || isCode) {
		event.respondWith((async () => {
			try {
				const fresh = await fetch(req);
				const cache = await caches.open(CACHE);
				cache.put(req, fresh.clone()).catch(() => {});
				return fresh;
			} catch {
				const cached = await caches.match(req);
				return cached || (isHTML ? caches.match('/offline.html') : new Response('', { status: 504 }));
			}
		})());
		return;
	}

	event.respondWith((async () => {
		const cached = await caches.match(req);
		if (cached) return cached;
		try {
			const fresh = await fetch(req);
			if (fresh && fresh.ok && url.origin === self.location.origin) {
				const cache = await caches.open(CACHE);
				cache.put(req, fresh.clone()).catch(() => {});
			}
			return fresh;
		} catch {
			return cached || new Response('', { status: 504 });
		}
	})());
});
