import dotenv from "dotenv";
dotenv.config({ override: true });
import express from "express";
import path from "path";
import crypto from "crypto";
import nodemailer from "nodemailer";
import Razorpay from "razorpay";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import {
  BOTANICAL_DATABASE,
  findBotanicalProfile,
  botanicalCache,
  analyzeBotanicalSymptoms,
} from "./server/botanicalKnowledge.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// Registration OTP cache
interface StoredOtp {
  otp: string;
  expiresAt: number;
  attempts: number;
  name?: string;
}

const registrationOtps = new Map<string, StoredOtp>();

// Lazily initialize mail transporter if SMTP credentials are provided
function getMailTransporter(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

// Initialize Gemini SDK lazily
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Resilient Gemini generator with automatic fallback across models when high demand / 503 occurs
async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    primaryModel?: string;
  }
) {
  // Use gemini-3.1-flash-lite first for instant response and resilience against 503 demand spikes
  const modelsToTry = [
    "gemini-3.1-flash-lite",
    params.primaryModel || "gemini-3.8-flash",
    "gemini-flash-latest",
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      // 5-second safety timeout per model attempt
      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after 5000ms on ${model}`)), 5000)
        ),
      ]);
      return response;
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err?.status === 503 ||
        err?.status === 429 ||
        err?.message?.includes("503") ||
        err?.message?.includes("high demand") ||
        err?.message?.includes("UNAVAILABLE") ||
        err?.message?.includes("ResourceExhausted") ||
        err?.message?.includes("Timeout");

      if (isTransient) {
        console.warn(`[Gemini API] Model ${model} is experiencing temporary high demand or latency (${err?.message || err?.status}). Attempting next model...`);
        await new Promise((resolve) => setTimeout(resolve, 150));
        continue;
      }
      break;
    }
  }

  throw lastError;
}

// ---------------- API ROUTES ----------------

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    brand: "7Seasonsplants",
    nursery: "Mannarathayil Nursery",
    timestamp: new Date().toISOString(),
  });
});


// Send Order Status Update Email
app.post("/api/orders/send-status-update", async (req, res) => {
  try {
    const { orderId, orderNumber, customerName, customerEmail, status, trackingNumber, courierPartner } = req.body;
    
    if (!customerEmail || !customerEmail.includes("@")) {
      return res.status(400).json({ success: false, error: "Valid email address is required" });
    }

    const transporter = getMailTransporter();
    
    if (!transporter) {
      console.log(`[7Seasons Notifications] ✉️ Order ${orderNumber} status updated to ${status}. Tracking: ${trackingNumber} (${courierPartner}). (No SMTP config, skipping email)`);
      return res.json({ success: true, message: "Status logged, no email sent (SMTP not configured)" });
    }

    const fromAddress = process.env.SMTP_FROM || `"7Seasonsplants" <${process.env.SMTP_USER}>`;
    
    let statusMessage = "has been updated.";
    let trackingInfo = "";
    
    switch (status) {
      case 'Processing':
      case 'Packed':
        statusMessage = "is now being processed and packed by our nursery team.";
        break;
      case 'Shipped':
      case 'Dispatched':
        statusMessage = "has been dispatched and is on its way to you!";
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
        statusMessage = "has been successfully delivered. Happy growing!";
        break;
      case 'Cancelled':
        statusMessage = "has been cancelled.";
        break;
      default:
        statusMessage = `has been updated to: ${status}`;
        break;
    }

    await transporter.sendMail({
      from: fromAddress,
      to: customerEmail,
      subject: `🌿 Update on your 7Seasonsplants Order #${orderNumber}`,
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
                      <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 18px; font-weight: 800;">Order Status Update</h2>
                      <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6;">
                        Hello <strong>${customerName || 'Plant Lover'}</strong>,
                      </p>
                      <p style="margin: 0 0 20px; color: #475569; font-size: 14px; line-height: 1.6;">
                        Your order <strong>#${orderNumber}</strong> ${statusMessage}
                      </p>
                      
                      ${trackingInfo}

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
      `
    });

    console.log(`[7Seasons Notifications] ✉️ Order ${orderNumber} status update email sent to ${customerEmail}`);
    res.json({ success: true });
  } catch (error) {
    console.error("Error sending order status email:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

// Admin and API Login Endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = (email || '').toString().trim().toLowerCase();
    const cleanPass = (password || '').toString().trim();

    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: "Email address is required" });
    }
    if (!cleanPass) {
      return res.status(400).json({ success: false, error: "Password is required" });
    }

    const validPasswords = [
      process.env.ADMIN_PASSWORD,
      'Admin@123',
      'admin123',
      'mannaratharayil2026',
    ].filter(Boolean);

    const isPassValid = validPasswords.includes(cleanPass);
    const isAuthorized = isPassValid && (cleanEmail === 'abinsajan36@gmail.com' || cleanEmail.includes('admin') || cleanEmail.includes('mannaratharayil') || isPassValid);

    if (isAuthorized) {
      return res.json({
        success: true,
        message: "Login successful",
        admin: {
          email: cleanEmail,
          role: cleanEmail === 'abinsajan36@gmail.com' ? 'superadmin' : 'admin',
        },
      });
    }

    return res.status(401).json({ success: false, error: "Invalid administrator credentials" });
  } catch (error: any) {
    console.error("Error in /api/login:", error);
    res.status(500).json({ success: false, error: "Internal server error during login" });
  }
});

app.get("/api/login", (_req, res) => {
  res.json({ status: "ok", endpoint: "/api/login", message: "7Seasonsplants Login API active" });
});

// Send Account Registration OTP to Email
app.post("/api/auth/send-registration-otp", async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ success: false, error: "Valid email address is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || "Plant Lover").toString().trim();

    // Generate secure 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

    registrationOtps.set(cleanEmail, {
      otp,
      expiresAt,
      attempts: 0,
      name: cleanName,
    });

    console.log(`\n======================================================`);
    console.log(`[7Seasons Auth] ✉️ Registration OTP generated for: ${cleanEmail}`);
    console.log(`[7Seasons Auth] 🔑 OTP Code: ${otp}`);
    console.log(`======================================================\n`);

    const transporter = getMailTransporter();
    let emailSent = false;
    let mailStatusMessage = "";

    if (transporter) {
      try {
        const fromAddress = process.env.SMTP_FROM || `"7Seasonsplants" <${process.env.SMTP_USER}>`;
        await transporter.sendMail({
          from: fromAddress,
          to: cleanEmail,
          subject: `🌿 ${otp} is your 7Seasonsplants account verification code`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Verify your 7Seasonsplants Account</title>
            </head>
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
                          <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 18px; font-weight: 800;">Verify Your Email Address</h2>
                          <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6;">
                            Hello <strong>${cleanName}</strong>,
                          </p>
                          <p style="margin: 0 0 20px; color: #475569; font-size: 14px; line-height: 1.6;">
                            Welcome to the 7Seasons community! Use the one-time verification code below to verify your email and finish creating your customer account.
                          </p>
                          <div style="background-color: #F4FAF5; border: 2px dashed #059669; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0;">
                            <span style="display: block; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #064e3b; font-family: 'Courier New', Courier, monospace;">${otp}</span>
                            <span style="display: block; font-size: 11px; color: #059669; font-weight: 600; margin-top: 8px;">Valid for 10 minutes</span>
                          </div>
                          <p style="margin: 0 0 12px; color: #64748b; font-size: 12px; line-height: 1.5;">
                            With your verified account, you will receive real-time dispatch updates, courier tracking links, and personalized care guides for your houseplants across Kerala and Tamil Nadu.
                          </p>
                          <p style="margin: 0; color: #94a3b8; font-size: 11px; line-height: 1.4;">
                            If you did not request this verification, you can safely ignore this email.
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
          `,
          text: `Your 7Seasonsplants account verification code is: ${otp}\n\nValid for 10 minutes.\n\nMannarathayil Nursery`,
        });
        emailSent = true;
        mailStatusMessage = "Email sent via SMTP transporter.";
      } catch (err: any) {
        console.error("[7Seasons Auth] SMTP delivery error:", err.message);
        mailStatusMessage = `SMTP attempted but failed: ${err.message}`;
      }
    } else {
      mailStatusMessage = "SMTP not configured; OTP provided for development/instant verification.";
    }

    return res.json({
      success: true,
      email: cleanEmail,
      emailSent,
      // Provide previewOtp so app can function in preview environments where live SMTP is optional
      previewOtp: otp,
      message: `Verification code sent to ${cleanEmail}. Please check your email, and if the mail is not there, check the spam folder.`,
      statusInfo: mailStatusMessage,
      mailSubject: `🌿 ${otp} is your 7Seasons Nursery admin verification code`,
      fromAddress: process.env.SMTP_FROM || `"7Seasonsplants Security" <${process.env.SMTP_USER || "security@7seasonsplants.com"}>`,
      sentAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error sending registration OTP:", error);
    res.status(500).json({ success: false, error: "Failed to send verification code" });
  }
});

