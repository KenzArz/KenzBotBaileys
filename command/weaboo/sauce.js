import { createWriteStream, readFileSync } from 'fs'
import fetch from 'node-fetch'

export default async function (msg) {
    
    const isQuoted = await msg.quotedMessage()
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

    let listAnime =  `  ╾─͙─͙─͙Info Anime─͙─͙─͙╼\n`

    for(const [index, content] of filter.entries()) {
        const getPresentase = content.similarity.toString()
        const [perfect, persentase] = getPresentase.split('.')

        const realNumber = persentase?.slice(0, 2) || perfect + '00'
        const desimal = persentase?.slice(2, 4) || undefined

        const similarity = `${realNumber}${desimal ? `.${desimal}` : ''}%`

        
        listAnime += `${index + 1}. Title: ${content.native}
Romaji: ${content.romaji || '-'}
English: ${content.english || '-'}
Episode: ${content.episode || '-'}
Similarity: ${similarity}\n\n`
    } 

    listAnime += `  ╾─͙─͙─͙Info Hanime─͙─͙─͙╼\n`
    for(const [index, adultContent] of isAdult.entries()) {
        const getPresentase = adultContent.similarity.toString()
        const [perfect, persentase] = getPresentase.split('.')

        const realNumber = persentase.slice(0, 2) || perfect + '00'
        const desimal = persentase.slice(2, 4) || undefined

        const similarity = `${realNumber}${desimal ? `.${desimal}` : ''}%`
        

        listAnime += `${index + 1}. Title: ${adultContent.native}
Romaji: ${adultContent.romaji || '-'}
English: ${adultContent.english || '-'}
Episode: ${adultContent.episode || '-'}
Similarity: ${similarity}\n\n`
    }

    const indexAnime = listAnime.indexOf(`╾─͙─͙─͙Info Hanime─͙─͙─͙╼`)
    const filterAnime = listAnime.slice(0, indexAnime)

    const indexHanime = listAnime.indexOf(`╾─͙─͙─͙Info Hanime─͙─͙─͙╼`)
    const filterHanime = listAnime.slice(indexHanime)

    const imageAnime = filter[0].image
    let downloadImagePath = './anime.jpeg';
    try {
        if(isQuoted?.urlDownload !== null && isQuoted) {
            await isQuoted.urlDownload(imageAnime, downloadImagePath)
        }
        if(msg.urlDownload !== null) {
            await msg.urlDownload(imageAnime, downloadImagePath)
        }
    } catch (error) {
        throw error + '\n\nurl tidak valid'
    }

    let HPath = './warning.jpeg'
    if(isAdult[0]?.isAdult) {
        try {
            if(isQuoted?.urlDownload !== null && isQuoted) {
                await isQuoted.urlDownload(isAdult[0]?.image, HPath)
            }
            if(msg.urlDownload !== null) {
                await msg.urlDownload(isAdult[0]?.image, HPath)
            }
        } catch (error) {
            throw error + '\n\nurl tidak valid'
        }
    }
    let thumb;
    let HThumb;
    if(!isQuoted || msg.isMedia) {
        if(!msg.isMedia) return errorMessage
        thumb =  await msg.resize(downloadImagePath)

        if(isAdult[0]?.isAdult) {
            HThumb = msg.resize(HPath)
        }
    }
    else {
        if(!isQuoted?.isMedia) return errorMessage
        thumb = await isQuoted.resize(downloadImagePath)

        if(isAdult[0]?.isAdult) {
            HThumb = await isQuoted.resize(HPath)
        }
    }
    
    const {tempStore} = await import('../../bot.js')
    if(msg.isOwner){
        const allNime = await msg.reply(msg.ownerNumber, {
            image: readFileSync(downloadImagePath),
            caption: listAnime,
            mimetype: 'image/jpeg',
            jpegThumbnail: thumb
        }, {quoted: msg.quotedID})
        tempStore({message: allNime, filter})
        return
    }

    const animeContent = await msg.reply(msg.mentions, {
        image: readFileSync(downloadImagePath),
        caption: filterAnime,
        mimetype: 'image/jpeg',
        jpegThumbnail: thumb
    }, {quoted: msg.quotedID})
    tempStore({message: animeContent, filter})


    if(isAdult[0]?.isAdult) {
        await  msg.reply(msg.ownerNumber, {
            image: readFileSync(HPath),
            caption: filterHanime,
            mimetype: 'image/jpeg',
            jpegThumbnail: HThumb
        }, {quote: msg.quotedID})
    }

    
}