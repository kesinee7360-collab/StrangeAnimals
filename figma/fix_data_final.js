const fs = require('fs');
const path = require('path');
const https = require('https');

async function searchWikiImage(query) {
    return new Promise((resolve) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=0&gsrlimit=1&prop=pageimages&pithumbsize=400&format=json`;
        const options = {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ExoticPetsProject/1.0' }
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

function getLocalImagesMap() {
    const files = fs.readdirSync('images');
    const map = {};
    for (const f of files) {
        // e.g. "African_Grey_Parrot.jpg" -> "african grey parrot"
        const cleanName = f.replace(/\.[^/.]+$/, "").replace(/_/g, " ").toLowerCase();
        map[cleanName] = `images/${f}`;
    }
    // manual tweaks for mismatches
    map['cichlid'] = 'images/Cichlid.jpg';
    map['flowerhorn'] = 'images/Cichlid.jpg'; // If flowerhorn maps to cichlid?
    return map;
}

async function fixDataFinal() {
    const localMap = getLocalImagesMap();
    let content = fs.readFileSync('data.js', 'utf8');
    
    // We will parse line by line or block by block to not mess up
    // But regex replace is fine since we know the structure.
    const regex = /"id":\s*"([^"]+)",\s*"title":\s*"([^"]+)",\s*"img":\s*"([^"]+)"/g;
    let matches = [...content.matchAll(regex)];
    
    for (const match of matches) {
        const id = match[1];
        const title = match[2];
        const currentImg = match[3];
        
        // Extract english name from title: e.g. "นกแก้วมาคอว์ (Macaw)" -> "Macaw"
        let englishName = id.replace(/_/g, ' ').toLowerCase();
        const titleMatch = title.match(/\(([^)]+)\)/);
        if (titleMatch) {
            englishName = titleMatch[1].toLowerCase().replace(/['"_-]/g, '').trim();
        }
        
        let newImgUrl = null;
        
        // 1. Try exact match in local map using english name
        if (localMap[englishName]) {
            newImgUrl = localMap[englishName];
        } else {
            // Try matching ID
            const idClean = id.replace(/_/g, ' ').toLowerCase();
            if (localMap[idClean]) {
                newImgUrl = localMap[idClean];
            } else {
                // Try fuzzy matching
                for (const [key, val] of Object.entries(localMap)) {
                    if (key.includes(englishName) || englishName.includes(key)) {
                        newImgUrl = val;
                        break;
                    }
                }
            }
        }
        
        // If not found locally, use wikipedia search
        if (!newImgUrl) {
            console.log(`[Wiki] Fetching for ${englishName}`);
            let wikiUrl = await searchWikiImage(englishName);
            if (wikiUrl) {
                newImgUrl = wikiUrl;
            } else {
                console.log(`[Fallback] Using placehold for ${englishName}`);
                // fallback to placeholder with ID (english characters only)
                newImgUrl = `https://placehold.co/400x300/3e5f35/FFFFFF?text=${encodeURIComponent(id.replace(/_/g, ' '))}`;
            }
            await new Promise(r => setTimeout(r, 1000));
        } else {
            console.log(`[Local] Found for ${id} -> ${newImgUrl}`);
        }
        
        if (newImgUrl) {
            const newStr = match[0].replace(currentImg, newImgUrl);
            content = content.replace(match[0], newStr);
        }
    }
    
    fs.writeFileSync('data.js', content, 'utf8');
    console.log('Fixed data.js to prioritize local images!');
}

fixDataFinal();
