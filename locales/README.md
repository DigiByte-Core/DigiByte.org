# Locale catalogs

Translation strings for the DigiByte homepage. Each `<lang>.json` file maps
stable string IDs to the localized text shown on `https://digibyte.org/<lang>/`.

## How it works

1. The source `index.html` (at the repo root) carries `data-i18n="key"`
   attributes on every translatable element, and `data-i18n-attr="attr:key,…"`
   for translatable attributes (`alt`, `aria-label`, `placeholder`, `content`).
2. `tools/sync-locales.mjs`:
   - copies the root `index.html` into every `<lang>/index.html`;
   - rewrites `<html lang>`, `dir`, canonical URL, asset paths;
   - **swaps each `data-i18n` element's inner text with the value from
     `locales/<lang>.json`**, falling back to English (`en.json`) when a key
     is missing.

The source HTML still renders correctly in English on its own — the
`data-i18n` attributes are inert until the sync script runs.

## Files

- `en.json` — canonical English source. **Do not delete keys here** without
  also removing them from every other catalog.
- `<lang>.json` — per-locale translation. Partial coverage is fine; missing
  keys fall back to English at sync time.

## Translating

To translate a locale, copy missing keys from `en.json` into `<lang>.json` and
translate the values. Keep:

- placeholders like `{block}` exactly as-is;
- punctuation that matters for the language (e.g., RTL marks, full-width
  punctuation for ja/zh);
- short labels short — UI is tight in places (chips, buttons, stat labels).

After editing, run:

```bash
node tools/sync-locales.mjs
```

…then commit both the catalog change and the resulting `<lang>/index.html`.
