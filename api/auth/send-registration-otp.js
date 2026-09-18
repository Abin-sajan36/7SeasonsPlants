// Vercel Serverless Function: /api/auth/send-registration-otp
import crypto from 'crypto';

// In-memory fallback map for serverless instances
const otps = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { email, name } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || 'Customer').toString().trim();
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otps.set(cleanEmail, { otp, expiresAt, name: cleanName });

    console.log(`[7Seasons Auth] Generated OTP for ${cleanEmail}: ${otp}`);

    // If SMTP credentials exist, attempt to send email
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

        const fromAddress = process.env.SMTP_FROM || `"7Seasonsplants" <${process.env.SMTP_USER}>`;
        await transporter.sendMail({
          from: fromAddress,
          to: cleanEmail,
          subject: `🌿 ${otp} is your 7Seasonsplants account verification code`,
          text: `Your verification code is ${otp}. Valid for 10 minutes.`,
        });

        return res.status(200).json({
          success: true,
          message: `Verification code sent to ${cleanEmail}`,
        });
      } catch (mailError) {
        console.warn('SMTP dispatch failed in serverless function:', mailError);
      }
    }

    // Return success response with OTP code in development or fallback
    return res.status(200).json({
      success: true,
      message: `Verification code prepared for ${cleanEmail}. Check your email or use code: ${otp}`,
      devOtp: otp,
    });
  } catch (error) {
    console.error('Error in send-registration-otp serverless function:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate OTP' });
  }
}
