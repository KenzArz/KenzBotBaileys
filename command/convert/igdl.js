import { POST } from '../../system/scraper/savefrom.js'

export default async function (msg) {
  const quotedMessage = await msg.quotedMessage()
  const url = quotedMessage?.body || msg.body.split(' ')[1]

  if(!url.includes('instagram.com')) return {text: 'link tidak valid pastikan link benar dari instagram', error: true}

  await msg.reaction('process')
  const contents = await POST(url)
  const isArray = Array.isArray(contents)

  if(!isArray) {
    const setting = setMedia(contents.url)
    const fetching = await msg.urlDownload(contents.thumb)
    const thumb = await msg.resize(fetching)
    setting.jpegThumbnail = thumb
    await msg.reply(msg.mentions, setting)
    return msg.reaction({stop:true})
  }

  let index = ''
  for(const [content] of contents.entries()) {
    index+= `\n${content + 1}`
  }
  const contentMedia = await msg.reply(msg.mentions, {
    text: `ketik angka yang sesuai slide dipostingan untuk didownload\n${index}\n\n*NOTE*\nbalas 99 untuk mendownload semua media`
  }, {quoted: msg.quotedID})

  const {tempStore} = await import('../../bot.js')
  tempStore({message: contentMedia, contents, setMedia})
  return msg.reaction('')
}

function setMedia(data) {
  let media = {}
    for(const content of data) {
      media.url = content.url
      media.type = content.type
     }
  
    let message = {}
    if(media.type == 'jpg' || media.type == 'webp') {
      message.image = {url: media.url}
      message.mimetype = 'image/jpeg'
    }
    else if(media.type == 'mp4') {
      message.video = {url: media.url}
      message.mimetype = 'video/mp4'
    }
    return message
}