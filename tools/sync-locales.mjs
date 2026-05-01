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
	const next = localize(source, locale);
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
