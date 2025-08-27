// src/api.ts

// Tipično izvučeš konfiguracije iz env-a (sekreti, D1, KV...)
export interface Env {
  // npr. EMAIL_API_KEY: string;
}

async function runTask(env: Env) {
  // <<< OVO JE TVOJA LOGIKA >>>
  // Ovde stavi šta god je tvoj "cron posao":
  // - čišćenje baze (D1/KV/R2)
  // - slanje e-mailova
  // - sinhronizacija podataka
  // - bilo šta što si ranije radio u Node cronu

  // primer:
  const now = new Date().toISOString();
  console.log(`[runTask] started @ ${now}`);
  // ... tvoj posao ...
  // ako nešto pođe po zlu, baci Error
  return { ok: true, at: now };
}

// Exportujemo tako da ga CRON worker može zvati kao interni service
export default {
  // Opcioni HTTP endpoint da ga i ručno pozoveš (POST/GET /run)
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/run") {
      try {
        const result = await runTask(env);
        return Response.json(result);
      } catch (err: any) {
        return new Response(`runTask error: ${err?.message || err}`, {
          status: 500,
        });
      }
    }
    return new Response("Not found", { status: 404 });
  },

  // (OPCIJA) Ako želiš da CRON poziva direktno funkciju bez HTTP-a,
  // mogao bi i da izvezeš named handler i da ga pozoveš preko module do module,
  // ali service binding .fetch je sasvim OK i najjednostavniji.
};

export { runTask }; // korisno za eventualne unit testove
