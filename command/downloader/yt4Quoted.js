import { Create_message } from "../../system/message.js";
import { ytdl } from "./yt4.js";

/**@param {Create_message} msg */
export default async function (msg, { downloaded, ID, thumbnail }) {
	await msg.reaction({ loading: true });
	const content = downloaded[parseInt(msg.body) - 1];

	if (!content) throw { text: "angka yang anda masukan tidak sesuai" };

	ID.k = content.id;
	const convert = await ytdl({ formData: ID });
	return {
		video: { url: convert },
		jpegThumbnail: thumbnail,
		mimetype: "video/mp4",
		quoted: true,
	};
}
