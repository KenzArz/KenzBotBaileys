import got from 'got'
import vm from 'vm'

export async function POST(url) {
    const script = await got('https://worker.sf-tools.com/savefrom.php', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      origin: 'https://id.savefrom.net',
      referer: 'https://id.savefrom.net/',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36'
    },
    form: {
      sf_url: url,
      sf_submit: '',
      new: 2,
      lang: 'id',
      app: '',
      country: 'id',
      os: 'Windows',
      browser: 'Chrome',
      channel: ' main',
      'sf-nomad': 1
    }
  })

    const executeCode = '[]["filter"]["constructor"](b).call(a);'
    const fileScript = script.body.replace(executeCode, `
    try {const script = ${executeCode.split('.call')[0]}.toString();if (script.includes('function showResult')) scriptResult = script;else (${executeCode.replace(/;/, '')});} catch {}
`)

    const context = {
    scriptResult: '',
    log: console.log
    }
  
    vm.createContext(context)
    new vm.Script(fileScript).runInContext(context)
    const data = context.scriptResult.split('window.parent.sf.videoResult.show(')?.[1] || context.scriptResult.split('window.parent.sf.videoResult.showRows(')?.[1]

    const content = data.split(');')[0].split(",\"instagram.com\"")[0]
    return JSON.parse(content)
}