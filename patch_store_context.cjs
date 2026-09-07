const fs = require('fs');

let code = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

const updatedUpdateOrderStatus = `
  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    note?: string,
    trackingNumber?: string,
    courierPartner?: string
  ) => {
    // 1. Find the order first to get customer details
    const orderToUpdate = orders.find((o) => o.id === orderId);
    
    // 2. Update local state
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedHistory = [
            ...ord.statusHistory,
            {
              status,
              timestamp: new Date().toISOString(),
              note: note || \`Status updated to \${status}\`,
            },
          ];
          return {
            ...ord,
            orderStatus: status,
            trackingNumber: trackingNumber || ord.trackingNumber,
            courierPartner: courierPartner || ord.courierPartner,
            statusHistory: updatedHistory,
          };
        }
        return ord;
      })
    );

    addToast({
      type: 'success',
      title: 'Order Status Updated',
      message: \`Order marked as \${status}.\`,
    });

    // 3. Send email via backend if order was found
    if (orderToUpdate) {
      try {
        await fetch('/api/orders/send-status-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderToUpdate.id,
            orderNumber: orderToUpdate.orderNumber,
            customerName: orderToUpdate.customer.name,
            customerEmail: orderToUpdate.customer.email,
            status: status,
            trackingNumber: trackingNumber || orderToUpdate.trackingNumber,
            courierPartner: courierPartner || orderToUpdate.courierPartner,
          })
        });
      } catch (err) {
        console.error("Failed to send order update email", err);
      }
    }
  };
`;

// Regex to match the existing updateOrderStatus definition and replace it
const regex = /const updateOrderStatus = \(\s*orderId: string,\s*status: OrderStatus,\s*note\?: string,\s*trackingNumber\?: string,\s*courierPartner\?: string\s*\) => \{[\s\S]*?addToast\(\{[\s\S]*?\}\);\s*\};/m;

if (regex.test(code)) {
  code = code.replace(regex, updatedUpdateOrderStatus);
  fs.writeFileSync('src/context/StoreContext.tsx', code);
  console.log("Patched StoreContext successfully.");
} else {
  console.error("Failed to find updateOrderStatus in StoreContext.");
}

