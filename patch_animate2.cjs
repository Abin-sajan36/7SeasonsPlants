const fs = require('fs');
let code = fs.readFileSync('src/components/product/ReviewSection.tsx', 'utf8');

const target = `<div className="flex flex-col items-center justify-center py-12 text-center transition-all duration-700 ease-out transform translate-y-0 opacity-100 scale-100">`;
const replacement = `<style>
              {\`
                @keyframes popIn {
                  0% { opacity: 0; transform: scale(0.9) translateY(10px); }
                  100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-pop-in { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
              \`}
            </style>
            <div className="flex flex-col items-center justify-center py-12 text-center animate-pop-in">`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/product/ReviewSection.tsx', code);
