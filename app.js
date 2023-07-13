import * as express from 'express'
import fetch from 'node-fetch'
import connecting from './bot.js'

export const app = express.default()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('<p>Bot Online...</p>')
})

app.listen(port, async () => {
    await connecting()
    console.log('ACTIVATING BOT...')
  //getServer()
})

// function getServer() {
//   setInterval(() => { 
//     fetch('https://kenzbot.kenzart05.repl.co', {method: "HEAD"})
//       .then(server => server.text())
    
//   },60000)
// }