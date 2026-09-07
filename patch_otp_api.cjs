const fs = require('fs');
let code = fs.readFileSync('src/context/StoreContext.tsx', 'utf-8');

const sendOtpRegex = /const sendRegistrationOtp = async \(email: string, name\?: string\) => \{[^}]+\};/g;
const verifyOtpRegex = /const verifyRegistrationOtp = async \(email: string, otp: string\) => \{[^}]+\};/g;

const sendOtpApi = `const sendRegistrationOtp = async (email: string, name?: string) => {
    try {
      const response = await fetch('/api/auth/send-registration-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return { success: false, message: 'Network error. Could not send OTP.' };
    }
  };`;

const verifyOtpApi = `const verifyRegistrationOtp = async (email: string, otp: string) => {
    try {
      const response = await fetch('/api/auth/verify-registration-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await response.json();
      if (!data.success) {
        addToast({ type: 'error', title: 'Verification Failed', message: data.error || 'Invalid OTP' });
      }
      return data;
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      addToast({ type: 'error', title: 'Network Error', message: 'Could not verify OTP.' });
      return { success: false, message: 'Network error.' };
    }
  };`;

code = code.replace(sendOtpRegex, sendOtpApi);
code = code.replace(verifyOtpRegex, verifyOtpApi);

fs.writeFileSync('src/context/StoreContext.tsx', code);
console.log("Successfully patched OTP api endpoints");