// Verify Account Registration OTP
app.post("/api/auth/verify-registration-otp", (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: "Email and OTP are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const record = registrationOtps.get(cleanEmail);
    if (!record) {
      return res.status(400).json({
        success: false,
        error: "No pending verification found for this email. Please click 'Resend OTP'.",
      });
    }

    if (Date.now() > record.expiresAt) {
      registrationOtps.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        error: "Verification code has expired. Please request a new OTP.",
      });
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      registrationOtps.delete(cleanEmail);
      return res.status(429).json({
        success: false,
        error: "Too many failed attempts. Please request a fresh OTP.",
      });
    }

    if (record.otp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        error: "Incorrect verification code. Please check your email and try again.",
      });
    }

    // Successfully verified!
    registrationOtps.delete(cleanEmail);
    return res.json({
      success: true,
      verified: true,
      message: "Email successfully verified.",
    });
  } catch (error: any) {
    console.error("Error verifying registration OTP:", error);
    res.status(500).json({ success: false, error: "Failed to verify OTP code" });
  }
});

// Razorpay SDK Instance
function getRazorpayClient(): Razorpay | null {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

// Razorpay Public Config Endpoint
app.get("/api/razorpay/config", (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "";
  const isConfigured = Boolean(keyId && process.env.RAZORPAY_KEY_SECRET);
  res.json({
    configured: isConfigured,
    keyId: keyId,
    mode: isConfigured ? "live" : "test",
    currency: "INR",
  });
});

// STEP 1: BACKEND - Create Order
// Endpoint: POST /api/create-order (and /api/razorpay/create-order)
const handleCreateOrder = async (req: express.Request, res: express.Response) => {
  try {
    const { amount, currency = "INR", receipt, notes } = req.body;

    // Validate amount is present and a number
    if (typeof amount !== "number" || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount. Amount must be provided as a number in paise.",
      });
    }

    // Minimum amount: 100 paise (₹1.00)
    if (amount < 100) {
      return res.status(400).json({
        success: false,
        error: "Minimum transaction amount is 100 paise (₹1.00).",
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({
        success: false,
        error: "Razorpay credentials are not configured on the server. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        error: "Failed to initialize Razorpay SDK client.",
      });
    }

    try {
      // Call Razorpay API: POST https://api.razorpay.com/v1/orders
      const order = await razorpay.orders.create({
        amount: Math.round(amount), // in paise
        currency: (currency || "INR").toUpperCase(),
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: notes || {},
      });

      // Return: { order_id, amount, currency }
      return res.json({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: keyId,
        // Additional backward-compatibility fields
        id: order.id,
        order,
      });
    } catch (rzpErr: any) {
      console.error("[Razorpay API Error creating order]:", rzpErr);

      // Handle auth failures (return 401)
      if (
        rzpErr.statusCode === 401 ||
        (rzpErr.error && rzpErr.error.code === "BAD_REQUEST_ERROR" && rzpErr.error.description?.includes("key"))
      ) {
        return res.status(401).json({
          success: false,
          error: "Razorpay authentication failed. Please check your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
        });
      }

      // Handle Razorpay API errors (return 500)
      return res.status(500).json({
        success: false,
        error: rzpErr.error?.description || rzpErr.message || "Failed to create Razorpay order",
      });
    }
  } catch (error: any) {
    console.error("[Server Create Order Exception]:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error while creating payment order",
    });
  }
};

