import fetch from "node-fetch";
export async function y2mate({ url, formData }) {
	const baseUrl = "https://www.y2mate.com/mates/";
	const response = await fetch(baseUrl.concat(url), {
		method: "POST",
		headers: {
			accept: "*/*",
			"accept-language": "en-US,en;q=0.9",
			"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		body: new URLSearchParams(Object.entries(formData)),
	});
	return await response.json();
}
