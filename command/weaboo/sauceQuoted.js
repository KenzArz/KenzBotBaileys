export default async function(msg, {filter}) {

    await msg.reaction('process')
    const infoAnime = filter[parseInt(msg.body) - 1]
    if(!infoAnime) return {
      text: 'angka yang anda masukan tidak sesuai',
      error: true
    }
    const [perfect, persentase] = infoAnime.similarity.toString().split('.')

    const realNumber = persentase?.slice(0, 2) || perfect + '00'
    const desimal = persentase?.slice(2, 4) || undefined

    const similarity = `${realNumber}${desimal ? `.${desimal}` : ''}%`
    
    const info = `      ╾─͙─͙─͙Info Anime─͙─͙─͙╼\n`+
    `Title: ${infoAnime.native}\n`+
    `Romaji: ${infoAnime.romaji || '-'}\n`+
    `English: ${infoAnime.english || '-'}\n`+
    `Episode: ${infoAnime.episode || '-'}\n`+
    `Similarity: ${similarity}`

    const downloadContent = await msg.urlDownload(infoAnime.image)
    const resize = await msg.resize(downloadContent)

    await msg.reply(msg.room_chat, {
        caption: info,
        image: downloadContent,
        jpegThumbnail: resize,
        mimetype: 'image/jpeg'
    })
    await msg.reaction('')
}