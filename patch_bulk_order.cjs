const fs = require('fs');
const filePath = 'src/pages/AdminPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add state for selectedOrderIds
content = content.replace(
  `  const [selectedComboIds, setSelectedComboIds] = useState<string[]>([]);`,
  `  const [selectedComboIds, setSelectedComboIds] = useState<string[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);`
);

// 2. Add functions for toggling and bulk updating
const bulkFunctions = `
  const toggleOrderSelection = (id: string) => {
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(oId => oId !== id) : [...prev, id]
    );
  };

  const toggleAllOrders = () => {
    if (selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    }
  };

  const handleBulkUpdateOrderStatus = (status: OrderStatus) => {
    if (selectedOrderIds.length === 0) return;
    selectedOrderIds.forEach(id => {
      updateOrderStatus(id, status);
    });
    setSelectedOrderIds([]);
    addToast({ title: 'Status Updated', message: \`Updated \${selectedOrderIds.length} orders to \${status}.\`, type: 'success' });
  };
`;

content = content.replace(
  `  const handleExportOrdersCSV = () => {`,
  bulkFunctions + `\n  const handleExportOrdersCSV = () => {`
);

fs.writeFileSync(filePath, content);
console.log("Patched state and functions successfully.");
