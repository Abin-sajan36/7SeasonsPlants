const fs = require('fs');
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

const importStatement = `import { PlantQuiz } from '../components/home/PlantQuiz';\n`;
code = code.replace(/import \{ Link \} from 'react-router-dom';/, importStatement + "import { Link } from 'react-router-dom';");

const targetContent = `{/* Collections/Categories */}`;
const replacement = `{/* Plant Match Quiz */}
      <PlantQuiz />

      {/* Collections/Categories */}`;

code = code.replace(targetContent, replacement);

fs.writeFileSync('src/pages/HomePage.tsx', code);
