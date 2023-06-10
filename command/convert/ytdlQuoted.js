import fetch from 'node-fetch'

export default async function (msg, {downloaded, id: {id, ytId, ftype}, thumbnail}) {

    await msg.reaction({loading: true})
    const content = downloaded[parseInt(msg.body) - 1]
    const bitrate = content.bitrate
    const quality = /1080|720|480|360|240|144|128/
    const convert = await POST(`https://www.y2mate.com/mates/en60/convert`, {
        type: 'youtube',
        _id: id,
        v_id: ytId,
        ajax: '1',
        token: '',
        ftype,
        fquality: quality.exec(bitrate)[0]
    })
    const result = await convert.json()
    const link = /<a.+?href="(.+?)"/.exec(result.result)[1]

    if(ftype == 'mp4') {
        await msg.reply(msg.mentions, {
        video: {url: link},
        jpegThumbnail: thumbnail,
        mimetype: 'video/mp4'
    })
    }
    else if(ftype == 'mp3') {
        console.log(link)
        await msg.reply(msg.mentions, {
        audio: {url: link},
        mimetype: "audio/mp4"
        })
    }
    await msg.reaction({stop: true})
    await msg.reaction('succes')
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