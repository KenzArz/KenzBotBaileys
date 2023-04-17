import { createWriteStream, readFileSync } from 'fs'
import fetch from 'node-fetch'

export default async function (msg) {
    
    const isQuoted = msg.quotedMessage()
    const errorMessage = 'tidak ada image untuk dicari'
    let bufferImage;


    if(!isQuoted || msg.isMedia) {
        if(!msg.isMedia) return errorMessage
        bufferImage = await msg.media()
    }
    else {
        if(!isQuoted.isMedia) return errorMessage
        bufferImage = await isQuoted.media()
    }


    const getData = await fetch("https://api.trace.moe/search?anilistInfo", {
        method: "POST",
        body: bufferImage,
        headers: {"content-Type": "image/jpeg"}
    })
    
    const data = await getData.json()
    const result = data.result

    const anime = []
    for(const response of result) {
        const {native, romaji, english} = response.anilist.title
        const isAdult = response.anilist.isAdult
        const similarity = response.similarity
        const episode = response.episode
        const image = response.image
        const video = response.video

        anime.push({
            native,
            romaji,
            english,
            isAdult,
            similarity,
            episode,
            image,
            video
        })
    }
    
    const filter = []
    for(const similar of anime) {
        const isDuplicate = filter.find(duplicate => duplicate.native == similar.native)
        if(!isDuplicate){
            filter.push(similar)
        }
    }
    const isAdult = filter.filter(adultContent => adultContent.isAdult)
    filter.forEach((adultContent, index) => adultContent.isAdult ? filter.splice(index, 1) : '')

    let listAnime =  `╾─͙─͙─͙Info Anime─͙─͙─͙╼\n`

    for(const [index, content] of filter.entries()) {
        const getPresentase = content.similarity.toString()
        const [_, persentase] = getPresentase.split('.')

        const realNumber = persentase.slice(0, 2)
        const desimal = persentase.slice(2, 4)

        const similarity = `${realNumber}.${desimal}%`

        
        listAnime += `${index + 1}. Title: ${content.native}
Romaji: ${content.romaji || '-'}
English: ${content.english || '-'}
Episode: ${content.episode || '-'}
Kemiripan: ${similarity}\n\n`
    }

    listAnime += `╾─͙─͙─͙Info Hanime─͙─͙─͙╼\n`
    for(const [index, adultContent] of isAdult.entries()) {
        const getPresentase = content.similarity.toString()
        const [_, persentase] = getPresentase.split('.')

        const realNumber = persentase.slice(0, 2)
        const desimal = persentase.slice(2, 4)

        const similarity = `${realNumber}.${desimal}%`
        

        listAnime += `${index + 1}. Title: ${adultContent.native}
Romaji: ${adultContent.romaji || '-'}
English: ${adultContent.english || '-'}
Episode: ${adultContent.episode || '-'}
Kemiripan: ${similarity}\n\n`


    }

    const indexAnime = listAnime.indexOf(`╾─͙─͙─͙Info Hanime─͙─͙─͙╼`)
    const filterAnime = listAnime.slice(0, indexAnime)

    const indexHanime = listAnime.indexOf(`╾─͙─͙─͙Info Hanime─͙─͙─͙╼`)
    const filterHanime = listAnime.slice(indexHanime)

    const imageAnime = filter[0].image
    const video = filter[0].video

    const downloadImage = await fetch(imageAnime)
    downloadImage.body.pipe(createWriteStream('./anime.jpg'))

    const downloadVideo = await fetch(video)
    downloadVideo.body.pipe(createWriteStream('./anime.mp4'))

    if(isAdult[0].isAdult) {
        const warning = await fetch(isAdult[0].video)
        warning.body.pipe(createWriteStream('./warning.mp4'))
    }

    msg.reply(msg.mentions, {
        video: readFileSync('./anime.mp4'),
        caption: filterAnime,
        giftPlayback: true
    })

    isAdult[0].isAdult ? msg.reply(msg.ownerNumber, {
        video: readFileSync('./anime.mp4'),
        caption: filterHanime,
        giftPlayback: true
    }) : null
}