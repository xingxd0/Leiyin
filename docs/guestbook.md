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

## Browser-owned unreviewed messages

The upgraded Worker source is `workers/guestbook/worker.js`. Run `workers/guestbook/migration.sql` once in D1 before deploying that Worker. It adds nullable `owner_hash` and its index without changing existing messages. If D1 reports a duplicate column, inspect `PRAGMA table_info(messages)` before rerunning migrations.

New clients create a cryptographically random 32-byte browser credential in `leiyin.guestbook.key.v1` localStorage and send it only as `X-Guestbook-Key` over HTTPS. The server stores a SHA-256 digest, never the raw credential or IP for message visibility. Queries return published records plus this credential's pending records; hidden records are excluded for everyone. POST returns the saved item so the submitting browser can show it immediately, labeled "Only visible to you". Approval changes the same row to public; IDs prevent duplicates.

Changing IP has no effect. Clearing browser storage or using a different browser loses access to unreviewed messages. Shared browsers share the identity. Previously submitted pending messages without an owner hash remain private to moderation until approved; the new credential does not retroactively claim them. If storage is unavailable, a session-only in-memory credential is used and cannot be promised to survive reload.

For a safe rollout: migrate D1, deploy the Worker, then publish the updated frontend. The Worker accepts older clients' verified submissions without a browser credential for backwards compatibility; such records cannot be privately retrieved and become visible only after approval. The newer frontend always supplies a credential. Keep existing DB, Turnstile secret and rate-limiter bindings. Never include the credential in URLs, public responses, diagnostic logs or analytics.

Run `node scripts/test-guestbook-worker.mjs` (Node.js and Python 3 required) for real SQLite checks of migration, isolation, IP changes, moderation, hidden records, hashing, pagination and verification enforcement. Cloudflare's live bindings and Turnstile still require a production smoke test after the manual deployment.

## Message sticker presentation

The Guestbook fills the workspace. Its title and instructions sit behind freely draggable white stickers. Each sticker shows the nickname on its front; click (or keyboard activation) flips it to the full message, date and visibility label. Long messages scroll on the back. Pointer hover tilts the card and moves a subtle reflective highlight; reduced-motion settings disable tilt and animation. A drag threshold prevents moving a sticker from flipping it. Positions are saved only in this browser under `leiyin.guestbook.positions.v1`, independently of the ownership credential. Refresh and responsive layout restore positions within the available width. Click blank wall space or Leave a note to open the composer; a successful API submission closes it and shows the saved sticker, while errors preserve the draft. Verification loads only when composing. All user content uses textContent. Presentation does not change moderation, browser ownership, Turnstile or the Worker schema. The Workshop tab independently uses a curated hexagonal board with explicitly labeled visual demos; blank cells cannot be edited by visitors.
