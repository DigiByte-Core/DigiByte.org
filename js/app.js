/* DigiByte main app — vanilla ES module
 * Replaces: main2o.js, plugins (AOS, Slick, Lity, Waypoints, Parallax, jQuery)
 */

const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const $ = (sel, root = document) => root.querySelector(sel);

// ---------- Sticky nav state ----------
function initNav() {
	const nav = $('.nav');
	if (!nav) return;
	const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
	onScroll();
	window.addEventListener('scroll', onScroll, { passive: true });

	const toggle = $('.nav__toggle', nav);
	if (toggle) {
		toggle.addEventListener('click', () => {
			const open = nav.classList.toggle('is-open');
			toggle.setAttribute('aria-expanded', String(open));
		});
	}

	// Close mobile menu on link click
	$$('.nav__list a', nav).forEach(a => {
		a.addEventListener('click', () => nav.classList.remove('is-open'));
	});

	// Active link via IntersectionObserver on sections
	const links = $$('.nav__list a[href^="#"]');
	const map = new Map();
	links.forEach(a => {
		const id = a.getAttribute('href').slice(1);
		const sec = document.getElementById(id);
		if (sec) map.set(sec, a);
	});
	if (map.size) {
		const io = new IntersectionObserver(entries => {
			entries.forEach(e => {
				const link = map.get(e.target);
				if (!link) return;
				if (e.isIntersecting) {
					links.forEach(l => l.classList.remove('is-active'));
					link.classList.add('is-active');
				}
			});
		}, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
		map.forEach((_, sec) => io.observe(sec));
	}
}

// ---------- Reveal on scroll ----------
function initReveal() {
	const items = $$('[data-reveal]');
	if (!items.length || prefersReducedMotion) {
		items.forEach(i => i.classList.add('is-visible'));
		return;
	}
	const io = new IntersectionObserver((entries) => {
		entries.forEach(e => {
			if (e.isIntersecting) {
				const delay = parseInt(e.target.dataset.revealDelay || '0', 10);
				setTimeout(() => e.target.classList.add('is-visible'), delay);
				io.unobserve(e.target);
			}
		});
	}, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
	items.forEach(i => io.observe(i));
}

// ---------- Count-up ----------
function animateCount(el, target, opts = {}) {
	const { duration = 1400, decimals = 0, prefix = '', suffix = '' } = opts;
	const start = performance.now();
	const from = parseFloat(el.dataset._from || '0');
	const ease = t => 1 - Math.pow(1 - t, 3);
	const tick = (now) => {
		const t = Math.min(1, (now - start) / duration);
		const v = from + (target - from) * ease(t);
		el.textContent = prefix + v.toLocaleString(undefined, {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals,
		}) + suffix;
		if (t < 1) requestAnimationFrame(tick);
		else el.dataset._from = String(target);
	};
	requestAnimationFrame(tick);
}

function initCounters() {
	const items = $$('[data-count]');
	if (!items.length) return;
	if (prefersReducedMotion) {
		items.forEach(el => {
			const t = parseFloat(el.dataset.count);
			el.textContent = (el.dataset.prefix || '') + t.toLocaleString() + (el.dataset.suffix || '');
		});
		return;
	}
	const io = new IntersectionObserver((entries) => {
		entries.forEach(e => {
			if (e.isIntersecting) {
				const target = parseFloat(e.target.dataset.count);
				animateCount(e.target, target, {
					duration: parseInt(e.target.dataset.countDuration || '1400', 10),
					decimals: parseInt(e.target.dataset.countDecimals || '0', 10),
					prefix: e.target.dataset.prefix || '',
					suffix: e.target.dataset.suffix || '',
				});
				io.unobserve(e.target);
			}
		});
	}, { threshold: 0.4 });
	items.forEach(el => io.observe(el));
}

// ---------- Tabs ----------
function initTabs() {
	$$('.tabs').forEach(group => {
		const btns = $$('.tabs__btn', group);
		const panels = $$('.tabs__panel', group);
		const activate = (id) => {
			btns.forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === id)));
			panels.forEach(p => {
				if (p.dataset.tab === id) p.setAttribute('data-active', '');
				else p.removeAttribute('data-active');
			});
		};
		btns.forEach(b => b.addEventListener('click', () => activate(b.dataset.tab)));
		const initial = btns.find(b => b.getAttribute('aria-selected') === 'true') || btns[0];
		if (initial) activate(initial.dataset.tab);
	});
}

// ---------- Copy buttons ----------
function initCopy() {
	$$('.codeblock').forEach(block => {
		if (block.querySelector('.codeblock__copy')) return;
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'codeblock__copy';
		btn.textContent = 'Copy';
		btn.setAttribute('aria-label', 'Copy code');
		block.appendChild(btn);
		btn.addEventListener('click', async () => {
			const code = block.querySelector('pre, code')?.innerText ?? '';
			try {
				await navigator.clipboard.writeText(code);
				btn.textContent = 'Copied';
				btn.classList.add('is-copied');
				setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('is-copied'); }, 1500);
			} catch { btn.textContent = 'Error'; }
		});
	});
}

