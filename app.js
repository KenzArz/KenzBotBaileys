import * as express from 'express'

const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('<p>Bot Online...</p>')
})

app.listen(port, () => {
    console.log('ACTIVATING BOT...')
})