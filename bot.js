import makeWASocket, { DisconnectReason,useMultiFileAuthState, fetchLatestBaileysVersion, delay} from'@adiwajshing/baileys'
import {Boom} from '@hapi/boom'
import {createBOT} from './app'


export let client 
  
async function connecting () {
  const { state, saveCreds } = await  useMultiFileAuthState('./auth');
  const { version, isLatest } = await fetchLatestBaileysVersion();    
    client = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state,
    getMessage: async () => {
			return {
				conversation: 'pesan ini sedang pending atau tidak dapat dilihat dikarenakan masalah koneksi'
			}
		}
  })
  client.ev.on ('creds.update', saveCreds)

    client.ev.on('connection.update', async update => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = new Boom(lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to \n\n', lastDisconnect.error, ',\n\n reconnecting \n\n', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                await connecting()
            }
        } else if(connection === 'open') {
            console.log('connected')
        }
    })
    client.ev.on("messages.upsert", async m => {
      if(!msg)return
        const isGroup = contact.includes('@g.us'), 
        body = message?.conversation || message?.extendedTextMessage?.text ||  message?.imageMessage?.caption  || "undefined", 
        
        findOwner = ['6283891059445@s.whatsapp.net', '6289530016712@s.whatsapp.net'], 
        owner = findOwner.find(m => m == contact || m == msg.key.participant) || fromMe, 
        
        image = message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage || message?.imageMessage, 
        
        getPr = await PR.createPr()
        downloadImg.cekFile()

      createMSG(m)
      

    })
    // await connect.WA()
}

export async function createMSG(msg) {
  const {pushName: contactName, message , key:{remoteJid: contact, fromMe}} = msg
  const conversation = message?.extendedTextMessage?.text , quoted = message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text, caption = message?.imageMessage?.caption,

  findOwner = ['6283891059445@s.whatsapp.net', '6289530016712@s.whatsapp.net'], 
  owner = findOwner.find(m => m == contact || m == msg.key.participant) || fromMe

  new createBOT({client, menu: conversation || quoted || caption , msg})

  if(!owner)return "fitur ini khusus owner tidak untuk umum"
}
