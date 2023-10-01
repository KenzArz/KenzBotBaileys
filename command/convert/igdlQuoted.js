export default async function(msg, {contents, setMedia}) {

  await msg.reaction({loading: true})
  const int = parseInt(msg.body)
  const errThumb = './system/image/Error_Thumbnail.png'
  const size = {
    width: 300,
    height: 300
  }
  
  if(int == '99') {
    for(const media of contents){
      const setting = await setMedia(media.url, msg)

      const mediaBuffer = setting.image || setting.video
      if(!mediaBuffer) {
        await msg.reaction({stop: true})
        await msg.reaction('succes')
        continue
    }
      // const fetching = await (setting == 'Forbidden' ? msg.urlDownload(errThumb, size): msg.urlDownload(media.thumb))
      // const thumb = await msg.resize(fetching)
      const fetching = await msg.urlDownload(media.thumb)

      const validateThumb = fetching == "Forbidden" || fetching?.error || !fetching
      const thumb = await (validateThumb ? msg.resize(errThumb,size): msg.resize(fetching,size))
      setting.jpegThumbnail = thumb
      await msg.reply(msg.mentions, setting, {counter: true})
    }
    await msg.reaction({stop: true})
    return msg.reaction('succes')
  }

  const array = contents[int - 1]
  if(!array) return {
    text: 'angka yang anda masukan tidak sesuai',
    error: true
  }
  const setting = await setMedia(array.url, msg)
  const mediaBuffer = setting.image || setting.video
  if(!mediaBuffer) {
    await msg.reaction({stop: true})
    return msg.reaction('succes')
  }
  const fetching = await msg.urlDownload(array.thumb)
  const validateThumb = fetching == "Forbidden" || fetching?.error || !fetching
  const thumb = await ( validateThumb ? msg.resize(errThumb,size): msg.resize(fetching, size))
  setting.jpegThumbnail = thumb

  await msg.reply(msg.mentions, setting, {counter: true})
  await msg.reaction({stop: true})
  return msg.reaction('succes')
}