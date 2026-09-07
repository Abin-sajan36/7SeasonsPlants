const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'initialData.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Also update initialDailyDeals to use prod-bonsai-ficus and prod-philodendron-jiffy
content = content.replace(/prod-snake-plant-superba/g, 'prod-chrysanthemum-seedling');
content = content.replace(/prod-money-plant-golden/g, 'prod-imported-hibiscus');
content = content.replace(/prod-peace-lily-spathiphyllum/g, 'prod-sweet-alyssum');
content = content.replace(/combo-beginner-indoor-starter/g, 'combo-jiffy-bundle');
content = content.replace(/combo-pet-friendly-jungle/g, 'combo-balcony-bloomers');
content = content.replace(/combo-ultimate-air-purifier/g, 'combo-jiffy-bundle');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed references!');
