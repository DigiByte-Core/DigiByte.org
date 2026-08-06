import fs from 'node:fs';
import path from 'node:path';

const root = 'c:/GitHub/DGBio';
const files = [path.join(root, 'index.html')];
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
	if (!entry.isDirectory()) continue;
	const p = path.join(root, entry.name, 'index.html');
	if (fs.existsSync(p)) files.push(p);
}

// Match: optional leading tab, GA comment, then the full IIFE <script> block,
// up to and including the </script> tag and its trailing newline.
// Files use CRLF on Windows, so match either.
const re = /(?:\r?\n)?\t*<!-- Google Analytics[^\r\n]*-->\r?\n\t*<script>[\s\S]*?<\/script>\r?\n?/;

let patched = 0, skipped = 0;
for (const f of files) {
	const c = fs.readFileSync(f, 'utf8');
	if (!/UA-129492671-3/.test(c)) { skipped++; continue; }
	const c2 = c.replace(re, '\r\n');
	if (c2 === c) { console.error('No match in', f); skipped++; continue; }
	if (/UA-129492671-3|gtag\(|dataLayer/.test(c2)) {
		console.error('Residual gtag reference after strip in', f);
		skipped++; continue;
	}
	fs.writeFileSync(f, c2);
	patched++;
}
console.log(`Removed UA gtag block from ${patched} files, skipped ${skipped}`);
