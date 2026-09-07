const fs = require('fs');
let code = fs.readFileSync('src/data/initialData.ts', 'utf-8');

code = code.replace(/  wishlist: \['combo-jiffy-bundle', 'prod-chrysanthemum-seedling', 'prod-sweet-alyssum'\],/g, "  wishlist: [],");

fs.writeFileSync('src/data/initialData.ts', code);
console.log("Patched initialUser wishlist");
