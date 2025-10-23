require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "verify_token_example";

// ========= Emoji Replies (Multiple Lines, Serial System) =========
const emojiReplies = {
  "😂": [
    "হাসতে হাসতে পেট ব্যাথা হয়ে গেল 😂",
    "আরো বলো, হাসি থামতেছে না! 😆",
    "তুমি সত্যিই খুব ফানি! 🤣",
    "একটু আস্তে হাসো নাহলে আবার দাত পড়ে যাবে😁",
    "জান তোমার দাতে তো ময়লা 😓",
    "এতো হাসার কি আছে"
  ],
  "😍": [
    "আহা! এমনভাবে তাকিয়ো না 😍",
    "আমারও ভালো লেগে গেল! 🤭",
    "হৃদয় গলে জেলি হয়ে গেলো 😳",
    "কথা দেও আমাকে খুব ভালোবাসবে♥️",
    "জান সত্যি তোমাকে অনেক ভালোবাসি🫂",
    "কথা দেও আমাকেই ভালোবাসবে🥺"
  ],
  "😡": [
    "রাগ কমাও, মনটা শান্ত রাখো 🙂",
    "কেন রাগ করো বলো তো? 😟",
    "চলো কথা বলি, সব ঠিক হয়ে যাবে 🤝",
    "কেউ কষ্ট দিয়েছে😌 ?",
    "আমি যদি কোনো ভুল করে থাকি তাহলে মাফ করে দিও😞 ",
    "মাথা ঠান্ডা করো🥶",
    "ও হো আমার জান টা এতো রাগ করে কেন 💘"
  ]
};

// ========= Memory to store last index for each emoji =========
const lastIndex = {};

function getNextReply(emoji) {
  const list = emojiReplies[emoji];
  if (!list) return null;

  if (!lastIndex[emoji]) lastIndex[emoji] = 0;

  const reply = list[lastIndex[emoji]];
  lastIndex[emoji] = (lastIndex[emoji] + 1) % list.length;

  return reply;
}

// ========= Verify Webhook =========
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// ========= Message Receiver =========
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(async (entry) => {
      const event = entry.messaging[0];
      const senderId = event.sender.id;

      if (event.message && event.message.text) {
        const text = event.message.text.trim();

        if (emojiReplies[text]) {
          const reply = getNextReply(text);
          await sendText(senderId, reply);
        }
      }
    });

    return res.status(200).send("EVENT_RECEIVED");
  }

  res.sendStatus(404);
});

// ========= Send Text Function =========
async function sendText(recipientId, message) {
  await axios.post(
    `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: recipientId },
      message: { text: message }
    }
  );
}

// ========= Root Route =========
app.get("/", (_, res) => {
  res.send("Emoji Serial Reply Bot Running ✅");
});

app.listen(3000, () => console.log("Server running on port 3000"));
