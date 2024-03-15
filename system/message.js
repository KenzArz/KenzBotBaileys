import { downloadMediaMessage, S_WHATSAPP_NET, delay } from "@whiskeysockets/baileys"
import { readFileSync } from "fs"
import fetch from 'node-fetch'
import axios from 'axios'
import sharp from 'sharp'
import https from 'https'

import {client} from '../bot.js'
const map = new Map()

export class Create_message {

  #msg
  #getMsgType;
  #getType;
  #key
  #bot
  #ctxInfo
  #mediaContent

  constructor(msg) {
    this.#msg = msg

    this.#getMsgType = msg.ephemeralMessage?.message || msg.documentWithCaptionMessage?.message || msg.message
    this.#getType = checkType( findType => findType.find(findTypeMsg =>  Object.keys(this.#getMsgType).find(keyType => keyType === findTypeMsg.type)), this.#getMsgType)
    this.#key = msg.key
    this.#bot = this.#key.fromMe
    this.#mediaContent = msg.message.extendedTextMessage || msg.message.imageMessage || msg.message.videoMessage
    this.#ctxInfo = this.#msg.message?.extendedTextMessage?.contextInfo || this.#msg.message?.imageMessage?.contextInfo || this.#msg.message?.audioMessage?.contextInfo



    this.typeMsg = this.#getType?.typeMsg
    this.isMedia = this.#getType?.isMedia ? true : false
    this.contactName = msg.pushName

    this.body = msg.message.extendedTextMessage?.text || msg.message?.conversation || this.#mediaContent?.caption
    this.messageID = this.#key.id
    this.room_chat = this.#key.remoteJid
    this.expiration = this.#ctxInfo?.expiration
    this.ownerNumber = process.env.OWNER + S_WHATSAPP_NET
    this.ownerId = this.ownerNumber == this.#key.participant || this.ownerNumber == this.#key.remoteJid,
    this.isOwner = this.#bot || this.ownerId
    this.quotedID = this.#msg
    
  }

  quotedMessage()  {
    const quoted = this.#ctxInfo?.quotedMessage
    const quotedID = this.#ctxInfo?.stanzaId
    if(!quoted) return null
    this.#key.participant = this.#msg.message?.extendedTextMessage?.contextInfo?.participant || undefined
    const bodyQuoted = quoted?.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption
      
    const getType = checkType(findType => findType.find(findOBJ => Object.keys(quoted).find(m => m === findOBJ.type)), quoted)
    const isMedia = getType?.isMedia ? true : false

    return {
      quotedID: {
        key: this.#key,
        message: quoted
      },
      body: bodyQuoted,
      stanza: quotedID,
      typeMsg: getType?.typeMsg,
      isMedia
    }
  }

  media = async () => {
    const isQuoted = this.quotedMessage()
    const isMedia = isQuoted?.isMedia || this.isMedia
    if(!isMedia )return {text: 'sertakan gambar!!!'}

    const media = isQuoted ? isQuoted.quotedID : this.#msg
    const download = await downloadMedia(media);
    return download
  }

  async urlDownload(url, options = {}) {
    let urlImage
      try {        
        urlImage = await downloadMediaUrl(url, options)
      } catch (error) {
        if(error.toString().includes('network socket') || error.response.status == 521) {
          if(options.repeat == 5) {
            return {error: true}
          }
         if(options.repeat) options.repeat = options.repeat + 1
          options.repeat = options.repeat || 0
          urlImage = await this.urlDownload(url, options)
        }
      }
      return urlImage
  }

  async reply(contact, text, options={}) {
    options.ephemeralExpiration = this.expiration
    return delayMsg(contact, text, options)
  }

  async resize(image, options) {
    const media = await sharpImage(image, options)
    return media
  }

