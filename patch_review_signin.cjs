const fs = require('fs');
let code = fs.readFileSync('src/components/product/ReviewSection.tsx', 'utf8');

code = code.replace(
  /<div className="bg-amber-50 text-amber-800 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 border border-amber-200">[\s\S]*?Sign in to leave a review[\s\S]*?<\/div>/m,
  `<button onClick={() => window.location.href = '/account'} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 border border-emerald-200 transition-colors cursor-pointer">
            <UserIcon className="w-4 h-4" />
            Sign in to leave a review
          </button>`
);

fs.writeFileSync('src/components/product/ReviewSection.tsx', code);
