# sinazk.com

The live site for Sina Zibakerdar's portfolio, hosted on hidata.org (cPanel shared hosting).

## How deploys work

1. Push changes to `main` on GitHub.
2. In cPanel → Git Version Control → Manage → **Pull or Deploy**:
   - **Update from Remote** pulls the latest commit from GitHub.
   - **Deploy HEAD Commit** runs `.cpanel.yml`, which copies `public/` into `public_html`.

## Layout

- `public/` — everything here goes live. Only put files you're happy for anyone to see.
- `.cpanel.yml` — the deploy step.

## Rules

- This repo is public. Never commit passwords, keys, `.env` files or client material that isn't already on the site.
- Deploy copies files but never deletes them. If you remove a page, delete it from `public_html` in File Manager too.