// ---------- Smooth in-page scroll ----------
function initSmoothScroll() {
	document.addEventListener('click', (e) => {
		const a = e.target.closest('a[href^="#"]');
		if (!a) return;
		const id = a.getAttribute('href').slice(1);
		if (!id) return;
		const target = document.getElementById(id);
		if (!target) return;
		e.preventDefault();
		target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
		history.replaceState(null, '', '#' + id);
	});
}

// ---------- Marquee duplication ----------
function initMarquees() {
	$$('.marquee__track, .top-ticker__track').forEach(track => {
		// Duplicate children once for seamless loop
		if (track.dataset.duplicated) return;
		const clone = track.cloneNode(true);
		while (clone.firstChild) track.appendChild(clone.firstChild);
		track.dataset.duplicated = '1';
	});
}

// ---------- Wallet filter ----------
function initWalletFilter() {
	const filterEl = $('[data-wallet-filters]');
	if (!filterEl) return;
	const cards = $$('[data-wallet]');
	filterEl.addEventListener('click', (e) => {
		const btn = e.target.closest('[data-filter]');
		if (!btn) return;
		const f = btn.dataset.filter;
		$$('[data-filter]', filterEl).forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
		cards.forEach(c => {
			const types = (c.dataset.wallet || '').split(/\s+/);
			c.classList.toggle('is-hidden', f !== 'all' && !types.includes(f));
		});
	});
}

// ---------- Native dialog lightbox ----------
function initLightbox() {
	$$('[data-lightbox]').forEach(trigger => {
		trigger.addEventListener('click', (e) => {
			e.preventDefault();
			const url = trigger.getAttribute('href') || trigger.dataset.lightbox;
			const dialog = document.createElement('dialog');
			dialog.className = 'dialog';
			dialog.innerHTML = `
				<div class="dialog__inner">
					<button type="button" class="dialog__close" aria-label="Close">×</button>
					<div class="aspect-video">
						<iframe src="${url}" allow="autoplay; fullscreen" frameborder="0" style="width:100%;height:100%;"></iframe>
					</div>
				</div>`;
			document.body.appendChild(dialog);
			dialog.showModal();
			const close = () => { dialog.close(); dialog.remove(); };
			dialog.addEventListener('click', (ev) => { if (ev.target === dialog) close(); });
			dialog.querySelector('.dialog__close').addEventListener('click', close);
		});
	});
}

// ---------- Language menu ----------
function initLangMenu() {
	$$('.lang-menu').forEach(menu => {
		const btn = $('.lang-menu__btn', menu);
		const panel = $('.lang-menu__panel', menu);
		if (!btn || !panel) return;
		const close = () => { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
		const open = () => { panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); };
		btn.addEventListener('click', (e) => { e.stopPropagation(); panel.hidden ? open() : close(); });
		document.addEventListener('click', (e) => { if (!menu.contains(e.target)) close(); });
		document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
	});
}

// ---------- Year diff helper (legacy compat) ----------
function initYearDiff() {
	const start = new Date('2014-01-10');
	const years = Math.floor((Date.now() - start) / (365.25 * 24 * 3600 * 1000));
	$$('.year-diff').forEach(el => el.textContent = years);
}

// ---------- Scroll-to-top ----------
function initScrollTop() {
	let btn = $('.scroll-top');
	if (!btn) {
		btn = document.createElement('button');
		btn.className = 'scroll-top';
		btn.type = 'button';
		btn.setAttribute('aria-label', 'Back to top');
		btn.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
		document.body.appendChild(btn);
	}
	const onScroll = () => btn.classList.toggle('is-visible', window.scrollY > 600);
	onScroll();
	window.addEventListener('scroll', onScroll, { passive: true });
	btn.addEventListener('click', () => {
		window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
	});
}

// ---------- Boot ----------
function boot() {
	initNav();
	initReveal();
	initCounters();
	initTabs();
	initCopy();
	initSmoothScroll();
	initMarquees();
	initWalletFilter();
	initLightbox();
	initLangMenu();
	initScrollTop();
	initYearDiff();

	// Lazy-load feature modules on demand
	if ($('[data-hero-network]')) {
		const startHero = () => import('./hero-network.js').then(m => m.init?.()).catch(() => {});
		if ('requestIdleCallback' in window) requestIdleCallback(startHero, { timeout: 1500 });
		else setTimeout(startHero, 250);
	}
	if ($('[data-tokenomics-chart]')) {
		import('./tokenomics-chart.js').then(m => m.init?.()).catch(() => {});
	}
	if ($('[data-chain-dashboard]')) {
		import('./chain-dashboard.js').then(m => m.init?.()).catch(() => {});
	}
	if ($('[data-news-feed]')) {
		import('./news-feed.js').then(m => m.init?.()).catch(() => {});
	}
	if ($('[data-github-release]')) {
		import('./github-release.js').then(m => m.init?.()).catch(() => {});
	}

	// Service worker
	if ('serviceWorker' in navigator) {
		window.addEventListener('load', () => {
			navigator.serviceWorker.register('/js/sw.js').catch(() => {});
		});
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', boot);
} else {
	boot();
}
