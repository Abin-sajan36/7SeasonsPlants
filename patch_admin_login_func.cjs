const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminLoginGate.tsx', 'utf8');

const targetFunc = `  const handleQuickSelectAdmin = (adminEmail: string) => {
    setEmail(adminEmail);
    setPassword('Admin@123');
    setErrorMessage(null);
  };`;

content = content.replace(targetFunc, '');
fs.writeFileSync('src/components/admin/AdminLoginGate.tsx', content);
