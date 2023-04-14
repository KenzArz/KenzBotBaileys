import { Sticker, StickerTypes } from "wa-sticker-formatter/dist";

export default async function (msg) {
    const imagePath = './command/convert/sticker.webp';
    const isQuoted = msg.quotedMessage()
    const errorMessage = 'tidak ada image untuk di convert menjadi stiker'
    if(isQuoted){
        if(!isQuoted.isMedia) throw errorMessage
            await isQuoted.media(imagePath)
    }else {await msg.media(imagePath)}
    if(!msg.isMedia) throw errorMessage
    const buffer = new Sticker(imagePath, {author: 'KenzBot (´-﹏-`)', type: StickerTypes.FULL})
    return buffer.toMessage()
}