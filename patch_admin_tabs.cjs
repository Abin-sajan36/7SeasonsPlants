const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

const newTabs = `            { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
            { id: 'products', label: \`Plant Catalog (\${products.length})\`, icon: Package },`;
code = code.replace(/\{ id: 'products', label: `Plant Catalog \(\${products\.length}\)`, icon: Package \},/g, newTabs);

const newImport = `import {
  BarChart3,
  Package,`;
code = code.replace(/import \{\n  Package,/g, newImport);

fs.writeFileSync('src/pages/AdminPage.tsx', code);
