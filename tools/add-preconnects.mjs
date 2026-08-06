import fs from 'node:fs';
import path from 'node:path';

const root = 'c:/GitHub/DGBio';
const marker = '<!-- Self-hosted fonts (no third-party requests) -->';
const block = `<!-- Preconnect to third-party API origins used at runtime (chain stats, price ticker, releases) -->
	<link rel="preconnect" href="https://digiexplorer.info" crossorigin>
	<link rel="preconnect" href="https://api.coinpaprika.com" crossorigin>
	<link rel="preconnect" href="https://api.github.com" crossorigin>

	<!-- Self-hosted fonts (no third-party requests) -->`;

const files = [];
files.push(path.join(root, 'index.html'));
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
	if (!entry.isDirectory()) continue;
	const p = path.join(root, entry.name, 'index.html');
	if (fs.existsSync(p)) files.push(p);
}

let patched = 0, skipped = 0;
for (const f of files) {
	const c = fs.readFileSync(f, 'utf8');
	if (c.includes('rel="preconnect" href="https://digiexplorer.info"')) { skipped++; continue; }
	if (!c.includes(marker)) { skipped++; continue; }
	fs.writeFileSync(f, c.replace(marker, block));
	patched++;
}
console.log(`Patched: ${patched}, Skipped: ${skipped}`);
