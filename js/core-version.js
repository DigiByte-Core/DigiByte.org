/* Keep DigiByte Core version text and download links in sync with the latest GitHub release.
 * The hardcoded markup is the fallback if the API is unreachable or rate-limited. */

const API = 'https://api.github.com/repos/DigiByte-Core/digibyte/releases/latest';
const CACHE_KEY = 'dgb.core.latest';
const TTL = 60 * 60 * 1000;

let pending;

export function getLatestTag() {
	return pending || (pending = load());
}

async function load() {
	try {
		const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
		if (c && c.tag && Date.now() - c.at < TTL) return c.tag;
	} catch { /* storage unavailable */ }
	try {
		const r = await fetch(API, { headers: { 'Accept': 'application/vnd.github+json' } });
		if (!r.ok) throw new Error('http ' + r.status);
		const tag = (await r.json()).tag_name || '';
		if (!/^v\d+(\.\d+)+$/.test(tag)) return null;
		try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ tag, at: Date.now() })); } catch { /* ignore */ }
		return tag;
	} catch {
		return null;
	}
}

export async function init() {
	const tag = await getLatestTag();
	if (!tag) return;
	const ver = tag.slice(1);
	document.querySelectorAll('[data-core-version]').forEach(el => { el.textContent = tag; });
	document.querySelectorAll('[data-core-asset]').forEach(a => {
		const file = a.getAttribute('data-core-asset');
		a.href = `https://github.com/DigiByte-Core/digibyte/releases/download/${tag}/digibyte-${ver}-${file}`;
	});
}
