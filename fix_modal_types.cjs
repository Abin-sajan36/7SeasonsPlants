const fs = require('fs');

let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

// replace implicit any types
code = code.replace(
  'const PaymentModal = ({ isOpen, onClose, total, onConfirm }) => {',
  `const PaymentModal: React.FC<{ isOpen: boolean; onClose: () => void; total: number; onConfirm: (method: string) => void; }> = ({ isOpen, onClose, total, onConfirm }) => {`
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
