import { Sticker, StickerTypes } from "wa-sticker-formatter";
import ffmpeg from 'ffmpeg-static';


export default async function (msg) {
  // console.log(msg.typeMsg)
  const isQuoted = await msg.quotedMessage()
  const type = msg.typeMsg || isQuoted.typeMsg
  if(type == 'video')return {error: true, text: 'media harus berupa gambar atau video gif'}
  const quality = type == 'image' ? 100 : 15
  
  await msg.reaction('process')
  const errorMessage = 'tidak ada image untuk diconvert menjadi stiker'
  let bufferImage;
  
  if(!isQuoted || msg.isMedia){
      if(!msg.isMedia) return errorMessage
      bufferImage = await msg.media()
  }
  else {
      if(!isQuoted.isMedia) return errorMessage
      bufferImage = await isQuoted.media()
  }

  const buffer = new Sticker(bufferImage, {author: 'KenzBot (´-﹏-`)', type: StickerTypes.FULL, quality, background:'transparent'})
  const sticker = await buffer.toMessage()
  
  await msg.reply(msg.mentions, sticker, {quoted: msg.quotedID})
  await msg.reaction('')
}