import {POST} from '../../system/scraper/krakenFiles.js'

export default async function (msg) {
  await msg.reaction({loading: true})
  const link = msg.body.slice(8)
  const {url, size, title, mimetype, text, error} = await POST(link)
  if(error) return {text, error}

  await msg.reply(msg.mentions, {
    text: `${title}\n${size}\n                      Downloading...!`
  })

  if(size >= 130) {
    await msg.reply(msg.mentions, {text: `File terlalu besar untuk didownload, silahkan download manual dari link berikut:\n\n${url}`})
    msg.reaction({stop: true})
    await  msg.reaction({stop: true})
    return  msg.reaction('succes')
  }
  await msg.reply(msg.mentions, {
    document: {url},
    mimetype,
    fileName: title
  },{counter: true})
  await msg.reaction({stop: true})
  await msg.reaction('succes')
}