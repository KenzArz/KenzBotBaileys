import fetch from 'node-fetch'

export async function POST(link) {

  const content = {
    link,
    token: ''
  }
  const setCookie = await fetch('https://sssinstagram.com/r')
  const token = setCookie.headers.get('set-cookie').replace(/%3D.*$/, '=')
  const ss = setCookie.headers.get('set-cookie').replace(/.+lax,.?/, '')

  const request = await fetch('https://sssinstagram.com/r', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
       cookie: `random_n=eyJpdiI6InhEaWZINmtwc0VIL2s2WnMrdFZXTXc9PSIsInZhbHVlIjoidGsrbyt3T1RPeFpkeGRISVU0OEF5b1duQmVyUXhaSjZuTjBqaWs2V1BvOWtpQW9mVTJLZXBKSGFTZkc2ZURSQiIsIm1hYyI6Ijk5NmRlZTY5ODkwNTdiZTc1OTEyMGQyZGRjNTkyMmUwNzQzOTFlNGFjOGE1OTA2ZDNiNGNkZWQ2YTdiNmFlZDIiLCJ0YWciOiIifQ==; ${token}; ${ss}; _ga_90WCZ6NHEE=GS1.1.1690643169.2.0.1690643169.0.0.0; _ga=GA1.2.150047804.1685849661; _gid=GA1.2.2053177086.1690643169; _gat_UA-3524196-4=1; __gads=ID=c78e35276c1741fb-229bd45ac6e100b5:T=1685849664:RT=1690643161:S=ALNI_MajOuN1uql5xigE89S7_aemnt_XUA; __gpi=UID=00000c0f33ead7e2:T=1685849664:RT=1690643161:S=ALNI_MaDJAUQuerl3IMXIo-8evNNmqRLpQ; _ga_CN2Z3TL83Y=GS1.2.1690643170.1.0.1690643184.46.0.0`,
      'x-xsrf-token': token.replace('XSRF-TOKEN', '')
    },
    body: JSON.stringify(content)
  })
  const { data: { items } } = await request.json()
  let media;
  for(const contents of items) {
    const { urls:  url, pictureUrl: thumb} = contents
    if(items.length <= 1) media = { url, thumb}
    else if(items.length > 1) {
      if(!media) media = []
      media.push({url, thumb})
    }
  }
  // console.log(JSON.stringify(items, 0, 2))
  return media
}