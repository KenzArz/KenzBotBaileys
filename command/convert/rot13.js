export default async function (msg) {
	const quotedMsg = await msg.quotedMessage();
	const body = quotedMsg?.body || msg.body.slice(7);
	const convert = body
		.toUpperCase()
		.replace(/[A-Z]/g, char =>
			String.fromCharCode(
				char.charCodeAt(0) + (char.charCodeAt(0) > 77 ? -13 : 13)
			)
		)
		.toLowerCase();

	await msg.reply(msg.room_chat, { text: convert });
}
