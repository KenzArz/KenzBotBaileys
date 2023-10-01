export default async function(msg) {
  const body = msg.body.split(" ")
  const url = body[1]

  const buffer = await msg.urlDownload(url)
  console.log(buffer)
  await msg.reply(msg.mentions, {
    image: buffer
  })
}