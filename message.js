import { downloadMediaMessage, S_WHATSAPP_NET, delay } from "@adiwajshing/baileys"
import { writeFile } from "fs/promises"

import {client} from './bot.js'

export function message_objek(msg) {
  const getMsgType = msg.ephemeralMessage?.message || msg.documentWithCaptionMessage?.message || msg.message
  const getType = checkType( findType => findType.find(findTypeMsg =>  Object.keys(getMsgType).find(keyType => keyType === findTypeMsg.type)))

  const isMedia = getType?.isMedia ? true : null

  const key = msg.key,
  room_chat = msg.key.remoteJid,
  contactName = msg.pushName,
  bot = key.fromMe,
  ownerNumber = process.env.OWNER + S_WHATSAPP_NET,
  ownerId = ownerNumber == key.participant || ownerNumber == key.remoteJid,
  isOwner = bot || ownerId,

  body = msg.message?.conversation|| msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption
  if(!body) return {body: 'not a message'}


  return {
    contactID: key,
    contactName: contactName,
    body,
    mentions: room_chat,
    typeMsg: getType?.typeMsg,
    isMedia,
    isOwner,
    ownerNumber,
    quotedID: msg,
    quotedMessage: () => {
      key.participant = msg?.extendedTextMessage?.contextInfo?.participant

      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo || msg.message?.imageMessage?.contextInfo || msg.message?.audioMessage?.contextInfo
      const quoted = ctxInfo.quotedMessage
      if(!quoted) return false

      const bodyQuoted = quoted?.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption
      
      const getType = checkType(findType => findType.find(findOBJ => Object.keys(quoted).find(m => m === findOBJ.type)))
      const isMedia = getType?.isMedia ? true : false
      
      return {
        quotedID: {
        key: key,
        message: quoted
        },
        body: bodyQuoted,
        typeMsg: getType?.typeMsg,
        isMedia,
        media: isMedia ? async function (path) {
          const download = await downloadMedia(this.quotedID);
          writeFile(path, download);
          
        } : null,
        imgUrl: isMedia ? async (url, path) => {
          const urlImage = await downloadMediaUrl(url)
          writeFile(path, urlImage)
        } : null,
        reply: async (contact, text, options) => {
          await delayMsg(contact, text, options)
        }
      }
    },
    media: isMedia ? async (path) => {
      const download = await downloadMedia(msg);
      writeFile(path, download);
      return download
      
    } : null,
    imgUrl: isMedia ? async (url, path) => {
      const urlImage = await downloadMediaUrl(url)
      writeFile(path, urlImage)
      return urlImage
    } : null,
    reply: async (contact, text, options) =>{
      await delayMsg(contact, text, options)
    }
  }
}

function checkType (type, msgDetail) {
  const arrType = [{
    type: 'imageMessage',
    typeMsg: 'image',
    isMedia: true
  },
  {
    type: 'videoMessage',
    typeMsg: msgDetail.videoMessage?.gifPlayback ? 'gif' : 'video',
    isMedia: true
  },
  {
    type: 'audioMessage',
    typeMsg: msgDetail.audioMessage?.ppt ? 'vn' : 'audio',
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
  return await downloadMediaMessage(imageMessage, 'buffer')
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