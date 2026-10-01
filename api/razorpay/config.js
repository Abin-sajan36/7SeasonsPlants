// Vercel Serverless Function: /api/razorpay/config
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-email, x-admin-role');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TfQpwvQOSGYe9b').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || 'kYvN6D3539sjzWB8p8UNO7HR').trim();

  const requesterEmail = (req.query?.requesterEmail || req.headers['x-admin-email'] || '').toString().toLowerCase().trim();
  const requesterRole = (req.query?.requesterRole || req.headers['x-admin-role'] || '').toString().toLowerCase().trim();
  const isSuperHeader = (req.headers['x-is-super-admin'] || '').toString().toLowerCase().trim() === 'true';
  const isSuperAdmin = requesterEmail === 'abinsajan36@gmail.com' || requesterEmail === 'annanvasu36@gmail.com' || requesterRole === 'super_admin' || isSuperHeader;

  return res.status(200).json({
    success: true,
    key_id: isSuperAdmin ? keyId : (keyId ? `${keyId.slice(0, 8)}••••••••••••` : ''),
    keyId: isSuperAdmin ? keyId : (keyId ? `${keyId.slice(0, 8)}••••••••••••` : ''),
    rawKeyId: isSuperAdmin ? keyId : undefined,
    currency: 'INR',
    isSuperAdmin,
    keySecret: isSuperAdmin ? keySecret : undefined,
  });
}
