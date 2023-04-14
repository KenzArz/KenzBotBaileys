import { downloadMediaMessage, S_WHATSAPP_NET } from "@adiwajshing/baileys"
import { writeFile } from "fs/promises"

import {client} from './bot'

export class Message {
    constructor(msg){
        const getMsgType = msg.ephemeralMessage?.message || msg.documentWithCaptionMessage.message || msg.message
        const getType = checkType( findType => findType.find(findTypeMsg =>  Object.keys(getMsgType).find(keyType => keyType === findTypeMsg.type)))
    
        const isMedia = getType.isMedia ? getType.typeMsg : null

        const key = msg.key,
        room_chat = msg.key.remoteJid,
        contactName = msg.pushName,
        bot = key.fromMe,
        ownerNumber = process.env.OWNER + S_WHATSAPP_NET,
        ownerId = ownerNumber == key.participant || ownerNumber == key.remoteJid,
        isOwner = bot || ownerId,

        body = msg.message.conversation|| msg.message.extendedTextMessage.text || msg.message.imageMessage.caption


        this.message = {
          contactID: key,
          contactName: contactName,
          body,
          mentions: room_chat,
          typeMsg: getType.typeMsg,
          isMedia,
          isOwner,
          quotedID: {
            key,
            message: msg
          },
          quotedMessage: () => {
            key.participant = msg?.extendedTextMessage?.contextInfo?.participant
      
            const ctxInfo = msg.message?.extendedTextMessage?.contextInfo || msg.message?.imageMessage?.contextInfo || msg.message?.audioMessage?.contextInfo
            const quoted = ctxInfo.quotedMessage
            if(!quoted) return
      
            const bodyQuoted = quoted.conversation || quoted.extendedTextMessage.text || quoted.imageMessage.caption
            
            const getType = checkType(findType => findType.find(findOBJ => Object.keys(quoted).find(m => m === findOBJ)))
            const isMedia = getType.isMedia ? getType.typeMsg : null
            
            return {
              quotedID: {
              key: key,
              message: quoted
              },
              body: bodyQuoted,
              typeMsg: getType.typeMsg,
              isMedia,
              media: isMedia ? async function media(path) {
                const download = await downloadMedia(quoted);
                writeFile(path, download);
                
              } : null,
              imgUrl: isMedia ? async function imageUrl(url, path) {
                const urlImage = await downloadMediaUrl(url)
                writeFile(path, urlImage)
              } : null,
              reply: async function (contact, text, options) {
                options.quoted = quoted
                await delayMsg(contact, text, options)
              }
            }
          },
          media: isMedia ? async function media() {
            const download = await downloadMedia(key);
            writeFile(path, download);
            return download
            
          } : null,
          imgUrl: isMedia ? async function imageUrl(url, path) {
            const urlImage = await downloadMediaUrl(url)
            writeFile(path, urlImage)
            return urlImage
          } : null,
          reply: async function (contact, text, options) {
            await delayMsg(contact, text, options)
          }
        }
      }

    checkType = (type, msgDetail) => {
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
      
     async delayMsg(contact, body, options = {}) {
        options.ephemeralExpiration = 60*60*24 
        await client.presenceSubscribe(contact)
        await delay(options.kuisDate || 500)
    
        await client.sendPresenceUpdate('composing', contact)
        await delay(options.kuisDate || 500)
        
        await client.sendPresenceUpdate('paused', contact)
      
        await client.sendMessage(contact, body, options)
      }
    
      async downloadMedia(imageMessage) {
        return await downloadMediaMessage(imageMessage, 'buffer')
      }
      
      async downloadMediaUrl(url) {
        const getUrl = await axios({url, responseType: 'stream'})
        new Promise (async (resolve, reject) => {
          await getUrl.data
          .pipe(fs.createWriteStream(filePath))
          .on('finish', () => resolve())
          .on('error', e => reject(e));
        })
      }

}