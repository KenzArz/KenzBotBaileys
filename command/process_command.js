import { readdirSync, readFileSync} from 'fs'

let mainDir = './command'

function dirPath() {
    const checkDir = readdirSync(mainDir, {withFileTypes: true}).map(item => {
        if(!item.isDirectory()) {
            if(item.name !== 'process_command.js'){
                return {
                    item: item.name.split('.js')[0],
                    owner: false
                }
            }
            return
        }
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
    const delPrefix = body.slice(1).split(' ')[0]
    
    const getItem = checkDir.find(m => m.subItem?.find(k => k == delPrefix)) || checkDir.find(m => m.item == delPrefix)
    if(!getItem) return {text: `fitur ${body} tidak ada, silahkan ketik !menu untuk melihat fitur yang ada`}
    const setPath = {
        item: getItem.item,
        subItem: getItem?.subItem?.find(subItem => subItem === delPrefix.toLowerCase()) || ''
    }
    return {path: `./${setPath.item}${setPath.subItem ? `/${setPath.subItem}` : ''}.js`}
    
}

export async function processCommand(msg, option = {}) {

    if(option.quoted) {
        const quoted = await msg.quotedMessage()
        const {temp} = await import('../bot.js')
        const id = temp.find(({message}) => message.key.id == quoted.stanza)

        const {content, media, type, option = {}} = await selector(id, msg.body)

        let downloadMedia
        let downloadThumb;
        try {
            downloadMedia = await quoted.urlDownload(media.content || media)
            if(media.jpegThumbnail) downloadThumb = await quoted.urlDownload(media.jpegThumbnail)
        } catch (error) {
            throw error + '\n\nurl tidak valid'
        }
        
        const thumb = await quoted.resize(downloadThumb)

        const mimetype = {}
        switch (type) {
            case 'image':
                mimetype.image = downloadMedia
                mimetype.jpegThumbnail = thumb
                mimetype.mimetype = 'image/jpeg'
                break;
            case 'video':
                mimetype.video = downloadMedia
                mimetype.jpegThumbnail = thumb
                mimetype.mimetype = 'video/mp4'
                break
            case 'audio':
                mimetype.audio = downloadMedia
                mimetype.mimetype = 'audio/mp4'
                break
            case 'document':
                mimetype.document = downloadMedia
                break
            default:
                break;
        }
        
        mimetype.caption = content
        
        await msg.reply(msg.mentions, mimetype, option)
    
        return
    }
    
    const checkFitur =  filePath(msg.body)
    if(checkFitur.text) return checkFitur

    const {default: Run} = await import(checkFitur.path)
    await Run(msg)
}

async function selector(content, body) {
    const ctx = content.message.message.ephemeralMessage.message.imageMessage.contextInfo.quotedMessage || content.message.message.ephemeralMessage.message.extendedTextMessage.contextInfo.quotedMessage
    const bodyMesage = ctx.imageMessage?.caption?.slice(1) || ctx.extendedTextMessage?.text?.slice(1)
    
    switch (bodyMesage.split(' ')[0]) {
        case 'sauce':
            const {filter} = content
            const infoAnime = filter[parseInt(body) - 1]
            
            const [perfect, persentase] = infoAnime.similarity.toString().split('.')

            const realNumber = persentase?.slice(0, 2) || perfect + '00'
            const desimal = persentase?.slice(2, 4) || undefined

            const similarity = `${realNumber}${desimal ? `.${desimal}` : ''}%`
            
            const info = `      ╾─͙─͙─͙Info Anime─͙─͙─͙╼\n`+
            `Title: ${infoAnime.native}\n`+
            `Romaji: ${infoAnime.romaji || '-'}\n`+
            `English: ${infoAnime.english || '-'}\n`+
            `Episode: ${infoAnime.episode || '-'}\n`+
            `Similarity: ${similarity}`

            return {content: info, media: infoAnime.image, type: 'image'};
        case 'ytdl':
            const [bodyMessage, detailInfo] = body.split(' ')
            if(!detailInfo) return `sertakan keterangan untuk mengirim file dalam bentuk apa
            
Keterangan: 
-v: untuk Video
-a: untuk audio
-vd: untuk video yang dikirim melalui document
-ad: untuk audio yang dikirim melalui document

*CONTOH*: 5 -a`
            
            const {downloaded} = content
            const mediaDownload = downloaded[parseInt(bodyMessage) - 1]
            const youtubeData = await fetch(`https://api.zahwazein.xyz/downloader/youtube?apikey=zenzkey_d4d353be64&url=${mediaDownload.url}`)
            if(youtubeData.statusText !== 'OK')return '404 Fot Found'

            const parse = await youtubeData.json()

            const video = parse.result.getVideo
            const audio = parse.result.getAudio
            
            let media = {}
            let type;
            switch(body.split(' ')[1]) {
                case '-v':
                    media.content = video
                    media.jpegThumbnail = mediaDownload.thumbnail
                    type = 'video'
                    break
                case '-vd':
                    media.content = video
                    type = 'document'
                    break
                case '-ad':
                    media.content = audio
                    type = 'document'
                    break
                case '-a':
                    media.content = audio
                    type = 'audio'
                    break
            }
            return {content: '', media, type, option: {counter: true}}
        
        default:
            return;
    }
}
