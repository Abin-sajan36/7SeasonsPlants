const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

const target = `              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full font-black text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4 text-amber-300" />
                <span>
                  {isProcessing ? 'Processing Order...' : \`Proceed to Payment (₹\${Math.round(cartTotal)})\`}
                </span>
              </button>`;

const replacement = `              {invalidCartItems.length > 0 && (
                <div className="mb-4 p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold">
                  <p>Some items in your cart cannot be delivered to {formData.state}:</p>
                  <ul className="list-disc pl-4 mt-1 opacity-80">
                    {invalidCartItems.map(item => (
                      <li key={item.id}>{item.name}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-rose-600 font-bold">Please remove them from your cart to proceed.</p>
                </div>
              )}
              <button
                type="submit"
                disabled={isProcessing || invalidCartItems.length > 0}
                className="w-full py-4 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full font-black text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4 text-amber-300" />
                <span>
                  {isProcessing ? 'Processing Order...' : \`Proceed to Payment (₹\${Math.round(cartTotal)})\`}
                </span>
              </button>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
