import { createWriteStream, readFileSync } from 'fs'
import fetch from 'node-fetch'


export default async function (msg) {

    const quotedMessage = await msg.quotedMessage()
    const param = quotedMessage.body || msg.body
    const body = param.split(' ')[1]

    let data;
    const YTshort = param.includes('shorts') ? true : false
    if(!YTshort) {
        data  = await fetch(`https://api.zahwazein.xyz/searching/ytsearch?query=${encodeURIComponent(body)}%20xl&apikey=zenzkey_d4d353be64`)
    }
    else if(YTshort) {
        data = await fetch(`https://api.zahwazein.xyz/downloader/youtube?apikey=zenzkey_d4d353be64&url=${body}`)
        if(data.statusText !== 'OK')return '404 Fot Found'
        const {result: {title, thumb, getVideo}} = await data.json()

        const short = await msg.urlDownload(getVideo)
        const jpegThumbnail = await msg.urlDownload(thumb)

        const thumbnail = await msg.resize(jpegThumbnail)

        msg.reply(msg.mentions, {
            caption: title,
            video: short,
            jpegThumbnail: thumbnail
        }, {counter: true})
        
        return
    }
    else{
        return 'url atau title yang dimasukkan tidak valid'
    }

    if(data.statusText !== 'OK')return '404 Not Found'
    
    const getData = await data.json(),

    downloaded = []
    for(const [i, result] of getData.result.entries()){
        if(result.type !== 'video')continue
        if(parseInt(result.timestamp.split(':')[0]) > 5 || result.timestamp.split(':').length > 2)continue
        if(i > 10)continue

        const {
            url,
            title,
            thumbnail, 
            ago: time, 
            views, 
            timestamp: duration,
            author:{name:author}} = result

            downloaded.push({
                url,
                title,
                thumbnail,
                time,
                views,
                duration, 
                author})

    }
    
    let youtubeInfo = `     ╾─͙─͙─͙Youtube Download List─͙─͙─͙╼\n\n`
    for(const [i, media] of downloaded.entries()) {
        const date = new Date().getFullYear()
        const checkTime = media.time.includes('years')

        const isMonth = !checkTime ? media.time : (date - parseInt(media.time))

        youtubeInfo += `${i + 1}.Title: ${media.title}
Views: ${media.views}
Time: ${isMonth || '-'}
Duration: ${media.duration}
Author: ${media.author || '-'}\n\n`
    }
    youtubeInfo += `reply pesan ini dengan urutan urutan yang sesuai
*contoh* 5 -v

Keterangan: 
-v: untuk Video
-a: untuk audio
-vd: untuk video yang dikirim melalui document
-ad: untuk audio yang dikirim melalui document`

const infoMedia = await msg.reply(msg.mentions, {text: youtubeInfo}, {quoted: msg.quotedID})
const {tempStore} = await import('../../bot.js')

tempStore({message: infoMedia, downloaded})
}
