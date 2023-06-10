import axios from 'axios'
import cheerio from 'cheerio'

export default async function tes(link) {

    // const quotedMessage = await msg.quotedMessage()
    // const link = quotedMessage.body|| msg.body.slice(9)

    // if(!link.includes('roboguru'))return {text: 'pastikan link benar, dan link harus dari roboguru', error: true}

    const {data} = await axios.get(link)

    const $ = cheerio.load(data)

    let text, img = []
    img.forEach
    if(link.includes('question')) {

        $('.qns_explanation_answer').each( (i, el) => {

            const html = $(el)
            text = html.find('p').text()
            // console.log(text)

            const imgData = html.find('img').attr()
            if(imgData.src) {
                if(imgData.src.includes('https')) img.push(imgData)
            }
            html.find('li').each((i, el) => {
                console.log('tes')
                text += `\n${i + 1}. ${$(el).text()}`
            })
        })
    }

    else if(link.includes('forum')) {

        $('.lock-discussions').map(async(i, el) => {

            const html = $(el)
            text = html.find('h2').text()
            console.log(text)

            html.find('.chakra-image').each((i, el) => {
                const imageContent = $(el).attr()
              if(!imageContent.loading) img.push(imageContent.src)
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
          return
      }

    msg.reply(msg.mentions, {
        text: text
    })
    
}


tes('https://roboguru.ruangguru.com/forum/jelaskan-perbedaan-antara-larutan-sejati-sistem-koloid-dan-suspensi-kasar-_FRM-9MT60NNC#:~:text=Larutan%20sejati%20adalah%20campuran%20homogen,zat%20terdispersi%20dan%20medium%20pendispersi')