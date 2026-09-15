const fs = require('fs');
let code = fs.readFileSync('src/pages/ComboDetailPage.tsx', 'utf8');

const target = `                {/* Add to Bag */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={\`w-full sm:flex-1 py-3.5 px-6 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer \${
                    isOutOfStock
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 shadow-xs'
                  }\`}
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                  <span>{isOutOfStock ? 'Combo Sold Out' : 'Add Bundle to Bag'}</span>
                </button>

                {/* Buy Now */}
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={\`w-full sm:flex-1 py-3.5 px-6 rounded-full text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer \${
                    isOutOfStock
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white shadow-md hover:shadow-lg'
                  }\`}
                >
                  <span>Buy Bundle Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>`;

const replacement = `                {!isAvailableInState ? (
                  <div className="w-full sm:flex-1 py-3.5 px-6 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all bg-amber-50 text-amber-900 border border-amber-200">
                    Not Deliverable to {selectedDeliveryState}
                  </div>
                ) : (
                  <>
                    {/* Add to Bag */}
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className={\`w-full sm:flex-1 py-3.5 px-6 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer \${
                        isOutOfStock
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 shadow-xs'
                      }\`}
                    >
                      <ShoppingBag className="w-4 h-4 text-emerald-700" />
                      <span>{isOutOfStock ? 'Combo Sold Out' : 'Add Bundle to Bag'}</span>
                    </button>

                    {/* Buy Now */}
                    <button
                      onClick={handleBuyNow}
                      disabled={isOutOfStock}
                      className={\`w-full sm:flex-1 py-3.5 px-6 rounded-full text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer \${
                        isOutOfStock
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white shadow-md hover:shadow-lg'
                      }\`}
                    >
                      <span>Buy Bundle Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/ComboDetailPage.tsx', code);
