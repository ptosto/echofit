export interface Env {
  MY_DB: D1Database;
}

async function getState(env: Env, userId: string) {
  const row = await env.MY_DB.prepare("SELECT data FROM user_state WHERE user_id = ?")
    .bind(userId)
    .first();
  return row ? JSON.parse(row.data as string) : null;
}

async function saveState(env: Env, userId: string, data: unknown) {
  const now = Math.floor(Date.now() / 1000);
  await env.MY_DB.prepare(
    `INSERT INTO user_state (user_id, data, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
  )
    .bind(userId, JSON.stringify(data), now)
    .run();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const segments = url.pathname.replace(/^\/+/, "").split("/");

    if (segments[0] !== "state" || segments.length < 2) {
      return new Response("Not found", { status: 404 });
    }

    const userId = segments[1];

    if (request.method === "GET") {
      const data = await getState(env, userId);
      return new Response(JSON.stringify({ userId, data }), {
        status: data ? 200 : 404,
        headers: { "content-type": "application/json" },
      });
    }

    if (request.method === "POST") {
      const incoming = await request.json();
      const current = (await getState(env, userId)) ?? {};
      const merged = { ...current, ...incoming };
      await saveState(env, userId, merged);
      return new Response(JSON.stringify({ userId, data: merged }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  },
};
