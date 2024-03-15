import connecting from './bot.js'
import express from 'express'

export const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('<p>Bot Online...</p>')
})
app.get('/api', (req, res) => {
    res.send('<p>API NOT FOUND<p>')
})

app.listen(port, async (a) => {
    console.log('ACTIVATING BOT...')
    await connecting()
})