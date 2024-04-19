import connecting, { event } from './bot.js';
import express from 'express';
import qrcode from 'qrcode';

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

event.on('qrcode', qr => {
    app.get('/qrcode', (_, res) => {
        qrcode.toDataURL(qr, (e, code) => {
            if(e)rej(e)
            res.send(`<img src="${code}">`)
        })
        // event.on('authenticated', () => res.redirect('/'))
    })
})

app.use('/', (req, res, next) => {
    if(req.path == '/qrcode') return next()
    res.redirect('/')
})