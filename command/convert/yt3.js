import { Create_message } from '../../system/message.js'
import { POST, ytdl } from '../../system/scraper/y2mate.js'

/**@param {Create_message} msg */
export default async function (msg) {

    await msg.reaction({loading: true})
    
    const quotedMessage = msg.quotedMessage()
    const content = quotedMessage?.body || msg.body

    const { ID, data } = await ytdl(content, 'mp3')
    ID.k = data.id

    const mp3 = await POST({
        url: 'convertV2/index',
        formData: ID,
        isConvert: true
    })

    await msg.reply(msg.room_chat, {
        audio: {
            url: mp3
        },
        mimetype: "audio/mp4"
    }, {quoted: msg.quotedID})

    await msg.reaction({stop: true})
    return msg.reaction('succes')
}