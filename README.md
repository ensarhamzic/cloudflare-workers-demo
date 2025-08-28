# Cloudflare Workers Example: API + Cron

This repository contains a minimal example of how to use **two Cloudflare Workers**:

- An **API Worker** that exposes a `/run` endpoint.
- A **Cron Worker** that triggers the API Worker on a schedule.

The goal is to demonstrate how to connect Workers with **service bindings** and how to secure internal calls with a shared secret (`WORKER_AUTH_KEY`).

---

## How it works

- The **API Worker** exposes an endpoint `/run`.

  - It requires an `Authorization: Bearer <WORKER_AUTH_KEY>` header.
  - It executes a simple `runTask` function (here only logs to the console).

- The **Cron Worker** is configured with a schedule (`[triggers] crons` in `wrangler.toml`).
  - On each tick, it makes a request to the API Worker via **service binding**.
  - It sends the required `Authorization` header using the shared secret.

---

## Configuration

1. Deploy the API Worker:

```bash
cd api
npx wrangler deploy
```

2. Add secrets:

# in the API worker folder

```bash
npx wrangler secret put WORKER_AUTH_KEY
```

3. Deploy the Cron Worker:

```bash
cd cron
npx wrangler deploy
```

4. Add the same secret to the Cron Worker:

# in the cron worker folder

```bash
npx wrangler secret put WORKER_AUTH_KEY
```

---

## Testing locally

- Run both workers locally with:

```bash
npx wrangler dev
```

- Manually trigger the cron worker in dev mode:

```bash
curl http://127.0.0.1:8787/cdn-cgi/handler/scheduled
```

- Call the API worker directly (with auth header):

```bash
curl -X POST http://127.0.0.1:8787/run \
 -H "Authorization: Bearer <WORKER_AUTH_KEY>"
```

---

## Summary

This repository is a **template** that shows:

- How to build a simple API Worker.
- How to configure a Cron Worker.
- How to connect them with **service bindings**.
- How to secure internal calls with a shared secret.

Use this as a starting point for more advanced workflows with Cloudflare Workers.
