const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

code = code.replace(/<\/div>\s*\)\}\s*<\/div>\s*\{\/\* NEW\/EDIT PRODUCT MODAL \*\/\}/, '</div>\n          </div>\n        )}\n      </div>\n\n      {/* NEW/EDIT PRODUCT MODAL */}');

fs.writeFileSync('src/pages/AdminPage.tsx', code);
