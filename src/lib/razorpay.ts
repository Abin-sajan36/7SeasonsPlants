/**
 * Razorpay Standard Web Checkout Integration
 * 
 * Follows official Razorpay Standard Checkout specifications:
 * 1. Backend order creation via POST /api/create-order
 * 2. Frontend Razorpay modal checkout via https://checkout.razorpay.com/v1/checkout.js
 * 3. Cryptographic HMAC-SHA256 signature verification via POST /api/verify-payment
 */

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface RazorpayOrderResponse {
  order_id: string;
  amount: number; // in paise
  currency: string;
  key_id?: string;
  success?: boolean;
  error?: string;
}

export interface RazorpayPaymentSuccessPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayVerifyResponse {
  success: boolean;
  verified: boolean;
  message?: string;
  error?: string;
  order_id?: string;
  payment_id?: string;
}

export interface RazorpayCheckoutParams {
  amountInPaise: number;
  currency?: string;
  receipt?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  themeColor?: string;
  onSuccess: (verifyResult: RazorpayVerifyResponse, paymentPayload: RazorpayPaymentSuccessPayload) => void;
  onError: (errorMessage: string) => void;
  onDismiss?: () => void;
}

/**
 * Dynamically loads the Razorpay checkout script if not already present.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Initiates Razorpay Standard Web Checkout.
 */
export async function startRazorpayCheckout(params: RazorpayCheckoutParams): Promise<void> {
  const {
    amountInPaise,
    currency = 'INR',
    receipt,
    prefill,
    notes,
    themeColor = '#047857',
    onSuccess,
    onError,
    onDismiss,
  } = params;

  // 1. Ensure script is loaded
  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded || !window.Razorpay) {
    onError('Failed to load Razorpay payment gateway. Please check your internet connection and try again.');
    return;
  }

  // 2. Validate amount >= 100 paise (₹1.00 minimum)
  if (!amountInPaise || amountInPaise < 100) {
    onError('Transaction amount must be at least ₹1.00 (100 paise).');
    return;
  }

  try {
    // 3. STEP 1: Create Order via Backend POST /api/create-order
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: notes || {},
      }),
    });

    const orderData: RazorpayOrderResponse = await response.json();

    if (!response.ok || !orderData.order_id) {
      onError(orderData.error || 'Failed to initialize payment with Razorpay. Please try again.');
      return;
    }

    // Get public Key ID from frontend env or server response (never Key Secret)
    const keyId =
      orderData.key_id ||
      (import.meta as any).env?.VITE_RAZORPAY_KEY_ID ||
      'rzp_test_TfQpwvQOSGYe9b';

    // 4. STEP 2: Configure Razorpay Standard Checkout Modal
    const options = {
      key: keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: '7Seasonsplants',
      description: 'Mannaratharayil Gardens LLP - Plant Order',
      image: '/logo.png',
      order_id: orderData.order_id,
      handler: async function (response: RazorpayPaymentSuccessPayload) {
        try {
          // STEP 3: Verify Payment Signature via Backend POST /api/verify-payment
          const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData: RazorpayVerifyResponse = await verifyResponse.json();

          if (verifyResponse.ok && verifyData.verified) {
            onSuccess(verifyData, response);
          } else {
            onError(verifyData.error || 'Payment verification failed: cryptographic signature mismatch.');
          }
        } catch (err: any) {
          onError('Error verifying payment with server. Please contact support if your account was debited.');
        }
      },
      prefill: {
        name: prefill?.name || '',
        email: prefill?.email || '',
        contact: prefill?.contact || '',
      },
      notes: notes || {},
      theme: {
        color: themeColor,
      },
      modal: {
        ondismiss: function () {
          if (onDismiss) {
            onDismiss();
          }
        },
      },
    };

    const rzp = new window.Razorpay(options);

    // Handle payment.failed event
    rzp.on('payment.failed', function (failureResponse: any) {
      const errorMsg =
        failureResponse?.error?.description ||
        failureResponse?.error?.reason ||
        'Payment failed or was declined by the issuing bank.';
      onError(errorMsg);
    });

    // Open Razorpay Standard Checkout Modal
    rzp.open();
  } catch (err: any) {
    onError(err.message || 'An unexpected error occurred while launching Razorpay Checkout.');
  }
}
