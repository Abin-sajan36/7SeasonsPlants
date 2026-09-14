const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

const importStatement = `import { AnalyticsDashboard } from '../components/admin/AnalyticsDashboard';\n`;
code = code.replace(/import \{ useStore \} from '\.\.\/context\/StoreContext';/, importStatement + "import { useStore } from '../context/StoreContext';");

const targetContent = `{/* TAB 1: PRODUCTS INVENTORY */}`;
const replacement = `{/* TAB 0: ANALYTICS */}
        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {/* TAB 1: PRODUCTS INVENTORY */}`;

code = code.replace(targetContent, replacement);

fs.writeFileSync('src/pages/AdminPage.tsx', code);
