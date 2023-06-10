import fetch from 'node-fetch'
import {JSDOM} from 'jsdom'

export async function POST({url, formData, type, isConvert}) {
    const fetching = await fetch(url, {
        method: 'POST',
        headers: {
            accept: "*/*",
            'accept-language': "en-US,en;q=0.9",
            'content-type': "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: new URLSearchParams(Object.entries(formData))
    })
    const {result} = await fetching.json()
    if(isConvert) return /<a.+?href="(.+?)"/.exec(result)[1]

    const converting = await convert(result, type)
    return converting
}

async function convert(content, type) {

    const {document} = (new JSDOM(content)).window
    const tables = document.querySelectorAll('table')
    const table = tables[{mp4: 0, mp3: 1}[type]  || 0]

    const fileContent = []
        if(type == 'mp4') {
            const list = [...table.querySelectorAll('td')].filter(v => !/\.3gp/.test(v.innerHTML)).flatMap(v => {
                if(v.innerHTML.match(/.*?(?=\()/) !== null){
                    const content = v.textContent
                    if(!content.includes('Download')){
                        fileContent.push({bitrate: content})
                    }
                }
                else {
                    for(const [i, content] of fileContent.entries()) {
                        if(!content.size) {
                            fileContent.push({bitrate: content.bitrate, size: v.textContent})
                            fileContent.splice(i, 1)
                        }
                    }
                }
            })
        }
        else if(type == 'mp3') {
            fileContent.push({bitrate: '128kbps', size : table.querySelector('td').nextSibling.nextSibling.textContent})
        }

        const title = document.querySelector('b').innerHTML
        const thumbnail = document.querySelector('img').src
        const id = /var k__id = "(.*?)"/.exec(document.body.innerHTML) || ['', '']

        return {
            title,
            thumbnail,
            id,
            fileContent
        }
}