import { Create_message } from "../../system/message.js";
import { POST } from "../../system/scraper/y2mate.js";

/**@param {Create_message} msg */
export default async function (msg, { downloaded, ID, thumbnail }) {
  await msg.reaction({ loading: true });
  const content = downloaded[parseInt(msg.body) - 1];

  if (!content)
    return {
      text: "angka yang anda masukan tidak sesuai",
      error: true,
    };

  ID.k = content.id;
  const convert = await POST({
    url: `convertV2/index`,
    formData: ID,
    isConvert: true,
  });
  await msg.reply(
    msg.room_chat,
    {
      video: { url: convert },
      jpegThumbnail: thumbnail,
      mimetype: "video/mp4",
    },
    { quoted: msg.quotedID }
  );

  await msg.reaction({ stop: true });
  await msg.reaction("succes");
}
