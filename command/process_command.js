import { readdirSync} from 'fs'

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

export async function processCommand(msg) {
    
    const checkFitur =  filePath(msg.body)
    if(checkFitur.text) return checkFitur

    const {default: Run} = await import(checkFitur)
    await Run(msg)
}