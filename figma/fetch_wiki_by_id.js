const fs = require('fs');
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

const customQueries = {
    'african_grey': 'African grey parrot',
    'crested_gecko': 'Crested gecko',
    'corn_snake': 'Corn snake',
    'red_footed_tortoise': 'Red-footed tortoise',
    'blue_tongue_skink': 'Blue-tongued skink',
    'pacman_frog': 'Ceratophrys',
    'whites_tree_frog': "Australian green tree frog",
    'african_bullfrog': 'African bullfrog',
    'tomato_frog': 'Tomato frog',
    'glass_frog': 'Glass frog',
    'emperor_scorpion': 'Emperor scorpion',
    'snail': 'Lissachatina fulica',
    'macaw': 'Macaw',
    'conure': 'Sun conure',
    'owl': 'Scops owl',
    'duck': 'Call duck',
    'falcon': 'Falcon',
    'toucan': 'Toucan',
    'emu': 'Emu',
    'salamander': 'Tiger salamander',
    'newt': 'Fire-bellied newt',
    'toad': 'Common pipa',
    'whip_scorpion': 'Thelyphonida',
    'millipede': 'Archispirostreptus gigas',
    'praying_mantis': 'Orchid mantis',
    'hermit_crab': 'Hermit crab',
    'hissing_roach': 'Madagascar hissing cockroach',
    'isopod': 'Isopoda',
    'centipede': 'Centipede',
    'puffer': 'Mbu pufferfish',
    'bichir': 'Bichir',
    'gar': 'Alligator gar',
    'discus': 'Symphysodon',
    'lungfish': 'Lungfish',
    'peacock_bass': 'Peacock bass',
    'betta_wild': 'Siamese fighting fish',
    'wolfdog': 'Wolfdog',
    'bengal': 'Bengal cat',
    'liger': 'Liger',
    'zonkey': 'Zonkey',
    'coydog': 'Coydog',
    'mule': 'Mule',
    'chito': 'Cheetoh',
    'geep': 'Sheep-goat hybrid',
    'dzo': 'Dzo',
    'dwarf_croc': 'Dwarf crocodile',
    'wallaby': 'Wallaby',
    'slow_loris': 'Slow loris',
    'fennec_fox_wild': 'Red fox',
    'otter': 'Asian small-clawed otter',
    'skunk': 'Skunk',
    'kinkajou': 'Kinkajou',
    'genet': 'Genet (animal)',
    'slime_mold': 'Slime mold',
    'pitcher_plant': 'Nepenthes',
    'sundew': 'Drosera',
    'lithops': 'Lithops',
    'marimo': 'Marimo',
    'air_plant': 'Tillandsia',
    'mimosa': 'Mimosa pudica',
    'dancing_plant': 'Codariocalyx motorius',
    'corpse_flower': 'Titan arum',
    'glofish_barb': 'Tiger barb',
    'glofish_danio': 'Zebrafish',
    'glofish_shark': 'Rainbow shark',
    'glofish_betta': 'Siamese fighting fish',
    'glofrog': 'African clawed frog',
    'glo_cory': 'Corydoras',
    'transgenic_mouse': 'Laboratory mouse',
    'transgenic_pig': 'Domestic pig',
    'glowing_plant': 'Petunia'
};

async function fixData() {
    let content = fs.readFileSync('data.js', 'utf8');
    
    const regex = /"id":\s*"([^"]+)",\s*"title":\s*"([^"]+)",\s*"img":\s*"([^"]+)"/g;
    let matches = [...content.matchAll(regex)];
    
    for (const match of matches) {
        const id = match[1];
        const currentImg = match[3];
        
        if (currentImg.includes('placehold.co') || currentImg.includes('loremflickr')) {
            let query = customQueries[id] || id.replace(/_/g, ' ');
            console.log(`Fetching for ${id}: ${query}`);
            
            let wikiUrl = await searchWikiImage(query);
            
            if (!wikiUrl && query.includes(' ')) {
                wikiUrl = await searchWikiImage(query.split(' ')[0]);
            }
            
            if (wikiUrl) {
                const newStr = match[0].replace(currentImg, wikiUrl);
                content = content.replace(match[0], newStr);
                console.log(`-> Found: ${wikiUrl}`);
            } else {
                console.log(`-> Could not find image for ${query}`);
            }
            // Delay 1.5s to avoid rate limiting
            await new Promise(r => setTimeout(r, 1500));
        }
    }
    
    fs.writeFileSync('data.js', content, 'utf8');
    console.log('Done!');
}

fixData();
