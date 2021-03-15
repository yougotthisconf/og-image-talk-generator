const { createCanvas, loadImage } = require('canvas')
const fetch  = require('node-fetch')
const fs = require('fs')

// node index.js (tag) (url)

const w = 1200, h = 630

const main = async () => {
    try {
        fs.mkdir('output', { recursive: true }, (err) => { if(err) throw(err) })
        const url = `${process.argv[3] ? process.argv[3] : 'https://yougotthis.io'}/talks.json`
        let talks = await fetch(url).then(r => r.json())
        if(process.argv[2]) talks = talks.filter(item => item.tags.includes(process.argv[2]))
        for(let item of talks) {
            const canvas = createCanvas(w, h)
            const ctx = canvas.getContext('2d')

            // Background Gradient
            const gradient = ctx.createLinearGradient(0, 0, w, h)
            gradient.addColorStop(0, '#EC4899')
            gradient.addColorStop(1, '#3B82F6')
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, w, h)


            // // Logo
            const footer = await loadImage('./assets/footer.png')
            ctx.drawImage(footer, 0, canvas.height - 100 - 20, 1200, 100)

            // Title
            ctx.fillStyle = "white";
            ctx.font = "80px 'Freigeist'"
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'

            let lines = []
            let currentLine = ''
            let words = item.talk.title.split('&amp;').join('&').split(' ')

            for(let [i, word] of words.entries()) {
                let firstWord = i == 0
                let lastWord = i == words.length - 1
                let newLength = currentLine.length + word.length

                if(newLength > 18) {
                    lines.push(currentLine)
                    if(lastWord) lines.push(word)
                    else currentLine = word
                } else {
                    if(!firstWord) currentLine += ' '
                    currentLine += word
                    if(lastWord) lines.push(currentLine)
                }
            }

            for(let [i, line] of lines.entries()) {
                ctx.fillText(line, canvas.width / 2, 30 + (90 * i))
            }

            // Speakers
            const speakers = item.speakers.map(s => s.name).join(' & ')
            ctx.font = "40px 'Freigeist Regular'"
            ctx.fillText(speakers, canvas.width / 2, (80 + (90 * lines.length)))

            // Write files
            const out = fs.createWriteStream(`./output/${item.slug}.png`)
            const stream = canvas.createPNGStream()
            stream.pipe(out)
        }
    } catch(e) {
        console.error(e)
    }
};

main()
