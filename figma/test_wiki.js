const https = require('https');

function searchWikiImage(query) {
    return new Promise((resolve) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=0&gsrlimit=1&prop=pageimages&pithumbsize=400&format=json`;
        const options = {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const pages = json.query?.pages;
                    if (pages) {
                        const pageId = Object.keys(pages)[0];
                        if (pages[pageId].thumbnail) {
                            resolve(pages[pageId].thumbnail.source);
                            return;
                        }
                    }
                    resolve(null);
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

searchWikiImage('Sun conure').then(console.log);
searchWikiImage('African grey parrot').then(console.log);
searchWikiImage('Scops owl').then(console.log);
searchWikiImage('Call duck').then(console.log);
