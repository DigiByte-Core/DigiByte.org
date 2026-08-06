import fs from 'node:fs';
import path from 'node:path';

const root = 'c:/GitHub/DGBio';
const files = [path.join(root, 'index.html')];
for (const e of fs.readdirSync(root, { withFileTypes: true })) {
	if (!e.isDirectory()) continue;
	const p = path.join(root, e.name, 'index.html');
	if (fs.existsSync(p)) files.push(p);
}

// Collapse the 5 <link>s (tokens/base/components/sections/utilities) into a
// single bundled dgb.min.css load. Uses greedy match anchored on the first
// stylesheet, so any base path (/css/... or ../css/...) is preserved.
const re = /<link rel="stylesheet" href="((?:\.\.|)\/?css\/)tokens\.css">[\s\S]*?<link rel="stylesheet" href="\1utilities\.css">/;

let patched = 0, skipped = 0;
for (const f of files) {
	const c = fs.readFileSync(f, 'utf8');
	if (/href="[^"]*\/css\/dgb\.min\.css"/.test(c)) { skipped++; continue; }
	const c2 = c.replace(re, (_m, base) => `<link rel="stylesheet" href="${base}dgb.min.css">`);
	if (c2 === c) { console.error('No match:', f); skipped++; continue; }
	fs.writeFileSync(f, c2);
	patched++;
}
console.log(`Patched: ${patched}, Skipped: ${skipped}`);