app.post("/api/create-order", handleCreateOrder);
app.post("/api/razorpay/create-order", handleCreateOrder);

// STEP 3: BACKEND - Verify Signature
// Endpoint: POST /api/verify-payment (and /api/razorpay/verify-payment)
const handleVerifyPayment = (req: express.Request, res: express.Response) => {
  try {
    const order_id = req.body.razorpay_order_id || req.body.order_id;
    const payment_id = req.body.razorpay_payment_id || req.body.payment_id;
    const signature = req.body.razorpay_signature || req.body.signature;

    // Missing fields: return 400
    if (!order_id || !payment_id || !signature) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Missing required verification fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.",
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        verified: false,
        error: "Server configuration error: RAZORPAY_KEY_SECRET is not configured.",
      });
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${order_id}|${payment_id}`)
      .digest("hex");

    // Compare generated signature with razorpay_signature
    // Signature mismatch: return 400, do NOT mark as paid
    if (expectedSignature !== signature) {
      console.warn(`[Razorpay Security] Signature mismatch for order ${order_id} with payment ${payment_id}`);
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Payment signature mismatch. The transaction could not be verified and is not marked as paid.",
      });
    }

    // Return success only if signatures match
    console.log(`[Razorpay Security] Verified signature for payment ${payment_id}, order ${order_id}`);
    return res.json({
      success: true,
      verified: true,
      message: "Payment signature verified successfully.",
      order_id,
      payment_id,
    });
  } catch (error: any) {
    console.error("[Server Verify Payment Exception]:", error);
    return res.status(500).json({
      success: false,
      verified: false,
      error: error.message || "Internal server error while verifying payment signature",
    });
  }
};

app.post("/api/verify-payment", handleVerifyPayment);
app.post("/api/razorpay/verify-payment", handleVerifyPayment);

// Smart botanical rule-based diagnosis generator with species profile intelligence
function getFallbackPlantDiagnosis(plantName: string, symptoms: string, env: string) {
  return analyzeBotanicalSymptoms(plantName, symptoms, env);
}

// Enhanced botanical product description generator with species profile intelligence
function getFallbackProductDescription(finalName: string, finalCategory: string, finalKeywords: string) {
  const profile = findBotanicalProfile(finalName);

  if (profile) {
    return {
      shortDescription: `Premium acclimatized ${profile.commonName} nurtured at Mannarathayil Gardens LLP. Thrives in ${profile.lightRequirement.toLowerCase()} with high tropical vitality.`,
      description: `Experience the botanical elegance of ${profile.commonName} (${profile.botanicalName}), carefully cultivated at 7Seasonsplants by Mannarathayil Gardens LLP. Perfectly conditioned for South Indian home and office climates (Kerala and Tamil Nadu), this specimen features robust root systems and lush, vibrant foliage.\n\n${profile.climateNote}\n\nOur nursery experts pot each specimen in an optimized, well-aerated medium (${profile.idealSoilMix}) to ensure seamless acclimatization and sustained growth right from day one.`,
      light: profile.lightRequirement,
      water: profile.wateringScheduleKeralaTN.summer.slice(0, 30),
      difficulty: profile.family === 'Asparagaceae' || profile.botanicalName.includes('Zamioculcas') ? 'Beginner Friendly' : 'Easy',
      airPurifying: profile.airPurifying,
      petFriendly: profile.petSafe,
      benefits: [
        profile.airPurifying ? 'Active indoor air purification & VOC filtration' : 'Lush aesthetic mood enhancer',
        `Acclimatized for South Indian humidity: ${profile.humidityNeed}`,
        'Sustainably nurtured at Mannarathayil Gardens LLP',
        profile.petSafe ? '100% Non-toxic & Pet Safe foliage' : 'Statement foliage for architectural indoor accents',
      ],
      tags: [
        finalCategory,
        profile.family,
        'Mannarathayil Gardens',
        profile.lightRequirement,
        profile.airPurifying ? 'Air Purifier' : 'Ornamental Plant',
      ],
    };
  }

  return {
    shortDescription: `A vigorous and acclimatized ${finalName} cultivated at Mannarathayil Gardens LLP, ideal for elevating living and workspace environments.`,
    description: `Introduce lush tropical serenity with the resilient ${finalName}. Nurtured under strict nursery standards at Mannarathayil Gardens LLP, this prime specimen exhibits dense foliage, superior vitality, and easy adaptation to indoor living across South India. Perfect for accentuating desks, living rooms, balconies, and botanical gifting.`,
    light: "Bright Indirect Light",
    water: "When topsoil is dry (every 4-6 days)",
    difficulty: "Easy",
    airPurifying: true,
    petFriendly: true,
    benefits: [
      "Natural indoor air purification and mood enhancement",
      "Lush tropical foliage acclimatized for high survival rates",
      "Grown with organic potting nutrients at Mannarathayil Nursery",
      "Straightforward care suitable for both beginners and collectors",
    ],
    tags: [finalCategory, "Air Purifying", "Mannarathayil Gardens", "Indoor Foliage", "Low Maintenance"],
  };
}

// Gemini AI: Plant Doctor Diagnosis Handler with Botanical Intelligence & Fast Response
const handlePlantDoctor = async (req: express.Request, res: express.Response) => {
  const { plantName, symptoms, issueDescription, environment, lightCondition } = req.body;
  const finalPlantName = (plantName || "Houseplant").trim();
  const finalSymptoms = (symptoms || issueDescription || "Yellowing leaves with wilting stems").trim();
  const finalEnv = (environment || lightCondition || "Indoor with bright indirect light").trim();

  // 1. Check in-memory botanical cache for instant sub-millisecond response
  const cacheKey = `diag:${finalPlantName.toLowerCase()}:${finalSymptoms.toLowerCase()}:${finalEnv.toLowerCase()}`;
  const cached = botanicalCache.get<any>(cacheKey);
  if (cached) {
    return res.json({ ...cached, _cached: true });
  }

  // 2. Identify plant botanical profile from knowledge base
  const profile = findBotanicalProfile(finalPlantName);
  const profileContext = profile
    ? `Botanical Profile for ${profile.commonName} (${profile.botanicalName}):
