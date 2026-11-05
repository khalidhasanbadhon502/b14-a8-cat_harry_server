# AGENTS.md

## Layout
- Express 5 ESM server, port 8000:
  - `index.js` — app wiring, `/api/health`, JSON body parser, static `public/`, 404 + error middleware
  - `db.js` — MongoDB connect + in-memory fallback store
  - `routes/cats.js` — CRUD under `GET|POST /api/cats`, `GET|PUT|DELETE /api/cats/:id`
  - `routes/studios.js` — in-memory seed data, `GET /api/studios`, `GET /api/studios/:id` (no DB)
  - `public/index.html` — studio card gallery; fetches `/api/studios` client-side
- Package is ESM on purpose (`"type": "module"`). Do not switch to `commonjs` —
  `index.js` uses `import` and fails with `Cannot use import statement outside a module`.

## Run
- No `start` script — use `node index.js`.
- `npm test` is the npm default stub (`exit 1`). No lint/typecheck config. Don't invent commands.

## Database
- `.env` holds `MONGODB_URL` (Atlas). `dotenv.config()` must run **before**
  `connectToMongoDB()` — do not read `process.env` at module top-level in `db.js`
  (imports evaluate before `dotenv.config()`).
- **Atlas TLS is blocked from this network** (handshake gets `alert number 80` even
  with raw openssl — not a code bug). Connect failure is expected; the API falls
  back to an in-memory store automatically. `GET /health` reports `db: "memory"|"mongodb"`.
- In-memory store is per-process: data resets on restart.

## API conventions
- Validation errors → 400 `{ "error": "..." }`; missing route/row → 404; DB down without
  fallback → 503. Unknown paths hit JSON 404 middleware (not Express HTML).
- `cats` body: `name` (required string), optional `age` (non-negative number), `breed`, `color`.
- Ids are 24-hex ObjectId strings; invalid id → 400 before any DB lookup.

## Gotchas
- Express 5: async handler rejections go to the error middleware; path syntax is
  path-to-regexp v8 (`:id`). Avoid Express 4 habits.
- No `.gitignore`; `node_modules` is present. If initializing git, ignore it
  (and `.env` — it has credentials).
- Node v24 in this environment.
