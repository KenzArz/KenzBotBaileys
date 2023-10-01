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
    if(!getItem) return {text: `fitur ${body.split(' ')[0]} tidak ada, silahkan ketik !menu untuk melihat fitur yang ada`}
    const setPath = {
        item: getItem.item,
        subItem: getItem?.subItem?.find(subItem => subItem.toLowerCase() === delPrefix.toLowerCase()) || ''
    }
    return {path: `./${setPath.item}${setPath.subItem ? `/${setPath.subItem}` : ''}.js`}
    
}

export async function processCommand(msg) {
    
    const checkFitur =  filePath(msg.body)
    if(checkFitur.text) {
      await msg.reaction('failed')
      return checkFitur}

    const {default: Run} = await import(checkFitur.path)
    const command = await Run(msg)

    if(command?.error) {
      await msg.reaction({stop: true})
      await msg.reaction('failed')
      return command}
    
    return false
}

export async function commandQuoted(msgQuoted) {

    const quoted = await msgQuoted.quotedMessage()
    const {temp} = await import('../bot.js')
    const content = temp.find(({message}) => message.key.id == quoted.stanza)
  
    const ctx = content.message.message.ephemeralMessage.message?.imageMessage?.contextInfo?.quotedMessage || content.message.message.ephemeralMessage.message.extendedTextMessage.contextInfo.quotedMessage
    const bodyMesage = ctx.imageMessage?.caption?.slice(0) || ctx.conversation?.slice(0) || ctx.extendedTextMessage?.text?.slice(0)
    if(msgQuoted.body.split(' ')[0] == '0')return

    const checkFitur = filePath(bodyMesage.split(' ')[0]+ 'Quoted')
    const {default: Run} = await import(checkFitur.path)
    const commandQuoted = await Run(msgQuoted, content)
    if(commandQuoted?.error){
      await msgQuoted.reaction({stop: true})
      await msgQuoted.reaction('failed')
      return commandQuoted}
    return false
  
}
