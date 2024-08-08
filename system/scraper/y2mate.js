import fetch from "node-fetch";

export async function y2mate({ url, formData }) {
	const baseUrl = "https://www.y2mate.com/mates/";
	const response = await fetch(baseUrl.concat(url), {
		method: "POST",
		headers: {
			accept: "*/*",
			"accept-language": "en-US,en;q=0.9",
			"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		body: new URLSearchParams(Object.entries(formData)),
	});

	const content = await response.json();
	if (content.c_status || content.mess)
		throw {
			text: content.mess,
			error: true,
		};
	return content;

	// if (isConvert) {
	// 	return json.dlink;
	// }

	// yt3
	// if (type == "mp3") {
	// 	const mp3 = json.links.mp3.mp3128;
	// 	return {
	// 		size: mp3.size,
	// 		bitrate: mp3.q,
	// 		id: mp3.k,
	// 	};
	// igdl
	// } else if (type == "insta") {
	// 	return json;
	// }

	// yt4
	// const metadata = [];
	// const mp4 = json.links.mp4;
	// for (const links in mp4) {
	// 	const size = mp4[links].size;
	// 	const bitrate = mp4[links].q;
	// 	const id = mp4[links].k;

	// 	metadata.push({ size, bitrate, id });
	// }
	// const video = metadata.sort((a, b) => {
	// 	const parseIntA = parseInt(a.bitrate);
	// 	const parseIntB = parseInt(b.bitrate);

	// 	return parseIntA - parseIntB;
	// });

	// return {
	// 	title: json.title,
	// 	thumbnail: `https://i.ytimg.com/vi/${json.vid}/0.jpg`,
	// 	video,
	// };
	//  "Please enter valid video URL."
}
