const fs = require('fs');
let code = fs.readFileSync('src/components/common/Header.tsx', 'utf8');

code = code.replace(
  /<button\s*onClick=\{\(\) => \{\s*setAccountMenuOpen\(false\);\s*onNavigate\('wishlist'\);\s*\}\}[\s\S]*?<\/button>/m,
  (match) => `{storeSettings.menuVisibility?.wishlist !== false && (\n                    ${match.split('\n').join('\n                    ')}\n                  )}`
);

fs.writeFileSync('src/components/common/Header.tsx', code);
