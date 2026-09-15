const fs = require('fs');
let code = fs.readFileSync('src/pages/ComboDetailPage.tsx', 'utf8');

const target = `  const {
    combos,
    products,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setIsCartOpen,
    addToast,
  } = useStore();

  const combo = combos.find((c) => c.slug === slug) || combos[0];`;

const replacement = `  const {
    combos,
    products,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setIsCartOpen,
    addToast,
    selectedDeliveryState,
  } = useStore();

  const combo = combos.find((c) => c.slug === slug) || combos[0];
  
  const isAvailableInState = React.useMemo(() => {
    if (!selectedDeliveryState) return true;
    if (!combo.sellableStates || combo.sellableStates.length === 0) return true;
    return combo.sellableStates.includes(selectedDeliveryState);
  }, [combo, selectedDeliveryState]);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/ComboDetailPage.tsx', code);
