const fs = require('fs');
const content = fs.readFileSync('data.js', 'utf8');
const regex = /"img":\s*"([^"]+)"/g;
let match;
const urls = [];
while ((match = regex.exec(content)) !== null) {
    if (match[1].includes('loremflickr')) {
        urls.push(match[1]);
    }
}
console.log(urls.join('\n'));
