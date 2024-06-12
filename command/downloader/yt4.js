import { Create_message } from "../../system/message.js";
import { ytdl } from "../../system/scraper/y2mate.js";

/**@param {Create_message} msg */
export default async function(msg) {
    await msg.reaction('process')
    const quotedMessage = msg.quotedMessage()
    const content = quotedMessage?.body || msg.body
    
    const {data, ID} = await ytdl(content, 'mp4')
    let dataContent = 'Reply pesan ini dan pilih angka yang sesuai untuk memilih kualitas video\n\n' +'Title: '+ data.title + '\n'
    for(const [i, content] of data.video.entries()) {
        const bitrate = content.bitrate
        dataContent += `\n${i + 1}. ${bitrate} : ${content.size}\n`
    }
    const image = await msg.urlDownload(data.thumbnail)
    const thumbnail = await msg.resize(image)

    const videoInfo = await msg.reply(msg.room_chat, {
        image,
        caption: dataContent,
        mimetype: 'image/jpeg',
        jpegThumbnail: thumbnail
    }, {quoted: msg.quotedID})

    const {tempStore} = await import('../../bot.js')
    tempStore({message: videoInfo, downloaded: data.video, ID, thumbnail})
    
    return msg.reaction('')
}