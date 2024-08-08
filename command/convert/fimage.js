export default async function (msg) {
	await msg.reaction("process");
	const quoted = msg.quotedMessage();
	if (!quoted) throw { text: "tidak ada gambar yang dijadikan thumbnail" };

	const downloadMedia = await msg.media();
	const downloadThumb = await msg.media(msg.quotedID);

	let { height, width } = quoted.quotedID.message.imageMessage;
	if (height > width) {
		height = 256;
		width = 144;
	} else if (width > height) {
		width = 256;
		height = 144;
	} else if (height == width) {
		height = 300;
		width = 300;
	}

	const thumbSize = await quoted.resize(downloadThumb, { width, height });

	return {
		image: downloadMedia,
		mimetype: "image/jpeg",
		jpegThumbnail: thumbSize,
	};
}