  async reaction(reactContent) {
    const {loading, stop} = reactContent

    if(loading) {
      await upload({key: this.#key})
    }
    else if(stop) await upload(stop)
    else{
    const emot = await react(this.#key, reactContent)
    return emot
    }
  }
}

// export function message_objek(msg) {
//   const getMsgType = msg.ephemeralMessage?.message || msg.documentWithCaptionMessage?.message || msg.message
//   const getType = checkType( findType => findType.find(findTypeMsg =>  Object.keys(getMsgType).find(keyType => keyType === findTypeMsg.type)), getMsgType)

//   const isMedia = getType?.isMedia ? true : null

//   const key = msg.key,
//   messageID = key.id,
//   room_chat = key.remoteJid,
//   bot = key.fromMe,
//   contactName = msg.pushName,
//   ownerNumber = process.env.OWNER + S_WHATSAPP_NET,
//   ownerId = ownerNumber == key.participant || ownerNumber == key.remoteJid,
//   isOwner = bot || ownerId,

//   body = msg.message?.conversation|| msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption
//   if(!body) return {body: 'not a message'}


//   return {
//     messageID,
//     contactName,
//     body,
//     mentions: room_chat,
//     typeMsg: getType?.typeMsg,
//     isMedia,
//     isOwner,
//     ownerNumber,
//     quotedID: msg,
//     quotedMessage: () => {
//       const ctxInfo = msg.message?.extendedTextMessage?.contextInfo || msg.message?.imageMessage?.contextInfo || msg.message?.audioMessage?.contextInfo
//       const quoted = ctxInfo?.quotedMessage

//       const quotedID = ctxInfo?.stanzaId
//       if(!quoted) return null
//       key.participant = msg.message?.extendedTextMessage?.contextInfo?.participant || undefined
      
//       const bodyQuoted = quoted?.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption
      
//       const getType = checkType(findType => findType.find(findOBJ => Object.keys(quoted).find(m => m === findOBJ.type)), quoted)
//       const isMedia = getType?.isMedia ? true : false
      
//       return {
//         quotedID: {
//         key: key,
//         message: quoted
//         },
//         body: bodyQuoted,
//         stanza: quotedID,
//         typeMsg: getType?.typeMsg,
//         isMedia,
//         // media: isMedia ? async function () {
//         //   const download = await downloadMedia(this.quotedID);
//         //   return download;
          
//         // } : null,
//         // urlDownload: async (url, path) => {
//         //   const urlImage = await downloadMediaUrl(url, path)
//         //   return urlImage
//         // },
//         // reply: async (contact, text, options) => {
//         //   await delayMsg(contact, text, options)
//         // },
//         // resize: async (image, options) => {
//         //   const media = await sharpImage(image, options)
//         //   return media
//         // },
//         // reaction: async function({key}, emoji) {
//         //   const emot =  await react(key, emoji)
//         // }
//       }
//     },
//     media: isMedia ? async () => {
//       const download = await downloadMedia(msg);
//       return download
      
//     } : null,
//     urlDownload: async function(url, options = {})  {
//       let urlImage
//       try {        
//         urlImage = await downloadMediaUrl(url, options)
//       } catch (error) {
//         if(error.toString().includes('network socket') || error.response.status == 521) {
//           if(options.repeat == 5) {
//             return {error: true}
//           }
//          if(options.repeat) options.repeat = options.repeat + 1
//           options.repeat = options.repeat || 0
//           urlImage = await this.urlDownload(url, options)
//         }
//       }
//       return urlImage
//     },
//     reply: async (contact, text, options) =>{
//       return delayMsg(contact, text, options)
//     },
//     resize: async (image, options) => {
//       const media = await sharpImage(image, options)
//       return media
//     },
//     reaction: async function (reactContent) {
//       const {loading, stop} = reactContent

//       if(loading) {
//         await upload({key: msg.key})
//       }
//       else if(stop) await upload(stop)
//       else{
//       const emot = await react(msg.key, reactContent)
//       return emot
//       }
//     },
//   }
// }

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
  },
  {
    type: 'extendedTextMessage',
    typeMsg: 'text',
    isMedia: false
  }
]
return type(arrType)
}

async function delayMsg(contact, body, options = {}) {
  await client.presenceSubscribe(contact)
  await delay(options.kuisDate || 1000)
  
  return await client.sendMessage(contact, body, options)
}

async function downloadMedia(imageMessage) {
  return await downloadMediaMessage(imageMessage, 'buffer', {})
}

async function downloadMediaUrl(url, agent) {
  const agentDefault = new https.Agent({
    keepAlive: true
  })
  const data = {}
  try {
    data.getUrl = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
      },
      method: 'GET',
      agent: agent || agentDefault
    })
    const arrayBuffer = await data.getUrl.arrayBuffer()
    data.buffer = Buffer.from(arrayBuffer)
  } catch (error) {
    console.log('axios launched!')
      
     data.getUrl = await axios.get(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        httpsAgent: agent || agentDefault},
        responseType: 'arraybuffer'
       })
      data.buffer = Buffer.from(data.getUrl.data)
  }

  if(data.getUrl.status == '403' || data.getUrl.status == 521) return 'Forbidden'
  return data.buffer
  
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

const clear = []
async function upload(timesLimit) {
  const {key} = timesLimit
  if(!key) {
    for(const [i, checking] of clear.entries()) {
      if(map.has(checking)){
        const get = map.get(checking)
        clearInterval(get)
        return clear.splice(i, 1)
      }
    }
    return
  }

  let id = ''
  for(let i = 0; i < 4; i++) {
    id +=`${Math.floor(Math.random() * 9)}`
  }

  let uploading = 1
  await react(key, 'loading')
  const time = setInterval(async () => {
    if( uploading % 2 == 0) {
      await react(key, 'loading')
      uploading++
      return
    }
    await react(key, 'loading2')
    uploading++
  },2000)
  
  map.set(id, time)
  clear.push(id)
}