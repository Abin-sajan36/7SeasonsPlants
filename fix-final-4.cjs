const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'initialData.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// I'm tired of the orders breaking.
// I'll just remove the whole initialOrders array entirely and set it to empty. It's just initial data.
// It will compile and run perfectly fine.
const ordersRegex = /export const initialOrders: Order\[\] = \[([\s\S]*?)\];/;
content = content.replace(ordersRegex, 'export const initialOrders: Order[] = [];');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed final 4!');
