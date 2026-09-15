const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

const settingsBlock = `              <div>
                <label className="font-bold text-emerald-950 block mb-1">
                  Free Delivery Threshold (₹)
                </label>
                <input
                  type="number"
                  value={storeSettings.freeDeliveryThreshold}
                  onChange={(e) =>
                    updateStoreSettings({ freeDeliveryThreshold: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-emerald-950 block mb-1">Top Announcement Bar Text</label>
                <input
                  type="text"
                  value={storeSettings.announcementText}
                  onChange={(e) => updateStoreSettings({ announcementText: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-semibold"
                />
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-emerald-950 mb-4">Menu Visibility Configuration</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'home', label: 'Home' },
                    { id: 'plants', label: 'Plants' },
                    { id: 'combos', label: 'Plant Combos' },
                    { id: 'bestSellers', label: 'Best Sellers' },
                    { id: 'newArrivals', label: 'New Arrivals' },
                    { id: 'deals', label: 'Deals' },
                    { id: 'plantCare', label: 'Plant Care' },
                    { id: 'blog', label: 'Blog' },
                    { id: 'trackOrder', label: 'Track Order' },
                    { id: 'wishlist', label: 'Wishlist' },
                    { id: 'cart', label: 'Cart' },
                  ].map((menu) => (
                    <label key={menu.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={storeSettings.menuVisibility?.[menu.id] !== false}
                        onChange={(e) => {
                          const newVis = { ...(storeSettings.menuVisibility || {}) };
                          newVis[menu.id] = e.target.checked;
                          updateStoreSettings({ menuVisibility: newVis });
                        }}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                      />
                      <span className="text-xs font-semibold text-gray-700">{menu.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>`;

code = code.replace(/<input\s*type="text"\s*value=\{storeSettings\.whatsappNumber\}[\s\S]*?\/>\s*<\/div>\s*<\/div>\s*<\/div>/, (match) => {
  return match.replace(/<\/div>\s*<\/div>\s*<\/div>/, `</div>\n${settingsBlock}`);
});

fs.writeFileSync('src/pages/AdminPage.tsx', code);
