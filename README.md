## DigiByte.org

https://DigiByte.org website. (Formerly DigiByte.io)

Please feel free to contribute existing translations by pull requests and comments.

Created with pure html5, css3 and javascript.

It can be edited through GitHub or using any html editor.

It has been designed to be a single page website. Different sections are used on the same page.

---

## Maintainer notes

### Web3Forms (DigiByte Interest Form)

The `#collaborate` section on the homepage is a static form that posts to Web3Forms. There is no server-side component — the entire integration is a single access key in [`js/app.js`](js/app.js).

- **Where the key lives:** `WEB3FORMS_ACCESS_KEY` constant near the top of `initPartnerForm()` in [`js/app.js`](js/app.js).
- **Destination inbox:** whichever address the Web3Forms account was created with. Sign in at https://web3forms.com/ to see or change it.
- **How to rotate the key:**
  1. Sign in at https://web3forms.com/.
  2. Regenerate the access key in the dashboard.
  3. Replace the value in [`js/app.js`](js/app.js) and open a PR / redeploy.
- **CSP:** submissions travel to `https://api.web3forms.com`, which is allowlisted in the `connect-src` directive of the CSP `<meta>` tag on every localized `index.html`.
- **Privacy notice:** [`privacy-app.html`](privacy-app.html) sections 2 and 4 disclose the processor. Update those if the vendor changes.

### DigiDollar white paper

Live URL is the canonical `/docs/DigiDollar_whitepaper.pdf`. Dated versions live under `docs/archive/`. When a new version ships, move the current file into `docs/archive/DigiDollar_white-paper_<MM-YYYY>.pdf` and drop the new one at the canonical path — no HTML edits needed.

