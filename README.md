# echofit

This repository prototypes Aaron Nutwell's health and fitness personal coach app.

## Persistence prototype

- `schema.sql` defines a single `user_state` table that stores each user's entire JSON state in Cloudflare D1.
- `src/worker.ts` (TypeScript) and `src/worker.js` (plain JavaScript) expose a minimal worker with `GET /state/{userId}` and `POST /state/{userId}` endpoints to read and merge state blobs.
- See `docs/persistence.md` for setup notes.
- See `docs/custom-gpt.md` for the GPT prompt guidance and action definition that uses the worker.
