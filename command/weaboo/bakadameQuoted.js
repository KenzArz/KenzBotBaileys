import { mainPage, shortLink } from "./bakadame.js";

export default async function (msg, komikInfo) {
	throw { text: "Sedang dalam perbaikan" };
	// await msg.reaction("process");
	// const parseToInt = parseInt(msg.body);
	// const index = komikInfo[parseToInt - 1];

	// if (!index) throw { text: "angka yang anda masukan tidak sesuai" };
	// const { image, caption, contents } = await mainPage(index.url);
	// const imageDwn = await msg.urlDownload(image);
	// const thumb = await msg.resize(imageDwn);

	// await msg.reply(msg.room_chat, {
	// 	image: { url: image },
	// 	jpegThumbnail: thumb,
	// 	caption,
	// 	mimetype: "image/jpeg",
	// });

	// const text = await shortLink(contents);
	// if (text.split("LIMIT").length > 1) {
	// 	for (const tautan of text.split("LIMIT")) {
	// 		await msg.reply(msg.room_chat, { text: tautan });
	// 	}
	// 	return;
	// }
	// await msg.reply(msg.room_chat, { text });

	// return msg.reaction("");
}
