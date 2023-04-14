import makeWASocket ,{ DisconnectReason,useMultiFileAuthState, fetchLatestBaileysVersion, downloadMediaMessagem, S_WHATSAPP_NET } from'@adiwajshing/baileys';
import {Boom} from '@hapi/boom';
import {Message} from './message'

export let client;

async function connecting () {
  const { state, saveCreds } = await  useMultiFileAuthState('./auth');
  const { version, isLatest } = await fetchLatestBaileysVersion();    
  client = makeWASocket.default({
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
      const msg = m.message[0];
      if(!msg.message) return
      await client.readMessages([msg.key]);
      

      const message_objek = new Message(msg)
                  
      //cek command
      if(message_objek.message.body.includes('!'))
      {
          await processCommand(message_objek).catch(err => {
          await message_objek.message.reply(`*Terjadi Error*

          ${err.toString()}`)
        })
      }


    })
}
connecting()
