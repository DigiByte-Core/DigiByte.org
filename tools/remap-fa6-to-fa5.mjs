import fs from 'node:fs';
import path from 'node:path';

const root = 'c:/GitHub/DGBio';
// Vendored FA is v5; five HTML sites use FA6 names that don't exist in the v5
// CSS/webfont, so remap them to the v5 equivalents.
const remap = {
	'fa-shield-halved':               'fa-shield-alt',
	'fa-tower-broadcast':             'fa-broadcast-tower',
	'fa-arrow-up-right-from-square':  'fa-external-link-alt',
	'fa-scale-balanced':              'fa-balance-scale',
	'fa-triangle-exclamation':        'fa-exclamation-triangle',
};

const files = [path.join(root, 'index.html')];
for (const e of fs.readdirSync(root, { withFileTypes: true })) {
	if (!e.isDirectory()) continue;
	const p = path.join(root, e.name, 'index.html');
	if (fs.existsSync(p)) files.push(p);
}

let patched = 0;
const perIconTotal = {};
for (const f of files) {
	let c = fs.readFileSync(f, 'utf8');
	let changed = false;
	for (const [from, to] of Object.entries(remap)) {
		const re = new RegExp(`\\b${from}\\b`, 'g');
		const n = (c.match(re) || []).length;
		if (n) {
			c = c.replace(re, to);
			perIconTotal[from] = (perIconTotal[from] || 0) + n;
			changed = true;
		}
	}
	if (changed) { fs.writeFileSync(f, c); patched++; }
}
console.log(`Patched ${patched} files. Replacements:`);
for (const [k, v] of Object.entries(perIconTotal)) console.log(`  ${k} -> ${remap[k]}: ${v}`);
