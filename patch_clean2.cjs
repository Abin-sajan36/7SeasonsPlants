const fs = require('fs');
let code = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

code = code.replace(/const removeUndefined = \(obj\) => \{/, "const removeUndefined = (obj: any): any => {");
fs.writeFileSync('src/context/StoreContext.tsx', code);
