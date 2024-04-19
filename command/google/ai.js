import fetch from "node-fetch";
import FormData from "form-data";

import { Create_message } from "../../system/message.js";
const map = new Map();

/**@param {Create_message} msg */
export default async function (msg) {
  let user = map.get(msg.room_chat);
  if (!user) user = await guest();
  const formdata = await form(user, msg);

  const qai = await fetch("https://www.questionai.com/questionai/webchat/ask", {
    headers: {
      origin: "https://www.questionai.com",
      referer: "https://www.questionai.com/",
      cookie: `QUESTION_AI_PCUID=${process.env["CUID"]}; QUESTION_AI_UUID=${process.env["UUID"]};_hjSessionUser_3695897=eyJpZCI6ImE2MjZlMDA4LWE4YTYtNTQ1ZC1hOTRlLTYzYzIxY2FjM2VkZSIsImNyZWF0ZWQiOjE3MDg2MTQ0MjAxMDYsImV4aXN0aW5nIjp0cnVlfQ==;session=${process.env["SESSION"]}; question-ai-lang=en; _hjSession_3695897=eyJpZCI6IjZmZTdkODg3LTFmMzctNDRlMi05MDg4LWZlYzU4ZGE2NDMyMyIsImMiOjE3MTA3NDYzNTYzMDYsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MH0=; webcuid=6122341a7126d08760cbd4cf9c62f577;`,
    },
    body: formdata,
    method: "POST",
  });
  const { answer, own } = await readStream(qai.body);
  await msg.reply(msg.room_chat, { text: own || answer });
  return map.set(msg.room_chat, user);
}

async function guest() {
  const payload = {
    appId: "aihomework",
    clientType: 1,
    cuid: process.env["CUID"],
    vc: "100",
    vcname: "1.0.0",
    lang: "en",
    reqFrom: "browser",
    release: "2024.309.191758",
    t: Date.now(),
  };
  const cfg = await fetch("https://www.questionai.com/questionai/webchat/cfg", {
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      origin: "https://www.questionai.com",
      referer: "https://www.questionai.com/",
    },
    body: new URLSearchParams(Object.entries(payload)),
    method: "POST",
  });
  const {
    data: { presetId, sessionId },
  } = await cfg.json();
  return { presetId, sessionId };
}

async function form(data, msg) {
  const quoted = msg.quotedMessage();
  const body = msg.body.slice(4) || quoted.body;

  const formData = new FormData();
  formData.append("appId", "aihomework");
  formData.append("sessionId", data.sessionId);
  formData.append("presetId", data.presetId);
  formData.append("clientType", "1");
  formData.append("vc", "100");
  formData.append("vcame", "1.0.0");
  formData.append("cuid", process.env["CUID"]);
  formData.append("t", Date.now());
  formData.append("lang", "en");

  if (body == "to text") {
    const media = await msg.media();
    formData.append("msgCategory", "202");
    formData.append("img", media, {
      filename: "Kenz.png",
      contentType: "image/png",
    });
    formData.append("content", "/");
    formData.append("localMsgId", "1710328445417-4");
  } else {
    formData.append("msgCategory", "200");
    formData.append("content", body);
    formData.append("localMsgId", "1710328445417-2");
  }
  return formData;
}

async function readStream(body) {
  let error;
  body.on("error", (err) => {
    error = err;
  });

  let answer = "";
  let own;
  for await (const chunk of body) {
    const raw = chunk.toString();
    const [eventNames, content] = raw.split("\n");
    const data = JSON.parse(content.slice(5));

    if (data.ocrContent) own = data.ocrContent;
    if (!data.text) continue;
    answer += data.text;
  }

  return new Promise((resolve, reject) => {
    body.on("close", () => {
      error ? reject(error) : "";
    });
    resolve({
      answer,
      own,
    });
  });
}
