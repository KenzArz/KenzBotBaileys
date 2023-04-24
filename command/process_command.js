import { readdirSync, readFileSync} from 'fs'

let mainDir = './command'

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
        const id = temp.find(({message}) => message.key.id == quoted.stanza)

        const {content, media} = await type(id, msg.body)
        try {
            await quoted.imgUrl(media, './infoMedia.jpeg')    
        } catch (error) {
            throw error + '\n\nurl tidak valid'
        }
        
        const thumb = await quoted.resize('./infoMedia.jpeg')
        msg.reply(msg.mentions, {
            image: readFileSync('./infoMedia.jpeg'),
            caption: content,
            mimetype: 'image/jpeg',
            jpegThumbnail: thumb
        })
    

        return
    }
    
    const checkFitur =  filePath(msg.body)
    if(checkFitur.text) return checkFitur

    const {default: Run} = await import(checkFitur.path)
    await Run(msg)
}

async function type(content, body) {
    const ctx = content.message.message.ephemeralMessage.message.imageMessage.contextInfo.quotedMessage
    const bodyMesage = ctx.imageMessage.caption.slice(1) || ctx.extendedTextMessage.text.slice(1)
    
    switch (bodyMesage) {
        case 'sauce':
            const {filter} = content
            const infoAnime = filter[parseInt(body) - 1]
            
            const [_, getPresentase] = infoAnime.similarity.toString().split('.')
            const similarity = `${getPresentase.slice(0,2)}.${getPresentase.slice(2,4)}%`
            
            const info = `  ╾─͙─͙─͙Info Anime─͙─͙─͙╼\n`+
            `Title: ${infoAnime.native}\n`+
            `Romaji: ${infoAnime.romaji || '-'}\n`+
            `English: ${infoAnime.english || '-'}\n`+
            `Episode: ${infoAnime.episode || '-'}\n`+
            `Similarity: ${similarity}`

            return {content: info, media: infoAnime.image}
        default:
            return;
    }
}
