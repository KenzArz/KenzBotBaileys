import js from 'jsdom'
const {JSDOM} = js

export default async function (msg) {

    await msg.reaction('process')
    const quotedMessage = await msg.quotedMessage()

    const content = msg?.quotedMessage()?.body || msg.body
    const [_, type, links] = content.split(' ')

    let data;
    const isLink = links?.includes('https')  || type?.includes('https') ? true : false
    if(!isLink) {
      return {
        text: 'maintenance, untuk sekarang fitur ini hanya support untuk convert link yt',
        error: true
      }
        data  = await fetch(`https://api.zahwazein.xyz/searching/ytsearch?query=${encodeURIComponent(links)}%20xl&apikey=zenzkey_d4d353be64`)
    }
    else if(isLink) {
        if(!links) return {
            text: `sertakan keterangan untuk mengirim file dalam bentuk apa
            
Keterangan: 
v: untuk Video
a: untuk audio
vd: untuk video yang dikirim melalui document
ad: untuk audio yang dikirim melalui document

*CONTOH*: !ytdl a link`, error: true}

        let typeContent
        if(type.slice(0,1) == 'v')typeContent = 'mp4'
        else if(type.slice(0,1) == 'a')typeContent = 'mp3'
        else{return}

        const ytIdRegex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:shorts\/)|(?:watch\?.*(?:|\&)v=|embed\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/
        if(!ytIdRegex.test(links))return {text: 'url tidak valid', error: true}
        const ytId = ytIdRegex.exec(links)
        const url = 'https://youtu.be/' + ytId[1]
        data = await POST(`https://www.y2mate.com/mates/en60/analyze/ajax`, {
            url,
            q_auto: 0,
            ajax: 1
        })

        const {result} = await data.json()
        const {document} = (new JSDOM(result)).window
        const tables = document.querySelectorAll('table')
        const table = tables[{mp4: 0, mp3: 1}[typeContent]  || 0]
        
        const fileContent = []
        if(typeContent == 'mp4') {
            const list = [...table.querySelectorAll('td')].filter(v => !/\.3gp/.test(v.innerHTML)).flatMap(v => {
                    if(v.innerHTML.match(/.*?(?=\()/) !== null){
                        const content = v.textContent
                        if(!content.includes('Download')){
                            fileContent.push({bitrate: content})
                        }
                    }
                    else {
                        for(const [i, content] of fileContent.entries()) {
                            if(!content.size) {
                                fileContent.push({bitrate: content.bitrate, size: v.textContent})
                                fileContent.splice(i, 1)
                            }
                        }
                    }
                })
            }
        else if(typeContent == 'mp3') {
            fileContent.push({bitrate: '128kbps', size : table.querySelector('td').nextSibling.nextSibling.textContent})
        }

        const title = document.querySelector('b').innerHTML
        const thumbnail = document.querySelector('img').src
        const id = /var k__id = "(.*?)"/.exec(document.body.innerHTML) || ['', '']

        const idContent = {
          id: id[1],
          ytId: ytId[1],
          ftype: typeContent
        }

        let dataContent = 'Reply pesan ini dan pilih angka yang sesuai untuk memilih kualitas video\n\n' +'title: '+ title + '\n'
        for(const [i, content] of fileContent.entries()) {
            dataContent += `${i + 1}. ${content.bitrate} : ${content.size}\n`
        }
        
        const getThumb = await msg.urlDownload(thumbnail)
        const thumb = await msg.resize(getThumb)
        const caption = `${dataContent}`
        
        const infoContent = await msg.reply(msg.mentions, {
            image: getThumb,
            caption,
            mimetype: 'image/jpeg',
            jpegThumbnail: thumb
        }, {quoted: msg.quotedID})

        const {tempStore} = await import('../../bot.js')

        tempStore({message: infoContent, downloaded: fileContent, id: idContent, thumbnail: thumb})
        return msg.reaction('')
      
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
        const checkTime = media?.time?.includes('years')

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

async function POST(url, formData) {
    return fetch(url, {
        method: 'POST',
        headers: {
            accept: "*/*",
            'accept-language': "en-US,en;q=0.9",
            'content-type': "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: new URLSearchParams(Object.entries(formData))
    })
}