const fs = require('fs');
let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

content = content.replace(
  'getOrderById: (id: string) => Order | undefined;',
  'deleteOrder: (orderId: string) => void;\n  getOrderById: (id: string) => Order | undefined;'
);

content = content.replace(
  'const updateOrderStatus = async (',
  'const deleteOrder = (orderId: string) => {\n    setOrders(prev => prev.filter(o => o.id !== orderId));\n  };\n\n  const updateOrderStatus = async ('
);

content = content.replace(
  'updateOrderStatus,\n        getOrderById,',
  'updateOrderStatus,\n        deleteOrder,\n        getOrderById,'
);

fs.writeFileSync('src/context/StoreContext.tsx', content);
