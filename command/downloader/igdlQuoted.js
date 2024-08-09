import { setMedia } from "./igdl.js";

export default async function (msg, contents) {
	await msg.reaction({ loading: true });
	const int = Number(msg.body);

	// Download all content
	if (int == "99") {
		return contents.link.reduce(async (prev, curr) => {
			const tempData = await prev;
			const mediaContent = await setMedia(msg, curr);
			tempData.push(mediaContent);
			return tempData;
		}, Promise.resolve([]));
	}

	// Download content that has been chosed by user
	const content = contents.link[int - 1];
	if (!content) throw { text: "angka yang anda masukan tidak sesuai" };
	return await setMedia(msg, content);
}
