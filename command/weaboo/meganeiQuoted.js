import { mainPage } from './meganei.js'

export default async function (msg, {komikInfo}) {
  
  await msg.reaction('process')
  const parseToInt = parseInt(msg.body)
  const index = komikInfo[parseToInt - 1]

  const {preview, caption, linkDownload} = await mainPage(index.link)
  const imageDwn = await msg.urlDownload(preview)
  const thumb = await msg.resize(imageDwn)

  await msg.reply(msg.room_chat, {
    image: {url: preview},
    jpegThumbnail: thumb,
    caption,
    mimetype: 'image/jpeg'
  })
  await msg.reply(msg.room_chat, {text: linkDownload})
  return msg.reaction('')
}