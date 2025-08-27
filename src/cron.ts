// src/cron.ts

export interface Env {
  API: Fetcher; // dolazi iz service binding-a (wrangler.toml)
}

export default {
  // Cloudflare CRON entrypoint
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    // Pozovi API Worker internim pozivom (service binding).
    // URL nije bitan (nije javno), bitan je path koji tvoj API očekuje.
    console.log("CRON triggered");
    const res = await env.API.fetch("https://internal/run", { method: "POST" });
    if (!res.ok) {
      const text = await res.text();
      console.error("runTask failed:", res.status, text);
      throw new Error(`runTask failed with ${res.status}`);
    }
    const data = await res.json().catch(() => ({}));
    console.log("runTask ok:", data);
  },
};
