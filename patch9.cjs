const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

const replacement = `  const {
    cart,
    cartSubtotal,
    cartDiscount,
    cartDeliveryFee,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    currentUser,
    createOrder,
    addToast,
    storeSettings,
    combos,
  } = useStore();
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    street: '',
    apartment: '',
    city: 'Ernakulam',
    district: 'Ernakulam',
    state: 'Kerala',
    pincode: '',
    notes: '',
  });

  const invalidCartItems = React.useMemo(() => {
    return cart.filter(item => {
      if (item.type !== 'combo') return false;
      const combo = combos.find(c => c.id === item.id);
      if (!combo || !combo.sellableStates || combo.sellableStates.length === 0) return false;
      return !combo.sellableStates.includes(formData.state);
    });
  }, [cart, combos, formData.state]);`;

const target = `  const {
    cart,
    cartSubtotal,
    cartDiscount,
    cartDeliveryFee,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    currentUser,
    createOrder,
    addToast,
    storeSettings,
    combos,
  } = useStore();
  
  const invalidCartItems = React.useMemo(() => {
    return cart.filter(item => {
      if (item.type !== 'combo') return false;
      const combo = combos.find(c => c.id === item.id);
      if (!combo || !combo.sellableStates || combo.sellableStates.length === 0) return false;
      return !combo.sellableStates.includes(formData.state);
    });
  }, [cart, combos, formData?.state]);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    street: '',
    apartment: '',
    city: 'Ernakulam',
    district: 'Ernakulam',
    state: 'Kerala',
    pincode: '',
    notes: '',
  });`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
