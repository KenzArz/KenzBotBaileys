import { client } from "./bot"

export class sendMsg {
    constructor ({contact, msg, quoted}){
        this.msg = msg
        this.contact = contact
        this.delayMsg = async (body, options ={}) => {
        options.ephemeralExpiration = 60*60*24 
        await client.presenceSubscribe(contact)
        await delay(options.kuisDate || 500)

        await client.sendPresenceUpdate('composing', contact)
        await delay(options.kuisDate || 500)
        
        await client.sendPresenceUpdate('paused', contact)
      
        await client.sendMessage(contact, body, options)
        return 
        }

        this.quoted = quoted
    }

    async pingMsg(salam, userName) {
        await this.delayMsg({text: `halo ${userName + '' + salam[Math.floor(Math.random() * salam.length)]}`, mentions: [this.contact]}, {quoted: this.msg})
        return
    }
    async processCommand()
    
}

