const statusId = document.getElementById("status");
const sections = document.querySelectorAll("section");
const linksId = document.querySelectorAll(".nav-list li a");
const navbarRight = document.querySelector(".navbar .right .nav-list");
const hamburger = document.getElementById("hamburger");
const form = document.querySelector(".contact form");

const statusBot = "ONLINE";
let curr = statusBot;
setInterval(() => {
	if (curr.length < 9) curr += ".";
	else {
		curr = statusBot;
	}
	statusId.textContent = curr;
}, 1000);

const sendMessage = async ({ user, message }) => {
	if (!user) user = "Anonymous";
	if (!message) return "Message can not be empty";

	const base_url = window.location.origin;
	const report = await fetch(base_url.concat("/contact"), {
		headers: {
			"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		method: "POST",
		body: new URLSearchParams(Object.entries({ user, message })),
	});

	const { status, statusMessage } = await report.json();
	console.log(status);
	return statusMessage;
};

hamburger.addEventListener("click", () =>
	navbarRight.classList.toggle("active")
);

document.addEventListener("click", e => {
	if (!hamburger.contains(e.target) && !navbarRight.contains(e.target)) {
		navbarRight.classList.remove("active");
	}
});

form.addEventListener("submit", async e => {
	e.preventDefault();
	const formData = new FormData(e.target);
	alert(`${await sendMessage(Object.fromEntries(formData))}`);
});
