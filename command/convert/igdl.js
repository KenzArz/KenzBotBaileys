import axios from 'axios'

export default async function tes() {
    const igDownloadUrl = 'https://instasupersave.com/'
    const resp = await axios(igDownloadUrl);
    const cookie = resp.headers["set-cookie"]; // get cookie from request
    const session = cookie[0].split(";")[0].replace("XSRF-TOKEN=","").replace("%3D", "")
    console.log(resp.data)

    axios({
        method: 'POST',
        url: `${igDownloadUrl}api/convert`,
        headers: { 
            'origin': 'https://instasupersave.com', 
            'referer': 'https://instasupersave.com/pt/', 
            'sec-fetch-dest': 'empty', 
            'sec-fetch-mode': 'cors', 
            'sec-fetch-site': 'same-origin', 
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.52', 
            'x-xsrf-token': session, 
            'Content-Type': 'application/json', 
            'Cookie': `XSRF-TOKEN=${session}; instasupersave_session=${session}`
        },
        data : {
            url: 'https://www.instagram.com/reel/CsNYViLuQEE/?utm_source=ig_web_copy_link&igshid=MzRlODBiNWFlZA=='
        }
    }).then(m => console.log(m.data)).catch(m)
}
tes()