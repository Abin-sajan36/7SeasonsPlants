const fs = require('fs');
let code = fs.readFileSync('src/components/common/GardenerAIChat.tsx', 'utf-8');

code = code.replace(/dark:text-gray-100/g, 'dark:text-white');

fs.writeFileSync('src/components/common/GardenerAIChat.tsx', code);
console.log("Patched dark:text-gray-100 in GardenerAIChat");
