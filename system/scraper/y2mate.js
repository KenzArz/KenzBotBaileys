import fetch from "node-fetch";

export async function POST({ url, formData, type, isConvert }) {
	const baseUrl = "https://www.y2mate.com/mates/";
	const fetching = await fetch(baseUrl.concat(url), {
		method: "POST",
		headers: {
			accept: "*/*",
			"accept-language": "en-US,en;q=0.9",
			"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		body: new URLSearchParams(Object.entries(formData)),
	});

	const json = await fetching.json();
	if (isConvert) {
		return json.dlink;
	}

	if (type == "mp3") {
		const mp3 = json.links.mp3.mp3128;
		return {
			size: mp3.size,
			bitrate: mp3.q,
			id: mp3.k,
		};
	} else if (type == "insta") {
		return json;
	}

	const metadata = [];
	const mp4 = json.links.mp4;
	for (const links in mp4) {
		const size = mp4[links].size;
		const bitrate = mp4[links].q;
		const id = mp4[links].k;

		metadata.push({ size, bitrate, id });
	}
	const video = metadata.sort((a, b) => {
		const parseIntA = parseInt(a.bitrate);
		const parseIntB = parseInt(b.bitrate);

		return parseIntA - parseIntB;
	});

	return {
		title: json.title,
		thumbnail: `https://i.ytimg.com/vi/${json.vid}/0.jpg`,
		video,
	};
}

export async function ytdl(link, type) {
	const ytIdRegex =
		/(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:shorts\/)|(?:watch\?.*(?:|\&)v=|embed\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/;
	if (!ytIdRegex.test(link)) return { text: "url tidak valid", error: true };
	const ytId = ytIdRegex.exec(link);
	const url = "https://youtu.be/" + ytId[1];

	const content = await POST({
		url: `analyzeV2/ajax`,
		formData: {
			k_query: url,
			q_auto: "0",
			k_page: "home",
			hl: "en",
		},
		type,
	});

	return {
		ID: {
			vid: ytId[1],
		},
		data: content,
	};
}

export async function igdl(link) {
	const media = await POST({
		url: `analyzeV2/ajax`,
		formData: {
			k_query: link,
			q_auto: "1",
			k_page: "instagram",
			hl: "en",
		},
		type: "insta",
	});

	const contents = media.links.video.reduce((result, d, i) => {
		const pattern = /(JPG|JPEG|MP4||HEIC)\s(.*)/i;
		const text = d.q_text.match(pattern);
		const [_qtext, type, bitrate] = text;
		if (
			!media.gallery &&
			(bitrate.includes("1080") || bitrate.includes("video"))
		)
			result.push({ url: d.url, type: type.toLowerCase() });
		else if (media.gallery) {
			result.push({
				url: d.url,
				thumb: media.gallery?.items[i]?.thumb,
				type: type.toLowerCase(),
			});
		}
		return result;
	}, []);

	return {
		status: media.status,
		link: contents,
		thumbnail: media.thumbnail,
	};
}
