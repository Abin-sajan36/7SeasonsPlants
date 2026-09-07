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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginAdmin(email, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Invalid administrator credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelectAdmin = (adminEmail: string) => {
    setEmail(adminEmail);
    setPassword('Admin@123');
    setErrorMessage(null);
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
            <Logo variant="dark" size="md" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Nursery Operations Portal</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
            Admin Account Login
          </h2>
          <p className="text-xs text-gray-600 max-w-sm mx-auto">
            Restricted access for Mannarathayil Nursery staff. Sign in with your dedicated administrator credentials.
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

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center justify-between">
                <span>Admin Email ID</span>
                <span className="text-[10px] text-gray-500 font-normal">Dedicated Admin Account</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="admin@7seasonsplant.com"
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
                  type={showPassword ? 'text' : 'password'}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating Admin...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Access Nursery Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Select Admin Account */}
          <div className="pt-2 border-t border-gray-100 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>Nursery Admin Account</span>
              </span>
              <span className="text-[10px] text-gray-400 font-normal">Click to fill</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelectAdmin('admin@7seasonsplant.com')}
                className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  email.toLowerCase() === 'admin@7seasonsplant.com'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                    : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-black text-xs flex items-center justify-center shrink-0">
                    7S
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-emerald-950 leading-tight truncate">7Seasons Nursery Admin</p>
                    <p className="text-[10px] text-gray-500 truncate">admin@7seasonsplant.com</p>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                  Super Admin
                </span>
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-gray-600 flex items-start gap-2">
              <KeyRound className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                <strong>Login Credentials:</strong> <span className="font-semibold text-emerald-950">admin@7seasonsplant.com</span> / Password: <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-950 font-mono font-bold">Admin@123</code>
              </span>
            </div>
          </div>
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
