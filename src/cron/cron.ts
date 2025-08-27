export interface Env {
  API: Fetcher;
  WORKER_AUTH_KEY: string;
}

export default {
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    const res = await env.API.fetch("https://internal/run", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.WORKER_AUTH_KEY}`,
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("runTask failed:", res.status, text);
      throw new Error(`runTask failed with ${res.status}`);
    }

    const data = await res.json().catch(() => ({}));
    console.log("runTask ok:", data);
  },
};
