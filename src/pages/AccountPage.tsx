import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Package,
  MapPin,
  LogOut,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Heart,
  ShieldCheck,
  Phone,
  Mail,
  ShoppingBag,
  ExternalLink,
  Save,
  Check,
  Camera,
  RotateCw,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CustomerAddress } from '../types';
import { Logo } from '../components/common/Logo';

interface AccountPageProps {
  initialParam?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ initialParam, onNavigate }) => {
  const {
    currentUser,
    currentAdmin,
    isAdminAuthenticated,
    orders,
    wishlist,
    products,
    combos,
    loginCustomer,
    loginWithGoogle,
    logoutCustomer,
    sendRegistrationOtp,
    verifyRegistrationOtp,
    registerCustomer,
    requestPasswordReset,
    verifyPasswordResetOtp,
    updatePassword,
    updateUserProfile,
    addUserAddress,
    deleteUserAddress,
    setDefaultUserAddress,
    toggleWishlist,
    addToast,
    addToCart,
  } = useStore();

  const [authMode, setAuthMode] = useState<'login' | 'register'>(
    initialParam === 'register' ? 'register' : 'login'
  );

  // Form Inputs for Auth
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [selectedState, setSelectedState] = useState<'Kerala' | 'Tamil Nadu'>('Kerala');
  const [selectedDistrict, setSelectedDistrict] = useState('Ernakulam');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration OTP Flow
  const [registerStep, setRegisterStep] = useState<'form' | 'verify_otp'>('form');
  const [registrationOtp, setRegistrationOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [otpResendCountdown, setOtpResendCountdown] = useState<number>(0);

  useEffect(() => {
    if (otpResendCountdown <= 0) return;
    const interval = setInterval(() => {
      setOtpResendCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpResendCountdown]);

  // Password Reset Flow
  type ResetFlowStep = 'none' | 'request' | 'verify' | 'new_password';
  const [resetStep, setResetStep] = useState<ResetFlowStep>('none');
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'settings'>('orders');

  // Address Modal/Form State
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddressData, setNewAddressData] = useState({
    fullName: currentUser?.name || '',
    phoneNumber: currentUser?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: 'Ernakulam',
    district: 'Ernakulam',
    state: 'Kerala' as 'Kerala' | 'Tamil Nadu',
    pincode: '',
    isDefault: false,
  });

  // Edit Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    profileImage: currentUser?.profileImage || '',
  });

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        email: currentUser.email || '',
        profileImage: currentUser.profileImage || '',
      });
      setNewAddressData((prev) => ({
        ...prev,
        fullName: currentUser.name || '',
        phoneNumber: currentUser.phone || '',
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (initialParam === 'register') {
      setAuthMode('register');
    } else if (initialParam === 'login' || initialParam === 'auth') {
      setAuthMode('login');
    }
  }, [initialParam]);

  const keralaDistricts = [
    'Alappuzha',
    'Ernakulam',
    'Idukki',
    'Kannur',
    'Kasaragod',
    'Kollam',
    'Kottayam',
    'Kozhikode',
    'Malappuram',
    'Palakkad',
    'Pathanamthitta',
    'Thiruvananthapuram',
    'Thrissur',
    'Wayanad',
  ];

  const tamilNaduDistricts = [
    'Chennai',
    'Coimbatore',
    'Madurai',
    'Tiruchirappalli',
    'Salem',
    'Tirunelveli',
    'Erode',
    'Vellore',
    'Thoothukudi',
    'Dindigul',
    'Thanjavur',
    'Ranipet',
    'Virudhunagar',
    'Karur',
    'Nilgiris',
    'Kanyakumari',
    'Kanchipuram',
    'Tiruvallur',
  ];

  // Filter orders related to current user
  const customerOrders = orders.filter((o) => {
    if (!currentUser) return false;
    const userEmail = (currentUser.email || '').toLowerCase();
    const userPhone = currentUser.phone || '';
    const userId = currentUser.id || '';

    const orderEmail = (o.customer?.email || (o as any).customerEmail || '').toLowerCase();
    const orderPhone = o.customer?.phone || (o as any).customerPhone || '';
    const orderCustomerId = (o as any).customerId || '';

    return (
      (orderEmail && orderEmail === userEmail) ||
      (orderPhone && orderPhone === userPhone) ||
      (orderCustomerId && orderCustomerId === userId)
    );
  });

  // Get Wishlist Items
  const wishlistItems = [
    ...products.filter((p) => wishlist.includes(p.id)).map((p) => ({ ...p, type: 'product' as const })),
    ...combos.filter((c) => wishlist.includes(c.id)).map((c) => ({ ...c, type: 'combo' as const })),
  ];

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier.trim()) {
      addToast({ type: 'error', title: 'Required', message: 'Please enter your email or mobile number.' });
      return;
    }
    setIsSubmitting(true);
    const success = await requestPasswordReset(resetIdentifier);
    setIsSubmitting(false);
    if (success) {
      setResetStep('verify');
    }
  };

  const handleResetVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp.trim()) {
      addToast({ type: 'error', title: 'Required', message: 'Please enter the OTP.' });
      return;
    }
    setIsSubmitting(true);
    const success = await verifyPasswordResetOtp(resetIdentifier, resetOtp);
    setIsSubmitting(false);
    if (success) {
      setResetStep('new_password');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      addToast({ type: 'error', title: 'Password Required', message: 'Password should be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      addToast({ type: 'error', title: 'Passwords Mismatch', message: 'The confirmed password does not match.' });
      return;
    }
    setIsSubmitting(true);
    const success = await updatePassword(resetIdentifier, newPassword);
    setIsSubmitting(false);
    if (success) {
      setResetStep('none');
      setAuthMode('login');
      setEmailInput(resetIdentifier);
      setPasswordInput('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      addToast({
        title: 'Missing Email',
        message: 'Please enter your registered email address.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanEmail = emailInput.trim().toLowerCase();
      const success = await loginCustomer(emailInput, passwordInput);
      if (success) {
        setEmailInput('');
        setPasswordInput('');
        if (cleanEmail === 'admin@7seasonsplant.com' || cleanEmail === 'admin@7seasonsplants.com') {
          onNavigate('admin');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameInput.trim()) {
      addToast({
        title: 'Name Required',
        message: 'Please enter your full name.',
        type: 'error',
      });
      return;
    }

    if (!emailInput.trim() || !emailInput.includes('@') || !emailInput.includes('.')) {
      addToast({
        title: 'Valid Email Required',
        message: 'Please enter a valid email address for your verification OTP.',
        type: 'error',
      });
      return;
    }

    if (!phoneInput.trim() || phoneInput.replace(/\D/g, '').length < 10) {
      addToast({
        title: '10-Digit Mobile Number Required',
        message: 'Please provide a 10-digit mobile number for dispatch updates.',
        type: 'error',
      });
      return;
    }

    if (!passwordInput || passwordInput.length < 6) {
      addToast({
        title: 'Password Required',
        message: 'Password should be at least 6 characters.',
        type: 'error',
      });
      return;
    }

    if (passwordInput !== confirmPasswordInput) {
      addToast({
        title: 'Passwords Mismatch',
        message: 'The confirmed password does not match.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await sendRegistrationOtp(emailInput.trim(), nameInput.trim());
      if (result.success) {
        setRegisterStep('verify_otp');
        setRegistrationOtp(['', '', '', '', '', '']);
        setOtpResendCountdown(60);
        if (result.previewOtp) {
          console.log("OTP logic active via backend");
        }
      } else {
        addToast({
          title: 'Error',
          message: result.message,
          type: 'error',
        });
      }
    } catch (error: any) {
      addToast({
        title: 'Error',
        message: 'Failed to send OTP. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendRegistrationOtp = async () => {
    if (otpResendCountdown > 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await sendRegistrationOtp(emailInput.trim(), nameInput.trim());
      if (result.success) {
        setOtpResendCountdown(60);
        if (result.previewOtp) {
          console.log("OTP Resent via backend");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');
    if (cleanVal.length > 1) {
      const digits = cleanVal.slice(0, 6).split('');
      const newOtp = [...registrationOtp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setRegistrationOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      const nextInput = document.getElementById(`reg-otp-input-${nextIndex}`);
      nextInput?.focus();
      return;
    }

    const newOtp = [...registrationOtp];
    newOtp[index] = cleanVal;
    setRegistrationOtp(newOtp);

    if (cleanVal && index < 5) {
      const nextInput = document.getElementById(`reg-otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !registrationOtp[index] && index > 0) {
      const prevInput = document.getElementById(`reg-otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;
    const digits = pastedData.split('');
    const newOtp = [...registrationOtp];
    digits.forEach((d, i) => {
      if (i < 6) newOtp[i] = d;
    });
    setRegistrationOtp(newOtp);
    const targetIdx = Math.min(digits.length, 5);
    const targetInput = document.getElementById(`reg-otp-input-${targetIdx}`);
    targetInput?.focus();
  };

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = registrationOtp.join('').trim();
    if (fullOtp.length !== 6) {
      addToast({
        title: '6-Digit OTP Required',
        message: 'Please enter all 6 digits of the verification code sent to your email.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const verifyResult = await verifyRegistrationOtp(emailInput.trim(), fullOtp);
      if (!verifyResult.success) {
        return;
      }

      const initialAddresses: CustomerAddress[] = [
        {
          id: `addr_${Date.now()}`,
          fullName: nameInput.trim(),
          phoneNumber: phoneInput.trim(),
          addressLine1: `${selectedDistrict} Central`,
          city: selectedDistrict,
          district: selectedDistrict,
          state: selectedState,
          pincode: selectedState === 'Kerala' ? '682030' : '641001',
          isDefault: true,
        },
      ];

      const success = await registerCustomer({
        name: nameInput.trim(),
        email: emailInput.trim(),
        phone: phoneInput.trim(),
        password: passwordInput,
        role: 'customer',
        addresses: initialAddresses,
      });

      if (success) {
        setNameInput('');
        setEmailInput('');
        setPhoneInput('');
        setPasswordInput('');
        setConfirmPasswordInput('');
        setRegisterStep('form');
        setRegistrationOtp(['', '', '', '', '', '']);
      }
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      addToast({
        title: 'Error',
        message: 'Name cannot be blank.',
        type: 'error',
      });
      return;
    }
    updateUserProfile({
      name: profileForm.name.trim(),
      phone: profileForm.phone.trim(),
      email: profileForm.email.trim(),
      profileImage: profileForm.profileImage,
    });
    addToast({
      title: 'Profile Updated',
      message: 'Your profile has been saved successfully.',
      type: 'success',
    });
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressData.fullName.trim() || !newAddressData.phoneNumber.trim() || !newAddressData.addressLine1.trim() || !newAddressData.pincode.trim()) {
      addToast({
        title: 'Incomplete Address',
        message: 'Please fill in all mandatory address fields.',
        type: 'error',
      });
      return;
    }

    addUserAddress({
      fullName: newAddressData.fullName.trim(),
      phoneNumber: newAddressData.phoneNumber.trim(),
      addressLine1: newAddressData.addressLine1.trim(),
      addressLine2: newAddressData.addressLine2.trim() || undefined,
      city: newAddressData.city.trim() || newAddressData.district,
      district: newAddressData.district,
      state: newAddressData.state,
      pincode: newAddressData.pincode.trim(),
      isDefault: newAddressData.isDefault,
    });

    setShowAddAddressModal(false);
    setNewAddressData({
      fullName: currentUser?.name || '',
      phoneNumber: currentUser?.phone || '',
      addressLine1: '',
      addressLine2: '',
      city: 'Ernakulam',
      district: 'Ernakulam',
      state: 'Kerala',
      pincode: '',
      isDefault: false,
    });
  };

  const handleReorder = (order: any) => {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach((item: any) => {
      addToCart(item, item.type || 'product', item.quantity || 1);
    });
    addToast({
      title: 'Added to Bag 🌿',
      message: `Items from Order #${order.orderNumber || order.id} added to cart.`,
      type: 'success',
    });
    onNavigate('checkout');
  };

  // 1. IF NOT LOGGED IN: SHOW AUTH CARD (LOGIN / CREATE NEW ACCOUNT)
  if (!currentUser) {
    return (
      <div className="bg-[#F4FAF5] dark:bg-[#010a07] min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center transition-colors duration-300">
        <div className="max-w-lg w-full bg-white dark:bg-[#06120e] rounded-3xl p-6 sm:p-10 border border-emerald-900/10 dark:border-emerald-900/30 shadow-xl space-y-6 transition-colors duration-300">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-white dark:bg-[#0a1f18] shadow-md mx-auto border border-emerald-100 dark:border-emerald-900/40">
              <Logo size="md" showSubtitle={false} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-50 tracking-tight">
              {authMode === 'login' ? 'Welcome Back!' : 'Create Customer Account'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
              {authMode === 'login'
                ? 'Sign in to access your plant orders, live nursery dispatches, and saved wishlists.'
                : 'Join the 7Seasons community to order hardy nursery plants with direct home delivery in Kerala & TN.'}
            </p>
          </div>

          {/* Mode Tabs */}
          {resetStep !== 'none' ? (
            <div className="space-y-4 text-xs">
              {resetStep === 'request' && (
                <form onSubmit={handleResetRequest} className="space-y-4">
                  <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-4">
                    Enter your registered email address or mobile number to receive a verification code.
                  </p>
                  <div>
                    <label className="font-bold text-emerald-950 dark:text-emerald-100 block mb-1.5">
                      Email or Mobile <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      placeholder="e.g. meera.nambiar@gmail.com"
                      className="w-full px-4 py-3 bg-[#F4FAF5] dark:bg-[#021a12] text-emerald-950 dark:text-emerald-100 font-medium rounded-xl border border-emerald-900/15 dark:border-emerald-900/40 focus:bg-white dark:focus:bg-[#06120e] focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-hidden transition-all text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-[0_4px_12px_rgba(4,120,87,0.2)] hover:shadow-[0_6px_16px_rgba(4,120,87,0.3)] hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isSubmitting ? 'Sending...' : 'Send OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetStep('none')}
                    className="w-full py-2 text-gray-500 hover:text-emerald-700 font-semibold cursor-pointer"
                  >
                    Back to Login
                  </button>
                </form>
              )}
              {resetStep === 'verify' && (
                <form onSubmit={handleResetVerify} className="space-y-4">
                  <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-4">
                    Enter the 6-digit verification code sent to {resetIdentifier}.
                  </p>
                  <div>
                    <label className="font-bold text-emerald-950 dark:text-emerald-100 block mb-1.5">
                      OTP Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full px-4 py-3 bg-[#F4FAF5] dark:bg-[#021a12] text-emerald-950 dark:text-emerald-100 font-medium rounded-xl border border-emerald-900/15 dark:border-emerald-900/40 focus:bg-white dark:focus:bg-[#06120e] focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-hidden transition-all text-xs text-center tracking-widest text-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-[0_4px_12px_rgba(4,120,87,0.2)] hover:shadow-[0_6px_16px_rgba(4,120,87,0.3)] hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetStep('none')}
                    className="w-full py-2 text-gray-500 hover:text-emerald-700 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              )}
              {resetStep === 'new_password' && (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="font-bold text-emerald-950 dark:text-emerald-100 block mb-1.5">
                      New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-10 pr-10 py-3 bg-[#F4FAF5] dark:bg-[#021a12] text-emerald-950 dark:text-emerald-100 font-medium rounded-xl border border-emerald-900/15 dark:border-emerald-900/40 focus:bg-white dark:focus:bg-[#06120e] focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-hidden transition-all text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-emerald-950 dark:text-emerald-100 block mb-1.5">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full pl-10 pr-10 py-3 bg-[#F4FAF5] dark:bg-[#021a12] text-emerald-950 dark:text-emerald-100 font-medium rounded-xl border border-emerald-900/15 dark:border-emerald-900/40 focus:bg-white dark:focus:bg-[#06120e] focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-hidden transition-all text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-[0_4px_12px_rgba(4,120,87,0.2)] hover:shadow-[0_6px_16px_rgba(4,120,87,0.3)] hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isSubmitting ? 'Updating...' : 'Set New Password'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              <div className="flex bg-[#F4FAF5] dark:bg-[#021a12] p-1.5 rounded-2xl border border-emerald-900/10 dark:border-emerald-900/40">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setRegisterStep('form');
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white dark:bg-[#0a1f18] text-emerald-950 dark:text-emerald-50 shadow-xs border border-emerald-900/5 dark:border-emerald-900/20'
                      : 'text-gray-600 dark:text-gray-400 hover:text-emerald-900 dark:hover:text-emerald-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-emerald-900 dark:hover:text-emerald-200'
                  }`}
                >
                  Create New Account 🌿
                </button>
              </div>

          {/* LOGIN FORM */}
          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <button
                type="button"
                onClick={async () => { setIsSubmitting(true); await loginWithGoogle(); setIsSubmitting(false); }}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-[#0a1f18] border border-gray-300 dark:border-emerald-900/40 rounded-xl text-gray-700 dark:text-gray-200 font-bold text-xs hover:bg-gray-50 dark:hover:bg-[#123126] transition-all shadow-sm mb-6"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  <path d="M1 1h22v22H1z" fill="none"/>
                </svg>
                Sign in with Google
              </button>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-gray-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div>
                <label className="font-bold text-emerald-950 dark:text-emerald-100 block mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. meera.nambiar@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#F4FAF5] dark:bg-[#021a12] text-emerald-950 dark:text-emerald-100 font-medium rounded-xl border border-emerald-900/15 dark:border-emerald-900/40 focus:bg-white dark:focus:bg-[#06120e] focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-hidden transition-all text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-emerald-950 dark:text-emerald-100 block mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 bg-[#F4FAF5] dark:bg-[#021a12] text-emerald-950 dark:text-emerald-100 font-medium rounded-xl border border-emerald-900/15 dark:border-emerald-900/40 focus:bg-white dark:focus:bg-[#06120e] focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-hidden transition-all text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-0" />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setResetStep('request')}
                  className="text-emerald-700 font-semibold cursor-pointer hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : registerStep === 'verify_otp' ? (
            /* VERIFY REGISTRATION OTP SCREEN */
            <div className="space-y-5 text-xs">
              <div className="text-center pt-2">
                <div className="w-14 h-14 bg-emerald-100/70 border border-emerald-600/20 text-emerald-800 rounded-2xl mx-auto flex items-center justify-center shadow-xs mb-3">
                  <Mail className="w-7 h-7 text-emerald-700" />
                </div>
                <h3 className="text-lg font-black text-emerald-950 tracking-tight">Verify Your Email</h3>
                <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  We've sent a 6-digit one-time verification code (OTP) to your email address:
                </p>
                <div className="mt-2.5 inline-flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
                  <span className="font-bold text-emerald-900 text-xs font-mono">{emailInput}</span>
                  <button
                    type="button"
                    onClick={() => setRegisterStep('form')}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-950 underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* 6-Digit OTP Form */}
              <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4">
                <div>
                  <label className="font-bold text-emerald-950 block text-center mb-2.5">
                    Enter 6-Digit Verification Code <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                    {registrationOtp.map((digit, index) => (
                      <input
                        key={index}
                        id={`reg-otp-input-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        autoFocus={index === 0}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-11 sm:w-12 h-13 sm:h-14 text-center font-mono font-black text-xl sm:text-2xl text-emerald-950 bg-[#F4FAF5] border border-emerald-900/20 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-3 focus:ring-emerald-600/20 outline-hidden transition-all shadow-xs"
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 text-center mt-2.5">
                    Code is valid for 10 minutes. Please check your inbox and spam/junk folder.
                  </p>
                </div>

                {/* Resend Controls */}
                <div className="text-center pt-1">
                  {otpResendCountdown > 0 ? (
                    <span className="text-[11px] text-gray-500 font-medium inline-flex items-center gap-1.5">
                      <RotateCw className="w-3 h-3 animate-spin text-emerald-700" />
                      Resend code in <strong className="text-emerald-950 font-bold">{otpResendCountdown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleResendRegistrationOtp}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1.5 cursor-pointer underline underline-offset-2"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      Didn't get the code? Resend OTP
                    </button>
                  )}
                </div>

                {/* Submit & Back Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || registrationOtp.join('').length !== 6}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span>Verifying & Creating Account...</span>
                    ) : (
                      <>
                        <span>Verify & Create My Account</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterStep('form')}
                    className="w-full py-2.5 text-xs text-gray-600 hover:text-emerald-900 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Edit Registration Details
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* CREATE NEW ACCOUNT FORM */
            <form onSubmit={handleInitiateRegister} className="space-y-4 text-xs">
              <button
                type="button"
                onClick={async () => { setIsSubmitting(true); await loginWithGoogle(); setIsSubmitting(false); }}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-[#0a1f18] border border-gray-300 dark:border-emerald-900/40 rounded-xl text-gray-700 dark:text-gray-200 font-bold text-xs hover:bg-gray-50 dark:hover:bg-[#123126] transition-all shadow-sm mb-6"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  <path d="M1 1h22v22H1z" fill="none"/>
                </svg>
                Sign up with Google
              </button>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-gray-400 font-medium">OR USE EMAIL</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div>
                <label className="font-bold text-emerald-950 dark:text-emerald-100 block mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Anand Kumar / Priya Ramesh"
                    className="w-full pl-10 pr-4 py-3 bg-[#F4FAF5] dark:bg-[#021a12] text-emerald-950 dark:text-emerald-100 font-medium rounded-xl border border-emerald-900/15 dark:border-emerald-900/40 focus:bg-white dark:focus:bg-[#06120e] focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-hidden transition-all text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-emerald-950 dark:text-emerald-100 block mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. anand.kumar@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#F4FAF5] dark:bg-[#021a12] text-emerald-950 dark:text-emerald-100 font-medium rounded-xl border border-emerald-900/15 dark:border-emerald-900/40 focus:bg-white dark:focus:bg-[#06120e] focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-hidden transition-all text-xs"
                  />
                </div>
                <p className="text-[10px] text-emerald-700 font-medium mt-1">
                  A 6-digit verification code will be sent to this email address.
                </p>
              </div>

              <div>
                <label className="font-bold text-emerald-950 dark:text-emerald-100 block mb-1.5">
                  10-Digit Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="px-3 py-3 bg-emerald-50 text-emerald-800 font-bold rounded-xl border border-emerald-900/15 flex items-center justify-center shrink-0">
                    🇮🇳 +91
                  </div>
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="9847012345"
                      className="w-full pl-10 pr-4 py-3 bg-[#F4FAF5] dark:bg-[#021a12] text-emerald-950 dark:text-emerald-100 font-medium rounded-xl border border-emerald-900/15 dark:border-emerald-900/40 focus:bg-white dark:focus:bg-[#06120e] focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-hidden transition-all text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* State & District Preference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-bold text-emerald-950 dark:text-emerald-100 block mb-1.5">
                    Delivery State <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      const st = e.target.value as 'Kerala' | 'Tamil Nadu';
                      setSelectedState(st);
                      setSelectedDistrict(st === 'Kerala' ? 'Ernakulam' : 'Chennai');
                    }}
                    className="w-full px-3 py-2.5 bg-[#F4FAF5] text-emerald-950 font-medium rounded-xl border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden text-xs"
                  >
                    <option value="Kerala">Kerala (24-48h Delivery)</option>
                    <option value="Tamil Nadu">Tamil Nadu (48-72h Delivery)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-emerald-950 dark:text-emerald-100 block mb-1.5">
                    Primary District <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F4FAF5] text-emerald-950 font-medium rounded-xl border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden text-xs"
                  >
                    {(selectedState === 'Kerala' ? keralaDistricts : tamilNaduDistricts).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-bold text-emerald-950 dark:text-emerald-100 block mb-1.5">
                    Create Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pl-3 pr-10 py-2.5 bg-[#F4FAF5] text-emerald-950 font-medium rounded-xl border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-emerald-950 dark:text-emerald-100 block mb-1.5">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-3 pr-10 py-2.5 bg-[#F4FAF5] text-emerald-950 font-medium rounded-xl border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Member Perks Box */}
              <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-900/10 space-y-1.5 text-[11px] text-emerald-900">
                <div className="font-bold flex items-center gap-1.5 text-emerald-950">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Member Privileges at 7Seasons:</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-gray-600">
                  <li className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Real-time courier tracking</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>WhatsApp dispatch photos</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Saved delivery addresses</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Complimentary plant care guides</span>
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending Verification Code...</span>
                ) : (
                  <>
                    <span>Continue & Send Verification OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
          </>
          )}

        </div>
      </div>
    );
  }

  // 2. IF LOGGED IN: SHOW CUSTOMER DASHBOARD
  return (
    <div className="bg-[#F4FAF5] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Profile Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-800 font-black text-2xl flex items-center justify-center border border-emerald-200 shadow-xs shrink-0">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-emerald-950">{currentUser.name}</h1>
                {isAdminAuthenticated &&
                currentAdmin &&
                (currentUser.email?.toLowerCase() === 'admin@7seasonsplant.com' ||
                  currentUser.email?.toLowerCase() === 'admin@7seasonsplants.com') ? (
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
                    🛡️ Nursery Admin Account
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                    🌿 7Seasons Green Member
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {currentUser.email} • {currentUser.phone || 'No phone set'}
              </p>
              <p className="text-[11px] text-emerald-700 font-medium mt-1">
                Mannarathayil Nursery Delivery Network (Kerala & Tamil Nadu)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isAdminAuthenticated &&
              currentAdmin &&
              (currentUser.email?.toLowerCase() === 'admin@7seasonsplant.com' ||
                currentUser.email?.toLowerCase() === 'admin@7seasonsplants.com') && (
                <button
                  onClick={() => onNavigate('admin')}
                  className="px-4 py-2 bg-[#7D8F69] text-white rounded-full text-xs font-bold hover:bg-[#627252] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Open Admin Control Panel</span>
                </button>
              )}
            <button
              onClick={() => onNavigate('plants')}
              className="px-4 py-2 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer border border-emerald-200"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shop Plants</span>
            </button>
            <button
              onClick={() => {
                logoutCustomer();
                onNavigate('account', 'login');
              }}
              className="px-4 py-2 bg-rose-50 text-rose-700 rounded-full text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer border border-rose-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-emerald-900/10 pb-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-emerald-50 border border-emerald-900/10'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>My Orders ({customerOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'addresses'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-emerald-50 border border-emerald-900/10'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Saved Addresses ({currentUser.addresses?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'wishlist'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-emerald-50 border border-emerald-900/10'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>My Wishlist ({wishlist.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-emerald-50 border border-emerald-900/10'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Account Profile</span>
          </button>
        </div>

        {/* TAB 1: ORDER HISTORY */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {customerOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-emerald-900/10 space-y-3">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center text-3xl mx-auto border border-emerald-100">
                  📦
                </div>
                <h3 className="text-base font-bold text-emerald-950">No Plant Orders Placed Yet</h3>
                <p className="text-xs text-gray-600 max-w-sm mx-auto">
                  You haven't ordered any plants under <strong className="text-emerald-950">{currentUser.email}</strong>. Browse our fresh nursery stock or curated combos!
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => onNavigate('combos')}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-green-600 text-white rounded-full text-xs font-bold hover:from-emerald-800 hover:to-green-700 transition-all cursor-pointer shadow-sm"
                  >
                    Explore Plant Combos
                  </button>
                  <button
                    onClick={() => onNavigate('plants')}
                    className="px-6 py-2.5 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer border border-emerald-200"
                  >
                    Browse All Plants
                  </button>
                </div>
              </div>
            ) : (
              customerOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-emerald-900/10 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-emerald-950">
                          Order #{order.orderNumber || order.id}
                        </span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          {order.paymentStatus === 'paid' ? 'Paid Online' : order.paymentStatus}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        Placed on{' '}
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : (order as any).orderDate || 'Recently'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {order.orderStatus}
                      </span>
                      <span className="text-base font-black text-emerald-950">
                        ₹{order.total || (order as any).totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-[#F4FAF5] rounded-2xl flex items-center gap-3 text-xs border border-emerald-900/5"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover bg-emerald-50 shrink-0 border border-emerald-900/10"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-emerald-950 truncate">{item.name}</p>
                          <p className="text-[11px] text-gray-500">
                            Qty: {item.quantity} • ₹{item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer & Actions */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-gray-100">
                    <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        Courier: {order.courierPartner || 'ST Courier Express'}{' '}
                        {order.trackingNumber ? `(#${order.trackingNumber})` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate('track-order', order.orderNumber || order.id)}
                        className="px-4 py-2 bg-emerald-50 text-emerald-800 font-bold rounded-full hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer border border-emerald-200 text-xs"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track Live Status</span>
                      </button>

                      <button
                        onClick={() => handleReorder(order)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-green-600 text-white font-bold rounded-full hover:from-emerald-800 hover:to-green-700 transition-colors cursor-pointer shadow-xs text-xs"
                      >
                        Reorder Items
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-black text-emerald-950">Delivery Addresses</h3>
                  <p className="text-xs text-gray-500">
                    Manage your shipping locations in Kerala & Tamil Nadu for rapid checkout.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddAddressModal(true)}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-full text-xs font-bold hover:bg-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {/* Addresses List */}
              {(!currentUser.addresses || currentUser.addresses.length === 0) ? (
                <div className="text-center py-8 text-gray-500 text-xs space-y-2">
                  <MapPin className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-semibold text-emerald-950">No saved addresses yet.</p>
                  <p>Add your home or office address for 1-click plant deliveries.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentUser.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-5 rounded-2xl border transition-all relative space-y-2 ${
                        addr.isDefault
                          ? 'bg-emerald-50/40 border-emerald-600/50 shadow-xs'
                          : 'bg-[#F4FAF5] border-emerald-900/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-emerald-950">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold bg-emerald-700 text-white px-2 py-0.5 rounded-full shadow-xs">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed">
                        {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                        <br />
                        {addr.city}, {addr.district}, {addr.state} - <strong>{addr.pincode}</strong>
                      </p>

                      <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                        <Phone className="w-3 h-3 text-emerald-700" />
                        <span>{addr.phoneNumber}</span>
                      </div>

                      <div className="pt-2 flex items-center gap-2 border-t border-emerald-900/10">
                        {!addr.isDefault && (
                          <button
                            onClick={() => setDefaultUserAddress(addr.id)}
                            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => deleteUserAddress(addr.id)}
                          className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer ml-auto flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-black text-emerald-950">My Botanical Wishlist</h3>
              <p className="text-xs text-gray-500">
                Plants and curated combos you've saved for your garden collection.
              </p>
            </div>

            {wishlistItems.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-500 space-y-2">
                <Heart className="w-8 h-8 text-rose-400 mx-auto" />
                <p className="font-semibold text-emerald-950">Your wishlist is empty.</p>
                <p>Browse our nursery to heart your favorite plants and combos.</p>
                <button
                  onClick={() => onNavigate('plants')}
                  className="mt-2 px-5 py-2 bg-emerald-700 text-white rounded-full text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  Browse Nursery
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlistItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-[#F4FAF5] rounded-2xl border border-emerald-900/10 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex gap-3">
                      <img
                        src={(item as any).images ? (item as any).images[0] : (item as any).image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover bg-emerald-50 shrink-0 border border-emerald-900/10"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-emerald-950 truncate">{item.name}</h4>
                        <p className="text-[11px] text-emerald-700 font-bold mt-0.5">₹{item.price}</p>
                        <span className="text-[10px] text-gray-500 capitalize">{item.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {item.type === 'combo' && (
                        <button
                          onClick={() => {
                            addToCart(item as any, item.type);
                            addToast({
                              title: 'Added to Bag',
                              message: `${item.name} added to cart.`,
                              type: 'success',
                            });
                          }}
                          className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
                        >
                          Add to Cart
                        </button>
                      )}
                      {item.type === 'product' && (
                        <div className="flex-1 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-bold rounded-xl text-center">
                          Viewing Only
                        </div>
                      )}
                      <button
                        onClick={() => toggleWishlist(item.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROFILE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-6 max-w-xl">
            <div>
              <h3 className="text-lg font-black text-emerald-950">Customer Profile Settings</h3>
              <p className="text-xs text-gray-500">Update your name, contact phone number, and delivery preference.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="flex flex-col items-center gap-3 mb-6 pb-6 border-b border-emerald-50">
                <div className="relative w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-2xl overflow-hidden shadow-xs group">
                  {profileForm.profileImage ? (
                    <img src={profileForm.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    currentUser?.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                  )}
                  
                  {/* Hidden file input overlay */}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfileForm({ ...profileForm, profileImage: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                    <Camera className="w-6 h-6 text-white" />
                  </label>
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Update Photo</p>
              </div>

              <div>
                <label className="font-bold text-emerald-950 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F4FAF5] text-emerald-950 font-medium rounded-xl border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-emerald-950 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F4FAF5] text-emerald-950 font-medium rounded-xl border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-emerald-950 block mb-1">Phone Number (10 digits)</label>
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F4FAF5] text-emerald-950 font-medium rounded-xl border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ADD ADDRESS MODAL */}
      {showAddAddressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-emerald-900/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-black text-emerald-950 text-base">Add New Delivery Location</h3>
              <button
                onClick={() => setShowAddAddressModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAddress} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-emerald-950 block mb-1">Receiver's Full Name *</label>
                <input
                  type="text"
                  required
                  value={newAddressData.fullName}
                  onChange={(e) => setNewAddressData({ ...newAddressData, fullName: e.target.value })}
                  placeholder="e.g. Anand Kumar"
                  className="w-full px-3 py-2 bg-[#F4FAF5] text-emerald-950 font-medium rounded-xl border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-emerald-950 block mb-1">10-Digit Mobile Number *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={newAddressData.phoneNumber}
                  onChange={(e) => setNewAddressData({ ...newAddressData, phoneNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="9847012345"
                  className="w-full px-3 py-2 bg-[#F4FAF5] text-emerald-950 font-medium rounded-xl border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-emerald-950 block mb-1">House Name / Street Address *</label>
                <input
                  type="text"
                  required
                  value={newAddressData.addressLine1}
                  onChange={(e) => setNewAddressData({ ...newAddressData, addressLine1: e.target.value })}
                  placeholder="e.g. Palm Meadows Villa 14, Near Infopark"
                  className="w-full px-3 py-2 bg-[#F4FAF5] text-emerald-950 font-medium rounded-xl border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-emerald-950 block mb-1">Landmark / Locality (Optional)</label>
                <input
                  type="text"
                  value={newAddressData.addressLine2}
                  onChange={(e) => setNewAddressData({ ...newAddressData, addressLine2: e.target.value })}
                  placeholder="e.g. Opposite St. Mary Church"
                  className="w-full px-3 py-2 bg-[#F4FAF5] text-emerald-950 font-medium rounded-xl border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-emerald-950 block mb-1">State *</label>
                  <select
                    value={newAddressData.state}
                    onChange={(e) => {
                      const st = e.target.value as 'Kerala' | 'Tamil Nadu';
                      setNewAddressData({
                        ...newAddressData,
                        state: st,
                        district: st === 'Kerala' ? 'Ernakulam' : 'Chennai',
                        city: st === 'Kerala' ? 'Ernakulam' : 'Chennai',
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#F4FAF5] text-emerald-950 font-medium rounded-xl border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                  >
                    <option value="Kerala">Kerala</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-emerald-950 block mb-1">District *</label>
                  <select
                    value={newAddressData.district}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        district: e.target.value,
                        city: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F4FAF5] text-emerald-950 font-medium rounded-xl border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                  >
                    {(newAddressData.state === 'Kerala' ? keralaDistricts : tamilNaduDistricts).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-emerald-950 block mb-1">6-Digit PIN Code *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={newAddressData.pincode}
                  onChange={(e) => setNewAddressData({ ...newAddressData, pincode: e.target.value.replace(/\D/g, '') })}
                  placeholder="682030"
                  className="w-full px-3 py-2 bg-[#F4FAF5] text-emerald-950 font-medium rounded-xl border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={newAddressData.isDefault}
                    onChange={(e) => setNewAddressData({ ...newAddressData, isDefault: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-0"
                  />
                  <span>Set as default delivery address</span>
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
