const fs = require('fs');
let code = fs.readFileSync('src/components/common/Header.tsx', 'utf8');

const navLinksReplacement = `  const navLinks = [
    { label: 'Home', view: 'home', key: 'home' },
    {
      label: 'Plants',
      view: 'plants',
      hasDropdown: true,
      key: 'plants'
    },
    {
      label: 'Plant Combos',
      view: 'combos',
      badge: 'Save 35%',
      badgeColor: 'bg-rose-500 text-white shadow-xs',
      key: 'combos'
    },
    { label: 'Best Sellers', view: 'plants', param: 'filter:bestseller', key: 'bestSellers' },
    { label: 'New Arrivals', view: 'plants', param: 'filter:new', key: 'newArrivals' },
    {
      label: 'Deals',
      view: 'home',
      param: 'section:deals',
      icon: Flame,
      iconColor: 'text-amber-500',
      key: 'deals'
    },
    { label: 'Plant Care', view: 'plant-care', key: 'plantCare' },
    { label: 'Blog', view: 'blog', key: 'blog' },
    { label: 'Track Order', view: 'track-order', icon: Truck, key: 'trackOrder' },
  ].filter(link => {
    const visibility = storeSettings.menuVisibility || {};
    return visibility[link.key] !== false;
  });`;

code = code.replace(/const navLinks = \[\s*\{ label: 'Home'[\s\S]*?\]\.filter[\s\S]*?\}\);/m, navLinksReplacement);

fs.writeFileSync('src/components/common/Header.tsx', code);
