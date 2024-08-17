import makeWASocket, {
	DisconnectReason,
	useMultiFileAuthState,
	fetchLatestBaileysVersion,
	makeInMemoryStore,
	Browsers,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { EventEmitter } from "events";
import { processCommand, commandQuoted } from "./command/process_command.js";
import { Create_message } from "./system/message.js";
import pino from "pino";

export let client;
export const event = new EventEmitter();
const logger = pino({ level: "silent" });
const store = makeInMemoryStore({ logger });
// can be read from a file
store.readFromFile("system/baileys_store.json");
// saves the state to a file every 10s
setInterval(() => {
	store.writeToFile("system/baileys_store.json");
}, 10000);

export default async function connecting() {
	const { state, saveCreds } = await useMultiFileAuthState("system/auth");
	const { version } = await fetchLatestBaileysVersion();
	client = await makeWASocket.default({
		version,
		logger,
		auth: state,
		linkPreviewImageThumbnailWidth: 500,
		syncFullHistory: false,
		shouldSyncHistoryMessage: false,
		browser: Browsers.macOS("Desktop"),
		getMessage: async key => {
			if (store) {
				const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
				return msg?.message || undefined;
			}
			return;
		},
	});
	client.ev.on("creds.update", saveCreds);
	client.ev.on("connection.update", async update => {
		const { connection, lastDisconnect, qr } = update;
		qr ? event.emit("qrcode", qr) : event.emit("rmvPath");
		if (connection === "close") {
			const shouldReconnect =
				new Boom(lastDisconnect.error)?.output?.statusCode !==
				DisconnectReason.loggedOut;
			console.log(
				"connection closed due to \n\n",
				lastDisconnect.error,
				",\n\n reconnecting \n\n",
				shouldReconnect
			);
			// reconnect if not logged out
			if (shouldReconnect) {
				await connecting();
			}
		} else if (connection === "open") {
			console.log("connected");
		}
	});
	client.ev.on("messages.upsert", async m => {
		const msg = m.messages[0];
		if (!msg.message || m.type == "append") return;
		await client.readMessages([msg.key]);
		const message = new Create_message(msg);
		if (!message.body) return;
		const quotedMessage = message.quotedMessage();
		const localStore = message.localStore(quotedMessage?.stanzaId);

		//cek command
		if (message?.body?.startsWith("!", 0)) {
			try {
				const results = await processCommand(message);
				console.log(results);
				await sendMessage(results, message);
			} catch (error) {
				await errorMessage(error, message);
			}
		}

		if (quotedMessage && !localStore.error) {
			try {
				const results = await commandQuoted(message, localStore);
				await sendMessage(results, message);
			} catch (error) {
				await errorMessage(error, message);
			}
		}
	});
}

async function sendMessage(results, message) {
	for (const { isExtended, data, quoted, toOwner, ...result } of results) {
		const infoMessage = await message.reply(
			toOwner ? message.ownerNumber : message.room_chat,
			result,
			{
				quoted: quoted ? message.quotedID : undefined,
			}
		);
		if (isExtended) {
			message.localStore(infoMessage.key.id, data);
		}
	}
	await message.reaction({ stop: true });
}

async function errorMessage(error, message) {
	const errorText = error.text || error.toString();
	console.log(error);
	await message.reply(message.room_chat, {
		text: "*Terjadi Error*\n\n" + errorText,
	});
	await message.reaction({ stop: true });
	await message.reaction(error.text ? "failed" : "danger");

	const date = new Date();
	const group = await client?.groupMetadata(message.room_chat);
	const e = errorLog(
		`Error Message\n` +
			`Date: ${date.getHours() + 7}:${date.getMinutes()}}\n` +
			`chat: ${message.room_chat}\n` +
			`chat room: ${group.subject || "private chat"}\n` +
			`text: ${message.body}\n` +
			`typeMessage: ${message.typeMsg || "UNKNOWN"}\n` +
			`errorMessage: ${errorText}`
	);

	await message.reply(message.ownerNumber, e);
}

function errorLog(log) {
	const pathLog = "system/log";
	if (!existsSync(pathLog)) {
		mkdirSync(pathLog);
		writeFileSync(`${pathLog}/log.txt`, log);
		return {
			text: "*Error Message Detected*\nsilahkan check log message",
		};
	}
	const readFile = readFileSync(pathLog + "/log.txt", { encoding: "utf8" });
	writeFileSync(`${pathLog}/log.txt`, `${readFile}\n\n${log}`);
	return {
		text: "*Error Message Detected*\nsilahkan check log message",
	};
}
