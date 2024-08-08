import { generateList } from "./sauce.js";

export default async function (msg, anime) {
	await msg.reaction("process");
	const infoAnime = anime[Number(msg.body) - 1];
	if (!infoAnime) throw { text: "angka yang anda masukan tidak sesuai" };

	const info = generateList([infoAnime], "Info Anime");
	const downloadContent = await msg.urlDownload(infoAnime.image);
	const resize = await msg.resize(downloadContent);

	return {
		caption: info,
		image: downloadContent,
		jpegThumbnail: resize,
		mimetype: "image/jpeg",
	};
}
