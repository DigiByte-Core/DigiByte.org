import fs from 'node:fs';
import path from 'node:path';

const root = 'c:/GitHub/DGBio';
// Vendored FA is v5; some markup uses FA6 icon names AND FA6 family-prefix
// syntax (`fa-solid` / `fa-brands` / `fa-regular`) that don't exist in the v5
// CSS/webfont. Remap to their v5 equivalents.
const iconRemap = {
	'fa-shield-halved':               'fa-shield-alt',
	'fa-tower-broadcast':             'fa-broadcast-tower',
	'fa-arrow-up-right-from-square':  'fa-external-link-alt',
	'fa-scale-balanced':              'fa-balance-scale',
	'fa-triangle-exclamation':        'fa-exclamation-triangle',
	'fa-x-twitter':                   'fa-twitter',
};

// FA6 family prefixes -> FA5 short aliases. Only match when used as an <i>
// class token so we don't touch icon names that share the substring.
const prefixRemap = {
	'fa-solid':   'fas',
	'fa-brands':  'fab',
	'fa-regular': 'far',
};

// Scan every static HTML file (root + locale pages + langmenu / auxiliary
// pages) plus JS so runtime-injected icons are covered too.
const files = [];
function walk(dir) {
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		if (e.name === 'node_modules' || e.name === '.git' || e.name === 'reports' || e.name === 'digibyte') continue;
		const p = path.join(dir, e.name);
		if (e.isDirectory()) walk(p);
		else if (e.name.endsWith('.html') || e.name.endsWith('.js')) files.push(p);
	}
}
walk(root);

let patched = 0;
const perTotal = {};
for (const f of files) {
	let c = fs.readFileSync(f, 'utf8');
	let changed = false;
	for (const [from, to] of Object.entries(iconRemap)) {
		const re = new RegExp(`\\b${from}\\b`, 'g');
		const n = (c.match(re) || []).length;
		if (n) { c = c.replace(re, to); perTotal[from] = (perTotal[from] || 0) + n; changed = true; }
	}
	// Prefix remap: match `class="fa-solid ` or `class='fa-solid ` only at the
	// start of a class attribute value, to avoid rewriting icon-name substrings.
	for (const [from, to] of Object.entries(prefixRemap)) {
		const re = new RegExp(`(class=["'])${from}(\\s)`, 'g');
		const n = (c.match(re) || []).length;
		if (n) { c = c.replace(re, `$1${to}$2`); perTotal[from] = (perTotal[from] || 0) + n; changed = true; }
	}
	if (changed) { fs.writeFileSync(f, c); patched++; }
}
console.log(`Patched ${patched} files. Replacements:`);
for (const [k, v] of Object.entries(perTotal)) {
	const to = iconRemap[k] || prefixRemap[k];
	console.log(`  ${k} -> ${to}: ${v}`);
}
