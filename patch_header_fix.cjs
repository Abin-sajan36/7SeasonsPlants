const fs = require('fs');
let code = fs.readFileSync('src/components/common/Header.tsx', 'utf8');

code = code.replace(/\{\/\* Wishlist Button \*\/\}/g, '');
code = code.replace(/\{\/\* Cart Button \*\/\}/g, '');

fs.writeFileSync('src/components/common/Header.tsx', code);
