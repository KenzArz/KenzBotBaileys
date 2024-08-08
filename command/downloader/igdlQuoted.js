import { setMedia } from "./igdl.js";

export default async function (msg, contents) {
	await msg.reaction({ loading: true });
	const int = Number(msg.body);

	// Download all content
	if (int == "99") {
		return contents.link.reduce(async (prev, curr) => {
			const mediaContent = await setMedia(msg, curr);
			prev.push(mediaContent);
			return prev;
		}, []);
	}

	// Download content that has been chosed by user
	const content = contents.link[int - 1];
	if (!content) throw { text: "angka yang anda masukan tidak sesuai" };
	return await setMedia(msg, content);
}
