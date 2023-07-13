export default function (msg) {
    const contactName = `*${msg.contactName}*`
    const sayHello = [
        `halo ${contactName} ada yang bisa dibantu`,
        `hi ${contactName} kenzbot siap membantu`,
        `kenzbot hadir. ada yang bisa dibantu ${contactName}`,
        `kenzbot siap membantumu ${contactName}`
    ]
    msg.reply(msg.mentions, {text: sayHello[Math.floor(Math.random() * sayHello.length)], quoted: msg.quotedID})
}