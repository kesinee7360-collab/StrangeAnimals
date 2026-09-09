const fs = require('fs');

function fixPlaceholders() {
    let content = fs.readFileSync('data.js', 'utf8');
    
    const regex = /"id":\s*"([^"]+)",\s*"title":\s*"([^"]+)",\s*"img":\s*"([^"]+)"/g;
    let matches = [...content.matchAll(regex)];
    
    for (const match of matches) {
        const id = match[1];
        const title = match[2];
        const currentImg = match[3];
        
        if (currentImg.includes('placehold.co') || currentImg.includes('loremflickr')) {
            // Replace with placehold.co and the ACTUAL title
            const newUrl = `https://placehold.co/400x300/3e5f35/FFFFFF?text=${encodeURIComponent(title)}`;
            const newStr = match[0].replace(currentImg, newUrl);
            content = content.replace(match[0], newStr);
        }
    }
    
    fs.writeFileSync('data.js', content, 'utf8');
    console.log('Fixed remaining placeholders!');
}

fixPlaceholders();
