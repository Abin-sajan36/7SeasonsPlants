const fs = require('fs');
let code = fs.readFileSync('src/components/home/PlantQuiz.tsx', 'utf8');

code = code.replace(/onClick=\{\(\) => window\.location\.href = `\/product\/\$\{plant\.slug\}`\}`\)\}/, `onClick={() => window.location.href = \`/product/\${plant.slug}\`}`);

fs.writeFileSync('src/components/home/PlantQuiz.tsx', code);
