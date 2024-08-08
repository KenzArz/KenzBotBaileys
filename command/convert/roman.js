export default async function (msg) {
	const quotedMsg = await msg.quotedMessage();
	let body = Number(quotedMsg?.body || msg.body.slice(7));

	if (!body) throw { text: "pesan harus berupa angka" };
	else if (body < 1) throw { text: "Angka harus lebih besar dari 0" };
	else if (body >= 4000) throw { text: "Angka harus lebih kecil dari 4000" };

	const romanNumerals = {
		M: 1000,
		CM: 900,
		D: 500,
		CD: 400,
		C: 100,
		XC: 90,
		L: 50,
		XL: 40,
		X: 10,
		IX: 9,
		V: 5,
		IV: 4,
		I: 1,
	};

	let result = "Angka Romawi: ";
	for (const roman in romanNumerals) {
		while (body >= romanNumerals[roman]) {
			result += roman;
			body -= romanNumerals[roman];
		}
	}
	return { text: result };
}
