export default function (msg) {
    const contactName = msg.contactName
    const sayHello = [
        `halo ${contactName} ada yang bisa di bantu`,
        `hi ${contactName} kenzbot siap membantu`,
        `kenzbot hadir. ada yang bisa dibantu ${contactName}`,
        `apa yang bisa dibantu kenzbot lakukan ${contactName}`,
        `kenzbot siap membantu ${contactName}`
    ]
    msg.reply(msg.mentions, {text: sayHello[Math.floor(Math.random() * sayHello.length)], quoted: msg.quotedID})
}