const fs = require('fs');
let code = fs.readFileSync('src/components/common/Header.tsx', 'utf8');

code = code.replace(
  /<header className=\{`sticky top-0/,
  '<>\n      <header className={`sticky top-0'
);

code = code.replace(
  /      \{\/\* 4\. MOBILE DRAWER NAVIGATION \*\/\}/,
  '      </header>\n\n      {/* 4. MOBILE DRAWER NAVIGATION */}'
);

code = code.replace(
  /    <\/header>\n  \);/,
  '    </>\n  );'
);

fs.writeFileSync('src/components/common/Header.tsx', code);
