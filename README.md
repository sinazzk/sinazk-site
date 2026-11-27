# sinazk.com

The live site for Sina Zibakerdar's portfolio, hosted on hidata.org (cPanel shared hosting).

## Production deployment

cPanel deploys `main` to **sinazk.com**. In Git Version Control, open
**Manage → Pull or Deploy**, choose **Update from Remote**, then
**Deploy HEAD Commit**. The staging site at **new.sinazk.com** retains its last
deployment.

The first production deploy prepares the new site before switching
`public_html`. It moves the previous document root to
`~/portfolio-production-backup/public_html`, keeps the WordPress database in
place, and carries over the `.well-known` directory. Subsequent deploys update
the new site in place.

To roll back the first production release, move the new `public_html` to a
private folder, then move `~/portfolio-production-backup/public_html` back to
`~/public_html`. The old WordPress files retain their original database setup.

## Layout

- `public/` — everything here goes live. Only put files you're happy for anyone to see.
- `.cpanel.yml` — the deploy step.
- `src/pages/` — each page's main content. `tools/build.py` wraps it in the shared head, header and footer and writes `public/<page>/index.html`. After editing, run `python3 tools/build.py` and commit the regenerated files in `public/`.

## Rules

- This repo is public. Never commit passwords, keys, `.env` files or client material that isn't already on the site.
- Deploy copies files but never deletes them. If you remove a page, delete it from `public_html` in File Manager too.

## Sola case-study access

Before deploying, create the Apache password file at
`/home/sinazkco/.htpasswds/portfolio-sola/passwd` with `htpasswd` or through
your hosting administrator. Keep it outside both document roots and the Git
repository. After deploying, check that `/work/sola/` and
`/work/sola/index.html` return HTTP 401 without credentials and load with valid
credentials. Share credentials privately on request.

The Python preview server ignores Apache configuration. Use an Apache preview
to test authentication. The password prompt controls access on the hosted site.
The case-study files and their history are also present in the public repository.
