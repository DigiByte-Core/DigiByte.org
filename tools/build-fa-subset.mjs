/**
 * Font Awesome subsetter. Reads the 34 icons actually used on the site,
 * produces:
 *   css/font-awesome-subset/fa-subset.css
 *   css/font-awesome-subset/fa-solid-900.subset.woff2
 *   css/font-awesome-subset/fa-brands-400.subset.woff2
 *
 * Rebuild whenever an icon is added or removed:
 *   node tools/build-fa-subset.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

// Inventory: unique fa-* icons used across site HTML files AND JS files
// (some icons are injected at runtime by /js/app.js, /js/tokenomics-chart.js).
const scanPaths = [path.join(root, 'index.html')];
for (const e of fs.readdirSync(root, { withFileTypes: true })) {
	if (!e.isDirectory()) continue;
	const p = path.join(root, e.name, 'index.html');
	if (fs.existsSync(p)) scanPaths.push(p);
}
for (const f of fs.readdirSync(path.join(root, 'js'))) {
	if (f.endsWith('.js')) scanPaths.push(path.join(root, 'js', f));
}
// Accept both FA5 short prefixes (`fas`, `fab`, ...) and FA6 long ones
// (`fa-solid`, `fa-brands`, `fa-regular`) so nothing slips past the subset if
// a fresh copy-paste sneaks in FA6 syntax.
const iconRe = /class=["'](fab|fas|far|fal|fad|fak|fa-solid|fa-brands|fa-regular)\s+(fa-[a-z0-9-]+)(?:\s+[^"']*)?["']/g;
const solidIcons = new Set();
const brandsIcons = new Set();
for (const p of scanPaths) {
	const c = fs.readFileSync(p, 'utf8');
	for (const m of c.matchAll(iconRe)) {
		const family = m[1];
		const name = m[2];
		if (family === 'fas' || family === 'fa-solid') solidIcons.add(name);
		else if (family === 'fab' || family === 'fa-brands') brandsIcons.add(name);
	}
}
console.log(`Discovered ${solidIcons.size} solid + ${brandsIcons.size} brand icons`);

// Extract codepoint per icon by scanning the minified FA CSS. Rules look like
//   .fa-github:before{content:"\f09b"}
// but the same content string may be shared by many aliases separated by commas.
const faCss = fs.readFileSync(path.join(root, 'css/font-awesome/css/all.min.css'), 'utf8');
const nameToCp = {};
const ruleRe = /((?:\.fa-[a-z0-9-]+(?::before)?,?)+)\{content:"\\([0-9a-f]{2,5})"\}/g;
for (const m of faCss.matchAll(ruleRe)) {
	const cp = String.fromCodePoint(parseInt(m[2], 16));
	for (const sel of m[1].split(',')) {
		const name = sel.replace(':before', '').replace(/^\./, '');
		nameToCp[name] = cp;
	}
}

const solidChars = new Set();
for (const n of solidIcons) {
	if (nameToCp[n]) solidChars.add(nameToCp[n]);
	else console.warn('  WARN no codepoint for', n);
}
const brandsChars = new Set();
for (const n of brandsIcons) {
	if (nameToCp[n]) brandsChars.add(nameToCp[n]);
	else console.warn('  WARN no codepoint for', n);
}

// Subset the two webfonts we actually use.
const outDir = path.join(root, 'css/font-awesome-subset');
fs.mkdirSync(outDir, { recursive: true });

const webfontDir = path.join(root, 'css/font-awesome/webfonts');
async function subsetTo(srcFile, outFile, chars) {
	const src = fs.readFileSync(path.join(webfontDir, srcFile));
	const before = src.length;
	const out = await subsetFont(src, [...chars].join(''), { targetFormat: 'woff2' });
	fs.writeFileSync(path.join(outDir, outFile), out);
	console.log(`  ${srcFile}: ${before} -> ${out.length} bytes`);
}
await subsetTo('fa-solid-900.woff2',   'fa-solid-900.subset.woff2',   solidChars);
await subsetTo('fa-brands-400.woff2',  'fa-brands-400.subset.woff2',  brandsChars);

// Emit a minimal CSS file (no @font-face for regular/light/duotone; site
// doesn't use them). Icons in :not() shift text; keep the FA5 base classes.
const cssLines = [
	`/*! DigiByte FA subset — build artifact. Rebuild: node tools/build-fa-subset.mjs */`,
	`@font-face{font-family:"Font Awesome 5 Free";font-style:normal;font-weight:900;font-display:swap;src:url(fa-solid-900.subset.woff2) format("woff2")}`,
	`@font-face{font-family:"Font Awesome 5 Brands";font-style:normal;font-weight:400;font-display:swap;src:url(fa-brands-400.subset.woff2) format("woff2")}`,
	`.fa,.fas,.fab,.far,.fal{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:inline-block;font-style:normal;font-variant:normal;text-rendering:auto;line-height:1}`,
	`.fas{font-family:"Font Awesome 5 Free";font-weight:900}`,
	`.fab{font-family:"Font Awesome 5 Brands";font-weight:400}`,
];
const emitRule = (name) => {
	const cp = nameToCp[name];
	if (!cp) return;
	const hex = cp.codePointAt(0).toString(16);
	cssLines.push(`.${name}:before{content:"\\${hex}"}`);
};
for (const n of [...solidIcons].sort()) emitRule(n);
for (const n of [...brandsIcons].sort()) emitRule(n);

const outCss = path.join(outDir, 'fa-subset.css');
fs.writeFileSync(outCss, cssLines.join('\n') + '\n');
console.log(`Wrote ${outCss} (${fs.statSync(outCss).size} bytes)`);
