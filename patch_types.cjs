const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');
code = code.replace(
  /paymentMethod: 'razorpay' \| 'razorpay_test';/,
  `paymentMethod: 'razorpay' | 'razorpay_test' | 'UPI QR' | 'UPI ID' | 'Net Banking';`
);
fs.writeFileSync('src/types/index.ts', code);
