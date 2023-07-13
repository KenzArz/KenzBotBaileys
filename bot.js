import makeWASocket ,{ DisconnectReason,useMultiFileAuthState, fetchLatestBaileysVersion, makeInMemoryStore} from'@whiskeysockets/baileys';
import {Boom} from '@hapi/boom';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import pino from 'pino'

import { processCommand, commandQuoted } from './command/process_command.js';
import {message_objek} from './system/message.js'

export let client;
export const temp = []
export const tempStore = (message) => {
  temp.push(message)
  const index = temp.length - 1
  new Promise((res, rej) => {
    setTimeout(() => {
      temp.splice(index, 1)
      res('ok')
      rej('error')
    }, 180000)
  })
}
const logger= pino({ level: 'silent' }) 
const store = makeInMemoryStore({logger})
// can be read from a file
store.readFromFile('system/baileys_store.json')
// saves the state to a file every 10s
 setInterval(() => {
     store.writeToFile('system/baileys_store.json')
}, 10000)

export default async function connecting () {
  const { state, saveCreds } = await  useMultiFileAuthState('system/auth');
  const { version, isLatest } = await fetchLatestBaileysVersion();    
  client = await makeWASocket.default({
    version,
    printQRInTerminal: true,
    logger,
    auth: state,
    linkPreviewImageThumbnailWidth: 500,
    getMessage: async key => {
      if(store) {
        const msg = await store.loadMessage(key.remoteJid, key.id, undefined)
        return msg?.message || undefined
      }
      const {id} = key
      console.log('Resending', id)
      console.log(typeof tempStore[id])
      return tempStore[id]?.message
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
      const msg = m.messages[0];
      if(!msg.message) return
      await client.readMessages([msg.key]);
      const message = message_objek(msg)
      const isGroup = message?.mentions?.includes('@g.us')

      //cek command
      if(message?.body?.startsWith('!',0))
      {
          await processCommand(message)
            .then(async text => text ? await message.reply(message.mentions, text, {quoted: message.quotedID}) : '')
            .catch(async err => {
              console.log(err)
              await message.reaction({stop: true})
              await message.reaction('danger')
          await message.reply(message.mentions, {text: `*Terjadi Error*

${err.toString()}`})
            const date = new Date()
            const {subject} = isGroup ? await client.groupMetadata(message.mentions) : false
            const error = errorLog(`Error Message\n`+
            `Date: ${date.getHours() + 7}:${date.getMinutes()}}\n`+
            `chat: ${message.mentions}\n`+
            `chat room: ${subject || 'private chat'}\n`+
            `text: ${message.body}\n`+
            `typeMessage: ${message?.typeMsg || 'UNKNOWN'}\n`+
            `errorMessage: ${err}`
            )

            message.reply(message.ownerNumber, error)
        })
        
      }
      if(parseInt(message.body)  && message.quotedMessage() && temp.length !== 0)
      {
          await commandQuoted(message)
            .then(text => text ? message.reply(message.mentions, text, {quoted: message.quotedID}) : '')
            .catch(async err => {
              console.log(err)
              await message.reaction({stop: true})
              await message.reaction('danger')
              
              await message.reply(message.mentions, {text: `*Terjadi Error*

${err.toString()}`})
            const date = new Date()
            const {subject} = isGroup ? await client.groupMetadata(message.mentions) : false
            const error = errorLog(`Error Message\n`+
            `Date: ${date.getHours() + 7}:${date.getMinutes()}}\n`+
            `chat: ${message.mentions}\n`+
            `chat room: ${subject || 'private chat'}\n`+
            `text: ${message.body}\n`+
            `typeMessage: ${message?.typeMsg || 'UNKNOWN'}\n`+
            `errorMessage: ${err}`
            )

            message.reply(message.ownerNumber, error)
        })
      }
    })
}

function errorLog(log) {
  const pathLog = 'system/log'
  if(!existsSync(pathLog)){
    mkdirSync(pathLog)
    writeFileSync(`${pathLog}/log.txt`, log)
    return {
      text: '*Error Message Detected*\nsilahkan check log message'}
  }
  const readFile = readFileSync(pathLog + '/log.txt', {encoding: 'utf8'})
  writeFileSync(`${pathLog}/log.txt`, `${readFile}\n\n${log}`)
  return {
    text: '*Error Message Detected*\nsilahkan check log message'}
    return
}