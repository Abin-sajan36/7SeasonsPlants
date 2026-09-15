const fs = require('fs');

// Fix ComboDetailPage
let file1 = 'src/pages/ComboDetailPage.tsx';
let code1 = fs.readFileSync(file1, 'utf8');
code1 = code1.replace('matchedProd?.images[0]', 'matchedProd?.images?.[0]');
fs.writeFileSync(file1, code1);

// Fix ComboCustomizerModal
let file2 = 'src/components/admin/ComboCustomizerModal.tsx';
let code2 = fs.readFileSync(file2, 'utf8');
code2 = code2.replace('products[0]?.images[0]', 'products[0]?.images?.[0]');
fs.writeFileSync(file2, code2);

console.log('Fixed undefined array accesses');
