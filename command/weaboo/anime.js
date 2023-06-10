import fetch from "node-fetch"

export default async function (msg) {
const body = msg.body.slice(7)

//const data = await fetch(`https://api.zahwazein.xyz/${body}/waifu?apikey=zenzkey_d4d353be64`)
 
//  const buffer = await data.buffer();
//const thumb = await msg.resize(buffer)
console.log (body)
msg.reply(msg.mentions, {
image : {url: `https://api.zahwazein.xyz/randomanime/${body}?apikey=zenzkey_d4d353be64`}
})
}