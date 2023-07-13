import fetch from 'node-fetch'
import Replicate from "replicate";

export default async function(msg) {
  await msg.reaction({loading: true })
  let [_, size, ...request] = msg.body.split(' ')
  let subject = request.join(' ');
  (size.length > 1) ? subject = size + ' ' + subject : ''
  console.log(subject)
  const {scale, resolution, width, height} = reso(size);
  
  (!subject) ? subject = size : ''

  const req = await fetch('https://web-backend-prod.zmo.ai/api/v1.0/microTask/makeUp/create', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization:  process.env.AUTHORIZATION
    },
    body: JSON.stringify({
      subject, categoryId: "93c338fd527e41c19ce80c7955eff26d", styleCategoryIds:["0a2af253afb04b068ab3a013a383b91a"], scale, resolution, numOfImages:2
    })
  })
  if(req.status !== 200){
    await msg.reaction({stop: true})
    return {text: '*SERVER SEDANG SIBUK!!!*', error: true}}
  const {batchTaskId} = await req.json()

  const { images } = await image(batchTaskId);
  try {
    for(const content of images) {

      const upscale = await esrgan(content.original)
      const image = await msg.urlDownload(content.original)
      const jpegThumbnail = await msg.resize(image, {width, height})
      await msg.reply(msg.mentions, {
        image: {url: upscale},
        mimetype: 'image/jpeg',
        jpegThumbnail
      })
    }
  } catch (error) {
    await msg.reply(msg.mentions, {
      text: '*SERVER SEDANG SIBUK!!!*'
    })
    console.log(error)
    await msg.reaction({stop:true})
    return msg.reaction('failed')
  }
  
  await msg.reaction({stop:true})
  return msg.reaction('succes')
    
}


function reso(scale) {
  switch(scale){
    case 'l':
      return {scale: '4:3', resolution: "704x528", width: 288, height: 162}
    case 'p':
      return {scale: '9:16', resolution: '432x768', width: 162, height: 288}
    default :
      return {scale: '1:1', resolution: '640x640', width: 300, height: 300}
  }
}

async function image(id) {
    const req2 = await fetch('https://web-backend-prod.zmo.ai/api/v1.0/microTask/makeUp/get?batchTaskId='+ id, {
      headers: {
        'content-type': 'application/json',
        authorization:  process.env.AUTHORIZATION
      },
      method: 'GET'
    })
    const json2 = await req2.json()
    if(!json2.images[0].createdAt) {
     return image(id)
    }
  return json2
  }

async function esrgan(url) {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_KEY,
    fetch
  });
  
  const output = await replicate.run(
    "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
    {
      input: {
        image: content.original
      }
    }
  );
  return output
}