import { mainPage, shortLink } from './bakadame.js'

export default async function(msg, {komikInfo}) {
  await msg.reaction('process')
  const parseToInt = parseInt(msg.body)
  const index = komikInfo[parseToInt - 1]

  const {image, caption, contents} = await mainPage(index.url)
  const imageDwn = await msg.urlDownload(image)
  const thumb = await msg.resize(imageDwn)

  await msg.reply(msg.mentions, {
    image: {url: image},
    jpegThumbnail: thumb,
    caption,
    mimetype: 'image/jpeg'
  })

  const text = await shortLink(contents)
    if(text.split('LIMIT').length > 1) {
      for(const tautan of text.split('LIMIT')) {
        await msg.reply(msg.mentions, {text: tautan})
      }
      return
    }
    await msg.reply(msg.mentions, {text})
  
  return msg.reaction('')
}