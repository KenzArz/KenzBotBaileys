import fetch from "node-fetch";
import * as Cheerio from "cheerio";

export default async function (msg) {
	const quotedMessage = msg.quotedMessage();
	const links = quotedMessage?.body || msg.body.slice(6);

	const x2twitter = await fetch("https://x2twitter.com/api/ajaxSearch", {
		headers: {
			"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		method: "post",
		body: new URLSearchParams(
			Object.entries({
				q: links,
				lang: "en",
			})
		),
	});

	const pattern = /image/;
	const media = await x2twitter.json();
	if (media.statusCode) throw { text: media.msg };
	const $ = Cheerio.load(media.data);
	const contents = await Promise.all(
		$(".thumbnail img")
			.map(async (_, el) => {
				const thumbnail = await msg.urlDownload($(el).attr("src"));
				contents.push({
					jpegThumbnail: await msg.resize(thumbnail),
				});
			})
			.toArray()
	);

	await Promise.all(
		$(".dl-action").each(async (i, el) => {
			const content = $(el).find("p a").first().attr("href");
			const bufferContent = await msg.urlDownload(content);
			if (!content.match(pattern)) {
				contents[i].video = bufferContent;
				contents[i].mimetype = "video/mp4";
				return;
			}
			contents[i].image = bufferContent;
			contents[i].mimetype = "image/jpeg";
		})
	);
	return contents.length
		? contents
		: await Promise.all(
				$(".download-items")
					.map(async (_, el) => {
						const content = $(el).find("a").first().attr("href");
						const bufferContent = await msg.urlDownload(content);
						const thumbnail = await msg.urlDownload($("img").attr("src"));
						const obj = {
							mimetype: !content.match(pattern) ? "video/mp4" : "image/jpeg",
							jpegThumbnail: await msg.resize(thumbnail),
						};
						if (!content.match(pattern)) obj.video = bufferContent;
						else {
							obj.image = bufferContent;
						}
						return obj;
					})
					.toArray()
		  );
}
