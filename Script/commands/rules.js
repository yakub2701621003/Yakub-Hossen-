const fs = require("fs-extra");
const axios = require("axios");
const request = require("request");

module.exports.config = {
  name: "rules",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐘𝐀𝐊𝐔𝐁 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ _ ☢️",
  description: "Automatically sends group rules every 2 hours",
  commandCategory: "system",
  cooldowns: 5,
};

const rulesText = (groupName) => `🌺╔══❖•💠 **${groupName || "𝐒𝐒𝐂 𝟐𝐊𝟐𝟓⸙ꠋꠋꠋꠋꠋꠋꠋꠋꠋꠋꠋꠋꠋꠋꠋ⭕"} 𝐆𝐑𝐎𝐔𝐏 𝐑𝐔𝐋𝐄𝐒 💠•❖══╗🌺

📌 সবার জন্য কিছু গুরুত্বপূর্ণ নিয়ম — অনুগ্রহ করে সবাই মেনে চলবে 🙏

💎✨ 𝟏. 𝑹𝒆𝒔𝒑𝒆𝒄𝒕 𝑬𝒗𝒆𝒓𝒚𝒐𝒏𝒆 ✨💎
> সবার সাথে ভদ্রভাবে আচরণ করো 💬
কারও সাথে ঝগড়া বা খারাপ ব্যবহার ❌

💥✨ 𝟐. 𝑵𝒐 𝑺𝒑𝒂𝒎 / 𝑭𝒍𝒐𝒐𝒅 ✨💥
> একসাথে অনেক মেসেজ পাঠানো বা ট্যাগ স্প্যাম করা নিষেধ 🚫

🔗✨ 𝟑. 𝑵𝒐 𝑷𝒓𝒐𝒎𝒐𝒕𝒊𝒐𝒏 ✨🔗
> নিজের পেজ/গ্রুপ/চ্যানেল লিংক পোস্ট করা যাবে না 📵
অ্যাডমিন পারমিশন ছাড়া লিংক শেয়ার ❌

💢✨ 𝟒. 𝑵𝒐 𝟏𝟖+ / 𝑭𝒂𝒌𝒆 𝑪𝒐𝒏𝒕𝒆𝒏𝒕 ✨💢
> কোনো অশ্লীল ছবি, ভিডিও, ভয়েস শেয়ার করলে ব্যান 😤
ভুয়া আইডি বা ফেক নাম ❌

🕌✨ 𝟓. 𝑹𝒆𝒔𝒑𝒆𝒄𝒕 𝑹𝒆𝒍𝒊𝒈𝒊𝒐𝒏 ✨🕌
> ধর্ম নিয়ে মজা, কটূক্তি বা বিতর্ক কঠোরভাবে নিষিদ্ধ 🚫

💬✨ 𝟔. 𝑼𝒔𝒆 𝑷𝒐𝒍𝒊𝒕𝒆 𝑳𝒂𝒏𝒈𝒖𝒂𝒈𝒆 ✨💬
> কারও মনে আঘাত দেয় এমন কথা বলো না ❤️

👑✨ 𝟕. 𝑭𝒐𝒍𝒍𝒐𝒘 𝑨𝒅𝒎𝒊𝒏 & 𝑴𝒐𝒅𝒔 ✨👑
> অ্যাডমিনের সিদ্ধান্তই চূড়ান্ত ⚖️
রুল ভাঙলে ⚠️ Warning বা 🚫 Remove করা হবে

📚✨ 𝟖. 𝑺𝒕𝒂𝒚 𝑶𝒏 𝑻𝒐𝒑𝒊𝒄 ✨📚
> গ্রুপের উদ্দেশ্য অনুযায়ী চ্যাট করো 💡
অফটপিক বা অযথা আলোচনা কমাও 💤

📩✨ 𝟗. 𝑹𝒆𝒑𝒐𝒓𝒕 𝑷𝒓𝒊𝒗𝒂𝒕𝒆𝒍𝒚 ✨📩
> কোনো সমস্যা হলে পাবলিকে না বলে, অ্যাডমিনকে ইনবক্সে জানাও 🙏

🌺╚══❖•💠 𝑩𝒆 𝑹𝒆𝒔𝒑𝒆𝒄𝒕𝒇𝒖𝒍, 𝑩𝒆 𝑭𝒓𝒊𝒆𝒏𝒅𝒍𝒚 💠•❖══╝🌺

🌸 𝐆𝐫𝐨𝐮𝐩 𝐍𝐚𝐦𝐞: ${groupName || "𝐒𝐒𝐂 𝟐𝐊𝟐𝟓⸙ꠋꠋꠋꠋꠋꠋꠋꠋꠋꠋꠋꠋꠋꠋꠋ⭕"}
👑 𝐀𝐝𝐦𝐢𝐧: 𝐘𝐀𝐊𝐔𝐁 𝐇𝐎𝐒𝐒𝐄𝐍 🔗
https://www.facebook.com/yakub.hossen.548359

💖 Stay humble, stay respectful — together we are family! 💖`;

module.exports.onLoad = async ({ api }) => {
  const imageLink = "https://i.postimg.cc/PJKFqGkP/IMG-20240823-182020-699.jpg"; // সুন্দর ব্যাকগ্রাউন্ড ইমেজ আমি বেছে দিয়েছি 💠
  
  setInterval(async () => {
    const threads = global.data.allThreadID || [];
    for (const threadID of threads) {
      try {
        const threadInfo = await api.getThreadInfo(threadID);
        const groupName = threadInfo.threadName || "Unknown Group";

        const imgPath = __dirname + "/cache/rulesbanner.jpg";
        await new Promise((resolve, reject) => {
          request(encodeURI(imageLink))
            .pipe(fs.createWriteStream(imgPath))
            .on("close", resolve)
            .on("error", reject);
        });

        api.sendMessage(
          {
            body: rulesText(groupName),
            attachment: fs.createReadStream(imgPath),
          },
          threadID,
          () => fs.unlinkSync(imgPath)
        );
      } catch (err) {
        console.log(`[rules.js] Error sending rules in ${threadID}:`, err.message);
      }
    }
  }, 2 * 60 * 60 * 1000); // প্রতি ২ ঘন্টা পর পর
};

module.exports.run = async ({ api, event }) => {
  const threadInfo = await api.getThreadInfo(event.threadID);
  const groupName = threadInfo.threadName || "Unknown Group";
  const imgPath = __dirname + "/cache/rules.jpg";
  const imageLink = "https://i.postimg.cc/PJKFqGkP/IMG-20240823-182020-699.jpg";

  request(encodeURI(imageLink))
    .pipe(fs.createWriteStream(imgPath))
    .on("close", () =>
      api.sendMessage(
        {
          body: rulesText(groupName),
          attachment: fs.createReadStream(imgPath),
        },
        event.threadID,
        () => fs.unlinkSync(imgPath)
      )
    );
};

  
