const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'initialData.ts');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(/      difficulty: '(.*)'/g, "      difficulty: '$1',\n      airPurifying: false");

content = content.replace(/    estimatedDelivery: '(.*)',\n  },/g, "    estimatedDelivery: '$1',\n    createdAt: new Date().toISOString(),\n  },");

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed final 3!');
