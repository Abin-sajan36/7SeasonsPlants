// Serverless Function: /api/admin/secrets
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-email, x-admin-role, x-is-super-admin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const requesterEmail = (req.query?.requesterEmail || req.headers['x-admin-email'] || '').toString().toLowerCase().trim();
  const requesterRole = (req.query?.requesterRole || req.headers['x-admin-role'] || '').toString().toLowerCase().trim();
  const isSuperHeader = (req.headers['x-is-super-admin'] || '').toString().toLowerCase().trim() === 'true';
  const isSuperAdmin =
    requesterEmail === 'abinsajan36@gmail.com' ||
    requesterEmail === 'annanvasu36@gmail.com' ||
    requesterRole === 'super_admin' ||
    isSuperHeader;

  if (!isSuperAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Secret values are strictly restricted to authorized Super Administrators.',
    });
  }

  if (req.method === 'GET') {
    const rawKeyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '').trim();
    const rawKeySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    const razorpayKeyId = rawKeyId === 'rzp_test_TfQpwvQOSGYe9b' ? '' : rawKeyId;
    const razorpayKeySecret = rawKeySecret === 'kYvN6D3539sjzWB8p8UNO7HR' ? '' : rawKeySecret;
    const razorpayWebhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();

    const smtpHost = (process.env.SMTP_HOST || '').trim();
    const smtpPort = (process.env.SMTP_PORT || '587').trim();
    const smtpUser = (process.env.SMTP_USER || '').trim();
    const smtpPass = (process.env.SMTP_PASS || '').trim();
    const smtpFrom = (process.env.SMTP_FROM || '').trim();
    const geminiApiKey = (process.env.GEMINI_API_KEY || '').trim();

    return res.status(200).json({
      success: true,
      isSuperAdmin: true,
      secrets: {
        razorpayKeyId,
        razorpayKeySecret,
        razorpayWebhookSecret,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass,
        smtpFrom,
        geminiApiKey,
      },
    });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const {
      razorpayKeyId,
      razorpayKeySecret,
      razorpayWebhookSecret,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpFrom,
      geminiApiKey,
    } = body;

    if (razorpayKeyId !== undefined) {
      process.env.RAZORPAY_KEY_ID = razorpayKeyId.trim();
      process.env.VITE_RAZORPAY_KEY_ID = razorpayKeyId.trim();
    }
    if (razorpayKeySecret !== undefined) {
      process.env.RAZORPAY_KEY_SECRET = razorpayKeySecret.trim();
    }
    if (razorpayWebhookSecret !== undefined) {
      process.env.RAZORPAY_WEBHOOK_SECRET = razorpayWebhookSecret.trim();
    }
    if (smtpHost !== undefined) process.env.SMTP_HOST = smtpHost.trim();
    if (smtpPort !== undefined) process.env.SMTP_PORT = smtpPort.trim();
    if (smtpUser !== undefined) process.env.SMTP_USER = smtpUser.trim();
    if (smtpPass !== undefined) process.env.SMTP_PASS = smtpPass.trim();
    if (smtpFrom !== undefined) process.env.SMTP_FROM = smtpFrom.trim();
    if (geminiApiKey !== undefined) process.env.GEMINI_API_KEY = geminiApiKey.trim();

    return res.status(200).json({
      success: true,
      message: 'All system secrets updated successfully.',
    });
  }

  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed.` });
}
