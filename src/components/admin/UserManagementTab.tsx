import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Loader2,
  Search,
  Filter,
  RefreshCw,
  Crown,
  Lock,
  AlertTriangle,
  CheckCircle,
  X,
  UserCheck,
  Sparkles,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';
import { User, AdminRole } from '../../types';
import { useStore } from '../../context/StoreContext';

interface UserManagementTabProps {
  onNavigateToAccounts?: () => void;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({ onNavigateToAccounts }) => {
  const {
    registeredUsers,
    isCurrentSuperAdmin,
    currentAdmin,
    currentUser,
    grantAdminRoleToUser,
    revokeAdminRoleFromUser,
    promoteAdminToSuperAdmin,
    demoteSuperAdminToAdmin,
    sendPromotionOtp,
    verifyPromotionOtp,
    refreshRegisteredUsers,
    addToast,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin' | 'super_admin'>('all');

  // Action Modals State
  const [promotionModal, setPromotionModal] = useState<{
    isOpen: boolean;
    user: User | null;
    targetRole: AdminRole;
    isSuperElevation: boolean;
    step: 'details' | 'otp';
    otpInput: string;
    isSendingOtp: boolean;
    isVerifyingOtp: boolean;
    otpCountdown: number;
    sentMail: {
      subject: string;
      from: string;
      to: string;
      otp: string;
      sentAt: string;
      emailSent: boolean;
    } | null;
    copied: boolean;
  }>({
    isOpen: false,
    user: null,
    targetRole: 'admin',
    isSuperElevation: false,
    step: 'details',
    otpInput: '',
    isSendingOtp: false,
    isVerifyingOtp: false,
    otpCountdown: 0,
    sentMail: null,
    copied: false,
  });

  const [demoteModal, setDemoteModal] = useState<{
    isOpen: boolean;
    user: User | null;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    user: null,
    isSubmitting: false,
  });

  const [revokeModal, setRevokeModal] = useState<{
    isOpen: boolean;
    user: User | null;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    user: null,
    isSubmitting: false,
  });

  // Automatically sync users on component mount
  useEffect(() => {
    refreshRegisteredUsers();
  }, []);

