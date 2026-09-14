const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /console\.log\(\`\[7Seasons Notifications\] ✉️ Order \$\{orderNumber\} status updated to \$\{status\}\. \(No SMTP config, skipping email\)\`\);/,
  `console.log(\`[7Seasons Notifications] ✉️ Order \${orderNumber} status updated to \${status}. Tracking: \${trackingNumber} (\${courierPartner}). (No SMTP config, skipping email)\`);`
);

fs.writeFileSync('server.ts', code);
