const fs = require('fs');
let code = fs.readFileSync('src/components/common/BottomNav.tsx', 'utf8');

code = code.replace(/\{\/\* Home \*\/\}/g, '');
code = code.replace(/\{\/\* Plants \*\/\}/g, '');
code = code.replace(/\{\/\* Plant Combos \(Highlighted\) \*\/\}/g, '');
code = code.replace(/\{\/\* Wishlist \*\/\}/g, '');
code = code.replace(/\{\/\* Cart \*\/\}/g, '');

fs.writeFileSync('src/components/common/BottomNav.tsx', code);
