const fs = require('fs');

let code = fs.readFileSync('src/components/common/Header.tsx', 'utf8');

// Target the Wishlist and Plant Care and Track Order buttons in the mobile menu
// They are inside <div className="space-y-1 py-1"> under the Account menu? No, mobile menu.
// Let's replace the whole block if needed, or just insert the visibility checks.

const targetWishlistMobile = `{storeSettings.menuVisibility?.wishlist !== false && (
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onNavigate('wishlist');
                      }}`;
                      
const targetTrackOrder = `<button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onNavigate('track-order');
                      }}`;

const replacementTrackOrder = `{storeSettings.menuVisibility?.trackOrder !== false && (
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onNavigate('track-order');
                      }}`;

// Plant care in account menu
const targetPlantCare = `<button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onNavigate('plant-care');
                      }}`;

const replacementPlantCare = `{storeSettings.menuVisibility?.plantCare !== false && (
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onNavigate('plant-care');
                      }}`;
                      
if (code.includes(targetTrackOrder)) {
  code = code.replace(targetTrackOrder, replacementTrackOrder);
  // Need to add closing brace for trackOrder
  code = code.replace(
    `<span>Track Order</span>\n                    </button>`,
    `<span>Track Order</span>\n                    </button>\n                    )}`
  );
}

if (code.includes(targetPlantCare)) {
  code = code.replace(targetPlantCare, replacementPlantCare);
  code = code.replace(
    `<span>Plant Care Doctor</span>\n                    </button>`,
    `<span>Plant Care Doctor</span>\n                    </button>\n                    )}`
  );
}

fs.writeFileSync('src/components/common/Header.tsx', code);
console.log('Patched Header visibility');
