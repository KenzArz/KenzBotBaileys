import * as express from 'express'
import connecting from './bot.js'

const app = express.default()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('<p>Bot Online...</p>')
})

app.listen(port, async () => {
    await connecting.default()
    console.log('ACTIVATING BOT...')
})