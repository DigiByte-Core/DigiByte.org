# [Informational DIP] digibyte.org Website Redesign 2026 — a growth & developer-acquisition pitch

> **Paste this into:** https://github.com/DigiByte-Core/dips/discussions/categories/dip-discussions
>
> **Title:** `[Informational DIP] digibyte.org Website Redesign 2026 — growth & developer-acquisition pitch`
>
> Delete this blockquote before posting.

Hi DIP editors and community,

I'd like to vet a proposed Informational DIP before opening a PR to the
dips repository, per the DIP 1 workflow.

> **Live working preview:** https://dg-bio.vercel.app/
> Click through and run your own Lighthouse audit before reading further —
> 30 seconds is worth more than 600 lines of mediawiki.

## Why this matters (the pitch)

`digibyte.org` is the single highest-traffic surface the project controls
and the first artefact prospective users, developers, exchanges and
journalists encounter. Today it visually reads as a 2018-era project — a
material drag on every outreach effort, partner conversation and developer
recruitment attempt.

This DIP reframes the site as **an active funnel for new community members
and developers**, not a static brochure:

- **Newcomers** see live block height, hashrate and price within the first
  viewport — answering the implicit "is this project still alive?"
  question in the 1–2 seconds before most bounce decisions are made.
- **Developers** land on a DevHub that links Core, RPC docs, DigiAssets
  and Digi-ID, with copy-pasteable Esplora + Coinpaprika integration
  examples taken straight from the chain dashboard's source.
- **Site contributors** get a zero-build, MIT-licensed, plain-HTML
  codebase: clone, edit `index.html`, open in a browser, ship a PR.
  Empirically, lowering this bar is what converts front-end contributors
  into Core contributors over 12–24 months.
- **Translators** get `tools/sync-locales.mjs`, which propagates English
  changes across all 35 other locales automatically — no more copy-paste
  tax.
- **Partners** (exchanges, hardware wallets, journalists) get a site that
  visually matches the calibre of the integrations they're considering.

## Suggested success metrics (12-month, open to community ratification)

- **+25%** unique visitors to `digibyte.org`
- **+50%** organic Discord/Telegram joins from web referrals
- **≥10** new external contributors merged into `DigiByte-Core/DGBio`
- **≥3** new active locale maintainers
- **≥5** developer-facing PRs across the org that cite the site or DevHub
  as the entry point

These numbers are starting points — please push back, raise or lower them
in this thread.

## What's actually changing (technical summary)

- Drop the legacy jQuery + 9 plugins stack (≈400 KB) for vanilla ES modules
- Blue-only brand palette (cyan → brand blue → deep blue), dark-only theme
- Canvas-based isometric blockchain hero (cubes, chain links, confirmation
  pulses) with the DGB symbol embedded in ~25% of cubes
- Live chain telemetry from DigiExplorer (Esplora) + Coinpaprika
- Mobile burger menu rewrite, full 36-locale parity, PWA service worker
- Lighthouse: Perf 56→95, A11y 78→86, BP 73→100, SEO 92→100

