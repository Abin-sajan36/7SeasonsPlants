// Serverless Function: /api/admin/test-smtp
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-email, x-admin-role, x-is-super-admin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed. Please use POST.`,
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    
    // Authorization check
    const requesterEmail = (body.requesterEmail || req.headers['x-admin-email'] || '').toString().toLowerCase().trim();
    const requesterRole = (body.requesterRole || req.headers['x-admin-role'] || '').toString().toLowerCase().trim();
    const isSuperHeader = (req.headers['x-is-super-admin'] || '').toString().toLowerCase().trim() === 'true';
    const isSuperAdmin =
      requesterEmail === 'abinsajan36@gmail.com' ||
      requesterEmail === 'annanvasu36@gmail.com' ||
      requesterRole === 'super_admin' ||
      isSuperHeader;

    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        valid: false,
        message: 'Forbidden: Super Administrator privileges required.',
      });
    }

    const host = (body.smtpHost || process.env.SMTP_HOST || '').trim();
    const port = parseInt(body.smtpPort || process.env.SMTP_PORT || '587', 10);
    const user = (body.smtpUser || process.env.SMTP_USER || '').trim();
    const pass = (body.smtpPass || process.env.SMTP_PASS || '').trim();

    if (!host || !user || !pass) {
      return res.status(200).json({
        success: false,
        valid: false,
        message: 'Host, Username, and Password are all required to test SMTP connection.',
      });
    }

    const testTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10000,
    });

    await testTransporter.verify();
    return res.status(200).json({
      success: true,
      valid: true,
      message: `✅ SMTP Connection to ${host}:${port} successful! Authentication passed for ${user}.`,
    });
  } catch (err) {
    return res.status(200).json({
      success: true,
      valid: false,
      message: `❌ SMTP Connection Failed: ${err.message || 'Failed to authenticate'}`,
    });
  }
}
