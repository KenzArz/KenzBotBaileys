import fetch from "node-fetch";
import { readFileSync } from "node:fs";
// import sizeOf from "image-size";

export const generateList = (content, title, list = true) =>
	content.reduce((prev, anime, index) => {
		return (prev += `\n\n${list ? `${index + 1},` : ""} *Title*: _${
			anime.native
		}_
	*Romaji*: _${anime.romaji || "-"}_
	*English*: _${anime.english || "-"}_
	*Episode*: _${anime.episode || "-"}_
	*Similarity*: _${anime.similarity}_${
			anime.isAdult ? `\n	*Hanime*: _True_` : ""
		}`);
	}, `      ╾─͙─͙─͙${title}─͙─͙─͙╼${list ? "\n*Replay pesan ini dengan angka untuk info sauce yang lebih lengkap*" : ""}`);

const downloadMedia = async (urlDownload, url) => {
	const content = await urlDownload(url);
	const image =
		content ||
		(await Promise.resolve(readFileSync("system/image/Error_Image.jpg")));
	// const { height, width } = sizeOf(new Uint8Array(image));
	return {
		image,
		size: !content ? 300 : undefined,
	};
};

export default async function (msg) {
	await msg.reaction({ loading: true });
	const bufferImage = await msg.media();
	if (bufferImage.text) throw { text: bufferImage.text };

	const getData = await fetch("https://api.trace.moe/search?anilistInfo", {
		method: "POST",
		body: bufferImage,
		headers: { "content-Type": "image/jpeg" },
	});

	const data = await getData.json();
	const result = data.result;
	const animes = result.map(anime => {
		const {
			title: { native, romaji, english },
			isAdult,
		} = anime.anilist;
		return {
			native,
			romaji,
			english,
			isAdult,
			episode: anime.episode,
			similarity: (anime.similarity * 100).toFixed(2) + "%",
			image: anime.image,
		};
	});

	const rmvDuplicate = animes.filter(
		(anime, i) => i === animes.findIndex(obj => anime.native === obj.native)
	);
	const sfw = rmvDuplicate.filter(anime => !anime.isAdult);
	const nsfw = rmvDuplicate.filter(anime => anime.isAdult);

	const listAnime = generateList(animes, "Info All Anime");
	const listAnimeSfw = generateList(sfw, "Info Anime");
	const listAnimeNsfw = generateList(nsfw, "Info Hanime");

	const options = {
		mimetype: "image/jpeg",
		isExtended: true,
	};

	if (msg.isOwner) {
		const animeImage = await msg.urlDownload(animes[0].image);
		const thumb = await msg.resize(animeImage);
		return Object.assign(options, {
			image: animeImage,
			caption: listAnime,
			jpegThumbnail: thumb,
			data: animes,
		});
	}
	if (nsfw.length) {
		const HImage = await msg.urlDownload(nsfw[0].image);
		const HThumb = await msg.resize(animeImage);
		return Object.assign(options, {
			image: HImage,
			caption: listAnimeNsfw,
			jpegThumbnail: HThumb,
			quoted: true,
		});
	}

	const { image, size } = await downloadMedia(msg.urlDownload, sfw[0].image);
	const thumb = await msg.resize(image, { width: size, height: size });
	return Object.assign(options, {
		image: image,
		caption: listAnimeSfw,
		jpegThumbnail: thumb,
	});
}
