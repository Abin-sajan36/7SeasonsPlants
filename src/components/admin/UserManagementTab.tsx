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
    grantAdminRoleToUser,
    revokeAdminRoleFromUser,
    refreshRegisteredUsers,
    addToast,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all');

  // Action Modals State
  const [grantModal, setGrantModal] = useState<{
    isOpen: boolean;
    user: User | null;
    selectedRole: AdminRole;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    user: null,
    selectedRole: 'admin',
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
      // Role filter
      if (roleFilter === 'admin') {
        const isAdmin = u.role === 'admin' || u.role === 'super_admin' || u.email.toLowerCase() === 'abinsajan36@gmail.com';
        if (!isAdmin) return false;
      } else if (roleFilter === 'customer') {
        const isAdmin = u.role === 'admin' || u.role === 'super_admin' || u.email.toLowerCase() === 'abinsajan36@gmail.com';
        if (isAdmin) return false;
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
    let admins = 0;
    let customers = 0;
    registeredUsers.forEach((u) => {
      if (u.role === 'admin' || u.role === 'super_admin' || u.email.toLowerCase() === 'abinsajan36@gmail.com') {
        admins++;
      } else {
        customers++;
      }
    });
    return { total: registeredUsers.length, admins, customers };
  }, [registeredUsers]);

  // Handle Grant Admin
  const handleConfirmGrant = async () => {
    if (!grantModal.user) return;
    setGrantModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const res = await grantAdminRoleToUser(grantModal.user.id, grantModal.selectedRole);
      if (res.success) {
        setGrantModal({ isOpen: false, user: null, selectedRole: 'admin', isSubmitting: false });
      } else {
        setGrantModal((prev) => ({ ...prev, isSubmitting: false }));
      }
    } catch (err) {
      setGrantModal((prev) => ({ ...prev, isSubmitting: false }));
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
              Only the root Super Administrator (<strong className="font-mono">abinsajan36@gmail.com</strong>) has security authorization to promote registered user accounts to administrator roles or revoke administrative privileges.
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
            Registered Accounts
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-950">{counts.total}</span>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              Total
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
            Customer Accounts
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-950">{counts.customers}</span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Standard
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
            Authorized Administrators
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-amber-950">{counts.admins}</span>
            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
              Privileged
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
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Admins ({counts.admins})
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
                    user.email.toLowerCase() === 'abinsajan36@gmail.com' ||
                    user.role === 'super_admin';
                  const isAdmin =
                    isRootSuper || user.role === 'admin';

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50/70 transition-colors ${
                        isRootSuper ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Identity */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border shadow-2xs ${
                              isRootSuper
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
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
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs border border-amber-300">
                              <Crown className="w-3 h-3 text-amber-700" />
                              Super Admin
                            </span>
                            <span className="text-[9px] text-amber-700 font-medium mt-0.5">
                              Unrevokable Authority
                            </span>
                          </div>
                        ) : isAdmin ? (
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
                          isAdmin ? (
                            <button
                              onClick={() => setRevokeModal({ isOpen: true, user, isSubmitting: false })}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-rose-200 shadow-2xs"
                              title="Revoke Administrator Access"
                            >
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                              <span>Revoke Access</span>
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                setGrantModal({
                                  isOpen: true,
                                  user,
                                  selectedRole: 'admin',
                                  isSubmitting: false,
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                              title="Grant Administrator Privileges"
                            >
                              <Shield className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Grant Admin Role</span>
                            </button>
                          )
                        ) : (
                          <div className="inline-flex items-center gap-1 text-[11px] text-gray-400 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-200" title="Only the Super Administrator (abinsajan36@gmail.com) can modify roles">
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

      {/* MODAL 1: GRANT ADMIN ROLE */}
      {grantModal.isOpen && grantModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900">
                <div className="p-2 bg-emerald-100 rounded-2xl">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-black text-base">Grant Admin Privileges</h3>
              </div>
              <button
                onClick={() => setGrantModal({ isOpen: false, user: null, selectedRole: 'admin', isSubmitting: false })}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <p className="font-bold text-emerald-900">
                Promoting: {grantModal.user.name}
              </p>
              <p className="font-mono text-[11px] text-emerald-800">
                Email: {grantModal.user.email}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">
                Select Administrative Role Level
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setGrantModal((prev) => ({ ...prev, selectedRole: 'admin' }))}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    grantModal.selectedRole === 'admin'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-bold text-xs text-gray-900">General Nursery Administrator</div>
                  <div className="text-[11px] text-gray-500">
                    Full access to manage products, combos, care guides, and customer order statuses.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setGrantModal((prev) => ({ ...prev, selectedRole: 'nursery_manager' }))}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    grantModal.selectedRole === 'nursery_manager'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-bold text-xs text-gray-900">Nursery Operations Manager</div>
                  <div className="text-[11px] text-gray-500">
                    Focuses on plant inventories, stock alerts, and dispatch fulfillment.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setGrantModal((prev) => ({ ...prev, selectedRole: 'inventory_staff' }))}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    grantModal.selectedRole === 'inventory_staff'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-bold text-xs text-gray-900">Inventory Specialist</div>
                  <div className="text-[11px] text-gray-500">
                    Manages catalog details, pricing tags, and combo offerings.
                  </div>
                </button>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                Once confirmed, this user will immediately see the <strong>Admin Control Panel</strong> upon logging into 7Seasons Nursery using their credentials.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setGrantModal({ isOpen: false, user: null, selectedRole: 'admin', isSubmitting: false })}
                disabled={grantModal.isSubmitting}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmGrant}
                disabled={grantModal.isSubmitting}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {grantModal.isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Confirm Promotion</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REVOKE ADMIN ROLE */}
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
