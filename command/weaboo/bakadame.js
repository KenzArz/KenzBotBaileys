import fetch from 'node-fetch'
import cheerio from 'cheerio'

export default async function (msg) {

  await msg.reaction('process')
  const quotedMessage = await msg.quotedMessage()
  const anime = quotedMessage?.body|| msg.body.slice(10)

  const regex = /https:\/\/bakadame.com\/(.+?)\//
  if(regex.test(anime)) {

    const {image, caption, contents} = await mainPage(anime)
    
    const pict = await msg.urlDownload(image)
    const jpegThumbnail = await msg.resize(pict)
    await msg.reply(msg.room_chat, {
      image: {url: image},
      jpegThumbnail,
      mimetype: 'image/jpeg',
      caption
    })

    const text = await shortLink(contents)
    if(text.split('LIMIT').length > 1) {
      for(const tautan of text.split('LIMIT')) {
        await msg.reply(msg.room_chat, {text: tautan})
      }
      return
    }
    await msg.reply(msg.room_chat, {text})
    
    return
  }
  
  const fetching = await fetch('https://bakadame.com/?s='+ encodeURIComponent(anime))
  console.log(fetching)
  const html = await fetching.text()
  const $ = cheerio.load(html)

  const contents = []
  $('.td_module_16').each((i, el) => {
    const title = $(el).find('h3').text()
    if(title.match(/Daftar (\w+) 0-Z/) !== null)return
    const url = $(el).find('a').attr('href')
    contents.push({title, url})
  })

  const noResult = $('.no-results').text()
  if(noResult.length > 1) return msg.reply(msg.room_chat, {text: '*' + noResult + '*\n\n404 *NOT FOUND*'})
  let text = `${anime.toUpperCase()} - HASIL PENCARIAN\n`
  for(const [i, content] of contents.entries()) {
    text += `\n${i +1}. ${content.title}\n`
  }

  const komik = await msg.reply(msg.room_chat, {text}, {quoted: msg.quotedID})
  
  const {tempStore} = await import('../../bot.js')
  tempStore({message: komik, komikInfo: contents})
  return msg.reaction('')
}


export async function mainPage(page) {
  const fetching = await fetch(page)
    const html = await fetching.text()
    const $ = cheerio.load(html)
    
    const title = '*'+ $('.td-post-title').find('h1').text()+ '*'
    const image = $('figure').find('img').attr('data-lazy-src')

    let komikInfo = $('.dlmn-wrap').find('p').html()
    komikInfo = komikInfo.replaceAll('<br>', '\n')
    komikInfo = `*INFORMASI*: \n\n${$(komikInfo).text()}`

    let sinopsis = '*SINOPSIS*'
    $('.dlmn321 .dlmn-wrap').find('.dlmn321 .dlmn-wrap').find('p').each((i, el) => {
        if($(el).css()['text-align']?.includes('left')) {
            const data = $(el).text()
            sinopsis += `\n${data}\n`
        }
    })
    const regex = sinopsis.slice(11).length
    if(!regex || regex === 0) {
      $('.dlmn321 .dlmn-wrap').find('p').each((i, el) => {
          if($(el).attr('dir')) {
              sinopsis += '\n' + $(el).text() + '\n'
          }
          return
        })
      $('.dlmn321 .dlmn-wrap').find('p').each((i, el) => {
          const data = $(el).text()
          if($(el).css()['text-align']?.includes('left') && !data.includes('Judul Jepang') && !data.includes('link error')) {
            sinopsis += `\n${data}\n`
        }
          return
        })
      }

    const contents = []
    const anti = ['Bantu web ini terus bernafas', 'Perlu bantuan?']
    $('.dlmn-head').find('strong').each((i, el) => {
      const volume = $(el).text()
      const remove = anti.find(m => m == volume)
      if(remove)return
      else if(volume.trim() == '(Lanjutan anime)' || volume.trim() == 'END') {
        const index = contents.length - 1
        const sequel = contents[index].volume
        contents.splice(index, 1)
        return contents.push({volume: sequel + volume})
      }
      contents.push({volume})
    })

    let isBatch;
   $('ul').each((ind, el) => {
        const link = [], batch = []
        $(el).find('li').find('strong').each((i, el) => {
          const text = $(el).text()
          const fBitrate = /.?(1080P|720P|480P|360P|144P).?/
          const fSize = /.?((.+?)GB|(.+?)MB).?/
          if(fBitrate.test(text)) {
            batch.push({bitrate: fBitrate.exec(text)[0]})
          }
          else if(fSize.test(text)) {
            const index = batch.length - 1
            const {bitrate} = batch[index]
            batch.splice(index, 1)
            batch.push({bitrate, size: fSize.exec(text)[0]})
            isBatch = 0
          }
        })
     
        $(el).find('li').each((i, el) => {
          $(el).find('a').each((i, el) => {
            const source = $(el).text()
            const url = $(el).attr('href')
          
            const regex = /https:\/\/bakadame.com.?6b2053bcf2=(.+?)/
            if(regex.test(url) && typeof isBatch !== 'number') {
                link.push({source, url})
            }
            else if(regex.test(url) && typeof isBatch == 'number') {
              const { bitrate, size } = batch[isBatch]
              link.push({bitrate, size, source, url})
            }
            
         });
            
          (typeof isBatch == 'number') ? isBatch++ : ''
        })
        const del = $(el).find('li del').text()
        if(del.length !== 0) {
          const contentRmv = link.find((m, i) => !m.link ? i : '')
          contents.splice(contentRmv, 1)
        }
        for(const [i, content] of contents.entries()) {
            if(!content.link && link.length !== 0) {
                contents.push({volume: content.volume,link})
                return contents.splice(i, 1)
            }
        }
    })

  return {
    caption: title + '\n\n' + komikInfo + '\n\n' + sinopsis,
    image,
    contents
  }
}

export async function shortLink(contents) {

  let Download = '*LINK DOWNLOAD*'
  for(const [i, data] of contents.entries()) {
    Download += `\n${data.volume}\n`
    let index = 0
    let bitrate = data.link[index]?.bitrate;
    (bitrate) ? Download += `\n          *${bitrate}  ${data.link[index]?.size}*\n` : ''
    // console.log(data.size)
    for(const url of data.link) {

      if(url.bitrate !== bitrate) {
        bitrate = url.bitrate
        Download += `\n          *${bitrate}  ${url.size}*\n`
      }
      let shortLink = '/' + url.source
      const seed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
      for(let k = 0; k < 5; k++) {
        const randomSeed = Math.floor(Math.random() * seed.length)
        shortLink += seed.charAt(randomSeed)
      }

      app.get( shortLink, (req,res) => {
        res.redirect(url.url)
      })
      Download += `${url.source}: ${process.env.URL + shortLink}\n\n`;
      (url.bitrate) ? index++ : ''
    }
    if(i % 14 == 0 && i !== 0)Download += 'LIMIT'
  }
  return Download
}