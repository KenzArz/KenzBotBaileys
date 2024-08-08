import { Create_message } from "../../system/message.js";
import { ytdl } from "./yt4.js";

/**@param {Create_message} msg */
export default async function (msg) {
	await msg.reaction({ loading: true });

	const quotedMessage = msg.quotedMessage();
	const content = quotedMessage?.body || msg.body;
	const mp3 = await ytdl({ link: content, audioOnly: true });
	await msg.reply(
		msg.room_chat,
		{
			audio: {
				url: mp3,
			},
			mimetype: "audio/mp4",
		},
		{ quoted: msg.quotedID }
	);
	await msg.reaction({ stop: true });
	return msg.reaction("succes");
}
