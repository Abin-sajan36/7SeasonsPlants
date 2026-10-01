const fs = require('fs');
const filePath = 'src/pages/AdminPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetOfflineOrderCard = `                  return (
                    <div key={ord.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between pb-3 border-b border-gray-100 gap-3">
                        <div>
                          <span className="text-xs font-black text-emerald-950">Order #{ord.orderNumber || ord.id}</span>`;

const replacementOfflineOrderCard = `                  return (
                    <div key={ord.id} className={\`bg-white rounded-3xl p-5 sm:p-6 border \${selectedOrderIds.includes(ord.id) ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20' : 'border-gray-200 shadow-2xs hover:border-emerald-200'} transition-all space-y-4 relative\`}>
                      {/* Bulk selection checkbox */}
                      <div className="absolute top-5 right-5 z-10">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(ord.id)}
                          onChange={() => toggleOrderSelection(ord.id)}
                          className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between pb-3 border-b border-gray-100 gap-3 pr-10">
                        <div>
                          <span className="text-xs font-black text-emerald-950">Order #{ord.orderNumber || ord.id}</span>`;

if (content.includes(targetOfflineOrderCard)) {
  content = content.replace(targetOfflineOrderCard, replacementOfflineOrderCard);
  fs.writeFileSync(filePath, content);
  console.log("Patched offline order card successfully.");
} else {
  console.log("Target offline order card not found.");
}
