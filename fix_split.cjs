const fs = require('fs');

// AccountPage.tsx
let file1 = 'src/pages/AccountPage.tsx';
let code1 = fs.readFileSync(file1, 'utf8');
code1 = code1.replace("currentUser?.name.split(' ')", "(currentUser?.name || '').split(' ')");
fs.writeFileSync(file1, code1);

// Header.tsx
let file2 = 'src/components/common/Header.tsx';
let code2 = fs.readFileSync(file2, 'utf8');
code2 = code2.replace("currentUser.name.split(' ')", "(currentUser?.name || '').split(' ')");
code2 = code2.replace("currentUser.name.split(' ')", "(currentUser?.name || '').split(' ')");
fs.writeFileSync(file2, code2);

console.log('Fixed split errors');
