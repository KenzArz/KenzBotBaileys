import makeWASocket ,{ DisconnectReason,useMultiFileAuthState, fetchLatestBaileysVersion } from'@adiwajshing/baileys';
import {Boom} from '@hapi/boom';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

import { processCommand } from './command/process_command.js';
import {message_objek} from './message.js'

export let client;

export async function connecting () {
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
      const msg = m.messages[0];
      if(!msg.message) return
      await client.readMessages([msg.key]);
      
      const message = message_objek(msg)
      const isGroup = message?.mentions?.includes('@g.us')
      //cek command
      if(message.body.includes('!'))
      {
          await processCommand(message)
            .then(text => text ? message.reply(message.mentions, text) : '')
            .catch(async err => {
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
  const pathLog = 'command/log'
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
}