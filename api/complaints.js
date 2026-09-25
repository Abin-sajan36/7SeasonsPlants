// Vercel Serverless Function: /api/complaints
const complaintsStore = [];
const COMPANY_EMAIL = "mannaratharayil@gmail.com";

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Fetch complaints for Admin Grievances Desk
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      complaints: complaintsStore,
      total: complaintsStore.length,
      timestamp: new Date().toISOString(),
    });
  }

  // POST: Register customer grievance & route notification email
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const {
        name,
        email,
        phone,
        orderNumber,
        category = 'Plant Condition / Transit',
        urgency = 'Normal',
        description,
        desiredResolution = 'Replacement / Advice',
        photoAttachment,
      } = body;

      if (!name || !email || !phone || !description) {
        return res.status(400).json({
          success: false,
          error: 'Full name, email address, phone number, and description are required.',
        });
      }

      const ticketId = `CMP-${Date.now().toString().slice(-6)}`;
      const complaint = {
        id: `complaint_${Date.now()}`,
        ticketId,
        customerName: name.toString().trim(),
        customerEmail: email.toString().trim(),
        customerPhone: phone.toString().trim(),
        orderNumber: orderNumber ? orderNumber.toString().trim() : undefined,
        category: category || 'Plant Condition / Transit',
        urgency: urgency || 'Normal',
        description: description.toString().trim(),
        desiredResolution: desiredResolution || 'Replacement / Advice',
        photoAttachment: photoAttachment || null,
        status: 'open',
        companyEmail: COMPANY_EMAIL,
        createdAt: new Date().toISOString(),
      };

      complaintsStore.unshift(complaint);
      if (complaintsStore.length > 500) complaintsStore.pop();

      console.log(`[7Seasons Grievance Desk] ⚠️ Grievance #${ticketId} received from ${name} (${email})`);

      // Attempt to dispatch email via nodemailer if SMTP is configured
      let emailSent = false;
      let mailError = null;

      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          const nodemailer = await import('nodemailer');
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: `"7Seasons Grievance Desk" <${process.env.SMTP_USER}>`,
            to: COMPANY_EMAIL,
            replyTo: `${name} <${email}>`,
            subject: `🚨 [Customer Complaint #${ticketId}] ${category} - ${name} ${orderNumber ? `(Order #${orderNumber})` : ''}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #062919 0%, #0D4A2B 100%); padding: 24px; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;">Mannaratharayil Gardens LLP - Grievance Portal</h1>
                  <p style="margin: 6px 0 0; font-size: 13px; color: #a7f3d0;">New customer complaint logged for immediate resolution</p>
                </div>
                <div style="padding: 24px;">
                  <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <span style="display: inline-block; background: #dc2626; color: #ffffff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; text-transform: uppercase;">Ticket #${ticketId}</span>
                    <span style="display: inline-block; margin-left: 8px; font-size: 12px; font-weight: 600; color: #991b1b;">Urgency: ${urgency}</span>
                    <h3 style="margin: 10px 0 4px; font-size: 16px; color: #7f1d1d;">Category: ${category}</h3>
                    ${orderNumber ? `<p style="margin: 0; font-size: 13px; color: #991b1b; font-weight: 600;">Related Order: #${orderNumber}</p>` : ''}
                  </div>
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; width: 140px;">Customer Name:</td>
                      <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b;">Customer Email:</td>
                      <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${email}">${email}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b;">Phone / WhatsApp:</td>
                      <td style="padding: 8px 0; color: #0f172a; font-weight: 700;"><a href="tel:${phone}">${phone}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b;">Desired Resolution:</td>
                      <td style="padding: 8px 0; color: #059669; font-weight: 700;">${desiredResolution}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b;">Logged At:</td>
                      <td style="padding: 8px 0; color: #0f172a;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                    </tr>
                  </table>
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px;">Customer Grievance Statement</h4>
                    <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${description}</p>
                  </div>
                  ${photoAttachment ? `
                    <div style="margin-bottom: 20px;">
                      <h4 style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #475569;">Attached Photo Evidence</h4>
                      <img src="${photoAttachment}" alt="Complaint evidence" style="max-width: 100%; max-height: 350px; border-radius: 10px; border: 1px solid #cbd5e1;" />
                    </div>
                  ` : ''}
                  <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #64748b;">
                    <p style="margin: 0;">This email was automatically routed to <strong>${COMPANY_EMAIL}</strong> from the 7Seasonsplants customer grievance system.</p>
                  </div>
                </div>
              </div>
            `,
          });
          emailSent = true;
          console.log(`[7Seasons Grievance Desk] ✉️ Complaint email #${ticketId} dispatched to ${COMPANY_EMAIL}`);
        } catch (emailErr) {
          mailError = emailErr.message || 'Failed to dispatch email';
          console.warn('[7Seasons Grievance Desk] Mailer note:', mailError);
        }
      }

      return res.status(200).json({
        success: true,
        ticketId,
        sentTo: COMPANY_EMAIL,
        emailSent,
        mailError,
        complaint,
        message: `Complaint ticket #${ticketId} registered and routed to ${COMPANY_EMAIL}.`,
      });
    } catch (err) {
      console.error('[7Seasons Grievance Desk] Handler error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal server error processing complaint',
      });
    }
  }

  // PATCH: Update complaint status
  if (req.method === 'PATCH') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { id, ticketId, status } = body;
      const target = complaintsStore.find((c) => c.id === id || c.ticketId === (ticketId || id));
      if (target && status) {
        target.status = status;
        return res.status(200).json({ success: true, complaint: target });
      }
      return res.status(200).json({ success: true, message: 'Status updated' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // DELETE: Remove or dismiss complaint
  if (req.method === 'DELETE') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const targetId = body.id || body.ticketId || req.query?.id;
      const idx = complaintsStore.findIndex((c) => c.id === targetId || c.ticketId === targetId);
      if (idx !== -1) {
        complaintsStore.splice(idx, 1);
      }
      return res.status(200).json({ success: true, message: 'Complaint dismissed' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({
    success: false,
    error: `Method ${req.method} not allowed. Supported methods: GET, POST, PATCH, DELETE`,
  });
}
