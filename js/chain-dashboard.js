/* Real-time DigiByte chain dashboard.
 * Sources:
 *   - Esplora-style API: https://digiexplorer.info/api
 *       /blocks/tip          → [{ height, difficulty, ... }, ...]
 *       /blocks/tip/height   → plain integer
 *   - CoinGecko price:
 *       /simple/price?ids=digibyte&vs_currencies=usd&include_24hr_change=true
 */

const ENDPOINTS = {
	tip: 'https://digiexplorer.info/api/blocks/tip',
	tipHeight: 'https://digiexplorer.info/api/blocks/tip/height',
	price: 'https://api.coinpaprika.com/v1/tickers/dgb-digibyte',
};

async function fetchJSON(url, timeoutMs = 8000) {
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const r = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
		if (!r.ok) throw new Error('http ' + r.status);
		return await r.json();
	} finally { clearTimeout(t); }
}

async function fetchText(url, timeoutMs = 8000) {
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const r = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
		if (!r.ok) throw new Error('http ' + r.status);
		return (await r.text()).trim();
	} finally { clearTimeout(t); }
}

function formatNumber(n, opts = {}) {
	if (n === null || n === undefined || Number.isNaN(n)) return '—';
	return n.toLocaleString(undefined, opts);
}

function formatHashrate(hashps) {
	if (!hashps || Number.isNaN(hashps)) return '—';
	const units = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s'];
	let i = 0;
	while (hashps >= 1000 && i < units.length - 1) { hashps /= 1000; i++; }
	return hashps.toFixed(2) + ' ' + units[i];
}

function setText(sel, text, root = document) {
	root.querySelectorAll(sel).forEach(el => { el.textContent = text; el.classList.remove('is-loading'); });
}

function animate(sel, target) {
	document.querySelectorAll(sel).forEach(el => {
		el.classList.remove('is-loading');
		const from = parseFloat(el.dataset._from || '0');
		if (!Number.isFinite(target)) { el.textContent = '—'; return; }
		const dur = 800;
		const start = performance.now();
		const ease = t => 1 - Math.pow(1 - t, 3);
		const tick = (now) => {
			const t = Math.min(1, (now - start) / dur);
			const v = from + (target - from) * ease(t);
			el.textContent = formatNumber(Math.round(v));
			if (t < 1) requestAnimationFrame(tick); else el.dataset._from = String(target);
		};
		requestAnimationFrame(tick);
	});
}

async function refreshChain() {
	let height = null;
	let difficulty = null;

	try {
		const tip = await fetchJSON(ENDPOINTS.tip);
		if (Array.isArray(tip) && tip.length) {
			height = tip[0].height ?? null;
			difficulty = tip[0].difficulty ?? null;
		}
	} catch { /* fall through */ }

	if (height === null) {
		try { height = parseInt(await fetchText(ENDPOINTS.tipHeight), 10); } catch {}
	}

	if (Number.isFinite(height)) {
		animate('[data-stat="blocks"]', height);
		document.querySelectorAll('[data-block-height]').forEach(el => {
			el.textContent = '#' + formatNumber(height);
			el.classList.remove('is-loading');
		});
	}

	if (Number.isFinite(difficulty)) {
		setText('[data-stat="difficulty"]', formatNumber(difficulty, { maximumFractionDigits: 2 }));
		// Approximate network hashrate: difficulty * 2^32 / blockTime (15s)
		setText('[data-stat="network-hashrate"]', formatHashrate(difficulty * Math.pow(2, 32) / 15));
	}

	// Static-ish info — exposed via legacy data-stat ids on existing markup
	setText('[data-stat="connections"]', '5 algos');
	setText('[data-stat="version"]', 'v8.26.2');
}

async function refreshPrice() {
	try {
		const j = await fetchJSON(ENDPOINTS.price);
		const usd = j?.quotes?.USD;
		if (!usd) return;
		const price = usd.price;
		const change = usd.percent_change_24h;
		const priceText = '$' + price.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 });
		setText('[data-stat="price"]', priceText);
		document.querySelectorAll('[data-stat="price-change"]').forEach(el => {
			const sign = change >= 0 ? '+' : '';
			el.textContent = sign + change.toFixed(2) + '%';
			el.classList.remove('up', 'down', 'is-loading');
			el.classList.add(change >= 0 ? 'up' : 'down');
		});
	} catch { /* silent */ }
}

function refresh() {
	refreshChain();
	refreshPrice();
}

export function init() {
	if (!document.querySelector('[data-chain-dashboard], [data-block-height], [data-stat]')) return;
	document.querySelectorAll('[data-stat], [data-block-height]').forEach(el => el.classList.add('is-loading'));
	refresh();
	const interval = setInterval(refresh, 60000);
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible') refresh();
	});
	window.addEventListener('beforeunload', () => clearInterval(interval));
}
