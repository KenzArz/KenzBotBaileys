import got from 'got'
import vm from 'vm'
import fetch from 'node-fetch'

export default async function (msg) {
  const quotedMessage = await msg.quotedMessage()
  const url = quotedMessage?.body || msg.body.split(' ')[1]

  if(!url.includes('instagram.com')) return {text: 'link tidak valid pastikan link benar dari instagram', error: true}

 await msg.reaction('process')
 const script = await got('https://worker.sf-tools.com/savefrom.php', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      origin: 'https://id.savefrom.net',
      referer: 'https://id.savefrom.net/',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36'
    },
    form: {
      sf_url: url,
      sf_submit: '',
      new: 2,
      lang: 'id',
      app: '',
      country: 'id',
      os: 'Windows',
      browser: 'Chrome',
      channel: ' main',
      'sf-nomad': 1
    }
  })
   const executeCode = '[]["filter"]["constructor"](b).call(a);'
   const fileScript = script.body.replace(executeCode, `
  try {const script = ${executeCode.split('.call')[0]}.toString();if (script.includes('function showResult')) scriptResult = script;else (${executeCode.replace(/;/, '')});} catch {}
 `)

  const context = {
    scriptResult: '',
    log: console.log
  }
  vm.createContext(context)
   new vm.Script(fileScript).runInContext(context)
  const data = context.scriptResult.split('window.parent.sf.videoResult.show(')?.[1] || context.scriptResult.split('window.parent.sf.videoResult.showRows(')?.[1]

  const content = data.split(');')[0].split(",\"instagram.com\"")[0]
  const toJSON = JSON.parse(content)
  const isArray = Array.isArray(toJSON)
  
  if(!isArray) {
    let media = {}
     for(const content of toJSON.url) {
       media.url = content.url
       media.type = content.type
     }
    console.log(toJSON.thumb)
  
    let message = {}
    if(media.type == 'jpg' || media.type == 'webp') {
      message.image = {url: media.url}
      message.mimetype = 'image/jpeg'
    }
    else if(media.type == 'mp4') {
      message.video = {url: media.url}
      message.mimetype = 'video/mp4'
    }

    const fetching = await msg.urlDownload(toJSON.thumb)
   // console.log(fetching)
    const thumb = await msg.resize(fetching)
    message.jpegThumbnail = thumb
    await msg.reply(msg.mentions, message)
    return msg.reaction({stop:true})
  }
  let index = ''
  for(const [content] of toJSON.entries()) {
    index+= `\n${content + 1}`
  }
  const contentMedia = await msg.reply(msg.mentions, {
    text: `ketik angka yang sesuai slide dipostingan untuk didownload\n${index}\n\n*NOTE*\nbalas 99 untuk mendownload semua media`
  }, {quoted: msg.quotedID})

  const {tempStore} = await import('../../bot.js')
  tempStore({message: contentMedia, content: toJSON})
  return msg.reaction('')
}
