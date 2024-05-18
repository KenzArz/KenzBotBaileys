export default async function (msg) {
	const quotedMsg = await msg.quotedMessage();
	const body = quotedMsg?.body || msg.body.slice(11);
	const convert = msg.body.slice(7).toLowerCase().match(/-[ed]/)?.[0];

	let result = "";
	if (!body.length) {
		return { error: true, text: "Teks tidak boleh kosong" };
	} else if (convert === "-e") {
		result += "Teks to binary:\n";
		for (let i = 0; i < body.length; i++) {
			const uniqueCode = encode(body[i].charCodeAt(0));
			result += "0".repeat(8 - uniqueCode.length) + uniqueCode + " ";
		}
	} else if (convert === "-d") {
		const binaryArr = body.replace(/[^0-1]/g, "").match(/[0-1]{8}/g);
		result = "Binary to teks:\n" + decode(binaryArr);
	} else {
		return {
			error: true,
			text: "Tambahkan -e untuk teks to binary atau -d untuk sebaliknya\n\nExample:\n!binary -e shiroko istri tercinta gwejh",
		};
	}
	await msg.reply(msg.room_chat, { text: result }, { quoted: msg.quotedID });
}

const encode = input => {
	if (input === 0 || input === 1) {
		return String(input);
	} else {
		return encode(Math.floor(input / 2)) + (input % 2);
	}
};

const decode = binary => {
	if (!binary.length) return binary;
	const code = parseInt(binary[0], 2);
	return String.fromCodePoint(code) + decode(binary.slice(1));
};
