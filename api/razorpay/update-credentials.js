// Vercel Serverless Function: /api/razorpay/update-credentials
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-email, x-admin-role');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const requesterEmail = (body.requesterEmail || req.headers['x-admin-email'] || '').toString().toLowerCase().trim();
    const requesterRole = (body.requesterRole || req.headers['x-admin-role'] || '').toString().toLowerCase().trim();
    const isSuperHeader = (req.headers['x-is-super-admin'] || '').toString().toLowerCase().trim() === 'true';
    const isSuperAdmin = requesterEmail === 'abinsajan36@gmail.com' || requesterEmail === 'annanvasu36@gmail.com' || requesterRole === 'super_admin' || isSuperHeader;

    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Only authorized Super Administrators are permitted to modify secret payment credentials.',
      });
    }

    const keyId = (body.keyId || '').trim();
    const keySecret = (body.keySecret || '').trim();

    if (!keyId || !keySecret) {
      return res.status(400).json({
        success: false,
        error: 'Both Key ID and Key Secret are required.',
      });
    }

    process.env.RAZORPAY_KEY_ID = keyId;
    process.env.RAZORPAY_KEY_SECRET = keySecret;
    process.env.VITE_RAZORPAY_KEY_ID = keyId;

    return res.status(200).json({
      success: true,
      valid: true,
      keyId,
      message: 'Payment gateway secrets updated successfully!',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
