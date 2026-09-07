const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'initialData.ts');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(/      difficulty: '(.*)'\n/g, "      difficulty: '$1',\n      airPurifying: false\n");

// for orders... let's just make sure they have a createdAt at the end before closing bracket
// the orders are in initialOrders: Order[] = [{...}, {...}, {...}]
content = content.replace(/    statusHistory: \[\s*\{[\s\S]*?\]\n  \},/g, match => {
  return match.slice(0, -3) + ",\n    createdAt: new Date().toISOString()\n  },";
});


fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed final 2!');
