const fs = require('fs');
let code = fs.readFileSync('src/components/home/PlantQuiz.tsx', 'utf8');

code = code.replace(/import \{ useNavigate \} from 'react-router-dom';/, "");
code = code.replace(/const navigate = useNavigate\(\);/, "");
code = code.replace(/onClick=\{.*?navigate.*?\}/g, `onClick={() => window.location.href = \`/product/\${plant.slug}\`}`);

fs.writeFileSync('src/components/home/PlantQuiz.tsx', code);
