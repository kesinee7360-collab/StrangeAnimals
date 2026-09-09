const fs = require('fs');
const content = fs.readFileSync('data.js', 'utf8');
const regex = /"id":\s*"([^"]+)",\s*"title":\s*"([^"]+)",\s*"img":\s*"([^"]+)"/g;
let match;
const lines = [];
while ((match = regex.exec(content)) !== null) {
    lines.push(`${match[1]} | ${match[2]} | ${match[3]}`);
}
fs.writeFileSync('dump.txt', lines.join('\n'), 'utf8');
