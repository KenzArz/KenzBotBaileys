import { readdirSync, readFileSync} from 'fs'

let mainDir = './command'
export const cache = []
export const clearCache = (message) => {
    cache.push(message)
    const index = cache.length - 1
    new Promise((res, rej) => {
      setTimeout(() => {
        cache.splice(index, 1)
        res('ok')
        rej('error')
      }, 180000)
    })
  }

function dirPath() {
    const checkDir = readdirSync(mainDir, {withFileTypes: true}).map(item => {
        if(!item.isDirectory()) return
        return {
            item: item.name,
            subItem: readdirSync(`${mainDir}/${item.name}`, {withFileTypes: true}).map(subItem => {
                return subItem.name.split('.js')[0]
            }),
            owner: item.name == 'owner' ? true : false
        }
    })
    return checkDir.filter(m => m !== undefined)
    
}

function filePath(body) {
    const checkDir = dirPath()
    const delPrefix = body.slice(1)
    
    const getItem = checkDir.find(m => m.subItem.find(k => k == delPrefix))
    if(!getItem) return {text: `fitur ${body} tidak ada, silahkan ketik !menu untuk melihat fitur yang ada`}
    const setPath = {
        item: getItem.item,
        subItem: getItem.subItem.find(subItem => subItem === delPrefix.toLowerCase())
    }
    return {path: `./${setPath.item}/${setPath.subItem}.js`}
    
}

export async function processCommand(msg, option = {}) {

    if(option.quoted) {
        const quoted = msg.quotedMessage()
        const {temp} = await import('../bot.js')
        const id = temp.find(MID => MID.key.id == quoted.stanza)
        if(id) {
            let media;
            for(const mediaInfo of cache) {
                media = mediaInfo.filter.find((infoDetail, index) => index == (parseInt(msg.body) -1 ) ? infoDetail : null)
            }

            const checkType = await type(id, media)
            try {
                await quoted.imgUrl(media.image, './infoMedia.jpeg')    
            } catch (error) {
                throw error + '\n\nurl tidak valid'
            }
            
            const thumb = await quoted.resize('./infoMedia.jpeg')
            msg.reply(msg.mentions, {
                image: readFileSync('./infoMedia.jpeg'),
                caption: checkType,
                mimetype: 'image/jpeg',
                jpegThumbnail: thumb
            })
        
        }
        return
    }
    
    const checkFitur =  filePath(msg.body)
    if(checkFitur.text) return checkFitur

    const {default: Run} = await import(checkFitur.path)
    await Run(msg)
}

async function type(bodyQuoted, detailInfo) {
    const ctx = bodyQuoted.message.ephemeralMessage.message.imageMessage.contextInfo.quotedMessage
    const body = ctx.imageMessage.caption.slice(1) || ctx.extendedTextMessage.text.slice(1)
    
    switch (body) {
        case 'sticker':

            const [_, getPresentase] = detailInfo.similarity.toString().split('.')
            const similarity = `${getPresentase.slice(0,2)}.${getPresentase.slice(2,4)}%`
            
            const info = `╾─͙─͙─͙Info Anime─͙─͙─͙╼\n`+
            `Title: ${detailInfo.native}\n`+
            `Romaji: ${detailInfo.romaji || '-'}\n`+
            `English: ${detailInfo.english || '-'}\n`+
            `Episode: ${detailInfo.episode || '-'}\n`+
            `Similarity: ${similarity}`

            return info
        default:
            return;
    }
}
