const fs = require('fs');
let code = fs.readFileSync('src/pages/ComboDetailPage.tsx', 'utf8');

const importStatement = `import { ReviewSection } from '../components/product/ReviewSection';\n`;
code = code.replace(/import \{ useStore \} from '\.\.\/context\/StoreContext';/, importStatement + "import { useStore } from '../context/StoreContext';");

const targetContent = `{/* Replace reviews mock with the component */}`;
code = code.replace(/\{activeTab === 'reviews' && \([\s\S]*?(?=<\/div>\s*<\/div>\s*<Footer \/>)/, 
`{activeTab === 'reviews' && (
            <ReviewSection targetId={combo.id} targetType="combo" targetName={combo.name} />
          )}\n        `);

fs.writeFileSync('src/pages/ComboDetailPage.tsx', code);
