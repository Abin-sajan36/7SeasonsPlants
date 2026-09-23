import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  ShoppingBag,
  Heart,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Leaf,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';

interface LoginModalProps {
  onNavigate?: (view: string, param?: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onNavigate }) => {
  const {
    isAuthModalOpen,
    authModalReason,
    closeAuthModal,
    currentUser,
    loginCustomer,
    loginWithGoogle,
    registerCustomer,
    requestPasswordReset,
    addToast,
    authDomainNotice,
    dismissAuthDomainNotice,
  } = useStore();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHostname =
    typeof window !== 'undefined' && window.location.hostname
      ? window.location.hostname
      : '7seasonsplants.com';

  const handleCopyDomain = (domainToCopy: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(domainToCopy);
    }
    setCopiedDomain(true);
    addToast({
      type: 'success',
      title: 'Copied Domain! 📋',
      message: `${domainToCopy} copied to clipboard.`,
    });
    setTimeout(() => setCopiedDomain(false), 3000);
  };

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isAuthModalOpen) {
      setFormError(null);
      setResetSent(false);
    } else {
      setEmail('');
      setPassword('');
      setName('');
      setPhone('');
      setFormError(null);
      setMode('login');
      setResetSent(false);
    }
  }, [isAuthModalOpen]);

  // If user becomes logged in, close the modal automatically
  useEffect(() => {
    if (currentUser && isAuthModalOpen) {
      closeAuthModal();
    }
  }, [currentUser, isAuthModalOpen, closeAuthModal]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  // Determine icon & header based on reason
  const isCartReason = authModalReason.toLowerCase().includes('cart');
  const isWishlistReason = authModalReason.toLowerCase().includes('wishlist');

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const success = await loginWithGoogle();
      if (success) {
        closeAuthModal();
      }
    } catch (err: any) {
      setFormError(err?.message || 'Google sign-in could not be completed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await loginCustomer(cleanEmail, password);
      if (success) {
        closeAuthModal();
      } else {
        setFormError('Invalid email or password. Please try again or sign up.');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim().replace(/\D/g, '');

    if (!cleanName) {
      setFormError('Please enter your full name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      setFormError('Please enter a 10-digit mobile number.');
      return;
    }

    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await registerCustomer({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password,
        role: 'customer',
      });

      if (success) {
        addToast({
          type: 'success',
          title: 'Account Created 🌿',
          message: 'Welcome to 7Seasons Plants! You are now logged in.',
        });
        closeAuthModal();
      }
    } catch (err: any) {
      setFormError(err?.message || 'Could not create account. Please check details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormError('Please enter your registered email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await requestPasswordReset(cleanEmail);
      if (success) {
        setResetSent(true);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to send password reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="login-modal-overlay"
        className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        onClick={closeAuthModal}
      >
        <motion.div
          id="login-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative bg-white dark:bg-[#06120e] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-emerald-900/15 dark:border-emerald-900/40 p-6 sm:p-8 text-emerald-950 dark:text-emerald-50 my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            id="login-modal-close-btn"
            onClick={closeAuthModal}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-emerald-50 dark:bg-[#0a1f18] text-gray-500 hover:text-emerald-950 dark:hover:text-emerald-100 flex items-center justify-center transition-colors cursor-pointer border border-emerald-900/10 dark:border-emerald-900/30 shadow-xs"
            aria-label="Close login dialog"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Context Badge & Icon */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white flex items-center justify-center shadow-md mb-3 border border-emerald-500/30">
              {isCartReason ? (
                <ShoppingBag className="w-7 h-7" />
              ) : isWishlistReason ? (
                <Heart className="w-7 h-7 fill-white" />
              ) : (
                <Leaf className="w-7 h-7" />
              )}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>
                {isCartReason
                  ? 'Shopping Cart'
                  : isWishlistReason
                  ? 'Botanical Wishlist'
                  : 'Customer Account'}
              </span>
            </div>

            <h3 className="text-xl font-black text-emerald-950 dark:text-emerald-50 tracking-tight">
              {mode === 'login'
                ? 'Sign In to Continue'
                : mode === 'register'
                ? 'Create Customer Account'
                : 'Reset Password'}
            </h3>

            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-xs leading-relaxed">
              {authModalReason || 'Please sign in to access your garden bag, wishlist, and tracking.'}
            </p>
          </div>

          {/* Mode Tabs (Sign In / Register) */}
          {mode !== 'forgot' && (
            <div className="flex bg-gray-100 dark:bg-[#0a1f18] p-1 rounded-xl mb-5 border border-emerald-900/10 dark:border-emerald-900/30">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setFormError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-emerald-900 dark:hover:text-emerald-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setFormError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-emerald-900 dark:hover:text-emerald-200'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Error Message Box */}
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{formError}</span>
            </div>
          )}

          {/* DOMAIN AUTHORIZATION GUIDANCE BANNER (when Google OAuth domain whitelist is required) */}
          {authDomainNotice?.show && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800/70 shadow-xs text-left">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Google Sign-In Domain Whitelist Required</span>
                </div>
                <button
                  type="button"
                  onClick={() => dismissAuthDomainNotice()}
                  className="text-amber-700 hover:text-amber-950 dark:text-amber-400 p-0.5 cursor-pointer"
                  title="Dismiss notice"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed mb-2.5">
                Firebase restricts Google sign-in from this deployment until added to Authorized Domains in the Firebase Console:
              </p>

              <div className="flex items-center flex-wrap gap-1.5 mb-2.5">
                <code className="text-[11px] font-mono bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded text-amber-950 dark:text-amber-100 font-bold">
                  {authDomainNotice?.domain || currentHostname}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopyDomain(authDomainNotice?.domain || currentHostname)}
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors cursor-pointer"
                >
                  {copiedDomain ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedDomain ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={authDomainNotice?.consoleUrl || `https://console.firebase.google.com/project/${authDomainNotice?.projectId || 'season-445ff'}/authentication/settings`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-white dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <span>Firebase Console</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          )}

          {/* ONE-CLICK GOOGLE SIGN IN (shown on login/register) */}
          {mode !== 'forgot' && (
            <div className="space-y-4">
              <button
                id="login-modal-google-btn"
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-[#0a1f18] border border-gray-300 dark:border-emerald-900/40 rounded-xl text-gray-700 dark:text-gray-200 font-bold text-xs hover:bg-gray-50 dark:hover:bg-[#123126] transition-all shadow-xs disabled:opacity-60 cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200 dark:bg-emerald-900/30"></div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  OR USE EMAIL
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-emerald-900/30"></div>
              </div>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F4FAF5] dark:bg-[#0a1f18] text-xs text-emerald-950 dark:text-emerald-50 rounded-xl border border-emerald-900/15 dark:border-emerald-900/40 focus:border-emerald-600 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setFormError(null);
                    }}
                    className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F4FAF5] dark:bg-[#0a1f18] text-xs text-emerald-950 dark:text-emerald-50 rounded-xl border border-emerald-900/15 dark:border-emerald-900/40 focus:border-emerald-600 outline-hidden font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In & Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anand Vasu"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F4FAF5] dark:bg-[#0a1f18] text-xs text-emerald-950 dark:text-emerald-50 rounded-xl border border-emerald-900/15 dark:border-emerald-900/40 focus:border-emerald-600 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F4FAF5] dark:bg-[#0a1f18] text-xs text-emerald-950 dark:text-emerald-50 rounded-xl border border-emerald-900/15 dark:border-emerald-900/40 focus:border-emerald-600 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Mobile Number (10-digits)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F4FAF5] dark:bg-[#0a1f18] text-xs text-emerald-950 dark:text-emerald-50 rounded-xl border border-emerald-900/15 dark:border-emerald-900/40 focus:border-emerald-600 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F4FAF5] dark:bg-[#0a1f18] text-xs text-emerald-950 dark:text-emerald-50 rounded-xl border border-emerald-900/15 dark:border-emerald-900/40 focus:border-emerald-600 outline-hidden font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account & Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <div className="mt-4 space-y-4">
              {resetSent ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                    Reset Link Dispatched
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    Check your email inbox for instructions to reset your password. If the mail is not there, please check your <strong>spam</strong> folder.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setResetSent(false);
                    }}
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 underline cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Your Registered Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#F4FAF5] dark:bg-[#0a1f18] text-xs text-emerald-950 dark:text-emerald-50 rounded-xl border border-emerald-900/15 dark:border-emerald-900/40 focus:border-emerald-600 outline-hidden font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Password Reset Link'}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setFormError(null);
                      }}
                      className="text-xs font-semibold text-gray-500 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer Security Badge */}
          <div className="mt-6 pt-4 border-t border-emerald-900/10 dark:border-emerald-900/30 flex items-center justify-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Encrypted & secure botanical account • 7Seasons Nursery</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
