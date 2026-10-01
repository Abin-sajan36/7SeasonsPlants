const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductDetailPage.tsx', 'utf8');

const targetContent = `{activeTab === 'reviews' && (
            <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-900/10 text-center">
              <Star className="w-12 h-12 text-emerald-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-emerald-950 mb-2">Customer Reviews</h3>
              <p className="text-emerald-700 max-w-md mx-auto">
                Our new integrated reviews system is launching soon. Check back later to see what other plant lovers are saying about the {product.name}.
              </p>
            </div>
          )}`;
          
const replacement = `{activeTab === 'reviews' && (
            <ReviewSection targetId={product.id} targetType="product" targetName={product.name} />
          )}`;

code = code.replace(targetContent, replacement);

fs.writeFileSync('src/pages/ProductDetailPage.tsx', code);
