/**
 * Purge unused rules from the CSS bundle. Runs on the already-minified
 * css/dgb.min.css so class-name inference is straightforward.
 *
 * Safelist: dynamic state classes injected by the site's JS (see js/app.js,
 * js/chain-dashboard.js) that never appear in the static HTML.
 *
 * Run after tools/build-css.mjs whenever CSS or class usage changes:
 *   node tools/build-css.mjs && node tools/purge-css.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PurgeCSS } from 'purgecss';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const cssPath = path.join(root, 'css/dgb.min.css');

// PurgeCSS uses fast-glob internally, which requires forward-slash paths
// even on Windows. path.join hands back backslashes on win32 -> normalize.
const fwd = p => p.replace(/\\/g, '/');

const contentFiles = [fwd(path.join(root, 'index.html'))];
for (const e of fs.readdirSync(root, { withFileTypes: true })) {
	if (!e.isDirectory()) continue;
	const p = path.join(root, e.name, 'index.html');
	if (fs.existsSync(p)) contentFiles.push(fwd(p));
}
for (const j of fs.readdirSync(path.join(root, 'js'))) {
	if (j.endsWith('.js')) contentFiles.push(fwd(path.join(root, 'js', j)));
}
console.log(`Scanning ${contentFiles.length} content files`);

const results = await new PurgeCSS().purge({
	content: contentFiles,
	css: [fwd(cssPath)],
	safelist: {
		standard: [
			// State classes toggled at runtime by js/*.js
			'is-loading', 'is-open', 'is-scrolled', 'is-visible', 'is-active',
			'up', 'down', 'revealed', 'data-active',
		],
		greedy: [
			/^chip--/,
			/^stat--/,
			/^callout/,
			/^marquee/,
			/^feature-row/,
		],
	},
	variables: true,
	keyframes: true,
	fontFace: false,
});

if (!results.length) {
	console.error('PurgeCSS returned no results — check content globs.');
	process.exit(1);
}
const before = fs.statSync(cssPath).size;
fs.writeFileSync(cssPath, results[0].css);
const after = fs.statSync(cssPath).size;
console.log(`Purged css/dgb.min.css: ${before} -> ${after} bytes (${(after / before * 100).toFixed(1)}%)`);
