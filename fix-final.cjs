const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'initialData.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// size isn't allowed in ProductAttribute, so let's remove it
content = content.replace(/      size: '.*'\n/g, '');

// check why orders are failing createdAt again
// Let's manually replace the 3 orders createdAt properly
content = content.replace(/    orderStatus: 'delivered',\n    statusHistory:/g, "    orderStatus: 'delivered',\n    createdAt: new Date().toISOString(),\n    statusHistory:");
content = content.replace(/    orderStatus: 'processing',\n    statusHistory:/g, "    orderStatus: 'processing',\n    createdAt: new Date().toISOString(),\n    statusHistory:");
content = content.replace(/    orderStatus: 'shipped',\n    statusHistory:/g, "    orderStatus: 'shipped',\n    createdAt: new Date().toISOString(),\n    statusHistory:");

// Also just in case there's an order missing it...
// order 1
content = content.replace(/    estimatedDelivery: 'Oct 26, 2023',\n  },/g, "    estimatedDelivery: 'Oct 26, 2023',\n    createdAt: new Date().toISOString(),\n  },");
content = content.replace(/    estimatedDelivery: 'Oct 28, 2023',\n  },/g, "    estimatedDelivery: 'Oct 28, 2023',\n    createdAt: new Date().toISOString(),\n  },");
content = content.replace(/    estimatedDelivery: 'Oct 30, 2023',\n  },/g, "    estimatedDelivery: 'Oct 30, 2023',\n    createdAt: new Date().toISOString(),\n  },");

// if there's any double createdAt
// no wait, just put it at the very end of the order obj
content = content.replace(/    orderNumber: 'ORD-7S-8829',/g, "    createdAt: new Date().toISOString(),\n    orderNumber: 'ORD-7S-8829',");
content = content.replace(/    orderNumber: 'ORD-7S-8830',/g, "    createdAt: new Date().toISOString(),\n    orderNumber: 'ORD-7S-8830',");
content = content.replace(/    orderNumber: 'ORD-7S-8831',/g, "    createdAt: new Date().toISOString(),\n    orderNumber: 'ORD-7S-8831',");

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed final!');
