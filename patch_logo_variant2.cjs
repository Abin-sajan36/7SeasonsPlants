const fs = require('fs');

function replaceInFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/<Logo variant="dark"/g, '<Logo isLight={false}');
  fs.writeFileSync(file, code);
}

replaceInFile('src/components/admin/AdminLoginGate.tsx');
replaceInFile('src/components/common/Footer.tsx');
