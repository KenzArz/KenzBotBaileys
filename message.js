import { downloadMediaMessage, S_WHATSAPP_NET, delay } from "@adiwajshing/baileys"
import { createWriteStream } from "fs"
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
    quotedMessage: async () => {
      key.participant = msg.message?.extendedTextMessage?.contextInfo?.participant

      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo || msg.message?.imageMessage?.contextInfo || msg.message?.audioMessage?.contextInfo
      const quoted = ctxInfo.quotedMessage

      const quotedID = ctxInfo.stanzaId
      if(!quoted) return null

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
        resize: async (image) => {
          const media = await sharpImage(image)
          return media
        }
      }
    },
    media: isMedia ? async () => {
      const download = await downloadMedia(msg);
      return download
      
    } : null,
    urlDownload: async (url, path) => {
      const urlImage = await downloadMediaUrl(url, path)
      return urlImage
    },
    reply: async (contact, text, options) =>{
      return delayMsg(contact, text, options)
    },
    resize: isMedia ? async (image) => {
      const media = await sharpImage(image)
      return media
    } : null
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
  await delay(options.kuisDate || 500)

  await client.sendPresenceUpdate('composing', contact)
  await delay(options.kuisDate || 500)
  
  await client.sendPresenceUpdate('paused', contact)

  return client.sendMessage(contact, body, options)
}

async function downloadMedia(imageMessage) {
  return await downloadMediaMessage(imageMessage, 'buffer')
}

async function downloadMediaUrl(url, path) {
  const getUrl = await fetch(url)
  return new Promise((res, rej) => {
    getUrl.body
      .pipe(createWriteStream(path))
      .on('finish', () => res('succes'))
      .on('error', () => rej('failed'))
  })
}

async function sharpImage(image) {
  const resize = await sharp(image)
    .resize(50,25)
    .jpeg({quality: 35})
    .toBuffer()
  return resize
}