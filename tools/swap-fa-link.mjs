import fs from 'node:fs';
import path from 'node:path';

const root = 'c:/GitHub/DGBio';
const files = [path.join(root, 'index.html')];
for (const e of fs.readdirSync(root, { withFileTypes: true })) {
	if (!e.isDirectory()) continue;
	const p = path.join(root, e.name, 'index.html');
	if (fs.existsSync(p)) files.push(p);
}

let patched = 0, skipped = 0;
for (const f of files) {
	let c = fs.readFileSync(f, 'utf8');
	if (c.includes('/font-awesome-subset/fa-subset.css')) { skipped++; continue; }
	// Preserve base ("/css/" or "../css/") and any surrounding attributes.
	const c2 = c
		.replace(/href="((?:\.\.|)\/?css\/)font-awesome\/css\/all\.min\.css"/g,
		         'href="$1font-awesome-subset/fa-subset.css"');
	if (c2 === c) { console.error('No match:', f); skipped++; continue; }
	fs.writeFileSync(f, c2);
	patched++;
}
console.log(`Patched ${patched}, skipped ${skipped}`);
