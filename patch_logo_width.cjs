const fs = require('fs');
let code = fs.readFileSync('src/components/common/Logo.tsx', 'utf8');

code = code.replace(
  /sm: 'h-10',\n\s*md: 'h-14',\n\s*lg: 'h-20',\n\s*xl: 'h-32',/,
  "sm: 'w-32 h-10',\n    md: 'w-48 h-14',\n    lg: 'w-64 h-20',\n    xl: 'w-96 h-32',"
);

fs.writeFileSync('src/components/common/Logo.tsx', code);
