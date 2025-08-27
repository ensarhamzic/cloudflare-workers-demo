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

const url = `${BASE_URL.replace(/\/$/, "")}/send/message`;

function formatTime(date = new Date()) {
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
  const formattedTime = formatTime();
  const body = {
    phone: TARGET,
    message: `v3: Automated message sent on: ${formattedTime}`,
  };

  try {
    const response = await axios.post(url, body, {
      auth: { username: USERNAME, password: PASSWORD },
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });
    console.log("✅ Message sent:", response.data);
    return { ok: true, data: response.data };
  } catch (error) {
    const lastError = error?.response?.data || error?.message || String(error);
    console.error("❌ Error sending message:", lastError);
    return { ok: false, error: lastError };
  }
}

const app = express();

async function sendMessageEndpointHandler(req, res) {
  try {
    const result = await sendMessage();
    res.status(result.ok ? 200 : 500).json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

app.post("/send-message", sendMessageEndpointHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

cron.schedule("* * * * *", () => {
  console.log("⏳ Pokrećem cron job...");
  sendMessage();
});
