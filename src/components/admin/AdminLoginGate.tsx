import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  Store,
  AlertCircle,
  Users,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Mail, CheckCircle2 } from 'lucide-react';
import { Logo } from '../common/Logo';

interface AdminLoginGateProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({ onNavigate }) => {
  const { adminAccounts, loginAdmin, storeSettings } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [otpStep, setOtpStep] = useState(false);
  const [otpInput, setOtpInput] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (!otpStep) {
        const res = await verifyAdminCredentials(email, password);
        if (!res.success) {
          setErrorMessage(res.message || 'Invalid administrator credentials.');
        } else {
          try {
            const response = await fetch('/api/auth/send-registration-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: email, name: 'Admin User' }),
            });
            const data = await response.json();
            
            if (data.success) {
              setOtpStep(true);
              addToast({
                type: 'info',
                title: 'OTP Sent to Email',
                message: `Check your inbox at ${email} for the 6-digit code.`
              });
            } else {
              setErrorMessage(data.error || 'Failed to send OTP.');
            }
          } catch (err: any) { console.error("Login error:", err); 
            setErrorMessage('Network error while requesting OTP.');
          }
        }
      } else {
        try {
          const response = await fetch('/api/auth/verify-registration-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, otp: otpInput }),
          });
          const data = await response.json();
          
          if (data.success) {
            const res = await loginAdmin(email, password);
            if (!res.success) {
              setErrorMessage(res.message || 'Invalid administrator credentials.');
            }
          } else {
            setErrorMessage(data.error || 'Invalid OTP. Please try again.');
          }
        } catch (err: any) { console.error("Login error:", err); 
          setErrorMessage('Network error while verifying OTP.');
        }
      }
    } catch (err: any) { console.error("Login error:", err); 
      setErrorMessage(err?.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#F4FAF5] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Soft Botanics */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Nursery Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-white shadow-md mx-auto border border-emerald-100">
            <Logo isLight={false} size="md" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Nursery Operations Portal</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
            Admin Account Login
          </h2>
          <p className="text-xs text-gray-600 max-w-sm mx-auto">
            Restricted access for Mannaratharayil Gardens LLP staff. Sign in with your dedicated administrator credentials.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-xl space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form method="POST" action="/api/login" onSubmit={handleLoginSubmit} className="space-y-4">
            {!otpStep ? (
              <>
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center justify-between">
                <span>Admin Email ID</span>
                <span className="text-[10px] text-gray-500 font-normal">Dedicated Admin Account</span>
              </label>
              <div className="relative">
                <input
                  type="email" name="email" id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="abinsajan36@gmail.com"
                  required
                  className="w-full px-4 py-3 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm rounded-xl border border-gray-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-hidden transition-colors font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center justify-between">
                <span>Admin Password</span>
                <span className="text-[10px] text-gray-500 font-normal">Security Encrypted</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} name="password" id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-11 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm rounded-xl border border-gray-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-hidden transition-colors font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
              </>
            ) : (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-3 text-sm text-emerald-900">
                  <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">Verification Code Sent</p>
                    <p className="text-xs text-emerald-700/80 mt-0.5">Please check <strong>{email}</strong> for your 6-digit OTP code.</p>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    6-Digit OTP
                  </label>
                  <input
                    type="text" name="otp" id="otp"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 bg-gray-50 text-center text-gray-900 placeholder-gray-400 text-2xl tracking-[0.5em] rounded-xl border border-gray-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-hidden font-mono font-bold"
                  />
                </div>
              </div>
            )}
              
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{otpStep ? 'Verify OTP & Login' : 'Continue to Verification'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>


        </div>

        {/* Back to Storefront Link */}
        <div className="text-center">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-800 transition-colors cursor-pointer"
          >
            <Store className="w-4 h-4 text-emerald-700" />
            <span>← Back to {storeSettings.businessName} Storefront</span>
          </button>
        </div>
      </div>
    </div>
  );
};
