import axios from "axios";
import cheerio from "cheerio";

export default async function (msg) {
	throw { text: "Sedang dalam perbaikan" };
	await msg.reaction("process");
	const quotedMessage = await msg.quotedMessage();
	const link = quotedMessage?.body || msg.body.slice(10);

	if (!link.includes("roboguru"))
		throw { text: "pastikan link benar, dan link harus dari roboguru" };

	const { data } = await axios(link);
	const $ = cheerio.load(data);

	let text,
		img = [];
	if (link.includes("question")) {
		$(".qns_explanation_answer").each((i, el) => {
			const html = $(el);
			text = html.find("p").text();

			html.find("img").each((i, el) => {
				const imgData = $(el).attr();
				if (imgData?.src) {
					if (imgData.src.includes("https")) img.push(imgData.src);
					else if (imgData.src.includes("data:image")) img.push(imgData.src);
				}
			});
			html.find("li").each((i, el) => {
				text += `\n${i + 1}. ${$(el).text()}`;
			});
		});
	} else if (link.includes("forum")) {
		$(".lock-discussions").each(async (i, el) => {
			const html = $(el);
			text = html.find("h2").text();

			html.find(".chakra-image").each((i, el) => {
				const content = $(el).attr();
				if (!content.loading) img.push(content.src);
			});
		});
	}

	if (img.length > 0) {
		img.forEach(async image => {
			if (image.includes("data:image")) {
				// Mengambil data base64 dari URL
				const base64Data = image.split(",")[1];

				// Mengonversi data base64 menjadi buffer
				const imageBuffer = Buffer.from(base64Data, "base64");

				const thumb = await msg.resize(imageBuffer);

				await msg.reply(msg.room_chat, {
					caption: text || "hasil yang ditemukan",
					image: imageBuffer,
					jpegThumbnail: thumb,
				});
				return;
			}
			const downloadContent = await axios.get(image, {
				responseType: "arraybuffer",
			});
			const thumb = await msg.resize(downloadContent.data);
			await msg.reply(msg.room_chat, {
				caption: text || "hasil yang ditemukan",
				image: { url: image },
				jpegThumbnail: thumb,
			});
		});
	} else {
		await msg.reply(msg.room_chat, {
			text: text,
		});
	}
	await msg.reaction("");
}
