const fs = require('fs');
let code = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

code = code.replace(
  /\} else if \(initialParam === 'login' \|\| initialParam === 'auth'\) \{/,
  `} else if (initialParam === 'orders') {
      setActiveTab('orders');
    } else if (initialParam === 'login' || initialParam === 'auth') {`
);

fs.writeFileSync('src/pages/AccountPage.tsx', code);
