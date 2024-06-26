import {
	downloadMediaMessage,
	S_WHATSAPP_NET,
	delay,
} from "@whiskeysockets/baileys";
import { readFileSync } from "fs";
import fetch from "node-fetch";
import axios from "axios";
import sharp from "sharp";
import https from "https";
import { client } from "../bot.js";
import { EventEmitter } from "events";

const map = new Map();
const event = new EventEmitter();

export class Create_message {
	#msg;
	#key;
	#ctxInfo;

	constructor(msg) {
		this.#msg = msg;
		this.#key = msg.key;
		this.#ctxInfo =
			msg.message?.extendedTextMessage?.contextInfo ||
			msg.message?.imageMessage?.contextInfo ||
			msg.message?.audioMessage?.contextInfo;

		const getMsgType =
			msg.ephemeralMessage?.message ||
			msg.documentWithCaptionMessage?.message ||
			msg.message;
		const getType = checkType(
			findType =>
				findType.find(findTypeMsg =>
					Object.keys(getMsgType).find(keyType => keyType === findTypeMsg.type)
				),
			getMsgType
		);
		const mediaContent =
			msg.message.extendedTextMessage ||
			msg.message.imageMessage ||
			msg.message.videoMessage;

		this.typeMsg = getType?.typeMsg;
		this.isMedia = getType?.isMedia ? true : false;
		this.contactName = msg.pushName;

		this.body =
			msg.message.extendedTextMessage?.text ||
			msg.message?.conversation ||
			mediaContent?.caption;
		this.messageID = this.#key.id;
		this.room_chat = this.#key.remoteJid;
		this.expiration = this.#ctxInfo?.expiration;
		this.ownerNumber = process.env.OWNER + S_WHATSAPP_NET;
		this.isOwner =
			this.ownerNumber == this.#key.participant ||
			this.ownerNumber == this.#key.remoteJid;
		this.bot = process.env.OWNER + S_WHATSAPP_NET;
		this.isBot = this.#key.fromMe;
		this.quotedID = this.#msg;
	}

	quotedMessage() {
		const quoted = this.#ctxInfo?.quotedMessage;
		const quotedID = this.#ctxInfo?.stanzaId;
		if (!quoted) return null;
		this.#key.participant =
			this.#msg.message?.extendedTextMessage?.contextInfo?.participant ||
			undefined;
		const bodyQuoted =
			quoted?.conversation ||
			quoted.extendedTextMessage?.text ||
			quoted.imageMessage?.caption;

		const getType = checkType(
			findType =>
				findType.find(findOBJ =>
					Object.keys(quoted).find(m => m === findOBJ.type)
				),
			quoted
		);
		const isMedia = getType?.isMedia ? true : false;

		return {
			quotedID: {
				key: this.#key,
				message: quoted,
			},
			body: bodyQuoted,
			stanza: quotedID,
			typeMsg: getType?.typeMsg,
			isMedia,
		};
	}

	media = async content => {
		if (content) return await downloadMedia(media);

		const isQuoted = this.quotedMessage();
		const isMedia = isQuoted?.isMedia || this.isMedia;
		if (!isMedia) return { text: "sertakan gambar!!!" };

		const media = isQuoted ? isQuoted.quotedID : this.#msg;
		return await downloadMedia(media);
	};

	async urlDownload(url, options = {}) {
		let urlImage;
		try {
			urlImage = await downloadMediaUrl(url, options);
		} catch (error) {
			if (
				error.toString().includes("network socket") ||
				error?.response?.status == 521
			) {
				if (options.repeat == 5) {
					return { error: true };
				}
				if (options.repeat) options.repeat = options.repeat + 1;
				options.repeat = options.repeat || 0;
				urlImage = await this.urlDownload(url, options);
			}
		}
		return urlImage;
	}

	async reply(contact, text, options = {}) {
		options.ephemeralExpiration = this.expiration || "";
		return delayMsg(contact, text, options);
	}

	async resize(image, options) {
		const media = await sharpImage(image, options);
		return media;
	}

	async reaction(reactContent) {
		const { loading, stop } = reactContent;
		if (loading) {
			await upload({ key: this.#key, count: 0 });
		} else if (stop) event.emit("stop");
		else {
			return await react(this.#key, reactContent);
		}
	}

	localStore(data, key, store) {
		if (store) return map.set(key, [data]);

		const collectData = map.get(key);
		if (!Array.isArray(collectData) || collectData.length < 1)
			return { error: "empty" };

		const randomData = Math.round(Math.random() * collectData.length - 1);
		collectData.splice(randomData, 1);
		return collectData[randomData];
	}
}

function checkType(type, msgDetail) {
	const arrType = [
		{
			type: "imageMessage",
			typeMsg: "image",
			isMedia: true,
		},
		{
			type: "videoMessage",
			typeMsg: msgDetail?.videoMessage?.gifPlayback ? "gif" : "video",
			isMedia: true,
		},
		{
			type: "audioMessage",
			typeMsg: msgDetail?.audioMessage?.ppt ? "vn" : "audio",
			isMedia: true,
		},
		{
			type: "documentMessage",
			typeMsg: "document",
			isMedia: true,
		},
		{
			type: "stickerMessage",
			typeMsg: "sticker",
			isMedia: true,
		},
		{
			type: "extendedTextMessage",
			typeMsg: "text",
			isMedia: false,
		},
	];
	return type(arrType);
}

async function delayMsg(contact, body, options = {}) {
	await client.presenceSubscribe(contact);
	await delay(options.kuisDate || 1000);

	const date = new Date();
	const setDateGMT7 = date
		.toUTCString()
		.replace(/[\d]+:/, `${date.getUTCHours() + 7}:`);
	options.timestamp = new Date(setDateGMT7);

	return await client.sendMessage(contact, body, options);
}

async function downloadMedia(imageMessage) {
	return await downloadMediaMessage(imageMessage, "buffer", {});
}

async function downloadMediaUrl(url, agent) {
	const agentDefault = new https.Agent({
		keepAlive: true,
	});
	const data = {};
	try {
		data.getUrl = await fetch(url, {
			headers: {
				"user-agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
			},
			method: "GET",
			agent: agent || agentDefault,
		});
		const arrayBuffer = await data.getUrl.arrayBuffer();
		data.buffer = Buffer.from(arrayBuffer);
	} catch (error) {
		console.log("axios launched!");

		data.getUrl = await axios.get(url, {
			headers: {
				"user-agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
				httpsAgent: agent || agentDefault,
			},
			responseType: "arraybuffer",
		});
		data.buffer = Buffer.from(data.getUrl.data);
	}

	if (data.getUrl.status == "403" || data.getUrl.status == 521)
		return "Forbidden";
	return data.buffer;
}

async function sharpImage(image, size = {}) {
	const resize = await sharp(image)
		.resize(size.width || 300, size.height || 150)
		.jpeg({ quality: 100 })
		.toBuffer();
	return resize;
}

async function react(key, emoji) {
	const emotJson = JSON.parse(readFileSync("system/emoji/emoji.json"));
	const emot = emotJson[emoji];
	return await client.sendMessage(key.remoteJid, {
		react: {
			text: emot || "",
			key,
		},
	});
}

async function upload(reactContent) {
	const { key } = reactContent;
	let count = reactContent.count;

	if (count % 2 === 0) {
		await react(key, "loading");
	} else {
		await react(key, "loading2");
	}

	const timeout = new setTimeout(() => {
		upload({ key, count: count + 1 });
	}, 2500);
	event.on("stop", () => clearTimeout(timeout));
}
