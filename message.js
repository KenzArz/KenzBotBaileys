import { downloadMediaMessage, S_WHATSAPP_NET, delay } from "@whiskeysockets/baileys"
import { createWriteStream, readFileSync } from "fs"
import fetch from 'node-fetch'
import sharp from 'sharp'

import {client} from './bot.js'

export function message_objek(msg) {
  const getMsgType = msg.ephemeralMessage?.message || msg.documentWithCaptionMessage?.message || msg.message
  const getType = checkType( findType => findType.find(findTypeMsg =>  Object.keys(getMsgType).find(keyType => keyType === findTypeMsg.type)))

  const isMedia = getType?.isMedia ? true : null

  const key = msg.key,
  messageID = key.id,
  room_chat = key.remoteJid,
  contactName = msg.pushName,
  bot = key.fromMe,
  ownerNumber = process.env.OWNER + S_WHATSAPP_NET,
  ownerId = ownerNumber == key.participant || ownerNumber == key.remoteJid,
  isOwner = bot || ownerId,

  body = msg.message?.conversation|| msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption
  if(!body) return {body: 'not a message'}


  return {
    messageID,
    contactName,
    body,
    mentions: room_chat,
    typeMsg: getType?.typeMsg,
    isMedia,
    isOwner,
    ownerNumber,
    quotedID: msg,
    quotedMessage: () => {
      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo || msg.message?.imageMessage?.contextInfo || msg.message?.audioMessage?.contextInfo
      const quoted = ctxInfo.quotedMessage

      const quotedID = ctxInfo.stanzaId
      if(!quoted) return null
      key.participant = msg.message?.extendedTextMessage?.contextInfo?.participant || undefined
      
      const bodyQuoted = quoted?.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption
      
      const getType = checkType(findType => findType.find(findOBJ => Object.keys(quoted).find(m => m === findOBJ.type)))
      const isMedia = getType?.isMedia ? true : false
      
      return {
        quotedID: {
        key: key,
        message: quoted
        },
        body: bodyQuoted,
        stanza: quotedID,
        typeMsg: getType?.typeMsg,
        isMedia,
        media: isMedia ? async function () {
          const download = await downloadMedia(this.quotedID);
          return download;
          
        } : null,
        urlDownload: async (url, path) => {
          const urlImage = await downloadMediaUrl(url, path)
          return urlImage
        },
        reply: async (contact, text, options) => {
          await delayMsg(contact, text, options)
        },
        resize: async (image, options) => {
          const media = await sharpImage(image, options)
          return media
        },
        reaction: async function({key}, emoji) {
          const emot =  await react(key, emoji)
        }
      }
    },
    media: isMedia ? async () => {
      const download = await downloadMedia(msg);
      return download
      
    } : null,
    urlDownload: async (url) => {
      const urlImage = await downloadMediaUrl(url)
      return urlImage
    },
    reply: async (contact, text, options) =>{
      return delayMsg(contact, text, options)
    },
    resize: async (image, options) => {
      const media = await sharpImage(image, options)
      return media
    },
    reaction: async function (reactContent) {
      const {loading, stop} = reactContent
      if(loading) await upload({key: msg.key})
      else if(stop) await upload(stop)
      else{
      const emot = await react(msg.key, reactContent)
      return emot}
    },
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
    typeMsg: msgDetail?.videoMessage?.gifPlayback ? 'gif' : 'video',
    isMedia: true
  },
  {
    type: 'audioMessage',
    typeMsg: msgDetail?.audioMessage?.ppt ? 'vn' : 'audio',
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
  options.ephemeralExpiration = !options.counter ? 60*60*24 : undefined
  await client.presenceSubscribe(contact)
  await delay(options.kuisDate || 1000)
  
  return await client.sendMessage(contact, body, options)
}

async function downloadMedia(imageMessage) {
  return await downloadMediaMessage(imageMessage, 'buffer')
}

async function downloadMediaUrl(url) {
  const getUrl = await fetch(url)
  return getUrl.buffer()
  
}

async function sharpImage(image, size={}) {
  const resize = await sharp(image)
    .resize(size.width || 300, size.height || 150)
    .jpeg({quality: 100})
    .toBuffer()
  return resize
}

async function react(key, emoji) {
  const emotJson = JSON.parse(readFileSync('system/emoji/emoji.json'))
  const emot = emotJson[emoji]
  return client.sendMessage(key.remoteJid, {
    react: {
      text: emot || '',
      key
    }
  })
}

let interval;
export async function upload(timesLimit) {
  const {key} = timesLimit
  if(!key) {
    return clearInterval(interval)
  }
  let uploading = 1
  await react(key, 'loading')
  interval = setInterval(async () => {
    if( uploading % 2 == 0) {
      await react(key, 'loading')
      uploading++
      return
    }
    await react(key, 'loading2')
    uploading++
  },2000)
}