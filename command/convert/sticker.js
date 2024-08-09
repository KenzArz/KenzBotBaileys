import { Sticker, StickerTypes } from "wa-sticker-formatter";

export default async function (msg) {
	await msg.reaction("process");
	const isQuoted = await msg.quotedMessage();
	const type = msg.typeMsg || isQuoted.typeMsg;
	if (type == "video")
		throw { text: "media harus berupa gambar atau video gif" };
	const quality = type == "image" ? 100 : 15;

	const bufferImage = await msg.media();
	if (bufferImage.text) throw { text: bufferImage.text };

	const buffer = new Sticker(bufferImage, {
		author: "KenzBot (´-﹏-`)",
		type: StickerTypes.FULL,
		quality,
		background: "transparent",
	});
	return await buffer.toMessage();
}
