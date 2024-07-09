import { readdirSync, readFileSync } from "fs";
// import { Create_message } from "../system/message.js";

let mainDir = "./command";

export function dirPath() {
	const listDir = readdirSync(mainDir, { withFileTypes: true });
	return listDir.reduce((result, item) => {
		if (item.isDirectory()) {
			result.push({
				item: item.name,
				subItem: readdirSync(`${mainDir}/${item.name}`, {
					withFileTypes: true,
				}).map(({ name }) => name.split(".")[0]),
			});
		}
		return result;
	}, []);
}

function filePath(body) {
	const delPrefix = body.slice(1).split(" ")[0];
	const [item, subItem] = dirPath().reduce((result, m) => {
		const subItem = m.subItem?.find(k => k == delPrefix && k !== "index");
		if (subItem) result.push(m.item, subItem);
		return result;
	}, []);

	if (!subItem)
		return {
			text: `fitur !${delPrefix} tidak ada, silahkan ketik !menu untuk melihat fitur yang ada`,
		};
	return `./${item}/${subItem}.js`;
}

/**@param {Create_message} msg */
export async function processCommand(msg) {
	const searchFeatures = filePath(msg.body);
	if (searchFeatures.text) {
		await msg.reaction("failed");
		return searchFeatures;
	}

	const { default: Run } = await import(searchFeatures);
	const command = await Run(msg);

	if (command?.error) {
		await msg.reaction({ stop: true });
		await msg.reaction("failed");
		return command;
	}

	return false;
}

/**@param {Create_message} msgQuoted */
export async function commandQuoted(msgQuoted) {
	const quoted = msgQuoted.quotedMessage();
	const { temp } = await import("../bot.js");
	const dataTemp = temp.get(msgQuoted.room_chat);
	const content = dataTemp.find(
		({ message }) => message.key.id == quoted.stanza
	);

	const ctx =
		content.message.message?.imageMessage?.contextInfo?.quotedMessage ||
		content.message.message?.extendedTextMessage.contextInfo.quotedMessage ||
		content.message.message?.videoMessage.contextInfo.quotedMessage;
	const bodyMesage =
		ctx.imageMessage?.caption?.slice(0) ||
		ctx.conversation?.slice(0) ||
		ctx.extendedTextMessage?.text?.slice(0);
	if (msgQuoted.body.split(" ")[0] == "0") return;

	const searchFeatures = filePath(bodyMesage.split(" ")[0] + "Quoted");

	const { default: Run } = await import(searchFeatures);
	const commandQuoted = await Run(msgQuoted, content);

	if (commandQuoted?.error) {
		await msgQuoted.reaction({ stop: true });
		await msgQuoted.reaction("failed");
		return commandQuoted;
	}

	return false;
}
