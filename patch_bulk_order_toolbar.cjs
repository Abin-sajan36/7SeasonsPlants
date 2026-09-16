const fs = require('fs');
const filePath = 'src/pages/AdminPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetToolbar = `            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
              <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl w-full">`;

const replacementToolbar = `            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
              {/* Bulk Selection Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="selectAllOrders"
                      checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
                      onChange={toggleAllOrders}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="selectAllOrders" className="ml-2 text-xs font-bold text-gray-700 cursor-pointer">
                      Select All
                    </label>
                  </div>
                  <div className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600">
                    <strong className="text-emerald-950 font-bold">{filteredOrders.length}</strong> matching orders
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

              <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl w-full">`;

if (content.includes(targetToolbar)) {
  content = content.replace(targetToolbar, replacementToolbar);
  fs.writeFileSync(filePath, content);
  console.log("Patched toolbar successfully.");
} else {
  console.log("Target toolbar not found.");
}
