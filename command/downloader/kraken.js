import { POST } from "../../system/scraper/krakenFiles.js";

export default async function (msg) {
	await msg.reaction({ loading: true });
	const link = msg.body.slice(8);
	const { url, size, title, mimetype, text, error } = await POST(link);
	if (error) return { text, error };

	if (size >= 130) {
		throw {
			text: `File terlalu besar untuk didownload, silahkan download manual dari link berikut:\n\n${url}`,
		};
	}

	return [
		{
			text: `${title}\n${size}\n                      Downloading...!`,
		},
		{
			document: { url },
			mimetype,
			fileName: title,
		},
	];
}
