export default async function(msg, {filter}) {
<<<<<<< HEAD
=======
    await msg.reaction('process')
    console.log(filter)
>>>>>>> a7c8adf9bed3ee1285647dbdd51358758e626639
    const infoAnime = filter[parseInt(msg.body) - 1]
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

    msg.reply(msg.mentions, {
        caption: info,
        image: downloadContent,
        jpegThumbnail: resize,
        mimetype: 'image/jpeg'
    })
<<<<<<< HEAD
=======
    await msg.reaction('')
>>>>>>> a7c8adf9bed3ee1285647dbdd51358758e626639
}