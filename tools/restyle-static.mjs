/**
 * Wrap legacy static pages (privacy-app.html, terms-app.html) with the new
 * design system, preserving their content prose verbatim.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const TEMPLATE = (title, body) => `<!DOCTYPE html>
<html lang="en">
<head>
\t<meta charset="utf-8">
\t<meta name="viewport" content="width=device-width, initial-scale=1">
\t<title>${title} · DigiByte</title>
\t<meta name="theme-color" content="#05070d">
\t<link rel="preconnect" href="https://fonts.googleapis.com">
\t<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
\t<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap">
\t<link rel="stylesheet" href="/css/tokens.css">
\t<link rel="stylesheet" href="/css/base.css">
\t<link rel="stylesheet" href="/css/components.css">
\t<link rel="stylesheet" href="/css/sections.css">
\t<link rel="stylesheet" href="/css/utilities.css">
</head>
<body>
\t<header class="mini-header">
\t\t<div class="row container">
\t\t\t<a href="/" aria-label="DigiByte home"><img src="/images/logo.svg" alt="DigiByte"></a>
\t\t\t<a class="btn btn--ghost btn--sm" href="/">← Home</a>
\t\t</div>
\t</header>
\t<main class="legal-page">
\t\t<div class="container">
${body}
\t\t</div>
\t</main>
</body>
</html>
`;

function extractBody(html) {
	const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
	if (!m) throw new Error('no body');
	return m[1];
}

function pageH1(html, fallback) {
	const m = html.match(/<strong>([^<]{2,80})<\/strong>/);
	if (m) return m[1].trim();
	return fallback;
}

function transformBody(raw) {
	let s = raw;
	// First <strong>Title</strong> → <h1>
	s = s.replace(/^\s*<strong>([^<]+)<\/strong>/, '<h1>$1</h1>');
	// Section headings: <p><strong>Heading</strong></p> → <h2>
	s = s.replace(/<p>\s*<strong>([^<]+)<\/strong>\s*<\/p>/g, '<h2>$2</h2>'.replace('$2', '$1'));
	// Strip empty comment placeholders
	s = s.replace(/<!---*>/g, '');
	// Indent
	return s.split('\n').map(l => '\t\t\t' + l.trim()).filter(l => l.trim() !== '\t\t\t').join('\n');
}

const targets = [
	{ file: 'privacy-app.html', title: 'Privacy Policy', fallback: 'Privacy Policy' },
	{ file: 'terms-app.html', title: 'Terms & Conditions', fallback: 'Terms & Conditions' },
];

for (const t of targets) {
	const path = join(ROOT, t.file);
	const raw = readFileSync(path, 'utf8');
	const body = extractBody(raw);
	const transformed = transformBody(body);
	const out = TEMPLATE(t.title, transformed);
	writeFileSync(path, out);
	console.log('rewritten', t.file);
}
