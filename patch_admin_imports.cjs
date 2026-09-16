const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminLoginGate.tsx', 'utf8');

content = content.replace("  Users,\n  KeyRound,\n", "");
content = content.replace("  Users,\n  KeyRound\n", "");

fs.writeFileSync('src/components/admin/AdminLoginGate.tsx', content);
