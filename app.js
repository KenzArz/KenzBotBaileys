import * as express from 'express'
// import connecting from './bot.js'
let link = 'bakadame/'

const app = express.default()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('<p>Bot Online...</p>')
})
app.get('/api', (req, res) => {
    res.send('<p> API NOT FOUND')
})

app.get('/link', (req, res) => {
    const newLink = createLink()
    res.send(newLink)

    const remove = () => {
        app._router.stack.forEach((value, i) => {
            if(value.route ) {
                if(value.route.path == '/'+ link) {
                    console.log('deleting')
                    app._router.stack.splice(i, 1)
                    link = 'bakadame/'
                }
            }
        })
    }
    
    setTimeout(remove, 10 * 1000)
})

app.listen(port, async (a) => {
    // await connecting()
    console.log(port)
    console.log('ACTIVATING BOT...')
})


function createLink() {
    const code ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz124567890'
    for (let index = 1; index <= 5; index++) {
        const seed = Math.floor(Math.random() * code.length)
        link += code.charAt(seed)
    }
    app.get("/" +link, (req, res) => {
        res.send('APi -----')
    })
    return link
}