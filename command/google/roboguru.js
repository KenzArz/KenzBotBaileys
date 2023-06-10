import axios from 'axios'
import cheerio from 'cheerio'

export default async function (msg) {

    await msg.reaction('process')
    const quotedMessage = await msg.quotedMessage()
    const link = quotedMessage?.body|| msg.body.slice(10)

    if(!link.includes('roboguru'))return {text: 'pastikan link benar, dan link harus dari roboguru', error: true}

    const {data} = await axios(link)
    const $ = cheerio.load(data)

    let text, img = []
    if(link.includes('question')) {

        $('.qns_explanation_answer').each( (i, el) => {

            const html = $(el)
            text = html.find('p').text()

            const imgData = html.find('img').attr()
            if(imgData.src) {
                if(imgData.src.includes('https')) img.push(imgData.src)
            }
            html.find('li').each((i, el) => {
                text += `\n${i + 1}. ${$(el).text()}`
            })

        })
    }

    else if(link.includes('forum')) {

        $('.lock-discussions').each(async(i, el) => {

            const html = $(el)
            text = html.find('h2').text()

            const imgData = html.find('.chakra-image').each((i, el) => {
            const content = $(el).attr()
            if(!content.loading) img.push(content.src)
            })
            
        })
    }

    if(img.length > 0) {

        img.forEach(async image => {
        const downloadContent = await axios.get(image, {responseType: 'arraybuffer'})
        const thumb = await msg.resize(downloadContent.data)
        await msg.reply(msg.mentions, {
            caption: text || 'hasil yang ditemukan',
            image: {url: image},
            jpegThumbnail: thumb
        })
      })
    }
    else {
      await msg.reply(msg.mentions, {
          text: text
      })
    }
    await msg.reaction('') 
}
