const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductDetailPage.tsx', 'utf8');

// 1. Remove the review tab button
code = code.replace(
  /<button\s*onClick=\{\(\) => setActiveTab\('reviews'\)\}[\s\S]*?Customer Reviews \(\{product\.reviewCount\}\)\s*<\/button>/m,
  ''
);

// 2. Remove the activeTab === 'reviews' block completely
code = code.replace(
  /\{\/\* Tab 3: Reviews \*\/\}\s*\{activeTab === 'reviews' && \([\s\S]*?\}\s*\)\}/m,
  ''
);

// 3. Add ReviewSection after the detailed tabs container (before Featured Plant Combos)
code = code.replace(
  /\{\/\* 3\. Featured Plant Combos Containing\/Complementing this plant \*\/\}/m,
  `{/* Reviews Section */}\n        <ReviewSection targetId={product.id} targetType="product" targetName={product.name} />\n\n        {/* 3. Featured Plant Combos Containing/Complementing this plant */}`
);

fs.writeFileSync('src/pages/ProductDetailPage.tsx', code);
