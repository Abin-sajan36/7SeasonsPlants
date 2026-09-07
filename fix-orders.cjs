const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'initialData.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// The orders in initialOrders are probably missing createdAt, let's look at the shape
// They have 'date:' maybe instead of createdAt?
content = content.replace(/    date: /g, '    createdAt: ');

// Fix AdminAccounts
content = content.replace(/    lastLogin: (.*),/g, "    lastLogin: $1,\n    createdAt: new Date().toISOString(),");

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed orders and admins!');
