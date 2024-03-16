import connecting from './bot.js';
import express from 'express';
import qrcode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

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


export async function generateQR(qr) {
    try {
        await new Promise((resp, rej) => {
            const id = uuidv4()
            console.log('scan your QR code here\n')
            app.get('/qrcode', (req, res) => {
                qrcode.toDataURL(qr, (e, code) => {
                    if(e)rej(e)
                    res.send(`<img src="${code}">`)
                })
            })
        })
    } catch (error) {
        console.log(error)
    }
}