Community / external links (aligned with [DIP-0002](https://github.com/DigiByte-Core/dips/blob/main/dip-0002.mediawiki)):
- Community section reduced to **GitHub Discussions** + **[DigiByte Wiki](https://dgbwiki.com/index.php?title=DigiByte)** only
- Footer socials reduced to GitHub, GitHub Discussions, DigiByte Wiki
- All Telegram, Discord, Reddit, X/Twitter, YouTube, Facebook, LinkedIn,
  Instagram and Medium links removed from the homepage and relocated to
  the DigiByte Wiki, per DIP-0002
- DigiStats → `digibyte.io` (first-party, not a third-party social link)

## What this DIP deliberately does NOT do

No CMS, no first-party DigiAssets explorer, no web wallet, no analytics
platform change, no backend. Each of those could be a future DIP.

## Full draft

`docs/dip-pitallano-website-redesign.mediawiki` on the
[`redesign-2026` branch](https://github.com/DigiByte-Core/DGBio/blob/redesign-2026/docs/dip-pitallano-website-redesign.mediawiki).

Before/after screenshot gallery will follow as a comment on this thread.

## Questions for the community

1. Are the suggested 12-month success metrics the right ones?
2. Foundation/maintainer sign-off on blue-only, dark-only brand direction?
3. Is removing the (incomplete) light theme acceptable?
4. Migrate UA → GA4 as part of this DIP, or leave for a follow-up?
5. Concerns about DigiExplorer or Coinpaprika as data sources?

Thanks for reading — happy to revise based on feedback before opening the PR.

---

# Standalone notice: redesign follows DIP-0002

> **Paste this into:** the existing DIP-0002 discussion thread
> ([dips#7](https://github.com/DigiByte-Core/dips/discussions/7)) and/or
> the `redesign-2026` discussion thread, as a short status update.
>
> **Title (if new thread):** `digibyte.org redesign now fully follows DIP-0002`
>
> Delete this blockquote before posting.

Hi all,

Quick heads-up for anyone tracking the `digibyte.org` redesign
([redesign-2026 branch](https://github.com/DigiByte-Core/DGBio/tree/redesign-2026),
live preview: https://dg-bio.vercel.app/):

The redesign now **fully implements
[DIP-0002](https://github.com/DigiByte-Core/dips/blob/main/dip-0002.mediawiki)**
(*Remove Third-Party Links from DigiByte.org*, Final, 2024). No new
proposal, no amendment — we're just following what the community already
ratified.

**What changed on the homepage (root + all 36 locales):**

- Community section is now exactly two tiles: **GitHub Discussions** and
  the **[DigiByte Wiki](https://dgbwiki.com/index.php?title=DigiByte)**.
- All Telegram, Discord, Reddit, X/Twitter and YouTube tiles removed.
- Footer socials reduced to GitHub, GitHub Discussions and DigiByte
  Wiki. Telegram, Discord, Reddit and X/Twitter icons removed.
- Footer Resources gained a **DigiByte Wiki** link; Contact Us stays
  absent.
- `schema.org` `Organization.sameAs` no longer lists Twitter or Reddit;
  it lists GitHub, GitHub Discussions and the Wiki.
- No Alliance, DGBAT, Awareness Team, Blockchain 2035, "Meet the
  creator", Uphold, AntumID, news XML feed or pipeline references
  anywhere on the page.
- A short inline note on the Community section credits DIP-0002 and
  directs visitors to the Wiki for the social-media index.

**Audited:** zero matches across root `index.html` and all 36 locale
homepages for `t.me`, `dsc.gg`, `reddit.com/r/Digibyte`,
`facebook|linkedin|instagram|medium|uphold|gitter|antumid|alliance|awareness|dgbat|blockchain.?2035`,
or `fa-discord|fa-telegram|fa-reddit|fa-youtube|fa-x-twitter` icons.

**Implication for translators:** four new i18n keys to backfill when you
have a minute (English fallback in the meantime):
`community.dip0002`, `community.tile.github.title`,
`community.tile.wiki.title`, `community.tile.wiki.meta`,
`footer.resources.wiki`.

**Implication for the Wiki maintainers:** the homepage now funnels all
third-party social discovery to
[dgbwiki.com](https://dgbwiki.com/index.php?title=DigiByte). If the
social-media index page on the Wiki needs a refresh (e.g. confirming
canonical Telegram / Discord / X / Reddit URLs), now's a good time —
happy to coordinate.

Nothing about this changes the broader redesign DIP
([draft](https://github.com/DigiByte-Core/DGBio/blob/redesign-2026/docs/dip-pitallano-website-redesign.mediawiki));
it just makes the implementation match DIP-0002 verbatim. Any future
re-introduction of a third-party social link on the homepage would need
its own DIP that amends or supersedes DIP-0002.

Feedback welcome here or on the
[redesign-2026 thread](https://github.com/DigiByte-Core/dips/discussions/categories/dip-discussions).

— Dennis
