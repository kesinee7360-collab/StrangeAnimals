const fs = require('fs');
const https = require('https');

async function getWikiImage(query) {
    return new Promise((resolve) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=400`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const pages = json.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pageId !== '-1' && pages[pageId].thumbnail) {
                        resolve(pages[pageId].thumbnail.source);
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

async function fixData() {
    let content = fs.readFileSync('data.js', 'utf8');
    
    // Find all loremflickr URLs
    const regex = /"img":\s*"(https:\/\/loremflickr\.com\/400\/300\/([^"]+))"/g;
    let matches = [...content.matchAll(regex)];
    
    for (const match of matches) {
        const fullMatch = match[1];
        let query = match[2].replace(/_/g, ' ');
        // some custom queries
        if (query === 'africangrey') query = 'African grey parrot';
        if (query === 'crestedgecko') query = 'Crested gecko';
        if (query === 'cornsnake') query = 'Corn snake';
        if (query === 'redfootedtortoise') query = 'Red-footed tortoise';
        if (query === 'bluetongueskink') query = 'Blue-tongued skink';
        if (query === 'pacmanfrog') query = 'Pacman frog';
        if (query === 'treefrog') query = "White's tree frog";
        if (query === 'africanbullfrog') query = 'African bullfrog';
        if (query === 'tomatofrog') query = 'Tomato frog';
        if (query === 'glassfrog') query = 'Glass frog';
        if (query === 'emperorscorpion') query = 'Emperor scorpion';
        if (query === 'giantafricanland snail') query = 'Giant African snail';
        
        console.log(`Fetching wiki image for: ${query}`);
        let wikiUrl = await getWikiImage(query);
        
        if (!wikiUrl) {
            // try just the first word if two words
            if (query.includes(' ')) {
                wikiUrl = await getWikiImage(query.split(' ')[0]);
            }
        }
        
        if (wikiUrl) {
            content = content.replace(fullMatch, wikiUrl);
            console.log(`Replaced ${match[2]} with ${wikiUrl}`);
        } else {
            console.log(`Could not find image for ${query}`);
            // Fallback to a placeholder with text
            const fallback = `https://placehold.co/400x300?text=${encodeURIComponent(query)}`;
            content = content.replace(fullMatch, fallback);
        }
    }
    
    fs.writeFileSync('data.js', content, 'utf8');
    console.log('Done!');
}

fixData();