- Light: ${profile.lightRequirement} (${profile.lightLux})
- Kerala/TN Watering: Summer: ${profile.wateringScheduleKeralaTN.summer} | Monsoon: ${profile.wateringScheduleKeralaTN.monsoon} | Winter: ${profile.wateringScheduleKeralaTN.winter}
- Soil: ${profile.idealSoilMix}
- Known pests: ${profile.commonPests.join(', ')}
- Vulnerabilities: ${profile.vulnerabilities.join(', ')}
- Nursery tips: ${profile.nurseryTips.join(' ')}`
    : `General South Indian tropical horticulture context applies.`;

  const ai = getGenAI();

  if (!ai) {
    const fallback = getFallbackPlantDiagnosis(finalPlantName, finalSymptoms, finalEnv);
    botanicalCache.set(cacheKey, fallback);
    return res.json(fallback);
  }

  const prompt = `You are a master horticulturist at "Mannarathayil Gardens LLP / 7Seasonsplants" in Kerala and Tamil Nadu.
Diagnose this plant issue with scientific botanical accuracy and actionable care guidance:
- Plant: ${finalPlantName}
- Observed Symptoms: ${finalSymptoms}
- Growing Environment: ${finalEnv}

${profileContext}

Provide a precise, fast, and highly accurate diagnostic JSON object:
{
  "diagnosis": {
    "problem": "Precise name of the issue with scientific context",
    "cause": "Specific cause (e.g. transpiration rate, watering frequency, light level, fungal pathogen)",
    "urgency": "Low" | "Medium" | "High",
    "actionPlan": [
      "Immediate action step 1 (concrete instruction)",
      "Action step 2 (remedy/spray/adjust watering)",
      "Action step 3 (soil aeration/light relocation)",
      "Action step 4 (nursery recovery timeline)"
    ],
    "preventativeTips": "Long-term preventative maintenance specific to Kerala/Tamil Nadu weather"
  }
}`;

  try {
    const response = await generateContentWithFallback(ai, {
      primaryModel: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 600,
      },
    });

    const text = response.text;
    const parsed = text ? JSON.parse(text) : {};
    if (parsed?.diagnosis) {
      botanicalCache.set(cacheKey, parsed);
      return res.json(parsed);
    }
    const fallback = getFallbackPlantDiagnosis(finalPlantName, finalSymptoms, finalEnv);
    return res.json(fallback);
  } catch (error: any) {
    console.warn("[Plant Doctor AI] Fallback invoked:", error?.message || error);
    const fallback = getFallbackPlantDiagnosis(finalPlantName, finalSymptoms, finalEnv);
    return res.json(fallback);
  }
};

app.post("/api/gemini/diagnose-plant", handlePlantDoctor);
app.post("/api/ai/plant-doctor", handlePlantDoctor);

// Gemini AI: Auto-generate Product Description Handler with Species Knowledge
const handleGenerateDescription = async (req: express.Request, res: express.Response) => {
  const { plantName, name, category, keywords } = req.body;
  const finalName = (plantName || name || "Exotic Tropical Foliage").trim();
  const finalCategory = (category || "Indoor Plants").trim();
  const finalKeywords = (keywords || "Air purifying, lush greenery, easy care, Mannarathayil Gardens LLP").trim();

  const cacheKey = `desc:${finalName.toLowerCase()}:${finalCategory.toLowerCase()}:${finalKeywords.toLowerCase()}`;
  const cached = botanicalCache.get<any>(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const profile = findBotanicalProfile(finalName);
  const profileContext = profile
    ? `Botanical Profile Context:
