#!/usr/bin/env node
/**
 * DigiByte locale sync.
 *
 * Mirrors the new English homepage (root `index.html`) into every locale
 * folder (`<lang>/index.html`), rewriting:
 *   - <html lang="..."> to the target locale
 *   - <html dir="..."> to "rtl" for Arabic, Persian, Hebrew, Urdu
 *   - root-relative asset paths ("/css/x" -> "../css/x") so the file works
 *     both at /<lang>/ on GitHub Pages and locally
 *   - canonical URL to https://digibyte.org/<lang>/
 *
 * Localized COPY is NOT translated here — translators backfill afterwards.
 *
 * Usage:  node tools/sync-locales.mjs [--check]
 *   --check   exit non-zero if any locale is out of date (CI-friendly)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const RTL = new Set(['ar', 'fa', 'he', 'ur']);

// All known locale folders (matches the existing site).
const LOCALES = [
	'af', 'ar', 'bg', 'cs', 'da', 'de', 'el', 'en', 'en-us', 'es', 'fa', 'fi',
	'fil', 'fr', 'hi', 'hr', 'hu', 'id', 'it', 'ja', 'ms', 'nb', 'nl', 'pl',
	'pt', 'pt-br', 'ro', 'ru', 'sl', 'sq', 'sv', 'sw', 'th', 'tr', 'vi', 'zh',
];

const checkMode = process.argv.includes('--check');

const source = readFileSync(join(ROOT, 'index.html'), 'utf8');

// Load translation catalogs from /locales/<lang>.json.
// `en.json` is the canonical source-of-truth fallback.
const LOCALES_DIR = join(ROOT, 'locales');
const CATALOGS = {};
for (const locale of [...new Set(['en', ...readdirSync(LOCALES_DIR, { withFileTypes: true })
	.filter(d => d.isFile() && d.name.endsWith('.json'))
	.map(d => d.name.replace(/\.json$/, ''))])]) {
	const f = join(LOCALES_DIR, `${locale}.json`);
	if (existsSync(f)) {
		try { CATALOGS[locale] = JSON.parse(readFileSync(f, 'utf8')); }
		catch (e) { console.error(`[warn] invalid JSON in locales/${locale}.json: ${e.message}`); }
	}
}
const EN = CATALOGS.en || {};

// HTML-escape a translation value before inserting into innerHTML.
// Allow a small whitelist of inline markup (em-dash already Unicode; we keep <br>, <strong>, <em>).
function escapeForInner(value) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}
function escapeForAttr(value) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

// Apply data-i18n / data-i18n-attr replacements for a given locale.
// Source HTML is expected to render correctly in English; this pass swaps
// text content (and selected attributes) using the locale's catalog,
// falling back to en.json, then to whatever is already in the HTML.
function applyCatalog(html, locale) {
	const cat = CATALOGS[locale];
	if (!cat) return html; // no catalog → ship English
	const lookup = (key) => (cat[key] ?? EN[key]);

	// data-i18n="key" on an element: replace its inner content (everything
	// up to the matching closing tag, assuming no nested same-name tags).
	html = html.replace(
		/<(\w+)([^>]*\bdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g,
		(match, tag, attrs, key, inner) => {
			const v = lookup(key);
			if (v == null) return match;
			return `<${tag}${attrs}>${escapeForInner(v)}</${tag}>`;
		}
	);

	// data-i18n-attr="attr1:key1,attr2:key2" → replace those attributes.
	html = html.replace(
		/<(\w+)([^>]*\bdata-i18n-attr="([^"]+)"[^>]*)>/g,
		(match, tag, attrs, spec) => {
			let updated = attrs;
			for (const pair of spec.split(',')) {
				const [attr, key] = pair.split(':').map(s => s.trim());
				if (!attr || !key) continue;
				const v = lookup(key);
				if (v == null) continue;
				const attrRe = new RegExp(`\\b${attr}="[^"]*"`);
				if (attrRe.test(updated)) {
					updated = updated.replace(attrRe, `${attr}="${escapeForAttr(v)}"`);
				} else {
					updated += ` ${attr}="${escapeForAttr(v)}"`;
				}
			}
			return `<${tag}${updated}>`;
		}
	);

	return html;
}

function localize(html, locale) {
	let out = html;

	// 1. <html lang="en" dir="ltr"> → target locale
	const dir = RTL.has(locale.split('-')[0]) ? 'rtl' : 'ltr';
	out = out.replace(/<html lang="[^"]*"(?: dir="[^"]*")?>/, `<html lang="${locale}" dir="${dir}">`);

	// 2. Canonical URL
	out = out.replace(
		/<link rel="canonical" href="https:\/\/digibyte\.org\/[^"]*">/,
		`<link rel="canonical" href="https://digibyte.org/${locale}/">`
	);

	// 3. og:url
	out = out.replace(
		/<meta property="og:url" content="https:\/\/digibyte\.org\/[^"]*">/,
		`<meta property="og:url" content="https://digibyte.org/${locale}/">`
	);

	// 4. Rewrite root-relative paths (`href="/x"`, `src="/x"`, `content="/x"`)
	//    to relative `../x` so the page renders correctly when opened
	//    locally, while still working at /<lang>/ on GitHub Pages.
	out = out.replace(/(\s(?:href|src|content)=")\/(?!\/)/g, '$1../');

	// Keep absolute hrefs to # anchors and full URLs as-is (already not /-rooted).

	// 5. Manifest sometimes lives at /favicons/site.webmanifest — already root-rooted, fine.

	return out;
}

let drift = 0;
for (const locale of LOCALES) {
	const dir = join(ROOT, locale);
	if (!existsSync(dir) || !statSync(dir).isDirectory()) continue;
	const target = join(dir, 'index.html');
	const next = applyCatalog(localize(source, locale), locale);
	const prev = existsSync(target) ? readFileSync(target, 'utf8') : '';
	if (prev === next) continue;
	if (checkMode) {
		console.error(`[drift] ${locale}/index.html`);
		drift++;
		continue;
	}
	writeFileSync(target, next);
	console.log(`[write] ${locale}/index.html`);
}

if (checkMode && drift) {
	console.error(`\n${drift} locale file(s) are out of sync. Run: node tools/sync-locales.mjs`);
	process.exit(1);
}

if (!checkMode) console.log('\nDone.');
