# WhatsApp Message Scheduler

WhatsApp Message Scheduler is a simple app that allows users to schedule and send automated WhatsApp messages at a configured day and time.

- ✅ Schedule WhatsApp messages
- ✅ Configure exact date and time for sending

This app works by sending requests to a service built using the [go-whatsapp-web-multidevice](https://github.com/aldinokemal/go-whatsapp-web-multidevice) project.

---

## Powered by Cloudflare

This project runs **entirely on Cloudflare Workers**, with deployment and management via **Wrangler**:

- **API Worker** — exposes a minimal HTTP endpoint that sends a message (no traditional server required).
- **Cron Worker** — uses **Cloudflare Cron Triggers** to call the API Worker on a schedule.
- **Service Bindings** — the Cron Worker invokes the API Worker internally (no public URL needed).
- **Wrangler** — used for local dev, deploys, logs, and environment secrets.

> No frontend, no servers/VMs — just Workers.

---

## Minimal Stack

- Cloudflare **Workers** (API + scheduler)
- Cloudflare **Cron Triggers**
- Workers **Service Bindings**
- **Wrangler** (`npx wrangler`) for dev/deploy/logs
- External WhatsApp sender: **go-whatsapp-web-multidevice**

---

## Environment

The Workers read configuration from environment variables/secrets:

- `WP_SERVER_BASE_URL` — base URL of the WhatsApp sender service
- `WP_SERVER_USERNAME` — basic auth username
- `WP_SERVER_PASSWORD` — basic auth password

Secrets are stored with Wrangler (e.g. `npx wrangler secret put WP_SERVER_PASSWORD`).

---

## Notes

- This project is not an official WhatsApp API client.
- Make sure you comply with WhatsApp policies and local regulations when automating messaging.
