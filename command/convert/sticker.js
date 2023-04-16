import { Sticker, StickerTypes } from "wa-sticker-formatter";

export default async function (msg) {
    const imagePath = 'command/convert/sticker.webp';
    const isQuoted = msg.quotedMessage()
    const errorMessage = 'tidak ada image untuk di convert menjadi stiker'
    let quoted;
    if(!isQuoted || msg.isMedia){
        quoted = msg.quotedID
        await msg.media(imagePath)
    }else {
        if(!isQuoted.isMedia) throw errorMessage
        quoted = msg.quotedID
        await isQuoted.media(imagePath)
    }
    const buffer = new Sticker(imagePath, {author: 'KenzBot (´-﹏-`)', type: StickerTypes.FULL})
    return {
        typeMsg: msg.typeMsg,
        text: await buffer.toMessage(),
        quoted
    }
}