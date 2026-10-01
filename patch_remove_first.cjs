const fs = require('fs');
const filePath = 'src/pages/AdminPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `              <div className="space-y-4">
                {filteredOfflineOrders.map((ord) => {
                  const customerName = ord.customer?.name || ord.customer?.shippingAddress?.fullName || 'Customer';
                  const customerPhone = ord.customer?.phone || ord.customer?.shippingAddress?.phoneNumber || 'N/A';
                  const shippingAddr = ord.customer?.shippingAddress;
                  const formattedDate = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Recent';

                  return (
                    <div key={ord.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">`;

const replacement = `              <div className="space-y-4">
                {filteredOfflineOrders.map((ord, index) => {
                  if (index === 0) return null;
                  const customerName = ord.customer?.name || ord.customer?.shippingAddress?.fullName || 'Customer';
                  const customerPhone = ord.customer?.phone || ord.customer?.shippingAddress?.phoneNumber || 'N/A';
                  const shippingAddr = ord.customer?.shippingAddress;
                  const formattedDate = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Recent';

                  return (
                    <div key={ord.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content);
  console.log("Patched successfully.");
} else {
  console.log("Target not found.");
}
