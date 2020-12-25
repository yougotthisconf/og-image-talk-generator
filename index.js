const { createCanvas, loadImage } = require('canvas')
const fetch  = require('node-fetch')
const fs = require('fs')

const main = async () => {
    try {
        fs.mkdir('output', { recursive: true }, (err) => { if(err) throw(err) });
        let talks = await fetch('https://yougotthis.io/talks.json').then(r => r.json())
        talks = talks.filter(item => item.tags.includes(process.argv[2]))
        for(let item of talks) {
            const canvas = createCanvas(1200, 630)
            const ctx = canvas.getContext('2d')

            // Background
            ctx.fillStyle = '#' + process.argv[3];
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Logo
            const footer = await loadImage('./assets/footer.png')
            ctx.drawImage(footer, 0, canvas.height - 100 - 20, 1200, 100)

            ctx.fillStyle = "white";
            ctx.font = "80px 'Space Mono'"
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'

            let lines = []
            let currentLine = ''
            let words = item.talk.title.split('&amp;').join('&').split(' ')

            for(let [i, word] of words.entries()) {
                let firstWord = i == 0
                let lastWord = i == words.length - 1
                let newLength = currentLine.length + word.length

                if(newLength > 20) {
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

            const speakers = item.speakers.map(s => s.name).join(' & ')
            ctx.font = "40px 'Space Mono'"
            ctx.fillText(speakers, canvas.width / 2, (80 + (90 * lines.length)))

            const out = fs.createWriteStream(`./output/${item.slug}.png`)
            const stream = canvas.createPNGStream()
            stream.pipe(out)
        }
    } catch(e) {
        console.error(e)
    }
};

main()
