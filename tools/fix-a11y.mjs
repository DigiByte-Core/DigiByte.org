import fs from 'node:fs';
import path from 'node:path';

const root = 'c:/GitHub/DGBio';
const files = [path.join(root, 'index.html')];
for (const e of fs.readdirSync(root, { withFileTypes: true })) {
	if (!e.isDirectory()) continue;
	const p = path.join(root, e.name, 'index.html');
	if (fs.existsSync(p)) files.push(p);
}

// [aria-valid-attr-value] Wire the tab panels to their controlling buttons.
// [heading-order] Footer group labels jump h3 -> h6; retag to h3.
const tabs = ['cli', 'node', 'py', 'curl'];

let patched = 0, skipped = 0;
for (const f of files) {
	let c = fs.readFileSync(f, 'utf8');
	const before = c;

	for (const t of tabs) {
		const hasIdAttr = new RegExp(`<div class="tabs__panel"[^>]*\\bid="tab-${t}"`).test(c);
		if (hasIdAttr) continue;
		const openTagRe = new RegExp(`<div class="tabs__panel" data-tab="${t}"([^>]*)>`);
		c = c.replace(openTagRe, (_m, rest) =>
			`<div class="tabs__panel" data-tab="${t}" id="tab-${t}" role="tabpanel" aria-labelledby="tabbtn-${t}"${rest}>`
		);
	}

	c = c.replace(/<h6(\s[^>]*)?data-i18n="footer\.(protocol|build|use|resources)\.heading"([^>]*)>/g,
		(_m, pre = '', _grp, post = '') => `<h3${pre}data-i18n="footer.${_grp}.heading"${post}>`
	);
	c = c.replace(/data-i18n="footer\.(protocol|build|use|resources)\.heading">([^<]*)<\/h6>/g,
		(_m, grp, txt) => `data-i18n="footer.${grp}.heading">${txt}</h3>`
	);

	if (c !== before) { fs.writeFileSync(f, c); patched++; } else { skipped++; }
}
console.log(`Patched: ${patched}, Skipped (already ok): ${skipped}`);

const cssPath = path.join(root, 'css/sections.css');
const css = fs.readFileSync(cssPath, 'utf8');
const css2 = css.replace(/\.footer h6 \{/g, '.footer h3 {');
if (css2 !== css) {
	fs.writeFileSync(cssPath, css2);
	console.log('Updated CSS selector .footer h6 -> .footer h3');
} else {
	console.log('CSS already updated (or selector not found)');
}
