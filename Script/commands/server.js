// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const gTTS = require('gtts'); // npm i gtts

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "verify_token_example";
const BASE_URL = process.env.BASE_URL || "https://your-domain.example.com";
const PORT = process.env.PORT || 3000;

// voices folder serve static
const VOICE_DIR = path.join(__dirname, "voices");
fs.ensureDirSync(VOICE_DIR);
app.use("/voices", express.static(VOICE_DIR)); // files available at BASE_URL/voices/<file>.mp3

// ========== Emoji -> Bengali text (female-cute style) ==========
// তুমি চাইলে এখানে আরও ইমোজি + টেক্সট যোগ করতে পারো
const emojiMap = {
  "😍": "ওই দেখছি! তুমি বারবার তাকালে লজ্জা হয় 😳",
  "😂": "হাহা! হাসতে হাসতে পেট কেঁপে গেল 😂",
  "😡": "রে, রাগ করো না প্লিজ, শান্ত হও তোমার ভাই আছে।",
  "😭": "ওহো! কাঁদো না, সব ঠিক হয়ে যাবে আরে, কষ্ট লাগছে শুনে।",
  "😎": "ওহ আমরা কুল হইয়া গেলাম, কুল কিড সেভিং! ",
  "🤔": "ভাই, একটু ভাবো তো—এইটা কি ঠিক? 🤔",
  "😴": "ঘুমাও আর বিশ্রাম নাও, মিষ্টি স্বপ্ন দেখতে।",
  "🥰": "পাগল! তোমাকে মনে পড়ে চট করে অনেক ভালো লাগলো।",
  "😱": "আরে বাপরে! কি ব্যাপার এত ভয় পেলি? 😱",
  "😜": "হাসি থামাও না, তুমি তো বড়ই মজার 😜",
  "😢": "মন খারাপ কোরো না, হাসো একটু।",
  "😇": "ভালো কাজ করো, আল্লাহ তোমাকে ভালো রাখুক।",
  "😏": "হুহু, ওইটো চোখে-চোখে কথা আছে না! 😏",
  "💀": "ওইবাহ — একদম মজা করে মরছি! 💀",
  "🤩": "ওরে বাপ! কেমন ঝকঝকে, দেখতেছি তোমারে 🤩",
  "👍": "ভালো! একদম ঠিক বললে।",
  "👎": "না না, এটা ঠিক হচ্ছে না, বদলে নেওয়া উচিত।",
  "👏": "ওয়ে! দারুণ কাজ করলে, বাহ্👏",
  "🙌": "চলো সবাই একসাথে, উদ্দীপনা বাড়াই—উফ! 🙌",
  "💖": "হৃদয়টা মাখা মাখা ভালো লাগা দিচ্ছে, ধন্যবাদ 💖"
};

// ========= Helper: generate TTS mp3 file =========
async function generateVoice(text, filename) {
  return new Promise((resolve, reject) => {
    try {
      const filepath = path.join(VOICE_DIR, filename);
      const tts = new gTTS(text, 'bn'); // 'bn' = Bengali
      tts.save(filepath, (err) => {
        if (err) return reject(err);
        resolve(filepath);
      });
    } catch (e) {
      reject(e);
    }
  });
}

// ========= Facebook webhook verification =========
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// ========= Webhook events (messages) =========
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      // messaging array may have multiple events
      const webhookEvent = entry.messaging && entry.messaging[0];
      if (!webhookEvent) continue;

      // when message received
      if (webhookEvent.message) {
        const senderId = webhookEvent.sender.id;
        const message = webhookEvent.message;

        // if message contains text that is exactly an emoji in our map
        if (message.text) {
          const text = message.text.trim();
          // if user sent only one emoji (or exact match)
          if (emojiMap[text]) {
            try {
              const phrase = emojiMap[text];
              const safeFilename = `voice_${encodeURIComponent(text)}_${Date.now()}.mp3`;
              const filepath = await generateVoice(phrase, safeFilename);
              // publicly accessible URL
              const publicUrl = `${BASE_URL}/voices/${path.basename(filepath)}`;

              // send audio attachment to the sender (or thread)
              await sendAudioMessage(senderId, publicUrl);
              console.log(`Sent audio for emoji ${text} -> ${publicUrl}`);
            } catch (err) {
              console.error("TTS or send error:", err.message || err);
            }
          }
        }

        // also support reactions: if platform sends reaction events, you can handle here (platform dependent)
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// ========= function to send audio via Facebook Graph API =========
async function sendAudioMessage(recipientId, audioUrl) {
  try {
    const body = {
      recipient: { id: recipientId },
      message: {
        attachment: {
          type: "audio",
          payload: {
            url: audioUrl
          }
        }
      }
    };
    const res = await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, body);
    return res.data;
  } catch (err) {
    console.error("Error sending audio message:", err.response ? err.response.data : err.message);
    throw err;
  }
}

// ========= simple root page =========
app.get('/', (req, res) => {
  res.send("Emoji Voice Bot is running. Voices served at /voices");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Voices dir: ${VOICE_DIR}`);
});
