import fetch from 'node-fetch'
export default async function (msg) {
  await msg.reaction({loading: true})
  const quotedMessage = await msg.quotedMessage()
  const link = quotedMessage?.body|| msg.body.slice(10)
  if(!link.includes('roboguru'))return {text: 'pastikan link benar, dan link harus dari roboguru', error: true}
  const response = await fetch('https://web-scrap.kenzart05.repl.co/api/roboguru', {
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    body: `url=${link}`
  })
  const arrayBuffer = await response.arrayBuffer()
  await msg.reply(msg.mentions, {
    image: Buffer.from(arrayBuffer)
  })
  await msg.reaction({stop: true})
  await msg.reaction('succes')
}