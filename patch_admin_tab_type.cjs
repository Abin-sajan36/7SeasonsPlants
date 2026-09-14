const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

const targetContent = `const [activeTab, setActiveTab] = useState<'products' | 'combos' | 'orders' | 'accounts' | 'settings' | 'ai-tools'>('products');`;
const replacement = `const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'combos' | 'orders' | 'accounts' | 'settings' | 'ai-tools'>('analytics');`;

code = code.replace(targetContent, replacement);

fs.writeFileSync('src/pages/AdminPage.tsx', code);
