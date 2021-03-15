const fetch  = require('node-fetch')

const main = async () => {
    try {
        const url = `http://localhost:8080/talks/${process.argv[2]}.json`
        // const url = "https://deploy-preview-37--yougotthisconf.netlify.app/talks/negotiating-after-your-start-date.json"
        let talks = await fetch(url).then(r => r.json())
        console.log(talks)
    } catch(e) {
        console.error(e)
    }
};

main()
