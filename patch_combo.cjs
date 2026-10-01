const fs = require('fs');
let code = fs.readFileSync('src/pages/ComboDetailPage.tsx', 'utf8');

code = code.replace(
  /import \{ ReviewSection \} from '\.\.\/components\/product\/ReviewSection';/,
  "import { Helmet } from 'react-helmet-async';\nimport { ReviewSection } from '../components/product/ReviewSection';"
);

code = code.replace(
  /return \(\n    <div className="bg-\[#F4FAF5\] min-h-screen py-8">/,
  `return (
    <div className="bg-[#F4FAF5] min-h-screen py-8">
      <Helmet>
        <title>{combo.name} - Buy Online | 7Seasonsplants</title>
        <meta name="description" content={combo.shortDescription} />
        <meta property="og:title" content={\`\${combo.name} | 7Seasonsplants\`} />
        <meta property="og:description" content={combo.shortDescription} />
      </Helmet>`
);

fs.writeFileSync('src/pages/ComboDetailPage.tsx', code);
