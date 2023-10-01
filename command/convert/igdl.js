import { POST } from '../../system/scraper/ssinstagram.js'
import https from 'https'
export default async function (msg) {
  const quotedMessage = msg.quotedMessage()
  const url = quotedMessage?.body || msg.body.split(' ')[1]
  const regex = /(?:https:\/\/:?www.instagram.com)\/((:?reel\/|:?p\/)([-_0-9A-Za-z]{11}))|(stories\/(.+?)\/)([-_0-9A-Za-z]{19})/
  if(!regex.test(url)) return {text: 'link tidak valid pastikan link benar dari instagram', error: true}

  await (url.includes('reel') ? msg.reaction({loading: true}) : msg.reaction('process'))
  const contents = await POST(url)
  
  if(contents?.error) return {text: contents.error, error: true}
  const isArray = Array.isArray(contents)
  if(!isArray || contents.length  <= 1) {
    const size = {
      width: 300,
      height: 300
    }
    const setting = await setMedia(contents.url, msg)
    const mediaBuffer = setting.image || setting.video
    if(!mediaBuffer) {
      await msg.reaction({stop: true})
      return msg.reaction('succes')
    }
    const fetching = await msg.urlDownload(contents.thumb)

    const validateThumb = fetching == "Forbidden" || fetching?.error || !fetching;
    
    const thumb = await (validateThumb ? msg.resize('./system/image/Error_Thumbnail.png',size): msg.resize(fetching,size))
    setting.jpegThumbnail = thumb
    
    await msg.reply(msg.mentions, setting, {counter: true})
    await msg.reaction({stop: true})
    return msg.reaction('succes')
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

async function setMedia(data, sendLink) {
  const agent = new https.Agent({ keepAlive: true, timeout: 10000 });
  let message = {}
    for(const content of data) {
      const link = content.urlDownloadable || content.url
      const media = await sendLink.urlDownload(link, agent)
      if(media?.error || media == 'Forbidden') {
      console.log(media)
        
        await sendLink.reply(sendLink.mentions, { text: `link tidak dapat diconvert, silahkan convert manual jika beruntung: \n\n${link}`})
        continue
      } 
      if(content.extension == 'mp4') {
        message.video = media
        message.mimetype = 'video/mp4'
      }
      else if(content.extension == 'webp' || content.extension == 'jpg' || content.extension == "heic" ) {
        message.image = media
        message.mimetype = 'image/jpeg'
      }
    }
  
    return message
}