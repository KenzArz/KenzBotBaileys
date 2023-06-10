export default async function(msg, {contents, setMedia}) {
  await msg.reaction({loading: true})
  const int = parseInt(msg.body)
  if(int == '99') {
    for(const media of contents.url){
      const setting = setMedia(media)
      const fetching = await msg.urlDownload(media.thumb)
      const thumb = await msg.resize(fetching)
      setting.jpegThumbnail = thumb
      await msg.reply(msg.mentions, setting)
    }
    await msg.reaction({stop: true})
    return msg.reaction('succes')
  }

  const array = contents[int - 1]
  const setting = setMedia(array.url)
  const fetching = await msg.urlDownload(array.thumb)
  const thumb = await msg.resize(fetching)
  setting.jpegThumbnail = thumb

  await msg.reply(msg.mentions, setting)
  await msg.reaction({stop: true})
  return msg.reaction('succes')
}