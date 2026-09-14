const fs = require('fs');
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

code = code.replace(
  /import \{ NewsletterSection \} from '\.\.\/components\/home\/NewsletterSection';/,
  "import { NewsletterSection } from '../components/home/NewsletterSection';\nimport { FAQSection } from '../components/home/FAQSection';"
);

code = code.replace(
  /\{\/\* 11\. Botanical VIP Newsletter \*\/\}/,
  `{/* 11. FAQ Section */}
      <FAQSection />

      {/* 12. Botanical VIP Newsletter */}`
);

fs.writeFileSync('src/pages/HomePage.tsx', code);
