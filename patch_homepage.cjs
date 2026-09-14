const fs = require('fs');
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

code = code.replace(
  /import \{ FeaturedCombosSection \} from '\.\.\/components\/home\/FeaturedCombosSection';/,
  "import { FeaturedCombosSection } from '../components/home/FeaturedCombosSection';\nimport { PlantQuiz } from '../components/home/PlantQuiz';"
);

code = code.replace(
  /\{\/\* 6\. Best Selling Plants Grid \*\/\}/,
  `{/* 6. Plant Finder Quiz */}
      <PlantQuiz />

      {/* 7. Best Selling Plants Grid */}`
);

code = code.replace(
  /\{\/\* 7\. Plant Doctor AI & Care Guidance \*\/\}/,
  `{/* 8. Plant Doctor AI & Care Guidance */}`
);

code = code.replace(
  /\{\/\* 8\. Verified Customer Reviews \*\/\}/,
  `{/* 9. Verified Customer Reviews */}`
);

code = code.replace(
  /\{\/\* 9\. Instagram Nursery Feed \*\/\}/,
  `{/* 10. Instagram Nursery Feed */}`
);

code = code.replace(
  /\{\/\* 10\. Botanical VIP Newsletter \*\/\}/,
  `{/* 11. Botanical VIP Newsletter */}`
);

fs.writeFileSync('src/pages/HomePage.tsx', code);
