const fs = require('fs');
let code = fs.readFileSync('src/components/product/ReviewSection.tsx', 'utf8');

// Replace the animate-in with just standard tailwind animations or standard css
code = code.replace(
  /<div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">/,
  '<div className="flex flex-col items-center justify-center py-12 text-center transition-all duration-700 ease-out transform translate-y-0 opacity-100 scale-100">'
);

fs.writeFileSync('src/components/product/ReviewSection.tsx', code);
