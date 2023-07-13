import fetch from 'node-fetch'

export default async function (msg) {
  await msg.reaction('process')
  const quotedMessage = await msg.quotedMessage()
  const url = quotedMessage?.body || msg.body.slice(8)

  if(!url)return {text: 'masukkan link dengan benar dan pastikan link benar-benar dari 1Drive', error: true}
  const isBakadame = /https:\/\/kenzbot.kenzart05.repl.co\/1Drive+(.+?){5}/
  if(isBakadame) {
    const fetching = await fetch('https://web-scrap.kenzart05.repl.co/api/bakadame', {
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        method: 'POST',
        body: 'url='+ url
      })
    const res = await fetching.json()
    console.log(res.url.size)
    
    await msg.reaction({loading: true})
    if(res.status == 200) {
      const limit = res.url.size <= 130
      if(limit){ 
        await msg.reply(msg.mentions, {
        document: {url: res.url.download},
        mimetype: res.url.mimeType,
        fileName: res.url.name
      })
        await msg.reaction({stop: true})
        return msg.reaction('succes')
    }
       
      const bufferContent = await msg.urlDownload(res.url.download)
      await msg.reply(msg.mentions, {
        document: {url: res.url.download},
        mimetype: res.url.mimeType,
        fileName: res.url.name
      })
    }
      else if(res.status == 500){
      await msg.reply(msg.mentions,{text: res.message})
      }
    await msg.reaction({stop: true})
    await msg.reaction('succes')   
  }
}