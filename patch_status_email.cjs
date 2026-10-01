const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /switch \(status\) {[\s\S]*?case 'cancelled':[\s\S]*?break;\s*}/,
  `switch (status) {
      case 'Processing':
      case 'Packed':
        statusMessage = "is now being processed and packed by our nursery team.";
        break;
      case 'Shipped':
      case 'Dispatched':
        statusMessage = "has been dispatched and is on its way to you!";
        if (trackingNumber) {
          trackingInfo = \`
            <div style="background-color: #ECFDF5; border: 1px solid #059669; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <h3 style="margin: 0 0 8px; color: #064e3b; font-size: 16px;">Tracking Details</h3>
              <p style="margin: 0 0 4px; color: #0f172a; font-size: 14px;"><strong>Courier:</strong> \${courierPartner || 'Standard Shipping'}</p>
              <p style="margin: 0; color: #0f172a; font-size: 14px;"><strong>Tracking Number:</strong> <span style="font-family: monospace; font-size: 16px; font-weight: bold;">\${trackingNumber}</span></p>
            </div>
          \`;
        }
        break;
      case 'Delivered':
        statusMessage = "has been successfully delivered. Happy growing!";
        break;
      case 'Cancelled':
        statusMessage = "has been cancelled.";
        break;
      default:
        statusMessage = \`has been updated to: \${status}\`;
        break;
    }`
);

fs.writeFileSync('server.ts', code);
