import fetch from "node-fetch";
const tags = [
	{ id: 5, name: "Sword" },
	{ id: 6, name: "Kemonomimi" },
	{ id: 7, name: "Flowers" },
	{ id: 8, name: "Catgirl" },
	{ id: 19, name: "Maid" },
	{ id: 21, name: "Reading" },
	{ id: 22, name: "Mountain" },
	{ id: 23, name: "Night" },
	{ id: 24, name: "Gloves" },
	{ id: 27, name: "Sunny" },
	{ id: 28, name: "Rain" },
	{ id: 30, name: "Weapon" },
	{ id: 32, name: "Ice Cream" },
	{ id: 33, name: "Tree" },
	{ id: 35, name: "Dress" },
	{ id: 36, name: "Usagimimi" },
	{ id: 37, name: "Uniform" },
	{ id: 38, name: "Guitar" },
	{ id: 43, name: "Glasses" },
	{ id: 49, name: "Skirt" },
	{ id: 50, name: "Blonde" },
	{ id: 52, name: "Boy" },
	{ id: 53, name: "Tobrut" },
	{ id: 54, name: "Tobrut" },
	{ id: 55, name: "Tepos" },
	{ id: 56, name: "Tepos" },
];

export default async function (msg) {
	const quotedMessage = msg.quotedMessage();
	const tagsName = quotedMessage?.body || msg.body.slice(10);

	let image;
	if (!tagsName) image = await getImage(`/random`);
	else {
		if (tagsName == "tags")
			return await msg.reply(msg.room_chat, {
				text:
					"*TAGS ANIME IMAGES*\n\n" +
					[...new Set(tags.map(({ name }) => name))]
						.sort((a, b) => a[0].charCodeAt(0) - b[0].charCodeAt(0))
						.map((name, i) => `${i + 1}. ${name}`)
						.join("\n"),
			});
		const getTags = searchTag(tagsName);
		if (!getTags.length) return { error: true, text: "tag tidak ditemukan" };
		const tagId = getTags[Math.floor(Math.random() * getTags.length)].id;
		image = await getImage(`/tags/${tagId}/images`);
	}

	const imageBuffer = await msg.urlDownload(image);
	const thumb = await msg.resize(imageBuffer);
	return {
		image: imageBuffer,
		mimetype: "image/jpeg",
		jpegThumbnail: thumb,
	};
}

const searchTag = tagName =>
	tags.filter(tag => tag.name.toLowerCase() == tagName.toLowerCase());
const getImage = async path => {
	const base_url = "https://api.nekosapi.com/v3/images";
	const rating = ["safe", "suggestive", "borderline"];

	const content = await fetch(
		base_url.concat(
			`${path}?limit=1&rating=${
				rating[Math.floor(Math.random() * rating.length)]
			}`
		)
	);
	if (content.status !== 200) return { error: true, text: content.statusText };
	const data = await content.json();
	return data.items[0].image_url;
};
