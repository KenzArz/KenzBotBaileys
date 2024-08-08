import fetch from "node-fetch";
import cheerio from "cheerio";

export default async function (msg) {
	throw { text: "Sedang dalam perbaikan." };
	// await msg.reaction("process");
	// const body = msg.body.slice(9);
	// const regex = /https:\/\/meganei.net\/(.+?)\//;

	// if (regex.test(body)) {
	// 	const { preview, caption, linkDownload } = await mainPage(body);
	// 	const imageDwn = await msg.urlDownload(preview);
	// 	const thumb = await msg.resize(imageDwn);

	// 	await msg.reply(msg.room_chat, {
	// 		image: { url: preview },
	// 		jpegThumbnail: thumb,
	// 		caption,
	// 		mimetype: "image/jpeg",
	// 	});
	// 	await msg.reply(msg.room_chat, { text: linkDownload });
	// 	return msg.reaction("");
	// }

	// const search = "https://meganei.net?s=" + encodeURIComponent(body);
	// const fetching = await fetch(search);
	// const html = await fetching.text();

	// const $ = cheerio.load(html);
	// const notFound = $(".not-found").find("h1").text();
	// if (notFound == "Nothing Found")
	// 	return { text: "hasil untuk " + body + " tidak ditemukan", error: true };

	// const data = [];
	// $("article").each((i, el) => {
	// 	const title = $(el).find(".entry-title").text();
	// 	const link = $(el).find("a").attr("href");

	// 	if (title == "Daftar Komik") return;
	// 	data.push({ title, link });
	// });

	// if (data.length == 1) {
	// 	const { preview, caption, linkDownload } = await mainPage(data[0].link);
	// 	const imageDwn = await msg.urlDownload(preview);
	// 	const thumb = await msg.resize(imageDwn);

	// 	await msg.reply(msg.room_chat, {
	// 		image: { url: preview },
	// 		jpegThumbnail: thumb,
	// 		caption,
	// 		mimetype: "image/jpeg",
	// 	});
	// 	await msg.reply(msg.room_chat, { text: linkDownload });
	// 	return msg.reaction("");
	// }

	// let text = `*SEARCH RESULTS FOR*: *${body}*`;
	// for (const [i, content] of data.entries()) {
	// 	text += `\n${i + 1}. ${content.title}\n`;
	// }
	// text +=
	// 	"\nreply pesan ini dengan angka yang sesuai untuk melihat info lebih lengkap";

	// const komik = await msg.reply(
	// 	msg.room_chat,
	// 	{ text },
	// 	{ quoted: msg.quotedID }
	// );
	// msg.localStore(komik.key.id, {
	// 	command: "meganei",
	// 	data,
	// });

	// return msg.reaction("");
}

// export async function mainPage(page) {
// 	const fetching = await fetch(page);
// 	const html = await fetching.text();
// 	const $ = cheerio.load(html);
// 	const classHTML = ".is-layout-flow";

// 	let sinopsis = "*SINOPSIS*:";
// 	$(classHTML)
// 		.find("p")
// 		.each((i, el) => {
// 			sinopsis += "\n" + $(el).text() + "\n";
// 		});
// 	const preview = $(classHTML).find("img").attr("data-src");

// 	let infoKomik = "*DETAIL KOMIK*: ";
// 	$(".info-komik")
// 		.find("li")
// 		.each((i, el) => {
// 			const detail = $(el).find("b").text();
// 			const info = $(el).find("span").text();

// 			infoKomik += "\n" + detail + ": " + info.replaceAll("\n", "") + "\n";
// 		});

// 	let linkDownload = "link download";
// 	const title = $(".download-box").find("h2");
// 	$(".dwnld")
// 		.find("li")
// 		.each((i, el) => {
// 			const volume = $(el).find(".chapter-range").find("strong").text();
// 			const chapter = $(el).find(".chapter-range").find("font").text();

// 			let serverDwn = "";
// 			$(el)
// 				.find(".the-link")
// 				.find("a")
// 				.each((i, el) => {
// 					serverDwn += `${$(el).find("strong").text()}: ${$(el).attr(
// 						"href"
// 					)}\n\n`;
// 				});
// 			linkDownload += `\n${volume}: chapter ${chapter} \n${serverDwn}\n`;
// 		});

// 	return { caption: sinopsis + "\n\n" + infoKomik, preview, linkDownload };
// }
