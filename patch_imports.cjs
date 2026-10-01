const fs = require('fs');
let code = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');
code = code.replace(/KeyRound,\n\} from 'lucide-react';/, "KeyRound,\n  Clock,\n  Box,\n} from 'lucide-react';");
fs.writeFileSync('src/pages/AccountPage.tsx', code);
