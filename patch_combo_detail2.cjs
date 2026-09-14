const fs = require('fs');
let code = fs.readFileSync('src/pages/ComboDetailPage.tsx', 'utf8');

const targetStr = `        {/* 4. More Plant Combos */}`;

const reviewsBlock = `        {/* Reviews Section */}
        <ReviewSection targetId={combo.id} targetType="combo" targetName={combo.name} />

`;

code = code.replace(targetStr, reviewsBlock + targetStr);
fs.writeFileSync('src/pages/ComboDetailPage.tsx', code);
