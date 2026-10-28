# Guestbook

The fourth tab uses `/guestbook`; `/pending` remains an alias. UI and configuration live in `modules/guestbook.js`, `modules/guestbook.css`, and `modules/guestbook-config.js`.

## Public configuration

`apiBase` is the Cloudflare Worker URL. `siteKey` is the public Turnstile site key. The Turnstile secret stays exclusively in the Worker secret `TURNSTILE_SECRET_KEY`; never commit it. The widget hostname must allow `leiyin.si`, and its action is `guestbook`.

## Worker contract

- D1 binding: `DB`, database: `leiyin-guestbook`.
- Rate limiter binding: `GUESTBOOK_RATE_LIMITER`, configured for 3 submission attempts per 60 seconds. Cloudflare rate limiting is location-based, not a globally exact quota.
- `GET /messages?before=<id>` returns `{items:[{id,nickname,content,created_at}],nextCursor:string|null}`. Only published records are returned, up to 20 per page.
- `POST /messages` accepts `{nickname,content,token}` as JSON from `https://leiyin.si`. Server verifies Turnstile hostname and action, limits requests, validates nickname (1–20 Unicode code points) and content (1–500), then inserts with status `pending`.
- Successful submission returns HTTP 201 and `{status:"pending",message:...}`. The browser must not display pending records as public messages.

The Worker is currently managed through the Cloudflare dashboard. Saving repository changes does not deploy that Worker or change its bindings.

## Moderation

In the D1 console, inspect pending messages:

```sql
SELECT id, nickname, content, created_at
FROM messages
WHERE status = 'pending'
ORDER BY id DESC;
```

To approve or hide one message, replace the example ID with the reviewed record's actual ID:

```sql
UPDATE messages SET status = 'published' WHERE id = 123;
UPDATE messages SET status = 'hidden' WHERE id = 123;
```

Do not run both commands for the same intended operation. No public moderation endpoint is exposed.

## Validation

Run `node scripts/check-site.mjs` and `git diff --check`. Browser tests must cover untrusted text, pagination, failed verification, expired tokens, HTTP 429, preserving drafts after failed submissions, nickname persistence, narrow screens, and route cleanup.

Local browser tests can mock the API and Turnstile for deterministic coverage; that does not validate the live Worker. After deployment, test a real submission at `https://leiyin.si/becoming.html#/guestbook`, confirm a pending row in D1, approve that row, and check that it then appears publicly. GitHub Pages previews or localhost cannot use the production-only Turnstile hostname and POST origin restriction.
