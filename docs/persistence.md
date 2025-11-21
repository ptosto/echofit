# Persistence approach

This prototype keeps each user's state inside a single JSON payload so the custom GPT can evolve the structure at runtime without changing database schemas.

## Table

Use a single D1 table:

```sql
CREATE TABLE IF NOT EXISTS user_state (
  user_id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
```

`data` holds the full JSON blob (as a string) for the user, and `updated_at` records when the blob was last replaced.

## Worker API

`src/worker.ts` (or `src/worker.js` if you want to skip TypeScript) exposes two simple endpoints that operate on `user_state`:

- `GET /state/{userId}` returns the stored JSON for that user or `404` if none exists yet.
- `POST /state/{userId}` merges the provided JSON body into the current state and upserts it. This keeps the store schema-free for now while still letting the GPT accumulate knowledge.

Responses are JSON and include the `userId` alongside the persisted `data`.

## Bootstrapping

1. Create the D1 database and table (one-time):

   ```bash
   wrangler d1 execute <DB_NAME> --file=schema.sql
   ```

2. Bind the D1 database in your `wrangler.toml` as `MY_DB` so the worker can access it.

3. Deploy or run locally with Wrangler. Example local run using the JS worker:

   ```bash
   wrangler dev src/worker.js --local
   ```

This keeps persistence flexible while you iterate on how the GPT captures user attributes, goals, weekly plans, and feedback.
