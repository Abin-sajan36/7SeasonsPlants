const fs = require('fs');
const filePath = 'src/components/admin/AdminLoginGate.tsx';
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace(/<span>'Login to Control Center'<\/span>/, '<span>Login to Control Center</span>');
fs.writeFileSync(filePath, content);
console.log("Fixed quotes");
