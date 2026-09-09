const fs = require('fs');
const content = fs.readFileSync('data.js', 'utf8');
const regex = /"img":\s*"([^"]+)"/g;
let match;
const urls = [];
while ((match = regex.exec(content)) !== null) {
    urls.push(match[1]);
}
console.log(urls.slice(0, 20).join('\n'));
