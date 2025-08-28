export interface Env {
  WORKER_AUTH_KEY: string;
}

async function runTask(env: Env) {
  console.log("[runTask] executed");
  return { ok: true };
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/run") {
      const authHeader = req.headers.get("Authorization");
      if (authHeader !== `Bearer ${env.WORKER_AUTH_KEY}`) {
        return new Response("Forbidden", { status: 403 });
      }

      const result = await runTask(env);
      return Response.json(result, { status: 200 });
    }
    return new Response("Not found", { status: 404 });
  },
};

export { runTask };
