const fs = require('fs');
const path = require('path');

const directory = 'c:\\laragon\\www\\037kesinee\\kk\\figma';
const images_dir = path.join(directory, 'images');

const actual_images = {};
fs.readdirSync(images_dir).forEach(file => {
    if (file.toLowerCase().endsWith('.png')) {
        const name = path.basename(file, '.png').toLowerCase();
        actual_images[name] = file;
    }
});

const thai_mapping = {
    'เฟนเน็กฟ็อกซ์': 'Fennec_Fox',
    'เฟอร์เรท': 'Ferret',
    'แกสบี้': 'Guinea_Pig',
    'แพรี่ด็อก': 'Prairie_Dog',
    'ลิงมาร์โมเสท': 'Marmoset',
    'เมียร์แคต': 'Meerkat',
    'แรคคูน': 'Raccoon',
    'ตุ๊กแกเสือดาว': 'Leopard_Gecko',
    'งูบอลไพธอน': 'Ball_Python',
    'นกค็อกคาเทล': 'Cockatiel',
    'แอกโซลอเติล': 'Axolotl',
    'แมงมุมทารันทูล่า': 'Tarantula',
    'คาปิบารา': 'Capybara',
    'ชูการ์ไกลเดอร์': 'Sugar_Glider',
    'เม่นแคระ': 'Hedgehog',
    'ชินชิล่า': 'Chinchilla',
    'มังกรเครา': 'Bearded_Dragon',
    'งูคอร์นสเนค': 'Corn_Snake',
    'poison_frog': 'poison_frog'
};

function replace_image_paths(content) {
    return content.replace(/images\/([^"'\\]+)/g, (match, filepath) => {
        const filename = filepath.split('/').pop();
        const ext = path.extname(filename);
        const name = path.basename(filename, ext);
        
        if (thai_mapping[name]) {
            return match.replace(filepath, thai_mapping[name] + '.png');
        }
        
        const name_lower = name.toLowerCase();
        if (actual_images[name_lower]) {
            return match.replace(filepath, actual_images[name_lower]);
        }
        
        return match;
    });
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'images') {
                processDirectory(fullPath);
            }
        } else if (file.endsWith('.html') || file.endsWith('.js')) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                const new_content = replace_image_paths(content);
                if (new_content !== content) {
                    fs.writeFileSync(fullPath, new_content, 'utf8');
                    console.log('Updated ' + fullPath);
                }
            } catch (e) {
                console.error('Error processing ' + fullPath, e);
            }
        }
    }
}

processDirectory(directory);
console.log('Done!');
