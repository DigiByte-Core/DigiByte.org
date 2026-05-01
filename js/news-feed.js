/* Render news cards from /news.xml (RSS 2.0). */

export async function init() {
	const host = document.querySelector('[data-news-feed]');
	if (!host) return;
	const limit = parseInt(host.dataset.limit || '6', 10);

	try {
		const r = await fetch('/news.xml', { cache: 'no-store' });
		if (!r.ok) throw new Error('http ' + r.status);
		const text = await r.text();
		const xml = new DOMParser().parseFromString(text, 'application/xml');
		const items = Array.from(xml.querySelectorAll('item')).slice(0, limit);
		if (!items.length) { renderEmpty(host); return; }
		host.innerHTML = items.map(it => {
			const title = it.querySelector('title')?.textContent?.trim() ?? '';
			const link = it.querySelector('link')?.textContent?.trim() ?? '#';
			const date = it.querySelector('pubDate')?.textContent?.trim() ?? '';
			const desc = it.querySelector('description')?.textContent?.trim() ?? '';
			const cleanDesc = desc.replace(/<[^>]+>/g, '').slice(0, 200);
			const d = date ? new Date(date) : null;
			const dateStr = d && !isNaN(d) ? d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
			return `
				<a class="news-card" href="${escapeAttr(link)}" target="_blank" rel="noopener">
					<span class="news-card__date">${escapeHTML(dateStr)}</span>
					<h3 class="news-card__title">${escapeHTML(title)}</h3>
					<p class="news-card__excerpt">${escapeHTML(cleanDesc)}${desc.length > 200 ? '…' : ''}</p>
					<span class="chip chip--cyan">Read more →</span>
				</a>`;
		}).join('');
	} catch {
		renderEmpty(host);
	}
}

function renderEmpty(host) {
	host.innerHTML = `<p class="text-ink-3 text-center">News feed unavailable. Visit <a href="https://github.com/DigiByte-Core/digibyte/releases" target="_blank" rel="noopener">GitHub releases</a>.</p>`;
}

function escapeHTML(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
function escapeAttr(s) { return escapeHTML(s); }
