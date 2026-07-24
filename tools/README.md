# DigiByte tooling

## `sync-locales.mjs`

Mirrors the new English homepage (`/index.html`) into every locale folder
(`<lang>/index.html`). Run this whenever the homepage changes.

```bash
# Sync all locales
node tools/sync-locales.mjs

# CI mode — exit non-zero if any locale is out of date
node tools/sync-locales.mjs --check
```

The script:

- copies the source HTML verbatim (including the new design system);
- rewrites `<html lang>` and `dir` (RTL for ar/fa/he/ur);
- rewrites `<link rel="canonical">` and `og:url` to the locale URL;
- rewrites root-relative asset paths (`/css/...`, `/js/...`, `/images/...`) to
  `../css/...` so the file renders both at `/<lang>/` on GitHub Pages and when
  opened directly on disk.

## Translation workflow

1. The script overwrites every `<lang>/index.html`. **All locale files now
   carry the English copy of the new layout.** This is intentional: the
   redesign goes live consistently for every visitor, and translators backfill
   per-locale strings afterwards.
2. To translate a locale: edit `<lang>/index.html` directly, replacing only
   the visible text (do not change classes, IDs, `data-*` attributes or
   asset paths).
3. After the homepage source changes again, the sync script will overwrite
   your translation. Until we move to a Jekyll-includes/data-driven setup,
   translators should re-apply changes after each sync — keep diffs small.
