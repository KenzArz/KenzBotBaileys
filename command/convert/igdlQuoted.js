export default async function(msg, {content}) {
  await msg.reaction({loading: true})
  const int = parseInt(msg.body)
  if(int == '99') {
    for(const media of content){
      const data = {}
      for(const body of media.url) {
        data.url = body.url
        data.type = body.type
      }

      const message = {}
      if(data.type == 'webp' || data.type == 'webp') {
        message.image = {url: data.url}
        message.mimetype = 'image/jpeg'
      }
      else if(data.type == 'mp4') {
        message.video = {url: data.url}
        message.mimetype = 'video/mp4'
      }

      const fetching = await msg.urlDownload(media.thumb)
      const thumb = await msg.resize(fetching)
      message.jpegThumbnail = thumb

      await msg.reply(msg.mentions, message)
    }
    await msg.reaction({stop: true})
    return msg.reaction('succes')
  }

  const array = content[int - 1]

  const data = {}
  for(const body of array.url) {
    data.url = body.url
    data.type = body.type
  }

  const message = {}
  if(data.type == 'webp' || data.type == 'webp') {
    message.image = {url: data.url}
    message.mimetype = 'image/jpeg'
  }
  else if(data.type == 'mp4') {
    message.video = {url: data.url}
    message.mimetype = 'video/mp4'
  }

  const fetching = await msg.urlDownload(array.thumb)
  const thumb = await msg.resize(fetching)
  message.jpegThumbnail = thumb

  await msg.reply(msg.mentions, message)
  await msg.reaction({stop: true})
  return msg.reaction('succes')
}