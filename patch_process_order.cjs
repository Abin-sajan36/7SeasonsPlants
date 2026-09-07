const fs = require('fs');

let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(
  /paymentMethod: 'razorpay',/,
  `paymentMethod: method === 'qr' ? 'UPI QR' : method === 'upi' ? 'UPI ID' : 'Net Banking',`
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
