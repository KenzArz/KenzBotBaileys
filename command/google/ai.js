import got from 'got'
import { Create_message } from '../../system/message.js'
const map = new Map()

/**@param {Create_message} msg */
export default async function(msg) {
    const quoted = msg.quotedMessage()
    const body = msg.body.slice(4) || quoted.body

    let user = map.get(msg.room_chat)
    if(!user) user = await guest()
    const {sessionId, cuid, presetId} = user
    
    const qai = got.post('https://www.questionai.com/questionai/webchat/ask', {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            origin: 'https://www.questionai.com',
            referer: 'https://www.questionai.com/'
        },
        form: {
            appId:'aihomework',
            clientType:'1',
            sessionId,
            presetId,
            msgCategory:'200',
            content: body,
            vc:100,
            cuid,
            vcname:'1.0.0',
            lang:'en',
            t:Date.now()
        },
        isStream: true
    })
    let answer = ''
    for await(const chunk of qai) {
        const raw = chunk.toString()
        const [eventNames, content] = raw.split('\n')
        const data = JSON.parse(content.slice(5))
        if(!data.text)continue
        answer += data.text
    }
    await msg.reply(msg.room_chat, {text: answer})
    return map.set(msg.room_chat, user)
}

async function guest() {
    const {headers} = await got('https://www.questionai.com/')
    const [cuid] = headers['set-cookie'].map(r => r.match(/=([^;]+)/)[1])

    const cfg = await got.post('https://www.questionai.com/questionai/webchat/cfg', {
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            origin: 'https://www.questionai.com',
            referer: 'https://www.questionai.com/'
        },
        form: {
            appId:'aihomework',
            clientType:1,
            cuid,
            vc:'100',
            vcname:'1.0.0',
            lang:'en',
            reqFrom: 'browser',
            release: '2024.309.191758',
            t:Date.now()
        }
    }).json()
    const {data: {presetId, sessionId}} = cfg
    return { cuid, presetId, sessionId }
}