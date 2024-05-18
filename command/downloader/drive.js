import fetch from "node-fetch";
import cheerio from "cheerio";

export default async function (msg) {
	await msg.reaction("process");
	const quotedMessage = await msg.quotedMessage();
	const link = quotedMessage?.body || msg.body.slice(6);

	const driveId =
		/https:\/\/drive.google.com\/file\/d\/(.+)\/view/.exec(link) ||
		/https:\/\/drive.google.com\/u\/0\/uc.?id=(.+)&export=download/.exec(link);
	if (!driveId) return { text: "Link tidak valid!!!", error: true };
	const directLink = `https://docs.google.com/uc?export=download&id=${driveId[1]}`;
	await msg.reaction({ loading: true });

	let { url, headers } = await fetch(directLink);
	const contents = {};
	if (directLink == url) {
		const response = await directed(url);
		const content = head(response.headers);
		content.url = response.url;
		Object.assign(contents, content);

		if (content.fileSize >= 130) {
			await msg.reply(msg.mentions, {
				text:
					"File terlalu besar untuk didownload, silahkan download manual dari link berikut:\n\n" +
					response.url,
			});
			await msg.reaction({ stop: true });
			return msg.reaction("succes");
		}
	}
	if (Object.keys(contents).length == 0) {
		const content = head(headers);
		content.url = url;
		Object.assign(contents, content);
	}
	const { mimetype, fileName, fileSize } = contents;
	await msg.reply(msg.mentions, {
		document: { url: contents.url },
		mimetype,
		fileName,
	});
	await msg.reaction({ stop: true });
	return msg.reaction("succes");
}

function head(headers) {
	return {
		fileName: headers.get("content-disposition").match(/filename="(.+?)"/)[1],
		mimetype: headers.get("content-type"),
		fileSize: Math.floor(parseInt(headers.get("content-length")) / 1048576),
	};
}

async function directed(drive) {
	const direct = await fetch(drive, {
		headers: { cookie: process.env.COOKIE },
	});

	const html = await direct.text();
	const $ = cheerio.load(html);
	const url = $("#download-form").attr("action");
	return fetch(url, {
		headers: { "content-type": "application/x-www-form-urlencoded" },
	});
}
