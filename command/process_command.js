import { readdirSync, readFileSync } from "fs";
import { Create_message } from "../system/message.js";

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
	const [item, subItem] = dirPath().reduce((result, m) => {
		const subItem = m.subItem?.find(k => k == body && k !== "index");
		if (subItem) result.push(m.item, subItem);
		return result;
	}, []);

	if (!subItem)
		throw {
			text: `fitur !${body} tidak ada, silahkan ketik !menu untuk melihat fitur yang tersedia`,
		};
	return `./${item}/${subItem}.js`;
}

/**@param {Create_message} msg */
export async function processCommand(msg) {
	const command = msg.body.slice(1).split(" ")[0];
	const { default: Run } = await import(filePath(command));
	const message = await Run(msg);
	if (!Array.isArray(message)) {
		message.data = { ...message.data, command };
		return Array.of(message);
	}
	return message;
}

/**@param {Create_message} msgQuoted */
export async function commandQuoted(msgQuoted, data) {
	const { default: Run } = await import(filePath(command + "Quoted"));
	const extendedMessage = await Run(msgQuoted, data);
	if (!Array.isArray(extendedMessage)) return Array.of(extendedMessage);
	return extendedMessage;
}
