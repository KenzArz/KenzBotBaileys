import { Sticker, StickerTypes } from "wa-sticker-formatter";
import 'ffmpeg-static';

export default async function (msg) {
  
  await msg.reaction('process')
  const isQuoted = await msg.quotedMessage()
  const type = msg.typeMsg || isQuoted.typeMsg
  if(type == 'video')return {error: true, text: 'media harus berupa gambar atau video gif'}
  const quality = type == 'image' ? 100 : 15
  
  const bufferImage = await msg.media()
  if(bufferImage.text)return {text: bufferImage.text, error: true}

  const buffer = new Sticker(bufferImage, {author: 'KenzBot (´-﹏-`)', type: StickerTypes.FULL, quality, background:'transparent'})
  const sticker = await buffer.toMessage()
  
  await msg.reply(msg.room_chat, sticker, {quoted: msg.quotedID})
  await msg.reaction('')
}