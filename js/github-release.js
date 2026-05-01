/* Pull latest DigiByte Core release from GitHub API and render. */

const API = 'https://api.github.com/repos/DigiByte-Core/digibyte/releases/latest';

export async function init() {
	const host = document.querySelector('[data-github-release]');
	if (!host) return;
	try {
		const r = await fetch(API, { headers: { 'Accept': 'application/vnd.github+json' } });
		if (!r.ok) throw new Error('http ' + r.status);
		const j = await r.json();
		const tag = j.tag_name || '';
		const name = j.name || tag;
		const date = j.published_at ? new Date(j.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
		const url = j.html_url || 'https://github.com/DigiByte-Core/digibyte/releases';
		const body = (j.body || '').slice(0, 500);
		const assetCount = (j.assets || []).length;

		host.innerHTML = `
			<div class="release-card__head">
				<span class="release-card__tag">${escapeHTML(tag)}</span>
				<span class="chip chip--violet">Latest</span>
				<span class="text-ink-3 fs-mono">${escapeHTML(date)}</span>
			</div>
			<h3 class="card__title">${escapeHTML(name)}</h3>
			<div class="release-card__notes">${escapeHTML(body)}</div>
			<div class="cluster">
				<a class="btn btn--primary btn--sm" href="${escapeAttr(url)}" target="_blank" rel="noopener">View on GitHub →</a>
				<span class="chip">${assetCount} downloads</span>
			</div>
		`;
		host.classList.remove('is-loading');
	} catch {
		host.innerHTML = `<p class="text-ink-3">Latest release info unavailable. <a href="https://github.com/DigiByte-Core/digibyte/releases" target="_blank" rel="noopener">Open GitHub →</a></p>`;
	}
}

function escapeHTML(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
function escapeAttr(s) { return escapeHTML(s); }
