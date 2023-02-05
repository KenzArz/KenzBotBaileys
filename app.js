export class createBOT {
    constructor ({client, menu, msg})


    command = [
        {
            menu: "!ping",
            sendMsg: (contact, salam) => {
                client.sendMessage(contact, {text: `halo ${contactName} ${salam[Math.floor(Math.random() * salam.length -1)]}`, mentions: [contact]}, {quoted : msg} )
            }
        }
    ]
}