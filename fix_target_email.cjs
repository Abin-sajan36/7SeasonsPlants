const fs = require('fs');
let file = 'src/context/StoreContext.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace("target?.email.toLowerCase()", "target?.email?.toLowerCase()");
fs.writeFileSync(file, code);
