import { Sticker, StickerTypes } from "wa-sticker-formatter";

export default async function (msg) {
    const isQuoted = msg.quotedMessage()
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
    const buffer = new Sticker(bufferImage, {author: 'KenzBot (´-﹏-`)', type: StickerTypes.FULL})
    const sticker = await buffer.toMessage()
    
    msg.reply(msg.mentions, sticker, {quoted: msg.quotedID})
}