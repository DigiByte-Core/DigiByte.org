/**
 * Bundles the site's CSS layers into a single minified stylesheet.
 * Order matches the cascade the site was written against and MUST be preserved:
 *   tokens -> base -> components -> sections -> utilities
 * Run this whenever any of those source files change:
 *   node tools/build-css.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const sources = ['tokens.css', 'base.css', 'components.css', 'sections.css', 'utilities.css'];
const outPath = path.join(root, 'css', 'dgb.min.css');

const banner = `/*! DigiByte bundled CSS — build artifact, do not edit.
 * Sources: ${sources.join(' + ')}
 * Rebuild: node tools/build-css.mjs
 */`;

const concat = banner + '\n' + sources
	.map(f => `/* --- ${f} --- */\n` + fs.readFileSync(path.join(root, 'css', f), 'utf8'))
	.join('\n');

const result = await esbuild.transform(concat, {
	loader: 'css',
	minify: true,
	legalComments: 'inline',
});

fs.writeFileSync(outPath, result.code);
const before = sources.reduce((n, f) => n + fs.statSync(path.join(root, 'css', f)).size, 0);
const after = fs.statSync(outPath).size;
console.log(`Bundled ${sources.length} files: ${before} -> ${after} bytes (${(after / before * 100).toFixed(1)}%)`);
