import { mainPage } from "./meganei.js";

export default async function (msg, komikInfo) {
	throw { text: "Sedang dalam perbaikan" };
	// await msg.reaction("process");
	// const index = komikInfo[Number(msg.body) - 1];
	// if (!index) throw { text: "angka yang anda masukan tidak sesuai" };

	// const { preview, caption, linkDownload } = await mainPage(index.link);
	// const imageDwn = await msg.urlDownload(preview);
	// const thumb = await msg.resize(imageDwn);

	// await msg.reply(msg.room_chat, {
	// 	image: imageDwn,
	// 	jpegThumbnail: thumb,
	// 	caption,
	// 	mimetype: "image/jpeg",
	// });
	// await msg.reply(msg.room_chat, { text: linkDownload });
	// return msg.reaction("");
}
