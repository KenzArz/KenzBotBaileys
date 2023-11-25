// import fetch from 'node-fetch'
import express from 'express'
import connecting from './bot.js'

export const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('<p>Bot Online...</p>')
})
app.get('/api', (req, res) => {
    res.send('<p> API NOT FOUND')
})

app.listen(port, async (a) => {
    await connecting()
    console.log(port)
    console.log('ACTIVATING BOT...')
})

// function getServer() {
//   setInterval(() => { 
//     fetch('https://kenzbot.kenzart05.repl.co', {method: "HEAD"})
//       .then(server => server.text())
    
//   },60000)
// }
