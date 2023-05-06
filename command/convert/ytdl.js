import { createWriteStream, readFileSync } from 'fs'
import fetch from 'node-fetch'


export default async function (msg) {

    const quotedMessage = await msg.quotedMessage()
    const param = quotedMessage.body || msg.body

    let data;
    const YTshort = param.includes('shorts') ? true : false
    if(!YTshort) {
        data  = await fetch(`https://api.zahwazein.xyz/searching/ytsearch?query=${encodeURIComponent(title)}%20xl&apikey=zenzkey_d4d353be64`)
    }
    else if(YTshort) {
        data = await fetch(`https://api.zahwazein.xyz/downloader/youtube?apikey=zenzkey_d4d353be64&url=${link}`)
        if(data.statusText !== 'OK')return
        const {result: {title, thumb, getVideo}} = await data.json()

        await msg.urlDownload(getVideo, './short.mp4')
        await msg.urlDownload(thumb, './thumShort.jpeg')

        const thumbnail = await msg.resize('./thumShort.jpeg')

        msg.reply(msg.mentions, {
            caption: title,
            video: readFileSync('./short.mp4'),
            jpegThumbnail: thumbnail
        }, {counter: true})
        
        return
    }
    else{
        return 'url atau title yang dimasukkan tidak valid'
    }

    // if(data.statusText !== 'OK')return '404 Not Found'
    
    // const getData = await data.json(),
    // newData = []

    
    // for(const [i, result] of getData.result.entries()){
    //     if(result.type !== 'video')continue
    //     if(i >= 10)continue

    //     const {
    //         url,
    //         title,
    //         thumbnail, 
    //         ago: time, 
    //         views, 
    //         timestamp: duration,
    //         author:{name:author}} = result

    //         newData.push({
    //             url,
    //             title,
    //             thumbnail,
    //             time,
    //             views,
    //             duration, 
    //             author})

    // }

    // const downloaded = []
    // for(const detailDownload of newData) {
    //     const youtubeData = await fetch(`https://api.zahwazein.xyz/downloader/youtube?apikey=zenzkey_d4d353be64&url=${encodeURIComponent(detailDownload.url)}`)

    //     const downloadMedia = await youtubeData.json()
    //     const audio = downloadMedia.getAudio
    //     // const video = YTshort ? downloadMedia.getVideo : null

    //     detailDownload.audo = audio
    //     detailDownload.video = video

    //     downloaded.push(detailDownload)
    // }
    

    

}