  // Sync users on component mount
  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshRegisteredUsers();
      addToast({
        type: 'success',
        title: 'User Roster Synchronized',
        message: 'Loaded the latest registered accounts and role statuses.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Refresh Failed',
        message: err.message || 'Could not refresh user records.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    return registeredUsers.filter((u) => {
      const isSuper =
        u.email.toLowerCase() === 'abinsajan36@gmail.com' ||
        u.role === 'super_admin';
      const isNurseryAdmin = !isSuper && u.role === 'admin';
      const isCustomer = !isSuper && !isNurseryAdmin;

      // Role filter
      if (roleFilter === 'super_admin') {
        if (!isSuper) return false;
      } else if (roleFilter === 'admin') {
        if (!isNurseryAdmin) return false;
      } else if (roleFilter === 'customer') {
        if (!isCustomer) return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchPhone = u.phone?.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone;
    });
  }, [registeredUsers, roleFilter, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    let superAdmins = 0;
    let nurseryAdmins = 0;
    let customers = 0;
    registeredUsers.forEach((u) => {
      if (
        u.role === 'super_admin' ||
        u.email.toLowerCase() === 'abinsajan36@gmail.com'
      ) {
        superAdmins++;
      } else if (u.role === 'admin') {
        nurseryAdmins++;
      } else {
        customers++;
      }
    });
    return {
      total: registeredUsers.length,
      superAdmins,
      nurseryAdmins,
      admins: superAdmins + nurseryAdmins,
      customers,
    };
  }, [registeredUsers]);

  // Countdown timer for promotion OTP resend
  useEffect(() => {
    if (promotionModal.otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setPromotionModal((prev) => ({
        ...prev,
        otpCountdown: Math.max(0, prev.otpCountdown - 1),
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [promotionModal.otpCountdown]);

  // Open promotion modals
  const openPromoteToSuperModal = (user: User) => {
    setPromotionModal({
      isOpen: true,
      user,
      targetRole: 'super_admin',
      isSuperElevation: true,
      step: 'details',
      otpInput: '',
      isSendingOtp: false,
      isVerifyingOtp: false,
      otpCountdown: 0,
      sentMail: null,
      copied: false,
    });
  };

  const openGrantAdminModal = (user: User) => {
    setPromotionModal({
      isOpen: true,
      user,
      targetRole: 'admin',
      isSuperElevation: false,
      step: 'details',
      otpInput: '',
      isSendingOtp: false,
      isVerifyingOtp: false,
      otpCountdown: 0,
      sentMail: null,
      copied: false,
    });
  };

  const handleInitiateOtp = async (targetRole: AdminRole) => {
    if (!promotionModal.user) return;
    setPromotionModal((prev) => ({
      ...prev,
      targetRole,
      isSendingOtp: true,
      step: 'otp',
    }));

    try {
      const rawAuthorizer = currentAdmin?.email || currentUser?.email || 'abinsajan36@gmail.com';
      const authorizer = rawAuthorizer.toLowerCase() === 'admin@7seasons.com' ? 'abinsajan36@gmail.com' : rawAuthorizer;
      const res = await sendPromotionOtp({
        targetEmail: authorizer,
        authorizerEmail: authorizer,
        candidateEmail: promotionModal.user.email,
        candidateName: promotionModal.user.name,
        targetRole,
      });

      const otpCode = res.previewOtp || '123456';
      setPromotionModal((prev) => ({
        ...prev,
        isSendingOtp: false,
        otpCountdown: 30,
        sentMail: {
          subject: res.mailSubject || `🔐 ${otpCode} is your 7Seasons Authorization Code`,
          from: res.fromAddress || '"7Seasonsplants Security" <mannaratharayil@gmail.com>',
          to: authorizer,
          otp: otpCode,
          sentAt: res.sentAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          emailSent: Boolean(res.emailSent),
        },
      }));

      addToast({
        type: 'info',
        title: 'Authorization Code Dispatched',
        message: `Security OTP sent to authorizer (${authorizer}). Please check your email inbox and spam folder.`,
        duration: 9000,
      });
    } catch (err: any) {
      console.error('Error initiating promotion OTP:', err);
      setPromotionModal((prev) => ({ ...prev, isSendingOtp: false }));
      addToast({
        type: 'error',
        title: 'OTP Dispatch Failed',
        message: err.message || 'Could not send verification code.',
      });
    }
  };

  const handleResendPromotionOtp = async () => {
    if (!promotionModal.user || promotionModal.otpCountdown > 0 || promotionModal.isSendingOtp) return;
    await handleInitiateOtp(promotionModal.targetRole);
  };

  const handleVerifyAndConfirmPromotion = async () => {
    if (!promotionModal.user) return;
    const cleanOtp = promotionModal.otpInput.trim();
    if (!cleanOtp) {
      addToast({
        type: 'error',
        title: 'OTP Required',
        message: 'Please enter the 6-digit authorization code.',
      });
      return;
    }

    setPromotionModal((prev) => ({ ...prev, isVerifyingOtp: true }));
    try {
      const rawAuthorizer = currentAdmin?.email || currentUser?.email || 'abinsajan36@gmail.com';
      const authorizer = rawAuthorizer.toLowerCase() === 'admin@7seasons.com' ? 'abinsajan36@gmail.com' : rawAuthorizer;
      const verifyRes = await verifyPromotionOtp(
        authorizer,
        cleanOtp,
        promotionModal.user.email,
        promotionModal.targetRole
      );

      if (!verifyRes.success) {
        setPromotionModal((prev) => ({ ...prev, isVerifyingOtp: false }));
        addToast({
          type: 'error',
          title: 'Authorization Rejected',
          message: verifyRes.error || 'The entered OTP code is invalid or has expired.',
        });
        return;
      }

      // Execute role elevation with otpVerified = true
      let res;
      if (promotionModal.targetRole === 'super_admin') {
        res = await promoteAdminToSuperAdmin(promotionModal.user.id, true);
      } else {
        res = await grantAdminRoleToUser(promotionModal.user.id, promotionModal.targetRole, true);
      }

      setPromotionModal((prev) => ({ ...prev, isVerifyingOtp: false }));
      if (res.success) {
        setPromotionModal({
          isOpen: false,
          user: null,
          targetRole: 'admin',
          isSuperElevation: false,
          step: 'details',
          otpInput: '',
          isSendingOtp: false,
          isVerifyingOtp: false,
          otpCountdown: 0,
          sentMail: null,
          copied: false,
        });
        await refreshRegisteredUsers();
      }
    } catch (err: any) {
      console.error('Error confirming promotion:', err);
      setPromotionModal((prev) => ({ ...prev, isVerifyingOtp: false }));
      addToast({
        type: 'error',
        title: 'Promotion Failed',
        message: err.message || 'Could not complete promotion.',
      });
    }
  };

  // Handle Demote Super Admin to Nursery Admin
  const handleConfirmDemote = async () => {
    if (!demoteModal.user) return;
    setDemoteModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const res = await demoteSuperAdminToAdmin(demoteModal.user.id);
      if (res.success) {
        setDemoteModal({ isOpen: false, user: null, isSubmitting: false });
      } else {
        setDemoteModal((prev) => ({ ...prev, isSubmitting: false }));
      }
    } catch (err) {
      setDemoteModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Handle Revoke Admin
  const handleConfirmRevoke = async () => {
    if (!revokeModal.user) return;
    setRevokeModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const res = await revokeAdminRoleFromUser(revokeModal.user.id);
      if (res.success) {
        setRevokeModal({ isOpen: false, user: null, isSubmitting: false });
      } else {
        setRevokeModal((prev) => ({ ...prev, isSubmitting: false }));
      }
    } catch (err) {
      setRevokeModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Privilege Notification */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-emerald-950">User & Role Management</h2>
            {isCurrentSuperAdmin ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
                <Crown className="w-3.5 h-3.5 text-amber-700" />
                Super Admin Authorized
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-stone-100 text-stone-700 px-3 py-1 rounded-full border border-stone-200">
                <Lock className="w-3 h-3 text-stone-500" />
                Delegation Restricted
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage registered customer accounts and configure administrator access privileges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-emerald-900 rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh User Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Sync Accounts</span>
          </button>
        </div>
      </div>

      {/* Super Admin Notice Card */}
      {!isCurrentSuperAdmin ? (
        <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-3xl flex items-start gap-3.5 text-amber-900 shadow-2xs">
          <div className="p-2 bg-amber-200/60 rounded-2xl shrink-0 mt-0.5">
            <Lock className="w-5 h-5 text-amber-800" />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-extrabold text-sm text-amber-950 flex items-center gap-1.5">
              <span>Super Administrator Privilege Required</span>
            </h4>
            <p className="text-amber-800 leading-relaxed">
              Only authorized Super Administrators have security authorization to promote registered user accounts to administrator roles or revoke administrative privileges.
            </p>
            <p className="text-[11px] text-amber-700 font-medium">
              You are currently logged in as {currentAdmin?.name || 'Nursery Staff'} ({currentAdmin?.role?.replace('_', ' ').toUpperCase() || 'ADMIN'}). You can view registered users, but role modification controls are locked.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-3xl flex items-start gap-3.5 text-emerald-900 shadow-2xs">
          <div className="p-2 bg-emerald-200/60 rounded-2xl shrink-0 mt-0.5">
            <Crown className="w-5 h-5 text-emerald-800" />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-1.5">
              <span>Super Administrator Access Active</span>
              <span className="text-[10px] bg-emerald-800 text-white font-bold px-2 py-0.5 rounded-full">
                Security Enforced
              </span>
            </h4>
            <p className="text-emerald-800 leading-relaxed">
              As the Super Administrator, you can grant the <strong>Admin role</strong> to any registered customer account below. Promoted users gain immediate access to the Nursery Operations Center to manage plant stock, combo recipes, and order dispatches.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
            Registered Accounts
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-950">{counts.total}</span>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              Total
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
            Customers
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-950">{counts.customers}</span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Shoppers
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
            Nursery Admins
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-900">{counts.nurseryAdmins}</span>
            <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
              Admins
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-2xs space-y-1 bg-amber-50/30">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1">
            <Crown className="w-3 h-3 text-amber-700" />
            Super Admins
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-amber-950">{counts.superAdmins}</span>
            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
              Master
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border border-gray-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              roleFilter === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Accounts ({counts.total})
          </button>
          <button
            onClick={() => setRoleFilter('customer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              roleFilter === 'customer'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Customers ({counts.customers})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              roleFilter === 'admin'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Nursery Admins ({counts.nurseryAdmins})
          </button>
          <button
            onClick={() => setRoleFilter('super_admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              roleFilter === 'super_admin'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Crown className="w-3 h-3" />
            Super Admins ({counts.superAdmins})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Loading user roster...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-50/80 text-emerald-950 font-black uppercase text-[10px] tracking-wider border-b border-emerald-100">
                <tr>
                  <th className="px-5 py-3.5">Account & Identity</th>
                  <th className="px-5 py-3.5">Contact Details</th>
                  <th className="px-5 py-3.5">Registered On</th>
                  <th className="px-5 py-3.5 text-center">Assigned Role</th>
                  <th className="px-5 py-3.5 text-right">Super Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const isRootSuper =
                    user.email.toLowerCase() === 'abinsajan36@gmail.com';
                  const isPromotedSuper = !isRootSuper && user.role === 'super_admin';
                  const isSuper = isRootSuper || isPromotedSuper;
                  const isNurseryAdmin = !isSuper && user.role === 'admin';
                  const isAdmin = isSuper || isNurseryAdmin;

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50/70 transition-colors ${
                        isRootSuper ? 'bg-amber-50/30' : isPromotedSuper ? 'bg-amber-50/15' : ''
                      }`}
                    >
                      {/* Identity */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border shadow-2xs ${
                              isRootSuper
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : isPromotedSuper
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : isAdmin
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt={user.name}
                                className="w-full h-full object-cover rounded-2xl"
                              />
                            ) : (
                              (user.name || 'U').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-gray-900 text-sm">{user.name}</span>
                              {isRootSuper && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-amber-200/80 text-amber-950 px-1.5 py-0.5 rounded-full border border-amber-300">
                                  <Crown className="w-2.5 h-2.5" /> Root Owner
                                </span>
                              )}
                              {isPromotedSuper && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full border border-amber-200">
                                  <Crown className="w-2.5 h-2.5" /> Promoted
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono truncate">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[11px]">
                              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'Standard'}
                          </span>
                        </div>
                      </td>

                      {/* Role & Badges */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        {isRootSuper ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs border border-amber-300 shadow-2xs">
                              <Crown className="w-3 h-3 text-amber-700" />
                              Super Admin (Root)
                            </span>
                            <span className="text-[9px] text-amber-700 font-medium mt-0.5">
                              Unrevokable Authority
                            </span>
                          </div>
                        ) : isPromotedSuper ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 text-amber-950 font-extrabold text-xs border border-amber-300 shadow-2xs">
                              <Crown className="w-3 h-3 text-amber-700" />
                              Super Admin
                            </span>
                            <span className="text-[9px] text-amber-800 font-medium mt-0.5">
                              Full Master Authority
                            </span>
                          </div>
                        ) : isNurseryAdmin ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300">
                              <ShieldCheck className="w-3 h-3 text-emerald-700" />
                              Nursery Admin
                            </span>
                            {user.promotedToAdminAt && (
                              <span className="text-[9px] text-gray-500 mt-0.5">
                                Promoted on{' '}
                                {new Date(user.promotedToAdminAt).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium text-xs">
                            Customer Account
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {isRootSuper ? (
                          <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-200">
                            🔒 Root Protected
                          </span>
                        ) : isCurrentSuperAdmin ? (
                          isPromotedSuper ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => setDemoteModal({ isOpen: true, user, isSubmitting: false })}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-stone-300 shadow-2xs"
                                title="Demote to Standard Nursery Administrator"
                              >
                                <Shield className="w-3 h-3 text-stone-600" />
                                <span>Demote to Admin</span>
                              </button>
                              <button
                                onClick={() => setRevokeModal({ isOpen: true, user, isSubmitting: false })}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-rose-200 shadow-2xs"
                                title="Revoke all administrative access"
                              >
                                <ShieldAlert className="w-3 h-3 text-rose-600" />
                                <span>Revoke</span>
                              </button>
                            </div>
                          ) : isNurseryAdmin ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => openPromoteToSuperModal(user)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 border border-amber-400"
                                title="Promote to Super Administrator with full control"
                              >
                                <Crown className="w-3.5 h-3.5 text-amber-100" />
                                <span>Promote to Super Admin</span>
                              </button>
                              <button
                                onClick={() => setRevokeModal({ isOpen: true, user, isSubmitting: false })}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-rose-200 shadow-2xs"
                                title="Revoke Administrator Access"
                              >
                                <ShieldAlert className="w-3 h-3 text-rose-600" />
                                <span>Revoke</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => openGrantAdminModal(user)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                              title="Grant Administrator Privileges"
                            >
                              <Shield className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Grant Admin Role</span>
                            </button>
                          )
                        ) : (
                          <div className="inline-flex items-center gap-1 text-[11px] text-gray-400 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-200" title="Only authorized Super Administrators can modify roles">
                            <Lock className="w-3 h-3 text-gray-400" />
                            <span>Super Admin Only</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="max-w-sm mx-auto space-y-2">
                        <Shield className="w-8 h-8 text-gray-300 mx-auto" />
                        <p className="font-bold text-gray-700 text-sm">No accounts found</p>
                        <p className="text-xs text-gray-400">
                          {searchQuery
                            ? `No user records matching "${searchQuery}".`
                            : 'No user records currently registered in this filter view.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UNIFIED PROMOTION MODAL WITH MANDATORY OTP VERIFICATION */}
      {promotionModal.isOpen && promotionModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className={`bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl transition-all duration-200 border animate-in fade-in zoom-in-95 my-8 ${
            promotionModal.step === 'otp' ? 'border-emerald-200' : 'border-gray-100'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-2xl border ${
                  promotionModal.targetRole === 'super_admin'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}>
                  {promotionModal.targetRole === 'super_admin' ? (
                    <Crown className="w-5 h-5 text-amber-700" />
                  ) : (
                    <KeyRound className="w-5 h-5 text-emerald-700" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-base text-gray-900">
                    {promotionModal.step === 'otp'
                      ? promotionModal.targetRole === 'super_admin'
                        ? 'Super Admin OTP Verification'
                        : 'Admin Promotion OTP Verification'
                      : promotionModal.isSuperElevation
                      ? 'Promote to Super Admin'
                      : 'Grant Admin Privileges'}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {promotionModal.step === 'otp'
                      ? 'Security authorization code required to confirm'
                      : promotionModal.isSuperElevation
                      ? 'Elevate administrator to master super admin authority'
                      : 'Select administrative role level & confirm via OTP'}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setPromotionModal({
                    isOpen: false,
                    user: null,
                    targetRole: 'admin',
                    isSuperElevation: false,
                    step: 'details',
                    otpInput: '',
                    isSendingOtp: false,
                    isVerifyingOtp: false,
                    otpCountdown: 0,
                    sentMail: null,
                    copied: false,
                  })
                }
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Summary Card */}
            <div className="mt-4 p-3.5 bg-gray-50/90 rounded-2xl border border-gray-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">Candidate: {promotionModal.user.name}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                  ID: {promotionModal.user.id.slice(0, 10)}...
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 font-mono text-[11px]">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{promotionModal.user.email}</span>
              </div>
              <div className="pt-1 flex items-center gap-1.5">
                <span className="text-[11px] text-gray-500 font-medium">Target Elevation:</span>
                {promotionModal.targetRole === 'super_admin' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                    <Crown className="w-3 h-3 text-amber-700" /> Super Administrator
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />{' '}
                    {promotionModal.targetRole === 'nursery_manager'
                      ? 'Nursery Operations Manager'
                      : promotionModal.targetRole === 'inventory_staff'
                      ? 'Inventory Specialist'
                      : 'Nursery Administrator'}
                  </span>
                )}
              </div>
            </div>

            {/* STEP 1: DETAILS & ROLE SELECTION */}
            {promotionModal.step === 'details' && (
              <div className="space-y-4 mt-4">
                {promotionModal.isSuperElevation ? (
                  <div className="space-y-3 text-xs text-gray-600">
                    <p className="font-bold text-gray-800">What does promoting to Super Admin grant?</p>
                    <ul className="space-y-1.5 text-[11px] list-disc pl-4 text-gray-600 leading-relaxed">
                      <li>
                        <strong className="text-gray-800">Full Master Authority:</strong> Unrestricted control over catalog, plant combos, inventory, and site parameters.
                      </li>
                      <li>
                        <strong className="text-gray-800">Delegation & Role Promotion:</strong> Full power to promote other admins, manage accounts, and assign permissions.
                      </li>
                      <li>
                        <strong className="text-gray-800">Audit Logs & Confidential Settings:</strong> Complete access to user audit logs, backups, and operational control.
                      </li>
                      <li>
                        <strong className="text-gray-800">Privacy Exemption:</strong> Automatically excluded from standard admin account counts and bulk emails.
                      </li>
                    </ul>

                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span>
                        Security verification required: clicking proceed will send a one-time 6-digit authorization code to confirm this action.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700 block">
                      Select Administrative Role Level
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => setPromotionModal((prev) => ({ ...prev, targetRole: 'admin' }))}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          promotionModal.targetRole === 'admin'
                            ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          <span>General Nursery Administrator</span>
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Full access to manage plant products, combos, care guides, and customer orders.
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPromotionModal((prev) => ({ ...prev, targetRole: 'super_admin' }))}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          promotionModal.targetRole === 'super_admin'
                            ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-amber-700" />
                          <span>Super Administrator (Full Master Control)</span>
                        </div>
                        <div className="text-[11px] text-amber-800/80 mt-0.5">
                          Unrestricted access to all features, secrets vault, audit logs, and promoting other admins.
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPromotionModal((prev) => ({ ...prev, targetRole: 'nursery_manager' }))}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          promotionModal.targetRole === 'nursery_manager'
                            ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-bold text-xs text-gray-900">Nursery Operations Manager</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Focuses on plant inventories, stock alerts, and dispatch fulfillment.
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPromotionModal((prev) => ({ ...prev, targetRole: 'inventory_staff' }))}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          promotionModal.targetRole === 'inventory_staff'
                            ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-bold text-xs text-gray-900">Inventory Specialist</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Manages catalog details, pricing tags, and combo offerings.
                        </div>
                      </button>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span>
                        Role elevations require one-time security OTP authorization. An OTP will be requested in the next step before confirming.
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() =>
                      setPromotionModal({
                        isOpen: false,
                        user: null,
                        targetRole: 'admin',
                        isSuperElevation: false,
                        step: 'details',
                        otpInput: '',
                        isSendingOtp: false,
                        isVerifyingOtp: false,
                        otpCountdown: 0,
                        sentMail: null,
                        copied: false,
                      })
                    }
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInitiateOtp(promotionModal.targetRole)}
                    disabled={promotionModal.isSendingOtp}
                    className={`px-5 py-2.5 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5 disabled:opacity-50 ${
                      promotionModal.targetRole === 'super_admin'
                        ? 'bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-700 hover:from-amber-700 hover:to-amber-800'
                        : 'bg-emerald-800 hover:bg-emerald-900'
                    }`}
                  >
                    {promotionModal.isSendingOtp ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Authorization Code...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Continue to OTP Verification</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: OTP VERIFICATION */}
            {promotionModal.step === 'otp' && (
              <div className="space-y-4 mt-4">
                {/* On-Screen Preview Card: Mail Sent For Role Elevation */}
                <div className="p-4 bg-emerald-50/90 rounded-2xl border border-emerald-200 text-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80">
                    <div className="flex items-center gap-2 text-emerald-950 font-bold">
                      <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="text-sm font-black text-emerald-950">Mail Sent For Role Elevation</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                      Dispatched
                    </span>
                  </div>

                  <div className="space-y-1.5 text-emerald-900 text-xs">
                    <div className="flex items-center justify-between py-1 px-2.5 bg-white/80 rounded-xl border border-emerald-100">
                      <span className="text-gray-600 font-medium">Mail Recipient:</span>
                      <strong className="text-emerald-950 font-bold font-mono text-[12px]">
                        {promotionModal.sentMail?.to ||
                          (currentAdmin?.email?.toLowerCase() === 'admin@7seasons.com'
                            ? 'abinsajan36@gmail.com'
                            : currentAdmin?.email) ||
                          'abinsajan36@gmail.com'}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between py-1 px-2.5 bg-white/60 rounded-xl border border-emerald-100/60">
                      <span className="text-gray-500 font-medium">Sender:</span>
                      <span className="text-gray-700 font-medium font-mono text-[11px]">
                        mannaratharayil@gmail.com
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 px-2.5 bg-white/60 rounded-xl border border-emerald-100/60">
                      <span className="text-gray-500 font-medium">Candidate:</span>
                      <span className="text-gray-800 font-semibold text-[11px]">
                        {promotionModal.user.name} ({promotionModal.user.email})
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 px-2.5 bg-white/60 rounded-xl border border-emerald-100/60">
                      <span className="text-gray-500 font-medium">Elevating To:</span>
                      <span className="text-emerald-900 font-bold text-[11px]">
                        {promotionModal.targetRole === 'super_admin'
                          ? 'Super Administrator 👑'
                          : promotionModal.targetRole === 'nursery_manager'
                          ? 'Nursery Operations Manager'
                          : promotionModal.targetRole === 'inventory_staff'
                          ? 'Inventory Specialist'
                          : 'Nursery Administrator 🛡️'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-100/70 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                    <p className="font-semibold">
                      📩 Security OTP delivered to the recipient address above.
                    </p>
                    <p className="text-emerald-800/90 leading-relaxed">
                      Please check the email inbox. If you do not see the email, please check your <strong>spam / junk folder</strong>.
                    </p>
                  </div>
                </div>

                {/* 6-Digit OTP Field */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Enter 6-Digit Authorization Code</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleResendPromotionOtp}
                      disabled={promotionModal.otpCountdown > 0 || promotionModal.isSendingOtp}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${promotionModal.isSendingOtp ? 'animate-spin' : ''}`} />
                      <span>
                        {promotionModal.isSendingOtp
                          ? 'Dispatching...'
                          : promotionModal.otpCountdown > 0
                          ? `Resend code in ${promotionModal.otpCountdown}s`
                          : 'Resend Email OTP'}
                      </span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={promotionModal.otpInput}
                    onChange={(e) =>
                      setPromotionModal((prev) => ({
                        ...prev,
                        otpInput: e.target.value.replace(/\D/g, '').slice(0, 6),
                      }))
                    }
                    placeholder="••••••"
                    maxLength={6}
                    autoFocus
                    className="w-full text-center font-mono text-3xl font-black tracking-[0.35em] py-3.5 bg-gray-50 border-2 border-emerald-300 focus:border-emerald-600 focus:bg-white rounded-2xl outline-hidden text-emerald-950 transition-all shadow-inner"
                  />
                  <p className="text-[11px] text-gray-500 text-center">
                    Enter the code dispatched to your authorized administrator address to elevate this account.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setPromotionModal((prev) => ({ ...prev, step: 'details', otpInput: '' }))}
                    disabled={promotionModal.isVerifyingOtp}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPromotionModal({
                          isOpen: false,
                          user: null,
                          targetRole: 'admin',
                          isSuperElevation: false,
                          step: 'details',
                          otpInput: '',
                          isSendingOtp: false,
                          isVerifyingOtp: false,
                          otpCountdown: 0,
                          sentMail: null,
                          copied: false,
                        })
                      }
                      disabled={promotionModal.isVerifyingOtp}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyAndConfirmPromotion}
                      disabled={promotionModal.isVerifyingOtp || promotionModal.otpInput.trim().length < 6}
                      className={`px-5 py-2.5 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5 disabled:opacity-50 ${
                        promotionModal.targetRole === 'super_admin'
                          ? 'bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-700 hover:from-amber-700 hover:to-amber-800'
                          : 'bg-emerald-800 hover:bg-emerald-900'
                      }`}
                    >
                      {promotionModal.isVerifyingOtp ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Authorizing Elevation...</span>
                        </>
                      ) : (
                        <>
                          {promotionModal.targetRole === 'super_admin' ? (
                            <Crown className="w-3.5 h-3.5 text-amber-200" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-200" />
                          )}
                          <span>
                            {promotionModal.targetRole === 'super_admin'
                              ? 'Verify OTP & Elevate to Super Admin'
                              : 'Verify OTP & Grant Admin Role'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: DEMOTE TO NURSERY ADMIN */}
      {demoteModal.isOpen && demoteModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-900">
                <div className="p-2 bg-stone-100 rounded-2xl">
                  <Shield className="w-5 h-5 text-stone-700" />
                </div>
                <div>
                  <h3 className="font-black text-base">Demote to Nursery Admin</h3>
                  <p className="text-[11px] text-stone-500 font-medium">Revert Super Admin privileges</p>
                </div>
              </div>
              <button
                onClick={() => setDemoteModal({ isOpen: false, user: null, isSubmitting: false })}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-600 leading-relaxed">
                Are you sure you want to demote <strong className="text-gray-900 font-bold">{demoteModal.user.name}</strong> ({demoteModal.user.email}) from Super Administrator back to Nursery Administrator?
              </p>
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-[11px] text-stone-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
                <span>
                  They will continue to manage plant products, combos, and order fulfillment, but master powers to promote other admins or access restricted system vaults will be removed.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDemoteModal({ isOpen: false, user: null, isSubmitting: false })}
                disabled={demoteModal.isSubmitting}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              >
                Keep Super Admin
              </button>
              <button
                type="button"
                onClick={handleConfirmDemote}
                disabled={demoteModal.isSubmitting}
                className="px-5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {demoteModal.isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Demoting...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-3.5 h-3.5" />
                    <span>Confirm Demotion</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: REVOKE ADMIN ROLE */}
      {revokeModal.isOpen && revokeModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-900">
                <div className="p-2 bg-rose-100 rounded-2xl">
                  <ShieldAlert className="w-5 h-5 text-rose-700" />
                </div>
                <h3 className="font-black text-base">Revoke Admin Privileges</h3>
              </div>
              <button
                onClick={() => setRevokeModal({ isOpen: false, user: null, isSubmitting: false })}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-600 leading-relaxed">
                Are you sure you want to revoke administrator access for{' '}
                <strong className="text-gray-900 font-bold">{revokeModal.user.name}</strong> (
                {revokeModal.user.email})?
              </p>
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-[11px] text-rose-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <span>
                  Their administrator rights will be immediately removed and their account will revert to standard customer status. They will no longer have access to the nursery control room.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRevokeModal({ isOpen: false, user: null, isSubmitting: false })}
                disabled={revokeModal.isSubmitting}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              >
                Keep Admin Role
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                disabled={revokeModal.isSubmitting}
                className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {revokeModal.isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Revoking...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Confirm Revocation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
