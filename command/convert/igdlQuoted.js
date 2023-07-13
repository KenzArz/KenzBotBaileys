export default async function(msg, {contents, setMedia}) {

  await msg.reaction({loading: true})
  const int = parseInt(msg.body)
  const errThumb = '.system/image/Error_thumbnail.png'
  const size = {
    width: 300,
    height: 300
  }
  
  if(int == '99') {
    for(const media of contents){
      const setting = setMedia(media.url)
      const fetching = await (setting == 'Forbidden' ? msg.urlDownload(errThumb, size): msg.urlDownload(media.thumb))
      const thumb = await msg.resize(fetching)
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
  const setting = setMedia(array.url)
  const fetching = await msg.urlDownload(array.thumb)
  const thumb = await (fetching == 'Forbidden' ? msg.resize(errThumb,size): msg.resize(fetching, size))
  setting.jpegThumbnail = thumb

  await msg.reply(msg.mentions, setting, {counter: true})
  await msg.reaction({stop: true})
  return msg.reaction('succes')
}