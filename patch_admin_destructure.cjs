const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

content = content.replace(
  '    updateOrderStatus,',
  '    updateOrderStatus,\n    deleteOrder,'
);

fs.writeFileSync('src/pages/AdminPage.tsx', content);
