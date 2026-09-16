const fs = require('fs');
const filePath = 'src/pages/AdminPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetOfflineToolbar = `        {activeTab === 'offline-orders' && (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-2xs flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-lg font-black text-emerald-950">Offline Orders</h3>
                <p className="text-xs text-gray-500">Import and manage orders placed outside the website.</p>
              </div>`;

const replacementOfflineToolbar = `        {activeTab === 'offline-orders' && (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-2xs flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-emerald-950">Offline Orders</h3>
                  <p className="text-xs text-gray-500">Import and manage orders placed outside the website.</p>
                </div>
                <div className="flex gap-3">
                  <input
                    type="file"
                    accept=".csv"
                    id="import-offline-csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        try {
                          const text = ev.target?.result;
                          if (typeof text !== 'string') return;
                          
                          // Parse CSV handling quotes
                          const rows = [];
                          let quote = false;
                          let col = 0, row = 0;
                          for (let c = 0; c < text.length; c++) {
                              let cc = text[c], nc = text[c+1];
                              rows[row] = rows[row] || [];
                              rows[row][col] = rows[row][col] || '';
                              if (cc == '"' && quote && nc == '"') { rows[row][col] += cc; ++c; continue; }
                              if (cc == '"') { quote = !quote; continue; }
                              if (cc == ',' && !quote) { ++col; continue; }
                              if (cc == '\\r' && nc == '\\n' && !quote) { ++row; col = 0; ++c; continue; }
                              if (cc == '\\n' && !quote) { ++row; col = 0; continue; }
                              if (cc == '\\r' && !quote) { ++row; col = 0; continue; }
                              rows[row][col] += cc;
                          }
                          
                          if (rows.length < 2) throw new Error('File is empty or has no data rows');
                          
                          const headers = rows[0].map(h => h.trim().toLowerCase());
                          const newOrders = [];
                          
                          for (let i = 1; i < rows.length; i++) {
                            const values = rows[i];
                            if (values.length < 2) continue; // Skip empty rows
                            
                            const getItem = () => {
                              const itemStr = values[headers.indexOf('item')] || values[headers.indexOf('product')] || 'Custom Order';
                              return itemStr;
                            };
                            
                            const order = {
                              id: 'offline-' + Date.now() + '-' + i,
                              orderNumber: 'OFF-' + String(Date.now()).slice(-6) + i,
                              customer: {
                                id: 'offline-customer-' + i,
                                name: values[headers.indexOf('name')] || 'Walk-in Customer',
                                email: 'offline@example.com',
                                phone: values[headers.indexOf('phone number')] || values[headers.indexOf('phone')] || '',
                                isOffline: true,
                                createdAt: new Date().toISOString()
                              },
                              shippingAddress: {
                                addressLine1: values[headers.indexOf('address')] || '',
                                addressLine2: '',
                                city: values[headers.indexOf('district')] || values[headers.indexOf('city')] || '',
                                state: values[headers.indexOf('state')] || '',
                                pincode: values[headers.indexOf('pin')] || values[headers.indexOf('pincode')] || '',
                                fullName: values[headers.indexOf('name')] || '',
                                phoneNumber: values[headers.indexOf('phone number')] || values[headers.indexOf('phone')] || ''
                              },
                              items: [
                                {
                                  id: 'offline-item',
                                  type: 'product',
                                  name: getItem(),
                                  slug: 'offline-product',
                                  price: Number(values[headers.indexOf('price')]) || 0,
                                  quantity: Number(values[headers.indexOf('quantity')]) || 1,
                                  image: ''
                                }
                              ],
                              subtotal: Number(values[headers.indexOf('price')]) || 0,
                              discount: 0,
                              total: (Number(values[headers.indexOf('price')]) || 0) * (Number(values[headers.indexOf('quantity')]) || 1),
                              orderStatus: 'Order Placed',
                              paymentStatus: 'Paid',
                              paymentMethod: 'Offline/Cash',
                              source: 'offline',
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                              orderedBy: values[headers.indexOf('order by')] || '',
                              courierPartner: values[headers.indexOf('courier')] || ''
                            };
                            newOrders.push(order);
                          }
                          
                          importOrders(newOrders);
                          addToast({ title: 'Import Successful', message: \`Imported \${newOrders.length} offline orders.\`, type: 'success' });
                        } catch (err) {
                          console.error(err);
                          addToast({ title: 'Import Failed', message: 'Could not parse CSV file.', type: 'error' });
                        }
                        e.target.value = ''; // Reset
                      };
                      reader.readAsText(file);
                    }}
                  />
                  <label htmlFor="import-offline-csv" className="px-4 py-2 bg-emerald-800 text-white rounded-full text-xs font-bold hover:bg-emerald-900 transition-colors cursor-pointer flex items-center gap-2 shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>Import CSV</span>
                  </label>
                  
                  <button
                    onClick={downloadOfflineTemplate}
                    className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold hover:bg-emerald-200 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Get Template</span>
                  </button>
                  <button
                    onClick={() => {
                      setExportStatus('all');
                      setIsExportModalOpen(true);
                    }}
                    className="px-4 py-2 bg-white text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold hover:bg-emerald-50 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Bulk Selection Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="selectAllOfflineOrders"
                      checked={selectedOrderIds.length === filteredOfflineOrders.length && filteredOfflineOrders.length > 0}
                      onChange={() => {
                        if (selectedOrderIds.length === filteredOfflineOrders.length && filteredOfflineOrders.length > 0) {
                          setSelectedOrderIds([]);
                        } else {
                          setSelectedOrderIds(filteredOfflineOrders.map(o => o.id));
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="selectAllOfflineOrders" className="ml-2 text-xs font-bold text-gray-700 cursor-pointer">
                      Select All
                    </label>
                  </div>
                  <div className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600">
                    <strong className="text-emerald-950 font-bold">{filteredOfflineOrders.length}</strong> matching orders
                  </div>
                </div>

                {selectedOrderIds.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-emerald-950 mr-2">Bulk Update Status:</span>
                    <select
                      onChange={(e) => handleBulkUpdateOrderStatus(e.target.value as any)}
                      className="px-3 py-1.5 bg-gray-50 text-emerald-950 text-xs font-bold rounded-full border border-emerald-500 focus:border-emerald-600 outline-hidden cursor-pointer"
                      defaultValue=""
                    >
                      <option value="" disabled>Select Status</option>
                      <option value="Order Placed">Order Placed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
              </div>
            </div>`;

if (content.includes('id="import-offline-csv"')) {
  // We'll replace a broader chunk to be safe.
  let startIdx = content.indexOf(`        {activeTab === 'offline-orders' && (`);
  let endIdx = content.indexOf(`            {filteredOfflineOrders.length === 0 ? (`);
  
  if (startIdx !== -1 && endIdx !== -1) {
    const chunkToReplace = content.substring(startIdx, endIdx);
    content = content.replace(chunkToReplace, replacementOfflineToolbar + '\n\n');
    fs.writeFileSync(filePath, content);
    console.log("Patched offline toolbar successfully.");
  } else {
    console.log("Offline toolbar section not found.");
  }
} else {
  console.log("Could not find import csv.");
}
