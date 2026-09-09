import os
import re

directory = r'c:\laragon\www\037kesinee\kk\figma'
images_dir = os.path.join(directory, 'images')

actual_images = {}
for file in os.listdir(images_dir):
    if file.endswith('.png'):
        name = os.path.splitext(file)[0].lower()
        actual_images[name] = file

thai_mapping = {
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
}

def replace_image_paths(content):
    def replacer(match):
        full_match = match.group(0)
        path = match.group(1)
        filename = path.split('/')[-1]
        name, ext = os.path.splitext(filename)
        
        if name in thai_mapping:
            new_name = thai_mapping[name]
            return full_match.replace(path, new_name + '.png')
            
        name_lower = name.lower()
        if name_lower in actual_images:
            return full_match.replace(path, actual_images[name_lower])
            
        return full_match

    return re.sub(r'images/([^"\'\\]+)', replacer, content)

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.html') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                new_content = replace_image_paths(content)
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f'Updated {filepath}')
            except Exception as e:
                print(f"Error processing {filepath}: {e}")

print('Done!')
