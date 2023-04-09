import makeWASocket ,{ DisconnectReason,useMultiFileAuthState, fetchLatestBaileysVersion, downloadMediaMessage } from'@adiwajshing/baileys';
import {Boom} from '@hapi/boom';
import { writeFile } from 'fs/promises';
import axios from 'axios';

import {sendMsg} from './app.js';


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
      const {pushName: contactName, message, key:{remoteJid: contact, fromMe: bot}, key} = msg, ctxInfo = message?.extendedTextMessage?.contextInfo
      
      const getMsg = message?.extendedTextMessage?.text , quotedMsg = ctxInfo?.quotedMessage?.conversation || ctxInfo?.quotedMessage?.extendedTextMessage?.text, caption = message?.imageMessage?.caption, quotedCaption = ctxInfo?.quotedMessage?.imageMessage?.caption;
      const conversation = getMsg || caption || quotedMsg || quotedCaption; 

      if(!getMsg.startsWith('!', 0))return;
      const message_objek = await createMessage(msg, conversation)
      
      const isGroup = contact.includes('@g.us'),
      owner = process.env.OWNER_number
            
      //cek command
      processCommand(message_objek).catch(err => {
        error()
      })



    })
    // await connect.WA()
}

export async function createMessage(msg, body) {
  const checkType = (type, msgDetail) => {
    const arrType = [{
      type: 'imageMessage',
      typeMsg: 'image',
      isMedia: true
    },
    {
      type: 'videoMessage',
      typeMsg: msgDetail.videoMessage.gifPlayback ? 'gif' : 'video',
      isMedia: true
    },
    {
      type: 'audioMessage',
      typeMsg: msgDetail.audioMessage.ppt ? 'vn' : 'audio',
      isMedia: true
    },
    {
      type: 'documentMessage',
      typeMsg: 'document',
      isMedia: true
    },
    {
      type: 'stickerMessage',
      typeMsg: 'sticker',
      isMedia: true
    }
  ]
  return type(arrType)
  }
  const getMsgType = msg.ephemeralMessage?.message || msg.documentWithCaptionMessage.message || msg.message
  const getType = checkType( findType => findType.find(findTypeMsg =>  Object.keys(getMsgType).find(keyType => keyType === findTypeMsg.type)))

  const isMedia = getType.isMedia ? getType.typeMsg : null
  const {pushName: contactName, key:{remoteJid: contact, fromMe: bot}, key} = msg

  const message = {
    contactID: msg.key,
    contactName: msg.pushName,
    body,
    typeMsg: getType.typeMsg,
    isMedia,
    quotedMessage: () => {
      msg.key.participant = msg?.extendedTextMessage?.contextInfo?.participant

      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo || msg.message?.imageMessage?.contextInfo || msg.message?.audioMessage?.contextInfo
      const quoted = ctxInfo.quotedMessage
      if(!quoted) return

      const getType = checkType(findType => findType.find(findOBJ => Object.keys(quoted).find(m => m === findOBJ)))
      const isMedia = getType.isMedia ? getType.typeMsg : null
      
      return {
        quoted: {
        key: msg.key,
        message: quoted
        },
        typeMsg: getType.typeMsg,
        isMedia,
        media: isMedia ? async function media() {
          const download = await downloadMedia(this.quoted);
          writeFile(path, download);
          
        } : null,
        imgUrl: isMedia ? async function imageUrl(url, path) {
          const urlImage = await downloadMediaUrl(url)
          writeFile(path, urlImage)
        } : null,
        reply: async function (text, options) {
          options.quoted = this.quoted
          await delayMsg(contact, text, options)
        }
      }
    },
    mentions: contact,
    media: isMedia ? async function media() {
      const download = await downloadMedia(this.quoted);
      writeFile(path, download);
      
    } : null,
    imgUrl: isMedia ? async function imageUrl(url, path) {
      const urlImage = await downloadMediaUrl(url)
      writeFile(path, urlImage)
    } : null,
    reply: async function (text, options) {
      options.quoted = this.quoted
      await delayMsg(contact, text, options)
    }
  }



 async function delayMsg(contact, body, options = {}) {
    options.ephemeralExpiration = 60*60*24 
    await client.presenceSubscribe(contact)
    await delay(options.kuisDate || 500)

    await client.sendPresenceUpdate('composing', contact)
    await delay(options.kuisDate || 500)
    
    await client.sendPresenceUpdate('paused', contact)
  
    await client.sendMessage(contact, body, options)
  }

  async function downloadMedia(imageMessage) {
    await downloadMediaMessage(imageMessage, 'buffer')
  }
  
  async function downloadMediaUrl(url) {
    const getUrl = await axios({url, responseType: 'stream'})
    new Promise (async (resolve, reject) => {
      await getUrl.data
      .pipe(fs.createWriteStream(filePath))
      .on('finish', () => resolve())
      .on('error', e => reject(e));
    })
  }

}


connecting()
