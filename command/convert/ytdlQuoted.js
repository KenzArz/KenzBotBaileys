
import { POST } from "../../system/scraper/y2mate.js"
export default async function (msg, {downloaded, ID, type, thumbnail}) {

    await msg.reaction({loading: true})
    const content = downloaded[parseInt(msg.body) - 1]
    if(!content) return {
      text: 'angka yang anda masukan tidak sesuai',
      error: true
    }
    const bitrate = content.bitrate
    const quality = /1080|720|480|360|240|144|128/.exec(bitrate)[0]
    ID.fquality = quality

    const convert = await POST({url: `https://www.y2mate.com/mates/en60/convert`, formData: ID, isConvert: true})
  if(convert?.failed) return {text: convert.failed, error: true}
  
  if(type == "v"){
    await msg.reply(msg.mentions, {
        video: {url: convert},
        jpegThumbnail: thumbnail,
        mimetype: 'video/mp4'
    }, {counter: true})
    await msg.reaction({stop: true})
    await msg.reaction('succes')
    return
  }
  else if(type == "vd")
  {
    await msg.reply(msg.mentions, {
        document: {url: convert},
        mimetype: 'video/mp4'
    }, {counter: true})
    await msg.reaction({stop: true})
    await msg.reaction('succes')
    return
  }
    
}