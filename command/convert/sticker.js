import { Sticker, StickerTypes } from "wa-sticker-formatter/dist";

export default async function (msg) {
    const imagePath = './command/convert/sticker.webp';
    const isQuoted = msg.quotedMessage()
    const errorMessage = 'tidak ada image untuk di convert menjadi stiker'
    let quoted;
    if(isQuoted){
        if(!isQuoted.isMedia) throw errorMessage
        quoted = isQuoted.quotedID
        await isQuoted.media(imagePath)
    }else {
        if(!msg.isMedia) throw errorMessage
        quoted = msg.quotedID
        await msg.media(imagePath)
    }
    const buffer = new Sticker(imagePath, {author: 'KenzBot (´-﹏-`)', type: StickerTypes.FULL})
    return {
        typeMsg: msg.typeMsg,
        text: await buffer.toMessage(),
        quoted
    }
}