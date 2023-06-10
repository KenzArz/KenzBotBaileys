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
        subItem: getItem?.subItem?.find(subItem => subItem.toLowerCase() === delPrefix.toLowerCase()) || ''
    }
    return {path: `./${setPath.item}${setPath.subItem ? `/${setPath.subItem}` : ''}.js`}
    
}

export async function processCommand(msg) {
    
    const checkFitur =  filePath(msg.body)
    if(checkFitur.text) return checkFitur

    const {default: Run} = await import(checkFitur.path)
    const command = await Run(msg)
    if(command?.error) return command
    return false
}

export async function commandQuoted(msgQuoted) {

    const quoted = await msgQuoted.quotedMessage()
    const {temp} = await import('../bot.js')
    const content = temp.find(({message}) => message.key.id == quoted.stanza)

    const ctx = content.message.message.ephemeralMessage.message.imageMessage.contextInfo.quotedMessage || content.message.message.ephemeralMessage.message.extendedTextMessage.contextInfo.quotedMessage
    const bodyMesage = ctx.imageMessage?.caption || ctx.extendedTextMessage?.text
    if(msgQuoted.body.split(' ')[0] == '0')return

    const checkFitur = filePath(bodyMesage.spit(' ')[0] + 'Quoted')
    if(checkFitur?.text) return checkFitur
    
    const {default : Run} = await import(checkFitur.path)
    const commandQuoted = await Run(msgQuoted, content)
    if(commandQuoted?.error) return commandQuoted
    return false
//     switch (bodyMesage.split(' ')[0]) {
//         case 'ytdl':
//             const [bodyMessage, detailInfo] = body.split('-')
//             if(!detailInfo) return{errorContent: {text: `sertakan keterangan untuk mengirim file dalam bentuk apa
            
// Keterangan: 
// -v: untuk Video
// -a: untuk audio
// -vd: untuk video yang dikirim melalui document
// -ad: untuk audio yang dikirim melalui document

// *CONTOH*: 5 -a`, error: true}}
            
//             const {downloaded} = content
//             const mediaDownload = downloaded[parseInt(bodyMessage) - 1]
//             const youtubeData = await fetch(`https://api.zahwazein.xyz/downloader/youtube?apikey=zenzkey_d4d353be64&url=${mediaDownload.url}`)
//             if(youtubeData.statusText !== 'OK')return {text: '404 Fot Found',error: true}
            
//             const parse = await youtubeData.json()
//             if(parse.result.message.includes('report!'))return {errorContent: {text: 'server error harap tunggu sampai server kembali pulih', error: true}}

//             const video = parse.result.getVideo
//             const audio = parse.result.getAudio
            
//             let media = {}
//             let type;
//             switch(body.split(' ')[1]) {
//                 case '-v':
//                     media.content = video
//                     media.jpegThumbnail = mediaDownload.thumbnail
//                     type = 'video'
//                     break
//                 case '-vd':
//                     media.content = video
//                     media.title = mediaDownload.title
//                     type = 'document video'
//                     break
//                 case '-ad':
//                     media.content = audio
//                     media.title = mediaDownload.title
//                     type = 'document audio'
//                     break
//                 case '-a':
//                     media.content = audio
//                     type = 'audio'
//                     break
//             }
//             return {content: mediaDownload.title, media, type, option: {counter: true}}
        
//         default:
//             return{errorContent: {text: `sertakan keterangan untuk mengirim file dalam bentuk apa
            
//             Keterangan: 
//             -v: untuk Video
//             -a: untuk audio
//             -vd: untuk video yang dikirim melalui document
//             -ad: untuk audio yang dikirim melalui document
            
//             *CONTOH*: 5 -a`, error: true}}
//     }
}
