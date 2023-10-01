import fetch from 'node-fetch'
import Replicate from "replicate";

export default async function(msg) {

  
  await msg.reaction({loading: true})
  const replicate = new Replicate({
    auth: process.env.REPLICATE_KEY,
    fetch
  });

  const errorMessage = 'tidak ada image untuk diupscale...'
  let bufferImage;

  const isQuoted = await msg.quotedMessage()
  if(!isQuoted || msg.isMedia){
      if(!msg.isMedia) return errorMessage
      bufferImage = await msg.media()
  }
  else {
      if(!isQuoted.isMedia) return errorMessage
      bufferImage = await isQuoted.media()
  }
  
  const output = await replicate.run(
    "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
    {
      input: {
        image: `data: image/png;base64,${bufferImage.toString('base64')}`
      }
    }
  );
  await msg.reply(msg.mentions, {
    image: {url: output}
  }, {counter: true})
  await msg.reaction({stop: true})
  await msg.reaction('succes')
}