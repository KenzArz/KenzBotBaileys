export default async function (msg) {

    await msg.reaction('process')
    const quoted = await msg.quotedMessage()
  console.log(quoted)
    if(!quoted) return {text: 'tidak ada gambar yang dijadikan thumbnail', error: true}

  console.log(quoted.quotedID.message)
    const downloadMedia = await msg.media()
    const downloadThumb = await quoted.media()

    let {height, width} = quoted.quotedID.message.imageMessage
  console.log(height, width)
    if(height > width) {
      height = 256
      width = 144
    }
  else if(width > height) {
    width = 256
    height = 144
  }
  else if( height == width) {
    height = 300
    width = 300
  }
    

    const thumbSize = await quoted.resize(downloadThumb, {height, width})
    
    msg.reply(msg.mentions, {
        image: downloadMedia,
        mimetype: 'image/jpeg',
        jpegThumbnail: thumbSize
    })
}