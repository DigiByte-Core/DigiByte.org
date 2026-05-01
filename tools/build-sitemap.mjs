/**
 * Generate a clean sitemap.xml covering the homepage (all 36 locales as
 * hreflang alternates) and key static pages.
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const LOCALES = [
	'af','ar','bg','cs','da','de','el','en','en-us','es','fa','fi','fil','fr',
	'hi','hr','hu','id','it','ja','ms','nb','nl','pl','pt','pt-br','ro','ru',
	'sl','sq','sv','sw','th','tr','vi','zh'
];

const TODAY = new Date().toISOString().slice(0, 10);
const BASE = 'https://digibyte.org';

const altLinks = LOCALES.map(l => `\t\t<xhtml:link rel="alternate" hreflang="${l}" href="${BASE}/${l}/" />`).join('\n');
const xDefault = `\t\t<xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/" />`;

const homeUrl = `\t<url>
\t\t<loc>${BASE}/</loc>
\t\t<lastmod>${TODAY}</lastmod>
\t\t<changefreq>daily</changefreq>
\t\t<priority>1.0</priority>
${altLinks}
${xDefault}
\t</url>`;

const localeUrls = LOCALES.map(l => `\t<url>
\t\t<loc>${BASE}/${l}/</loc>
\t\t<lastmod>${TODAY}</lastmod>
\t\t<changefreq>weekly</changefreq>
\t\t<priority>0.8</priority>
${altLinks}
${xDefault}
\t</url>`).join('\n');

const staticPages = [
	{ loc: '/legaldisclaimer.html', pri: 0.3 },
	{ loc: '/privacy-app.html', pri: 0.3 },
	{ loc: '/terms-app.html', pri: 0.3 }
];
const staticUrls = staticPages.map(p => `\t<url>
\t\t<loc>${BASE}${p.loc}</loc>
\t\t<lastmod>${TODAY}</lastmod>
\t\t<changefreq>yearly</changefreq>
\t\t<priority>${p.pri}</priority>
\t</url>`).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
\txmlns:xhtml="http://www.w3.org/1999/xhtml">
${homeUrl}
${localeUrls}
${staticUrls}
</urlset>
`;

writeFileSync(join(ROOT, 'sitemap.xml'), xml);
console.log(`sitemap.xml written: ${LOCALES.length} locales + ${staticPages.length} static pages`);
