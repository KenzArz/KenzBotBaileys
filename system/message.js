import {
	downloadMediaMessage,
	S_WHATSAPP_NET,
	delay,
} from "@whiskeysockets/baileys";
import { readFileSync } from "fs";
import fetch from "node-fetch";
import axios from "axios";
import sharp from "sharp";
import { EventEmitter } from "events";
import { client, temp, event } from "../bot.js";

const date = new Date();
export const temp = new Map();
export const event = new EventEmitter();

export class Create_message {
	#msg;
	#key;
	#ctxInfo;

	constructor(msg) {
		const messageContent =
			msg.ephemeralMessage?.message ||
			msg.message.documentWithCaptionMessage?.message ||
			msg.message;

		const messageInfo = Object.keys(messageContent)[0].match(/(.+)Message/);
		const mediaContent = messageContent[messageInfo?.[0]] || "conversation";
		const specialType = mediaContent?.gifPlayback
			? "gif"
			: mediaContent?.ptt
			? "vn"
			: undefined;

		this.#msg = msg;
		this.#key = msg.key;
		this.#ctxInfo = mediaContent?.contextInfo;

		this.typeMsg = specialType || messageInfo?.[1] || mediaContent;
		this.mimetype = mediaContent?.mimetype;
		this.isMedia = this.mimetype ? true : false;

		this.body =
			mediaContent?.text || mediaContent?.caption || msg.message?.conversation;
		this.contactName = msg.pushName;
		this.messageID = this.#key.id;
		this.room_chat = this.#key.remoteJid;
		this.expiration = this.#ctxInfo?.expiration;
		this.quotedID = this.#msg;

		this.ownerNumber = process.env.OWNER + S_WHATSAPP_NET;
		this.isOwner = this.ownerNumber.match(
			this.#key.participant || this.#key.remoteJid
		)?.[0]
			? true
			: false;
		this.botNumber = process.env.BOT + S_WHATSAPP_NET;
		this.isBot = this.#key.fromMe;
	}

	quotedMessage() {
		const quoted = this.#ctxInfo?.quotedMessage;
		const stanzaId = this.#ctxInfo?.stanzaId;
		if (!quoted) return null;

		this.#key.participant =
			this.#msg.message?.extendedTextMessage?.contextInfo?.participant;

		const quotedMessageContent =
			quoted.documentWithCaptionMessage?.message || quoted;
		const quotedMessageInfo =
			Object.keys(quotedMessageContent)[0].match(/(.+)Message/);
		const quotedMediaContent =
			quotedMessageContent[quotedMessageInfo?.[0]] || "conversation";
		const bodyQuoted =
			quotedMessageContent?.conversation ||
			quotedMediaContent?.text ||
			quotedMediaContent.caption;
		const specialType = quotedMediaContent.gifPlayback
			? "gif"
			: quotedMediaContent?.ptt
			? "vn"
			: undefined;

		return {
			quotedID: {
				key: this.#key,
				message: quotedMessageContent,
			},
			body: bodyQuoted,
			stanzaId,
			typeMsg: specialType || quotedMessageInfo?.[1] || quotedMediaContent,
			mimetype: quotedMediaContent.mimetype,
			isMedia: quotedMediaContent.mimetype ? true : false,
		};
	}

	media = async content => {
		if (content) return await downloadMediaMessage(content, "buffer");

		const isQuoted = this.quotedMessage();
		const isMedia = isQuoted?.isMedia || this.isMedia;
		if (!isMedia) throw { text: "sertakan gambar!!!" };

		const media = isQuoted ? isQuoted.quotedID : this.#msg;
		return await downloadMediaMessage(media, "buffer");
	};

	async urlDownload(url, count = 0) {
		if (count === 5) return "Forbidden";
		const data = {};

		try {
			data.getUrl = await fetch(url);
			const arrayBuffer = await data.getUrl.arrayBuffer();
			data.buffer = Buffer.from(arrayBuffer);
		} catch (error) {
			console.log("axios launched!");
			data.getUrl = await axios.get(url, {
				responseType: "arraybuffer",
			});
			data.buffer = Buffer.from(data.getUrl.data);
		}

		count++;
		if (data.getUrl.status == "403" || data.getUrl.status == 521)
			return this.urlDownload(url, count);
		return data.buffer;
	}

	async reply(contact, body, options = {}) {
		options.ephemeralExpiration = this.expiration || "";
		await client.presenceSubscribe(contact);
		await delay(options.kuisDate || 1000);

		const setDateGMT7 = date
			.toUTCString()
			.replace(/[\d]+:/, `${date.getUTCHours() + 7}:`);

		options.timestamp = new Date(setDateGMT7);
		return await client.sendMessage(contact, body, options);
	}

	async resize(image, width, height) {
		return await sharp(image)
			.resize(width || 300, height || 150)
			.jpeg({ quality: 100 })
			.toBuffer();
	}

	async reaction(reactContent) {
		const { loading, stop } = reactContent;

		if (loading) {
			await react(this.#key, "loading2");
			let count = 0;
			const interval = setInterval(async () => {
				const module = count % 2;
				switch (module) {
					case 0:
						await react(this.#key, "loading");
						break;
					default:
						await react(this.#key, "loading2");
						break;
				}
				count++;
			}, 2000);
			event.on(this.messageID, () => clearInterval(interval));
		} else if (stop) {
			event.emit(this.messageID);
			event.removeListener(this.messageID);
		} else {
			return await react(this.#key, reactContent);
		}
	}

	localStore(key, store) {
		if (store) return map.set(key, [store]);

		const collectData = map.get(key);
		if (!Array.isArray(collectData) || !collectData.length)
			return { error: "empty" };
		return collectData;
	}
}

const emotJson = JSON.parse(readFileSync("system/emoji/emoji.json"));
async function react(key, emoji) {
	const emot = emotJson[emoji];
	return await client.sendMessage(key.remoteJid, {
		react: {
			text: emot || "",
			key,
		},
	});
}
