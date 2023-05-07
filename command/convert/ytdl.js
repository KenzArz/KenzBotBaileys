import fetch from 'node-fetch'


export default async function (msg) {

    const quotedMessage = await msg.quotedMessage()

    const param = quotedMessage?.body ? `${quotedMessage.body} ${msg.body.slice(6)}` : msg.body.slice(6)
    const [body, keterangan] = param.split('-')

    let data;
    const link = body.includes('https') ? true : false
    if(!link) {
        data  = await fetch(`https://api.zahwazein.xyz/searching/ytsearch?query=${encodeURIComponent(body)}%20xl&apikey=zenzkey_d4d353be64`)
    }
    else if(link) {
        if(!keterangan) return {text: `sertakan keterangan untuk mengirim file dalam bentuk apa
            
Keterangan: 
-v: untuk Video
-a: untuk audio
-vd: untuk video yang dikirim melalui document
-ad: untuk audio yang dikirim melalui document

*CONTOH*: 5 -a`, error: true}
        
        data = await fetch(`https://api.zahwazein.xyz/downloader/youtube?apikey=zenzkey_d4d353be64&url=${body}`)

        if(data.statusText !== 'OK')return '404 Fot Found'
        const {result: {title, thumb, getVideo, getAudio, duration}} = await data.json()

        if(parseInt(duration.split(':')[0]) > 5 || duration.split(':').length > 2)return {text: 'durasi lebih dari 5 menit, tidak bisa mengconvert video lebih dari 5 menit', error: true}
        
        const jpegThumbnail = await msg.urlDownload(thumb)

        const thumbnail = await msg.resize(jpegThumbnail)

        const media = {}
        switch(keterangan) {
            case 'v':
                media.video = {url: getVideo}
                media.caption = title
                media.mimetype = 'video/mp4'
                media.jpegThumbnail = thumbnail
                break
            case 'vd':
                media.document = {url: getVideo}
                media.fileName = title
                media.mimetype = 'video/mp4'
                break
            case 'ad':
                media.document = {url: getAudio}
                media.fileName = title
                media.mimetype = 'audio/mp4'
                break
            case 'a':
                media.audio = audio
                media.mimetype = 'audio/mp4'
                break
        }

        msg.reply(msg.mentions, media, {counter: true})
        
        return
    }
    else{
        return 'url atau title yang dimasukkan tidak valid'
    }

    if(data.statusText !== 'OK')return '404 Not Found'
    
    const getData = await data.json(),

    downloaded = []
    console.log(getData)
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

tes('https://youtube.com/watch?v=UoklxctRrsk')