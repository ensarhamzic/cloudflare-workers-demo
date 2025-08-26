const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const BASE_URL = process.env.WP_SERVER_BASE_URL;
const USERNAME = process.env.WP_SERVER_USERNAME;
const PASSWORD = process.env.WP_SERVER_PASSWORD;

const url = `${BASE_URL}/send/message`;

async function sendMessage() {
  const now = new Date();
  const formattedTime = now
    .toLocaleString("sr-RS", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    .replace(",", "");

  const body = {
    phone: "120363403131187763@g.us",
    message: `Automated message sent on: ${formattedTime}`,
  };

  try {
    const response = await axios.post(url, body, {
      auth: {
        username: USERNAME,
        password: PASSWORD,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Message sent:", response.data);
  } catch (error) {
    console.error("❌ Error sending message:", error.message);
  }
}

sendMessage();
setInterval(sendMessage, 1 * 60 * 1000);
