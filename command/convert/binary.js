export default async function (msg) {
	const quotedMsg = await msg.quotedMessage();
	const body = quotedMsg?.body || msg.body.slice(11);
	const convert = msg.body.slice(7).toLowerCase().match(/-[ed]/)?.[0];

	let result = "";
	if (!body.length) {
		throw { error: true, text: "Teks tidak boleh kosong" };
	} else if (convert === "-e") {
		result +=
			"Teks to binary:\n" +
			body
				.split("")
				.map(str => str.charCodeAt(0).toString(2))
				.reduce((p, c) => (p += `${(p += "0".repeat(8 - c.length))}${c} `), "");
	} else if (convert === "-d") {
		result +=
			"Binary to teks:\n" +
			body
				.split(" ")
				.map(str => String.fromCodePoint(parseInt(str, 2)))
				.join("");
	} else {
		throw {
			text: "Tambahkan -e untuk teks to binary atau -d untuk sebaliknya\n\nExample:\n!binary -e shiroko istri tercinta gwejh",
		};
	}
	return { text: result, quoted: true };
}
