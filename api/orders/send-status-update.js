// Vercel Serverless Function: /api/orders/send-status-update
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const {
      orderId,
      orderNumber,
      customerName,
      customerEmail,
      status,
      trackingNumber,
      courierPartner,
      total,
      items,
      shippingAddress,
    } = body;

    if (!customerEmail || !customerEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email address is required' });
    }

    const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = (process.env.SMTP_USER || 'mannaratharayil@gmail.com').trim();
    let pass = (process.env.SMTP_PASS || '').trim();

    // Use the active Google App Password if empty or revoked placeholder
    if (!pass || pass === 'bsey qyqn wwmh hedc') {
      pass = 'exyu mdov exwb ofej';
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10000,
    });

    const fromAddress = process.env.SMTP_FROM || `"7Seasonsplants" <${user}>`;

    const isOrderPlacement = status === 'Order Placed' || status === 'Payment Confirmed' || status === 'Confirmed';
    const emailSubject = isOrderPlacement
      ? `🌿 Order Confirmed! #${orderNumber} - 7Seasonsplants`
      : `🌿 Update on your 7Seasonsplants Order #${orderNumber}`;
    const emailHeading = isOrderPlacement ? 'Order Confirmed!' : 'Order Status Update';

    let statusMessage = 'has been updated.';
    let trackingInfo = '';

    switch (status) {
      case 'Order Placed':
      case 'Payment Confirmed':
      case 'Confirmed':
        statusMessage = 'has been successfully placed and confirmed! Our nursery team will carefully prepare and pack your live plants.';
        break;
      case 'Processing':
      case 'Packed':
        statusMessage = 'is now being processed and packed by our nursery team.';
        break;
      case 'Shipped':
      case 'Dispatched':
        statusMessage = 'has been dispatched and is on its way to you!';
        if (trackingNumber) {
          trackingInfo = `
            <div style="background-color: #ECFDF5; border: 1px solid #059669; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <h3 style="margin: 0 0 8px; color: #064e3b; font-size: 16px;">Tracking Details</h3>
              <p style="margin: 0 0 4px; color: #0f172a; font-size: 14px;"><strong>Courier:</strong> ${courierPartner || 'Standard Shipping'}</p>
              <p style="margin: 0; color: #0f172a; font-size: 14px;"><strong>Tracking Number:</strong> <span style="font-family: monospace; font-size: 16px; font-weight: bold;">${trackingNumber}</span></p>
            </div>
          `;
        }
        break;
      case 'Delivered':
        statusMessage = 'has been successfully delivered. Happy growing!';
        break;
      case 'Cancelled':
        statusMessage = 'has been cancelled.';
        break;
      default:
        statusMessage = `has been updated to: ${status}`;
        break;
    }

    // Render Items block if provided
    let itemsHtml = '';
    if (Array.isArray(items) && items.length > 0) {
      const itemsList = items
        .map(
          (it) =>
            `<li style="margin-bottom: 6px;"><strong>${it.quantity}x</strong> ${it.name} <span style="color: #059669; font-weight: 600;">(₹${(it.price || 0) * (it.quantity || 1)})</span></li>`
        )
        .join('');
      itemsHtml = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px; color: #064e3b; font-size: 14px; font-weight: 700;">Plants in Your Order:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 13px; line-height: 1.6;">
            ${itemsList}
          </ul>
          ${
            total
              ? `<div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; font-weight: 800; color: #064e3b; font-size: 15px;">
                  <span>Total Amount Paid:</span>
                  <span style="color: #059669;">₹${total}</span>
                </div>`
              : ''
          }
        </div>
      `;
    }

    // Render Shipping Address if provided
    let addressHtml = '';
    if (shippingAddress) {
      const line1 = shippingAddress.addressLine1 || shippingAddress.street || '';
      const cityDist = shippingAddress.district || shippingAddress.city || '';
      const state = shippingAddress.state || '';
      const pin = shippingAddress.pincode || '';
      addressHtml = `
        <div style="background-color: #f1f5f9; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; font-size: 12px; color: #475569; line-height: 1.5;">
          <strong style="color: #0f172a; display: block; margin-bottom: 4px;">🚚 Shipping Destination:</strong>
          ${shippingAddress.fullName || customerName || ''}<br/>
          ${line1 ? `${line1}, ` : ''}${cityDist ? `${cityDist}, ` : ''}${state ? `${state} ` : ''}${pin ? `- ${pin}` : ''}
        </div>
      `;
    }

    try {
      await transporter.sendMail({
        from: fromAddress,
        to: customerEmail,
        subject: emailSubject,
        html: `
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
                        <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 18px; font-weight: 800;">${emailHeading}</h2>
                        <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6;">
                          Hello <strong>${customerName || 'Plant Lover'}</strong>,
                        </p>
                        <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6;">
                          Your order <strong>#${orderNumber}</strong> ${statusMessage}
                        </p>
                        
                        ${itemsHtml}
                        ${addressHtml}
                        ${trackingInfo}

                        <p style="margin: 0 0 12px; color: #64748b; font-size: 12px; line-height: 1.5;">
                          You can view your order anytime by visiting the track order page or logging into your account.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;">
                        <p style="margin: 0 0 4px; font-weight: 600; color: #334155;">Mannaratharayil Gardens LLP, Kerala & Tamil Nadu</p>
                        <p style="margin: 0;">WhatsApp Support: +91 88482 76403 • www.7seasonsplants.com</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });

      return res.status(200).json({ success: true, emailSent: true, message: 'Order notification email delivered' });
    } catch (mailErr) {
      console.warn('[Vercel send-status-update] Mail warning:', mailErr?.message || mailErr);
      return res.status(200).json({
        success: true,
        emailSent: false,
        warning: mailErr?.message || 'SMTP delivery issue',
      });
    }
  } catch (err) {
    console.error('[Vercel send-status-update] Handler error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error processing status email' });
  }
}
