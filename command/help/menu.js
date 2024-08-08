import "hostname-patcher";

import { readFileSync } from "node:fs";
import { dirPath } from "../process_command.js";

export default async function (msg) {
	const features = dirPath()
		.reduce((result, m) => {
			const subItem = m.subItem?.find(k => k === "index");
			if (subItem) {
				const lists = JSON.parse(
					readFileSync(`./command/${m.item}/${subItem}.json`, "utf8")
				);
				result.push({
					category: m.item,
					item: lists,
				});
			}
			return result;
		}, [])
		.map(m => {
			const title = `*${m.category.replace(/[a-z]/, char =>
				char.toUpperCase()
			)}*: \n`;
			const items = m.item
				.map(m => `┈➤ *!${m.title}*: _${m.description}_`)
				.join("\n");
			return title + items;
		})
		.join("\n\n");

	const menu = `*˚༺☆༻*「 ✦ KenzBot ✦ 」 *˚༺☆༻*
Halo *${msg.contactName}*, KenzBot siap membantu
    
${features}

꒷꒦꒷꒦꒷꒦꒷꒦꒷꒦꒷꒷꒦꒷꒦꒷꒦꒷꒦꒷꒦꒷꒷꒦꒷꒦꒷꒦꒷꒦꒷꒦꒷꒷꒦꒷꒷
`;
	return { text: menu };
}
