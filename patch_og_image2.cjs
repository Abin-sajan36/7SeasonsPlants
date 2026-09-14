const fs = require('fs');

let comboCode = fs.readFileSync('src/pages/ComboDetailPage.tsx', 'utf8');
comboCode = comboCode.replace(
  /<meta property="og:description" content=\{combo\.shortDescription\} \/>/,
  `<meta property="og:description" content={combo.shortDescription} />
        <meta property="og:image" content={combo.images[0]} />`
);
fs.writeFileSync('src/pages/ComboDetailPage.tsx', comboCode);
