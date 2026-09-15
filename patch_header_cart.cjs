const fs = require('fs');
let code = fs.readFileSync('src/components/common/Header.tsx', 'utf8');

code = code.replace(
  /\{\/\* Cart Button \*\/\}\s*<button[\s\S]*?<\/button>/m,
  (match) => `{storeSettings.menuVisibility?.cart !== false && (\n            ${match.split('\n').join('\n            ')}\n          )}`
);

fs.writeFileSync('src/components/common/Header.tsx', code);
