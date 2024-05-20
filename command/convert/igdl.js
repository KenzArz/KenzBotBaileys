import { igdl } from "../../system/scraper/y2mate.js";
import https from "https";
import { Create_message } from "../../system/message.js";

/**@param {Create_message} msg */
export default async function (msg) {
	const quotedMessage = msg.quotedMessage();
	const url = quotedMessage?.body || msg.body.split(" ")[1];

	const regex =
		/(?:https:\/\/:?www.instagram.com)\/((:?reel\/|:?p\/)([-_0-9A-Za-z]{11}))|(stories\/(.+?)\/)([-_0-9A-Za-z]{19})/;
	if (!regex.test(url))
		return {
			text: "link tidak valid pastikan link benar dari instagram",
			error: true,
		};

	await (url.includes("reel")
		? msg.reaction({ loading: true })
		: msg.reaction("process"));
	const contents = await igdl(url);
	if (contents.status != "ok")
		return { error: true, text: "*ERROR*\nsilahkan coba lagi!" };

	if (contents.link.length <= 1) {
		const size = {
			width: 300,
			height: 300,
		};
		const setting = await setMedia(contents.link, msg.urlDownload);
		const mediaBuffer = setting?.image || setting?.video;
		if (!mediaBuffer) {
			await msg.reaction({ stop: true });
			return msg.reaction("failed");
		}
		const fetching = await msg.urlDownload(contents.thumbnail);
		const validateThumb =
			fetching == "Forbidden" || fetching?.error || !fetching;

		let thumb;
		if (validateThumb)
			thumb = await msg.resize("./system/image/Error_Thumbnail.png", size);
		else {
			thumb = await msg.resize(fetching, size);
		}
		setting.jpegThumbnail = thumb;

		await msg.reply(msg.room_chat, setting);
		await msg.reaction({ stop: true });
		return msg.reaction("succes");
	}

	let index = "";
	for (const [content] of contents.link.entries()) {
		index += `\n${content + 1}`;
	}
	const contentMedia = await msg.reply(
		msg.room_chat,
		{
			text: `ketik angka yang sesuai slide dipostingan untuk didownload\n${index}\n\n*NOTE*\nbalas 99 untuk mendownload semua media`,
		},
		{ quoted: msg.quotedID }
	);

	const { tempStore } = await import("../../bot.js");
	tempStore({ message: contentMedia, contents, setMedia });
	return msg.reaction("");
}

async function setMedia(data, dwd) {
	const agent = new https.Agent({ keepAlive: true, timeout: 10000 });
	let message = {};

	for (const content of data) {
		const bufferMedia = await dwd(content.url, agent);
		if (content.type == "mp4") {
			message.video = bufferMedia;
			message.mimetype = "video/mp4";
		} else if (
			content.type == "webp" ||
			content.type == "jpg" ||
			content.type == "heic"
		) {
			message.image = bufferMedia;
			message.mimetype = "image/jpeg";
		}
	}
	return message;
}
