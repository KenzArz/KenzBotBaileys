import { Create_message } from "../../system/message.js";
import { POST } from "../../system/scraper/y2mate.js";

/**@param {Create_message} msg */
export default async function (msg) {
	await msg.reaction("process");
	const quotedMessage = msg.quotedMessage();
	const content = quotedMessage?.body || msg.body;

	const { data, ID } = await ytdl({ link: content });
	const dataContent =
		"Reply pesan ini dan pilih angka yang sesuai untuk memilih kualitas video\n\n" +
		"Title: " +
		data.title +
		"\n\n" +
		data.video
			.map((content, i) => `${i + 1}. *${content.bitrate}*: _${content.size}_`)
			.join("\n");
	const image = await msg.urlDownload(data.thumbnail);
	const thumbnail = await msg.resize(image);

	return {
		image,
		caption: dataContent,
		mimetype: "image/jpeg",
		jpegThumbnail: thumbnail,
		isExtended: true,
		data: {
			downloaded: data.video,
			ID,
			thumbnail,
		},
	};
}

// yt converter
export async function ytdl({ link, audioOnly, formData }) {
	const ytIdRegex =
		/(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:shorts\/)|(?:watch\?.*(?:|\&)v=|embed\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/;
	if (!ytIdRegex.test(link) && !formData) throw { text: "url tidak valid" };
	const ytId = ytIdRegex.exec(link)?.[1];
	const url = "https://youtu.be/" + ytId;

	const ID = { vid: ytId };
	const content = await POST({
		url: formData ? "convertV2/index" : "analyzeV2/ajax",
		formData: formData || {
			k_query: url,
			q_auto: "0",
			k_page: "home",
			hl: "en",
		},
	});

	if (formData) return content.dlink;
	else if (audioOnly) {
		ID.k = mp3.mp3128.k;
		return await ytdl({ formData: ID });
	}
	const mp4 = content.links.mp4;
	const video = Object.keys(mp4)
		.reduce((prev, item) => {
			prev.push({
				size: mp4[item].size,
				bitrate: mp4[item].q,
				id: mp4[item].k,
			});
			return prev;
		}, [])
		.sort((a, b) => parseInt(a.bitrate) - parseInt(b.bitrate));
	return {
		ID,
		data: {
			title: content.title,
			thumbnail: `https://i.ytimg.com/vi/${ytId}/0.jpg`,
			video,
		},
	};
}
