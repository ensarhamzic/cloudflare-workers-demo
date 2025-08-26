const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cron = require("node-cron");

dotenv.config();

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.WP_SERVER_BASE_URL;
const USERNAME = process.env.WP_SERVER_USERNAME;
const PASSWORD = process.env.WP_SERVER_PASSWORD;
const TARGET = process.env.WP_TARGET || "120363403131187763@g.us";
const intervalMs = 5 * 60 * 1000;

const url = `${BASE_URL.replace(/\/$/, "")}/send/message`;

let job = null;
let intervalId = null;
let running = false;
let lastSentAt = null;
let lastError = null;

function formatNowSrRS(date = new Date()) {
  return date
    .toLocaleString("sr-RS", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Europe/Belgrade",
    })
    .replace(",", "");
}

async function sendMessage() {
  const formattedTime = formatNowSrRS();
  const body = {
    phone: TARGET,
    message: `v2: Automated message sent on: ${formattedTime}`,
  };

  try {
    const response = await axios.post(url, body, {
      auth: { username: USERNAME, password: PASSWORD },
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });
    lastSentAt = new Date();
    lastError = null;
    console.log("✅ Message sent:", response.data);
    return { ok: true, data: response.data };
  } catch (error) {
    lastError = error?.response?.data || error?.message || String(error);
    console.error("❌ Error sending message:", lastError);
    return { ok: false, error: lastError };
  }
}

function startScheduler() {
  if (running) return;
  intervalId = setInterval(() => {
    void sendMessage();
  }, intervalMs);
  running = true;
  console.log(`⏱️  Started interval: every ${intervalMs} ms`);
}

function stopScheduler() {
  if (job) {
    job.stop();
    job = null;
  }
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  running = false;
  console.log("⏹️  Scheduler stopped");
}

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "WhatsApp sender is running",
    endpoints: ["/status", "/send-now", "/start", "/stop"],
  });
});

app.get("/status", (_req, res) => {
  res.json({
    ok: true,
    running,
    mode: "interval",
    intervalMs: intervalMs,
    lastSentAt: lastSentAt ? lastSentAt.toISOString() : null,
    lastSentAtLocal: lastSentAt ? formatNowSrRS(lastSentAt) : null,
    lastError: lastError || null,
    target: TARGET,
  });
});

app.post("/send-now", async (_req, res) => {
  const result = await sendMessage();
  res.status(result.ok ? 200 : 500).json(result);
});

app.post("/start", (_req, res) => {
  startScheduler();
  res.json({ ok: true, running });
});

app.post("/stop", (_req, res) => {
  stopScheduler();
  res.json({ ok: true, running });
});

function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down...`);
  stopScheduler();
  server.close(() => {
    console.log("HTTP server closed. Bye!");
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

const server = app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);

  setTimeout(() => {
    startScheduler();
  }, 30 * 1000);
});
