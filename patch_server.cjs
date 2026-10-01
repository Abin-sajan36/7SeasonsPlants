const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const orderStatusApiCode = `
// Send Order Status Update Email
app.post("/api/orders/send-status-update", async (req, res) => {
  try {
    const { orderId, orderNumber, customerName, customerEmail, status, trackingNumber, courierPartner } = req.body;
    
    if (!customerEmail || !customerEmail.includes("@")) {
      return res.status(400).json({ success: false, error: "Valid email address is required" });
    }

    const transporter = getMailTransporter();
    
    if (!transporter) {
      console.log(\`[7Seasons Notifications] ✉️ Order \${orderNumber} status updated to \${status}. (No SMTP config, skipping email)\`);
      return res.json({ success: true, message: "Status logged, no email sent (SMTP not configured)" });
    }

    const fromAddress = process.env.SMTP_FROM || \`"7Seasonsplants" <\${process.env.SMTP_USER}>\`;
    
    let statusMessage = "has been updated.";
    let trackingInfo = "";
    
    switch (status) {
      case 'processing':
        statusMessage = "is now being processed by our nursery team.";
        break;
      case 'dispatched':
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
      case 'delivered':
        statusMessage = "has been successfully delivered. Happy growing!";
        break;
      case 'cancelled':
        statusMessage = "has been cancelled.";
        break;
    }

    await transporter.sendMail({
      from: fromAddress,
      to: customerEmail,
      subject: \`🌿 Update on your 7Seasonsplants Order #\${orderNumber}\`,
      html: \`
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4FAF5; margin: 0; padding: 24px; color: #064e3b;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center">
                <table width="100%" max-width="540" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; border: 1px solid rgba(20, 83, 45, 0.12); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04); overflow: hidden;">
                  <tr>
                    <td style="padding: 32px 32px 24px; text-align: center; background: linear-gradient(180deg, #ECFDF5 0%, #ffffff 100%);">
                      <span style="font-size: 40px; line-height: 1;">🌱</span>
                      <h1 style="margin: 10px 0 2px; color: #064e3b; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">7 Seasons</h1>
                      <p style="margin: 0; color: #059669; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">PLANT COMBOS • Mannarathayil Nursery</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 32px 24px;">
                      <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 18px; font-weight: 800;">Order Status Update</h2>
                      <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6;">
                        Hello <strong>\${customerName || 'Plant Lover'}</strong>,
                      </p>
                      <p style="margin: 0 0 20px; color: #475569; font-size: 14px; line-height: 1.6;">
                        Your order <strong>#\${orderNumber}</strong> \${statusMessage}
                      </p>
                      
                      \${trackingInfo}

                      <p style="margin: 0 0 12px; color: #64748b; font-size: 12px; line-height: 1.5;">
                        You can view more details about your order and its status in your account dashboard.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;">
                      <p style="margin: 0 0 4px; font-weight: 600; color: #334155;">Mannarathayil Nursery, Kerala & Tamil Nadu</p>
                      <p style="margin: 0;">WhatsApp Support: +91 95672 74176 • www.7seasonsplants.com</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      \`
    });

    console.log(\`[7Seasons Notifications] ✉️ Order \${orderNumber} status update email sent to \${customerEmail}\`);
    res.json({ success: true });
  } catch (error) {
    console.error("Error sending order status email:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});
`;

code = code.replace(
  '// Send Account Registration OTP to Email',
  orderStatusApiCode + '\n// Send Account Registration OTP to Email'
);

fs.writeFileSync('server.ts', code);
