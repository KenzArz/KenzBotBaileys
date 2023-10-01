import fetch from 'node-fetch'

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

  const json = await fetching.json();
  if(isConvert) {
    // if(/"sr-only">Error: </.test(result)) return {failed: 'Error: kemungkinan link diblokir oleh youtube untuk tidak bisa didownload'}
    return json.dlink
  }

  const metadata = []
  const mp4 = json.links.mp4
  for(const links in mp4) {
    const size = mp4[links].size
    const bitrate = mp4[links].q
    const id = mp4[links].k

    metadata.push({size, bitrate, id})
  }
  const video = metadata.sort((a,b) => {
    const parseIntA = parseInt(a.bitrate)
    const parseIntB = parseInt(b.bitrate)

    return parseIntA - parseIntB
  })

  const mp3 = json.links.mp3.mp3128
  const audio = {
    size: mp3.size,
    bitrate: mp3.q,
    id: mp3.k
  }
  
  // const converting = convert(result, type)
  return {title: json.title, thumbnail: `https://i.ytimg.com/vi/${json.vid}/0.jpg`, fileContent: {video, audio}}
}
