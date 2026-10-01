// Vercel Serverless Function: /api/razorpay/test-credentials
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const keyId = (body.keyId || process.env.RAZORPAY_KEY_ID || '').trim();
    const keySecret = (body.keySecret || process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!keyId || !keySecret) {
      return res.status(200).json({
        success: false,
        valid: false,
        error: 'Both Key ID and Key Secret are required to test credentials.',
      });
    }

    try {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: 100,
          currency: 'INR',
          receipt: `test_${Date.now()}`,
        }),
      });

      const data = await rzpResponse.json();
      if (rzpResponse.ok && data.id) {
        return res.status(200).json({
          success: true,
          valid: true,
          testOrderId: data.id,
          message: '✅ Razorpay credentials verified successfully and active!',
        });
      }

      const desc = data?.error?.description || data?.message || 'Authentication failed';
      return res.status(200).json({
        success: true,
        valid: false,
        error: desc,
        message: `❌ Razorpay returned: ${desc}. Please verify your Key ID & Key Secret in your Razorpay Dashboard.`,
      });
    } catch (err) {
      return res.status(200).json({
        success: true,
        valid: false,
        error: err.message,
        message: `❌ Network error connecting to Razorpay: ${err.message}`,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