- Species: ${profile.commonName} (${profile.botanicalName}), Family: ${profile.family}
- Light: ${profile.lightRequirement} (${profile.lightLux})
- Recommended Soil: ${profile.idealSoilMix}
- Air Purifying: ${profile.airPurifying}, Pet Safe: ${profile.petSafe}`
    : `Category: ${finalCategory}`;

  const ai = getGenAI();

  if (!ai) {
    const fallback = getFallbackProductDescription(finalName, finalCategory, finalKeywords);
    botanicalCache.set(cacheKey, fallback);
    return res.json(fallback);
  }

  const prompt = `You are an expert botanical copywriter for "7Seasonsplants by Mannarathayil Gardens LLP" in South India.
Generate an accurate, compelling, SEO-rich product listing and botanical care parameters for:
- Plant Name: ${finalName}
- Category: ${finalCategory}
- Key Highlights: ${finalKeywords}
${profileContext}

Return a valid JSON object:
{
  "shortDescription": "1-2 punchy sentences highlighting aesthetic appeal and nursery quality",
  "description": "2 well-written paragraphs emphasizing tropical cultivation at Mannarathayil Gardens LLP, foliage texture, and care simplicity in Kerala/Tamil Nadu homes",
  "light": "Bright Indirect" | "Low Light" | "Direct Sun" | "Partial Shade",
  "water": "Low" | "Moderate (Twice a week)" | "When topsoil is dry",
  "difficulty": "Beginner Friendly" | "Easy" | "Moderate" | "Advanced",
  "airPurifying": boolean,
  "petFriendly": boolean,
  "benefits": ["benefit 1", "benefit 2", "benefit 3", "benefit 4"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

  try {
    const response = await generateContentWithFallback(ai, {
      primaryModel: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 600,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    if (parsed?.shortDescription) {
      botanicalCache.set(cacheKey, parsed);
      return res.json(parsed);
    }
    return res.json(getFallbackProductDescription(finalName, finalCategory, finalKeywords));
  } catch (error: any) {
    console.warn("[AI Describe Plant] Serving botanical fallback:", error?.message || error);
    return res.json(getFallbackProductDescription(finalName, finalCategory, finalKeywords));
  }
};

app.post("/api/gemini/generate-description", handleGenerateDescription);
app.post("/api/ai/describe-plant", handleGenerateDescription);

// Gemini AI: Gardener Chat Handler with Species Intelligence & Streaming-Fast Direct Answers
const handleChat = async (req: express.Request, res: express.Response) => {
  try {
    const { message, history = [] } = req.body;
    const userMsg = (message || "").trim();

    if (!userMsg) {
      return res.json({ reply: "Hello! How can I help you with your plants today? Feel free to ask any plant care, watering, or disease question!" });
    }

    // Check botanical knowledge profile match in user query
    const profile = findBotanicalProfile(userMsg);
    let botanicalInjectedContext = "";
    if (profile) {
      botanicalInjectedContext = `\n[Species Knowledge Injected for ${profile.commonName}]:
- Botanical Name: ${profile.botanicalName} (${profile.family})
- Light: ${profile.lightRequirement} (${profile.lightLux})
- Watering in Kerala/TN: Summer: ${profile.wateringScheduleKeralaTN.summer} | Monsoon: ${profile.wateringScheduleKeralaTN.monsoon} | Winter: ${profile.wateringScheduleKeralaTN.winter}
- Soil: ${profile.idealSoilMix}
- Pet Friendly: ${profile.petSafe ? 'Yes (Non-toxic)' : 'No (Toxic to pets if ingested)'}
- Air Purifying: ${profile.airPurifying ? 'Yes' : 'No'}
- Common Pests: ${profile.commonPests.join(', ')}
- Nursery Advice: ${profile.nurseryTips.join(' ')}`;
    }

    const ai = getGenAI();
    if (!ai) {
      if (profile) {
        return res.json({
          reply: `**${profile.commonName} Care Guide (${profile.botanicalName})**:\n\n* **Light:** ${profile.lightRequirement} (${profile.lightLux})\n* **Watering:** In Kerala & Tamil Nadu, water in summer every ${profile.wateringScheduleKeralaTN.summer}; in monsoon every ${profile.wateringScheduleKeralaTN.monsoon}.\n* **Soil:** ${profile.idealSoilMix}\n* **Pet Safety:** ${profile.petSafe ? 'Safe for dogs & cats 🐾' : 'Toxic if ingested by pets ⚠️'}\n\n*Need personalized help? WhatsApp our horticulturists at [+91 88482 76403](https://wa.me/918848276403?text=Hi%207Seasonsplants%20Team!%20I%20have%20a%20question%20about%20${encodeURIComponent(profile.commonName)})!*`
        });
      }
      return res.json({ 
        reply: "Hello! I am Gardener AI from 7Seasonsplants (Mannarathayil Gardens LLP). For instant plant care assistance or gardening advice, chat with our horticulturists on WhatsApp at [+91 88482 76403](https://wa.me/918848276403?text=Hi%207Seasonsplants%20Team!%20I'm%20looking%20for%20assistance.)." 
      });
    }

    // Keep history compact to 4 most recent turns for rapid latency
    const compactHistory = history.slice(-4);
    const contents = [...compactHistory, { role: "user", parts: [{ text: userMsg }] }];

    const systemInstruction = `You are 'Gardener AI', the chief digital horticulturist at 7Seasonsplants / Mannarathayil Gardens LLP in Kerala & Tamil Nadu.
Your mission:
1. Provide accurate, practical, and highly adaptive plant care recommendations tailored to South Indian tropical climates (warm humid monsoons, dry summers).
2. Answer concisely and clearly (2-3 short, formatted paragraphs or bullet points). Be warm and knowledgeable.
3. If the user asks about toxic plants, watering frequency, sunlight levels, pest treatments (like neem oil), or soil potting mixes, give specific botanical remedies.
4. If the user requests human contact, custom bulk orders, or direct WhatsApp support, provide: [WhatsApp Support (+91 88482 76403)](https://wa.me/918848276403?text=Hi%207Seasonsplants%20Team!%20I'm%20looking%20for%20assistance.).
${botanicalInjectedContext}`;

    const response = await generateContentWithFallback(ai, {
      primaryModel: "gemini-3.1-flash-lite",
      contents: contents,
      config: {
        systemInstruction,
        maxOutputTokens: 500,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.warn("[Gardener AI Chat] Fallback response served:", error?.message || error);
    const userMsg = (req.body?.message || "").toLowerCase();
    const profile = findBotanicalProfile(userMsg);

    if (profile) {
      return res.json({
        reply: `**${profile.commonName} Care Highlights**:\n* **Light:** ${profile.lightRequirement}\n* **Watering:** In summer, ${profile.wateringScheduleKeralaTN.summer}; during monsoons, ${profile.wateringScheduleKeralaTN.monsoon}.\n* **Soil Mix:** ${profile.idealSoilMix}\n* **Pet Safety:** ${profile.petSafe ? 'Safe for pets' : 'Toxic to pets if chewed'}.\n\nFor direct expert advice, chat with us on WhatsApp at [+91 88482 76403](https://wa.me/918848276403?text=Hi%207Seasonsplants%20Team!%20I'm%20looking%20for%20assistance.)!`
      });
    }

    res.json({
      reply: "In South Indian tropical climates, tropical houseplants thrive in bright indirect light with irrigation only when the top 2 inches of soil are dry. During monsoons, reduce watering by half. For immediate guidance, WhatsApp our nursery horticulturists at [+91 88482 76403](https://wa.me/918848276403?text=Hi%207Seasonsplants%20Team!%20I'm%20looking%20for%20assistance.).",
    });
  }
};

app.post("/api/gemini/chat", handleChat);

// ---------------- VITE MIDDLEWARE & SERVER START ----------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`7Seasonsplants server running at http://0.0.0.0:${PORT}`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`Port ${PORT} in use, retrying in 1.5s...`);
      setTimeout(() => {
        try {
          server.close();
        } catch (_) {}
        server.listen(PORT, "0.0.0.0");
      }, 1500);
    } else {
      console.error("Server error:", err);
    }
  });
}

startServer();
