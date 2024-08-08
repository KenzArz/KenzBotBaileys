import "hostname-patcher";
import env from "dotenv";
env.config({
	path: "./key/.env",
});

import express from "express";
import bodyParser from "body-parser";
import qrcode from "qrcode";
import { S_WHATSAPP_NET } from "@whiskeysockets/baileys";

import connecting, { event, client } from "./bot.js";
import { dirPath } from "./command/process_command.js";

export const app = express();
const features = dirPath();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (_, res) => {
	res.render("main", {
		title: process.env["OWNERNAME"],
		bot: process.env["BOTNAME"],
		hp: process.env["BOT"],
		features: features.map(({ item }) =>
			item.replace(/\w/, _match => _match[0].toUpperCase())
		),
	});
});

app.post("/contact", async (req, res) => {
	if (!client)
		return res.json({
			status: 500,
			statusMessage: "Server shutdown, try again later.",
		});
	if (!req.body.user) req.body.user = "Anonymous";
	if (!req.body.message)
		return res.json({
			status: 403,
			statusMessage:
				"Something wrong, make sure the message is not empty, and try again!",
		});
	await client.sendMessage(process.env["OWNER"] + S_WHATSAPP_NET, {
		text: `Report Message: \n\nUser: ${req.body.user}\nMessage: ${req.body.message}`,
	});
	return res.json({ status: 200, statusMessage: "The message has been sent" });
});

app.use("/", (req, res, next) => {
	const path = app._router.stack.find(layer => layer.route?.path === req.path);
	if (!path) return res.redirect("/");
	next();
});

app.listen(port, async () => {
	console.log("ACTIVATING BOT...");
	await connecting();
});

event.on("qrcode", qr => {
	app.get("/qrcode", (_, res) => {
		qrcode.toDataURL(qr, (e, code) => {
			if (e) return e;
			res.send(`<img src="${code}">`);
		});
	});
});

event.on("rmvPath", () => {
	app._router.stack = app._router.stack.filter(
		layer => layer.route?.path !== "/qrcode"
	);
});
