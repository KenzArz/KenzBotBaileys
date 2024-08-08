import { y2mate } from "../../system/scraper/y2mate.js";
import { Create_message } from "../../system/message.js";

/**@param {Create_message} msg */
export default async function (msg) {
	const quotedMessage = msg.quotedMessage();
	const url = quotedMessage?.body || msg.body.split(" ")[1];

	const regex =
		/(?:https:\/\/:?www.instagram.com)\/((:?reel\/|:?p\/)([-_0-9A-Za-z]{11}))|(stories\/(.+?)\/)([-_0-9A-Za-z]{19})/;
	if (!regex.test(url))
		throw { text: "link tidak valid pastikan link benar dari instagram" };

	await msg.reaction(url.match("reel") ? { loading: true } : "process");
	const contents = await igdl(url);

	// Contents index is more than 1
	if (contents.link.length > 1) {
		return {
			text: `Reply pesan ini dan pilih angka 1-${contents.link.length} yang sesuai slide dipostingan untuk didownload\n\n*NOTE*\nReply dengan angka 99 untuk mendownload semua media`,
			isExtended: true,
		};
	}

	// contents index is 1
	const linkContent = contents.link[0];
	return await setMedia(msg, linkContent, contents.thumbnail);
}

export async function setMedia(msg, contents, thumbnail) {
	const size = 300;
	const mediaBuffer = msg.urlDownload(contents.url);
	const thumbnailBuffer = await msg.urlDownload(thumbnail || contents.thumb);
	const thumbError =
		thumbnailBuffer == "Forbidden" ||
		thumbnailBuffer?.error ||
		!thumbnailBuffer;

	const thumb = await (thumbError
		? msg.resize("./system/image/Error_Thumbnail.png", 300, 300)
		: msg.resize(thumbnailBuffer, size, size));

	const message = {};
	if (contents.mimetype.match(/mp4/)) {
		message.video = mediaBuffer;
		message.mimetype = "video/mp4";
	} else if (/webp|jpg|heic|jpeg/.test(contents.mimetype)) {
		message.image = mediaBuffer;
		message.mimetype = "image/jpeg";
	}
	message.jpegThumbnail = thumb;
	return message;
}

export async function igdl(link) {
	const media = await y2mate({
		url: `analyzeV2/ajax`,
		formData: {
			k_query: link,
			q_auto: "1",
			k_page: "instagram",
			hl: "en",
		},
		type: "insta",
	});

	const pattern = /(JPG|JPEG|MP4||HEIC)\s(.*)/i;
	const contents = media.links.video.reduce((result, d, i) => {
		const text = d.q_text.match(pattern);
		const [_qtext, type, bitrate] = text;
		if (!media.gallery && (bitrate.match("1080") || bitrate.match("video")))
			result.push({ url: d.url, mimetype: type.toLowerCase() });
		else if (media.gallery) {
			result.push({
				url: d.url,
				thumb: media.gallery.items[i]?.thumb,
				mimetype: type.toLowerCase(),
			});
		}
		return result;
	}, []);

	return {
		link: contents,
		thumbnail: media.thumbnail,
	};
}
