import cheerio from 'cheerio'
import fetch from 'node-fetch'

import FormData from 'form-data'
import {writeFileSync} from 'fs'

export async function POST(link) {
  
  // download krakenfile
  const kraken = await fetch(link)
  const reg = /https:\/\/krakenfiles.com\/view\/(.+?)\/file.html/
  if(!reg.test(kraken.url)) return {text: 'link tidak valid', error: true}
  
  const html = await kraken.text()
  const $ = cheerio.load(html)
  
  const http = 'https:'  + $('form').attr('action')
  const token = $('#dl-token').val()

  const content = {}
  try {  
    const komik = await fetch(http, {
      headers: {
        "content-type": `application/x-www-form-urlencoded; charset=UTF-8`
      },
      method: 'POST',
      body: 'token= '+ token
    })
    Object.assign(content, (await komik.json()))
    
  } catch (error) {
    try {
      const formData = new FormData();
    formData.append('token', token);
    
      const komik = await fetch(http, {
        headers: {
          "content-type": `multipart/form-data; boundary=${formData._boundary}`
        },
        method: 'POST',
        body: formData
      })
      Object.assign(content, (await komik.json()))
    } catch (error) {
      return {text: error.toString(), error: true}
    }
    
  }

  const { headers } = await fetch(content.url)
  
  return { 
    url: content.url, 
    size: Math.floor(parseInt(headers.get('content-length')) / 1048576), 
    title: headers.get('content-disposition').match(/filename="(.+?)"/)[1], 
    mimetype: headers.get('content-type')}
}
