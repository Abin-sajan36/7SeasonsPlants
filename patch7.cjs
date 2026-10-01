const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

const target = `  const {
    cart,
    cartTotal,
    cartSubtotal,
    cartDiscount,
    cartDeliveryFee,
    appliedCoupon,
    storeSettings,
    currentUser,
    clearCart,
    removeCoupon,
  } = useStore();`;

const replacement = `  const {
    cart,
    cartTotal,
    cartSubtotal,
    cartDiscount,
    cartDeliveryFee,
    appliedCoupon,
    storeSettings,
    currentUser,
    clearCart,
    removeCoupon,
    combos,
  } = useStore();
  
  const invalidCartItems = React.useMemo(() => {
    return cart.filter(item => {
      if (item.type !== 'combo') return false;
      const combo = combos.find(c => c.id === item.id);
      if (!combo || !combo.sellableStates || combo.sellableStates.length === 0) return false;
      return !combo.sellableStates.includes(formData.state);
    });
  }, [cart, combos, formData.state]);
  `;

code = code.replace(target, replacement);

const target2 = `                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full text-sm font-black flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : \`Pay ₹\${cartTotal} & Place Order\`}
                  {!isProcessing && <ArrowRight className="w-5 h-5" />}
                </button>`;

const replacement2 = `                {invalidCartItems.length > 0 && (
                  <div className="mt-4 p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold">
                    <p>Some items in your cart cannot be delivered to {formData.state}:</p>
                    <ul className="list-disc pl-4 mt-1 opacity-80">
                      {invalidCartItems.map(item => (
                        <li key={item.id}>{item.name}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-rose-600 font-bold">Please remove them to proceed.</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || invalidCartItems.length > 0}
                  className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full text-sm font-black flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : \`Pay ₹\${cartTotal} & Place Order\`}
                  {!isProcessing && <ArrowRight className="w-5 h-5" />}
                </button>`;

code = code.replace(target2, replacement2);
fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
