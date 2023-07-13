import fetch from 'node-fetch'
import cheerio from 'cheerio'

export default async function (msg) {
  const quotedMessage = await msg.quotedMessage()
  const link = quotedMessage?.body || msg.body.slice(8)
  await msg.reaction({loading: true})

  const data = {}
  const isBaka = /https:\/\/kenzbot.kenzart05.repl.co\/MdFire+(.+?){5}/.test(link)
  if(isBaka) {
    const fetching = await fetch('https://web-scrap.kenzart05.repl.co/api/bakadame', {
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      method: 'POST',
      body: 'url=' + link
    })
    const {status, message, url} = await fetching.json()
    if(status == 200) {
      const direct = await directLink(url)
      Object.assign(data, direct)
      
    }else if(status == 500) {
      await msg.reply(msg.mentions,{
        text: message
      })
      await msg.reaction({stop: true})
      return msg.reaction('failed')
    }
  }else {
    const file = await directLink(link)
    Object.assign(data, file)
  }
  const { url, fileName, mimetype, fileSize } = data
  if(fileSize >= 150) {
    await msg.reply(msg.mentions, {
      text: `File terlalu besar untuk didownload, silahkan download manual dari link berikut:\n\n${url}`
    })
    await msg.reaction({stop: true})
    return msg.reaction('succes')
  }
  await msg.reply(msg.mentions, {
    document: {url},
    mimetype,
    fileName
  })
  await msg.reaction({stop: true})
  return msg.reaction('succes')
}

async function directLink(link) {
  let mediafire = link.replace(/\?dkey=.*$/, '')
  const content = await fetch(mediafire)
  const html = await content.text()
  const $ = cheerio.load(html)
  const direct = $('#downloadButton').attr('href')

  return head(direct)
}

async function head(directed) {
  const { url, headers } = await fetch(directed)
  return {
    url,
    fileName: headers.get('content-disposition').match(/filename="(.+?)"/)[1],
    mimetype: headers.get('content-type'),
    fileSize: Math.floor(parseInt(headers.get('content.length')) / 1048576 )
  }
}