// src/api.ts

export interface Env {
  WP_SERVER_BASE_URL: string; // npr. https://tvoj-wp-server.com
  WP_SERVER_USERNAME: string; // basic auth user
  WP_SERVER_PASSWORD: string; // basic auth pass
}

// Format "dd.mm.yyyy HH:MM:SS" u Europe/Belgrade (kao u tvom kodu)
function formatTime(date = new Date()) {
  return new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Europe/Belgrade",
  })
    .format(date)
    .replace(",", "");
}

// Bezbedan Basic auth header
function basicAuth(user: string, pass: string) {
  return "Basic " + btoa(`${user}:${pass}`);
}

// Glavna funkcija — ekvivalent tvom sendMessage()
async function runTask(env: Env) {
  const nowISO = new Date().toISOString();
  console.log(`[runTask] started @ ${nowISO}`);

  // Validacija env varijabli (umesto dotenv fajla)
  const { WP_SERVER_BASE_URL, WP_SERVER_USERNAME, WP_SERVER_PASSWORD } = env;
  console.log("Using WP_SERVER_BASE_URL:", WP_SERVER_BASE_URL);
  if (!WP_SERVER_BASE_URL || !WP_SERVER_USERNAME || !WP_SERVER_PASSWORD) {
    const msg =
      "Missing required env vars (WP_SERVER_BASE_URL, WP_SERVER_USERNAME, WP_SERVER_PASSWORD)";
    console.error("❌", msg);
    return { ok: false, error: msg };
  }

  const base = WP_SERVER_BASE_URL.replace(/\/$/, "");
  const url = `${base}/send/message`;

  const body = {
    phone: "120363403131187763@g.us",
    message: `cloudflare worker: Automated message sent on: ${formatTime()}`,
  };

  // Timeout 30s (kao axios { timeout: 30000 })
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: basicAuth(WP_SERVER_USERNAME, WP_SERVER_PASSWORD),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await res.text().catch(() => "");
    let data: any = text;
    try {
      data = JSON.parse(text);
    } catch {
      /* ostavi text ako nije JSON */
    }

    if (!res.ok) {
      console.error("❌ Error sending message:", data || res.status);
      return { ok: false, error: data || `HTTP ${res.status}` };
    }

    console.log("✅ Message sent:", data);
    return { ok: true, data };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const lastError = err?.message || String(err);
    console.error("❌ Error sending message:", lastError);
    return { ok: false, error: lastError };
  }
}

export default {
  // Ručni trigger (ekvivalent Express POST /send-message).
  // Ostavio sam i GET i POST na /run da bude lako testirati.
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/run") {
      const result = await runTask(env);
      return Response.json(result, { status: result.ok ? 200 : 500 });
    }
    return new Response("Not found", { status: 404 });
  },
};

export { runTask };
