const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

const targetContent = `const [activeTab, setActiveTab] = useState<'products' | 'combos' | 'orders' | 'accounts' | 'settings' | 'ai-tools'>('analytics');`;
const replacement = `const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'combos' | 'orders' | 'accounts' | 'settings' | 'ai-tools'>('analytics');`;

// Let's replace the whole useState line just in case the previous replacement failed
const regex = /const \[activeTab, setActiveTab\] = useState<[^>]+>\('[^']+'\);/;
code = code.replace(regex, replacement);

fs.writeFileSync('src/pages/AdminPage.tsx', code);
