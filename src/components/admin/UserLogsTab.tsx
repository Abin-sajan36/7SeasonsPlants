import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Trash2,
  RefreshCw,
  Clock,
  Laptop,
  Smartphone,
  Tablet,
  CheckCircle2,
  XCircle,
  LogOut,
  UserPlus,
  AlertTriangle,
  Crown,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  Activity,
  Sparkles,
  Users,
  ShoppingBag,
  Mail,
  Copy,
  ExternalLink,
  Send,
  Phone,
  Check,
  ArrowUpDown,
} from 'lucide-react';
import { db, isFirestoreQuotaExceeded, handleFirestoreQuotaError } from '../../lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { useStore } from '../../context/StoreContext';
import { UserLoginLog, AuthEventType, User, Order } from '../../types';
import { BulkEmailModal } from './BulkEmailModal';

export const UserLogsTab: React.FC = () => {
  const {
    userLogs,
    isCurrentSuperAdmin,
    isAdminAuthenticated,
    currentAdmin,
    adminAccounts,
    clearUserLogs,
    addToast,
    registeredUsers,
    orders,
    recordUserLog,
    refreshRegisteredUsers,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'accounts' | 'audit-logs'>('accounts');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingAudit, setIsGeneratingAudit] = useState(false);

  // Bulk Email State
  const [isBulkEmailOpen, setIsBulkEmailOpen] = useState(false);
  const [bulkEmailPreselected, setBulkEmailPreselected] = useState<User[]>([]);

  // Accounts List State
  const [accountSearch, setAccountSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState<'all' | 'ordered' | 'zero-orders' | 'admin'>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [selectedUserForOrders, setSelectedUserForOrders] = useState<User | null>(null);

  // Audit Logs State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'super_admin' | 'admin' | 'customer'>('all');
  const [eventFilter, setEventFilter] = useState<'all' | AuthEventType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedLog, setSelectedLog] = useState<UserLoginLog | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // If not authenticated as any administrator, block access
  if (!isCurrentSuperAdmin && !isAdminAuthenticated && !currentAdmin) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-red-100 shadow-sm space-y-4 max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Restricted to Store Administrators</h2>
        <p className="text-sm text-gray-500">
          User login and activity audit logs contain sensitive operational tracking data and can only be accessed by authorized store administrators.
        </p>
      </div>
    );
  }

  // Set of emails associated with super administrator
  const superAdminEmails = useMemo(() => {
    const emails = new Set<string>(['annanvasu36@gmail.com', 'abinsajan36@gmail.com']);
    adminAccounts.forEach((acc) => {
      if (acc.role === 'super_admin' && acc.email) {
        emails.add(acc.email.toLowerCase().trim());
      }
    });
    return emails;
  }, [adminAccounts]);

  // Aggregate user accounts with orders ordered
  const userAccountSummaries = useMemo(() => {
    return registeredUsers.map((user) => {
      const userEmail = (user.email || '').toLowerCase().trim();
      const userOrders = orders.filter((o) => {
        const ordEmail = (o.customer?.email || '').toLowerCase().trim();
        return (userEmail && ordEmail === userEmail) || (user.id && o.customerId === user.id);
      });

      const orderCount = userOrders.length;
      const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const isSuper = superAdminEmails.has(userEmail) || user.role === 'super_admin';
      const isAdmin = isSuper || user.role === 'admin';

      return {
        user,
        orderCount,
        totalSpent,
        orders: userOrders,
        isSuper,
        isAdmin,
      };
    });
  }, [registeredUsers, orders, superAdminEmails]);

  // Visible Account Summaries: Strictly omit Super Admin for standard administrators
  const visibleAccountSummaries = useMemo(() => {
    if (isCurrentSuperAdmin) {
      return userAccountSummaries;
    }
    return userAccountSummaries.filter((item) => !item.isSuper);
  }, [userAccountSummaries, isCurrentSuperAdmin]);

  // Accounts List Filtering
  const filteredAccountSummaries = useMemo(() => {
    return visibleAccountSummaries.filter((item) => {
      // 1. Search query
      const q = accountSearch.toLowerCase().trim();
      if (q) {
        const matchEmail = item.user.email?.toLowerCase().includes(q);
        const matchName = item.user.name?.toLowerCase().includes(q);
        const matchPhone = item.user.phone?.includes(q);
        if (!matchEmail && !matchName && !matchPhone) return false;
      }

      // 2. Filter category
      if (accountFilter === 'ordered' && item.orderCount === 0) return false;
      if (accountFilter === 'zero-orders' && item.orderCount > 0) return false;
      if (accountFilter === 'admin' && !item.isAdmin) return false;

      return true;
    });
  }, [visibleAccountSummaries, accountSearch, accountFilter]);

  // Accounts Overview Metrics: Super Admin is completely subtracted for standard admins
  const accountMetrics = useMemo(() => {
    const baseList = visibleAccountSummaries;
    const totalAccounts = baseList.length;
    const accountsWithOrders = baseList.filter((u) => u.orderCount > 0).length;
    const zeroOrderAccounts = baseList.filter((u) => u.orderCount === 0).length;
    const totalOrdersPlaced = orders.length;

    return {
      totalAccounts,
      accountsWithOrders,
      zeroOrderAccounts,
      totalOrdersPlaced,
    };
  }, [visibleAccountSummaries, orders]);

  // Selection handlers
  const handleSelectAllAccounts = () => {
    if (selectedUserIds.length === filteredAccountSummaries.length && filteredAccountSummaries.length > 0) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredAccountSummaries.map((s) => s.user.id || s.user.email));
    }
  };

  const handleToggleSelectAccount = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectedUsersList = useMemo(() => {
    return registeredUsers.filter((u) => selectedUserIds.includes(u.id) || selectedUserIds.includes(u.email));
  }, [registeredUsers, selectedUserIds]);

  // Copy email helper
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2500);
    addToast({
      type: 'info',
      title: 'Email Copied',
      message: `Copied ${email} to clipboard.`,
      duration: 2500,
    });
  };

  // Open Bulk Email for single user
  const handleOpenEmailForUser = (user: User) => {
    setBulkEmailPreselected([user]);
    setIsBulkEmailOpen(true);
  };

  // Open Bulk Email for selected users
  const handleOpenEmailForSelected = () => {
    if (selectedUsersList.length > 0) {
      setBulkEmailPreselected(selectedUsersList);
    } else {
      setBulkEmailPreselected([]);
    }
    setIsBulkEmailOpen(true);
  };

  // Export Accounts CSV
  const handleExportAccountsCSV = () => {
    const headers = [
      'Customer Name',
      'Email ID',
      'Phone',
      'Account Role',
      'Account Created Date',
      'Total Orders Placed',
      'Total Amount Spent (INR)',
    ];

    const rows = filteredAccountSummaries.map(({ user, orderCount, totalSpent }) => [
      `"${(user.name || '').replace(/"/g, '""')}"`,
      `"${user.email || ''}"`,
      `"${user.phone || ''}"`,
      user.role || 'customer',
      `"${user.createdAt || ''}"`,
      orderCount,
      totalSpent,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `7seasons_registered_accounts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'CSV Exported',
      message: `Exported ${filteredAccountSummaries.length} registered accounts with order counts.`,
    });
  };

  // Compute logs visible to current user
  const visibleLogs = useMemo(() => {
    if (isCurrentSuperAdmin) {
      return userLogs;
    }

    return userLogs.filter((log) => {
      if (log.role === 'super_admin') return false;
      const logEmail = (log.email || '').toLowerCase().trim();
      if (logEmail && superAdminEmails.has(logEmail)) return false;
      const logName = (log.name || '').toLowerCase();
      if (logName.includes('super admin')) return false;

      const details = (log.details || '').toLowerCase();
      const failureReason = (log.failureReason || '').toLowerCase();
      if (details.includes('super admin') || failureReason.includes('super admin')) return false;

      for (const sEmail of superAdminEmails) {
        if (details.includes(sEmail) || failureReason.includes(sEmail)) return false;
      }
      return true;
    });
  }, [userLogs, isCurrentSuperAdmin, superAdminEmails]);

  // Filtered audit logs
  const filteredLogs = useMemo(() => {
    return visibleLogs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesEmail = log.email?.toLowerCase().includes(q);
        const matchesName = log.name?.toLowerCase().includes(q);
        const matchesDevice = log.device?.toLowerCase().includes(q) || log.browser?.toLowerCase().includes(q);
        const matchesReason = log.failureReason?.toLowerCase().includes(q) || log.details?.toLowerCase().includes(q);
        if (!matchesEmail && !matchesName && !matchesDevice && !matchesReason) return false;
      }

      if (roleFilter !== 'all' && log.role !== roleFilter) return false;
      if (eventFilter !== 'all' && log.eventType !== eventFilter) return false;
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;

      if (dateRange !== 'all') {
        const logTime = new Date(log.timestamp).getTime();
        const now = Date.now();
        if (dateRange === 'today' && logTime < now - 24 * 60 * 60 * 1000) return false;
        if (dateRange === '7days' && logTime < now - 7 * 24 * 60 * 60 * 1000) return false;
        if (dateRange === '30days' && logTime < now - 30 * 24 * 60 * 60 * 1000) return false;
      }

      return true;
    });
  }, [visibleLogs, searchQuery, roleFilter, eventFilter, statusFilter, dateRange]);

  // Pagination for audit logs
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshRegisteredUsers();
      addToast({
        type: 'success',
        title: 'User Records Synchronized',
        message: `Accounts and logs refreshed successfully.`,
      });
    } catch (err: any) {
      console.warn('Refresh note:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGenerateAuditTrail = async () => {
    setIsGeneratingAudit(true);
    try {
      let created = 0;
      for (const u of registeredUsers) {
        if (!userLogs.some((l) => l.email?.toLowerCase() === u.email.toLowerCase() && l.eventType === 'signup')) {
          await recordUserLog({
            userId: u.id,
            email: u.email,
            name: u.name,
            role: u.role || 'customer',
            eventType: 'signup',
            authMethod: 'email_password',
            status: 'success',
            details: `Account registered for ${u.name} (${u.email})`,
          });
          created++;
        }
      }
      addToast({
        type: 'success',
        title: 'Audit Trail Reconstructed',
        message: `Generated ${created} audit entries from registered accounts.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Sync Failed',
        message: err.message || 'Error reconstructing audit records.',
      });
    } finally {
      setIsGeneratingAudit(false);
    }
  };

  const formatTimestamp = (iso?: string) => {
    if (!iso) return 'Recent';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const formatRelativeTime = (iso?: string) => {
    if (!iso) return '';
    try {
      const diffMs = Date.now() - new Date(iso).getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-emerald-300" />
            <span>Customer Roster & User Activity Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            User Activity & Registered Accounts
          </h1>
          <p className="text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
            Track all accounts created on 7Seasons, monitor customer order counts, inspect login security logs, and broadcast bulk marketing emails directly to customers.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Main Action: Send Bulk Email */}
          <button
            type="button"
            onClick={handleOpenEmailForSelected}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-lg hover:shadow-emerald-900/40 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4 text-emerald-100" />
            <span>Send Bulk Email to Customers</span>
          </button>

          <button
            type="button"
            onClick={handleExportAccountsCSV}
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-2xl text-xs font-bold transition-all border border-white/15 cursor-pointer shadow-xs"
            title="Download CSV report of all accounts and order counts"
          >
            <Download className="w-3.5 h-3.5 text-emerald-300" />
            <span>Export Accounts CSV</span>
          </button>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-3 rounded-2xl text-xs font-bold transition-all border border-white/15 cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh accounts and orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-300 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics: Accounts Created & Orders Ordered */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Accounts Created */}
        <div className="bg-white dark:bg-[#0c1e17] rounded-3xl p-5 border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Accounts Created
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-950 dark:text-emerald-50 mt-2">
            {accountMetrics.totalAccounts}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            Total registered customer accounts
          </span>
        </div>

        {/* Metric 2: Accounts with Orders */}
        <div className="bg-white dark:bg-[#0c1e17] rounded-3xl p-5 border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Active Shoppers
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-950 dark:text-blue-50 mt-2">
            {accountMetrics.accountsWithOrders}
          </div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
            Accounts with ≥1 order placed
          </span>
        </div>

        {/* Metric 3: Total Customer Orders */}
        <div className="bg-white dark:bg-[#0c1e17] rounded-3xl p-5 border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Orders Placed
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-950 dark:text-amber-50 mt-2">
            {accountMetrics.totalOrdersPlaced}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
            Live orders in database
          </span>
        </div>

        {/* Metric 4: Registered with 0 Orders */}
        <div className="bg-white dark:bg-[#0c1e17] rounded-3xl p-5 border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Registered Leads (0 Orders)
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-950 dark:text-purple-50 mt-2">
            {accountMetrics.zeroOrderAccounts}
          </div>
          <span className="text-[11px] text-purple-600 font-semibold mt-1 block">
            Target for promotional bulk emails
          </span>
        </div>
      </div>

      {/* Sub-Tab Navigation Switcher */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('accounts')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'accounts'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Accounts Created & Orders List ({filteredAccountSummaries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('audit-logs')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'audit-logs'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Authentication & Login Audit Logs ({filteredLogs.length})</span>
          </button>
        </div>

        {activeSubTab === 'accounts' && selectedUserIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full">
              {selectedUserIds.length} Selected
            </span>
            <button
              type="button"
              onClick={handleOpenEmailForSelected}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
            >
              <Send className="w-3 h-3" />
              <span>Email Selected ({selectedUserIds.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: ACCOUNTS CREATED & ORDER HISTORY LIST (Main user requirement) */}
      {activeSubTab === 'accounts' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-[#0c1e17] rounded-3xl p-4 sm:p-5 border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
                placeholder="Search by customer email ID, full name, or phone number..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-gray-200 dark:border-gray-800 bg-[#F4FAF5] dark:bg-[#06120e] text-emerald-950 dark:text-emerald-50 focus:bg-white dark:focus:bg-[#0a1f18] focus:border-emerald-600 outline-hidden font-medium"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setAccountFilter('all')}
                className={`px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer ${
                  accountFilter === 'all'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                All Accounts ({visibleAccountSummaries.length})
              </button>

              <button
                type="button"
                onClick={() => setAccountFilter('ordered')}
                className={`px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer ${
                  accountFilter === 'ordered'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                With Orders ({accountMetrics.accountsWithOrders})
              </button>

              <button
                type="button"
                onClick={() => setAccountFilter('zero-orders')}
                className={`px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer ${
                  accountFilter === 'zero-orders'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                0 Orders ({accountMetrics.zeroOrderAccounts})
              </button>

              <button
                type="button"
                onClick={() => setAccountFilter('admin')}
                className={`px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer ${
                  accountFilter === 'admin'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                Staff / Admin
              </button>
            </div>
          </div>

          {/* Accounts Table Card */}
          <div className="bg-white dark:bg-[#0c1e17] rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <th className="py-3.5 pl-6 pr-2 w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedUserIds.length === filteredAccountSummaries.length &&
                          filteredAccountSummaries.length > 0
                        }
                        onChange={handleSelectAllAccounts}
                        className="rounded accent-emerald-600 cursor-pointer"
                        title="Select All Accounts"
                      />
                    </th>
                    <th className="py-3.5 px-4">Account / Customer</th>
                    <th className="py-3.5 px-4">Email ID of Account</th>
                    <th className="py-3.5 px-4">Account Created Date</th>
                    <th className="py-3.5 px-4 text-center">Orders Ordered</th>
                    <th className="py-3.5 px-4 text-center">Role</th>
                    <th className="py-3.5 pr-6 pl-4 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                  {filteredAccountSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="font-bold text-sm text-gray-700 dark:text-gray-300">
                          No matching customer accounts found
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try adjusting your search query or filter.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredAccountSummaries.map(({ user, orderCount, totalSpent, orders: userOrders, isSuper, isAdmin }) => {
                      const userKey = user.id || user.email;
                      const isSelected = selectedUserIds.includes(userKey);

                      return (
                        <tr
                          key={userKey}
                          className={`hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors ${
                            isSelected ? 'bg-emerald-50/60 dark:bg-emerald-950/40' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-4 pl-6 pr-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectAccount(userKey)}
                              className="rounded accent-emerald-600 cursor-pointer"
                            />
                          </td>

                          {/* Customer Name & Avatar */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {user.profileImage ? (
                                <img
                                  src={user.profileImage}
                                  alt={user.name}
                                  className="w-8 h-8 rounded-full object-cover border border-emerald-600/30"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-black flex items-center justify-center text-xs">
                                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                  <span>{user.name || 'Unnamed Customer'}</span>
                                  {isSuper && (
                                    <span title="Super Administrator">
                                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                                    </span>
                                  )}
                                </div>
                                {user.phone && (
                                  <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                    <Phone className="w-2.5 h-2.5" />
                                    <span>{user.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Email ID of Account with Copy Button */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-emerald-900 dark:text-emerald-300">
                                {user.email}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyEmail(user.email)}
                                className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950 rounded-md transition-colors cursor-pointer"
                                title="Copy Email ID"
                              >
                                {copiedEmail === user.email ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Account Created Date */}
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <div>
                                <span>{formatTimestamp(user.createdAt)}</span>
                                {user.createdAt && (
                                  <span className="text-[10px] text-gray-400 block">
                                    {formatRelativeTime(user.createdAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Number of Orders Ordered */}
                          <td className="py-4 px-4 text-center">
                            {orderCount > 0 ? (
                              <button
                                type="button"
                                onClick={() => setSelectedUserForOrders(user)}
                                className="inline-flex flex-col items-center group cursor-pointer"
                                title="Click to view customer's order history"
                              >
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 group-hover:bg-emerald-200 transition-colors">
                                  <ShoppingBag className="w-3 h-3 text-emerald-600" />
                                  <span>{orderCount} Order{orderCount === 1 ? '' : 's'}</span>
                                </span>
                                {totalSpent > 0 && (
                                  <span className="text-[10px] font-bold text-gray-500 mt-0.5">
                                    ₹{totalSpent.toLocaleString('en-IN')} total
                                  </span>
                                )}
                              </button>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500">
                                0 Orders
                              </span>
                            )}
                          </td>

                          {/* Role Badge */}
                          <td className="py-4 px-4 text-center">
                            {isSuper ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                                <Crown className="w-3 h-3 text-purple-600" />
                                Super Admin
                              </span>
                            ) : isAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                Customer
                              </span>
                            )}
                          </td>

                          {/* Quick Actions */}
                          <td className="py-4 pr-6 pl-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Direct Email */}
                              <button
                                type="button"
                                onClick={() => handleOpenEmailForUser(user)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                                title="Compose email to this customer"
                              >
                                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Email</span>
                              </button>

                              {/* View Orders Modal trigger */}
                              {orderCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedUserForOrders(user)}
                                  className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                                  title="View orders details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Summary */}
            <div className="p-4 bg-gray-50/70 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
              <div>
                Showing <strong>{filteredAccountSummaries.length}</strong> of{' '}
                <strong>{visibleAccountSummaries.length}</strong> registered customer accounts on the site.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportAccountsCSV}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Accounts CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUTHENTICATION & LOGIN AUDIT LOGS */}
      {activeSubTab === 'audit-logs' && (
        <div className="space-y-4">
          {/* Audit Logs Filter Bar */}
          <div className="bg-white dark:bg-[#0c1e17] rounded-3xl p-4 sm:p-5 border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by email, name, browser or failure reason..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-gray-200 dark:border-gray-800 bg-[#F4FAF5] dark:bg-[#06120e] text-emerald-950 dark:text-emerald-50 focus:bg-white dark:focus:bg-[#0a1f18] focus:border-emerald-600 outline-hidden font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={eventFilter}
                  onChange={(e) => {
                    setEventFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a1f18] text-gray-700 dark:text-gray-300 outline-hidden font-medium"
                >
                  <option value="all">All Events</option>
                  <option value="login_success">Login Success</option>
                  <option value="login_failed">Login Failed</option>
                  <option value="signup">Sign Up</option>
                  <option value="logout">Sign Out</option>
                  <option value="password_reset">Password Reset</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a1f18] text-gray-700 dark:text-gray-300 outline-hidden font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="success">Success Only</option>
                  <option value="failed">Failed Only</option>
                </select>

                <select
                  value={dateRange}
                  onChange={(e) => {
                    setDateRange(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a1f18] text-gray-700 dark:text-gray-300 outline-hidden font-medium"
                >
                  <option value="all">All Time</option>
                  <option value="today">Past 24 Hours</option>
                  <option value="7days">Past 7 Days</option>
                  <option value="30days">Past 30 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white dark:bg-[#0c1e17] rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-[11px] font-black uppercase tracking-wider text-gray-500">
                    <th className="py-3.5 pl-6 pr-4">Event Type</th>
                    <th className="py-3.5 px-4">User / Account</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Method / Details</th>
                    <th className="py-3.5 pr-6 pl-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                  {paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="font-bold text-sm">No activity records match your filter</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="py-3.5 pl-6 pr-4">
                          {log.status === 'failed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3.5 h-3.5 text-rose-500" />
                              Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {log.eventType.replace('_', ' ').toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900 dark:text-gray-100">{log.name || 'Anonymous User'}</div>
                          <div className="text-[11px] text-gray-500 font-mono">{log.email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 capitalize">{log.role || 'customer'}</td>
                        <td className="py-3.5 px-4 text-gray-500">{formatTimestamp(log.timestamp)}</td>
                        <td className="py-3.5 px-4 text-gray-600 truncate max-w-xs">{log.details || log.failureReason || 'Auth event'}</td>
                        <td className="py-3.5 pr-6 pl-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="Inspect log details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                <span>Page {currentPage} of {totalPages} ({filteredLogs.length} logs)</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer Orders History Modal (when clicking a user's orders) */}
      {selectedUserForOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#0c1e17] rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-emerald-900/15 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                  Order History for {selectedUserForOrders.name || selectedUserForOrders.email}
                </h3>
                <p className="text-xs text-gray-500 font-mono">{selectedUserForOrders.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForOrders(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {(() => {
              const uEmail = (selectedUserForOrders.email || '').toLowerCase().trim();
              const uOrders = orders.filter((o) => {
                const ordEmail = (o.customer?.email || '').toLowerCase().trim();
                return (uEmail && ordEmail === uEmail) || (selectedUserForOrders.id && o.customerId === selectedUserForOrders.id);
              });

              if (uOrders.length === 0) {
                return (
                  <div className="py-8 text-center text-gray-500">
                    <ShoppingBag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="font-bold">No orders found for this account.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {uOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-950 dark:text-emerald-100">
                          #{ord.orderNumber}
                        </span>
                        <span className="font-extrabold text-sm text-emerald-700">
                          ₹{ord.total}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-gray-500">
                        <span>Placed on: {formatTimestamp(ord.createdAt)}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          {ord.orderStatus}
                        </span>
                      </div>
                      {ord.items && ord.items.length > 0 && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 text-[11px] text-gray-600 dark:text-gray-300">
                          <strong>Items:</strong> {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUserForOrders(null)}
                className="px-5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#0c1e17] rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-emerald-900/15 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Audit Log Details</h3>
              <button onClick={() => setSelectedLog(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <div><strong>Event:</strong> {selectedLog.eventType}</div>
              <div><strong>Status:</strong> {selectedLog.status}</div>
              <div><strong>User:</strong> {selectedLog.name} ({selectedLog.email})</div>
              <div><strong>Role:</strong> {selectedLog.role}</div>
              <div><strong>Timestamp:</strong> {selectedLog.timestamp}</div>
              <div><strong>Details:</strong> {selectedLog.details || 'N/A'}</div>
              {selectedLog.failureReason && <div className="text-rose-600"><strong>Failure:</strong> {selectedLog.failureReason}</div>}
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-gray-100 rounded-full font-bold text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Email Composer Modal */}
      <BulkEmailModal
        isOpen={isBulkEmailOpen}
        onClose={() => setIsBulkEmailOpen(false)}
        selectedUsers={bulkEmailPreselected.filter(
          (u) =>
            isCurrentSuperAdmin ||
            (!superAdminEmails.has((u.email || '').toLowerCase().trim()) && u.role !== 'super_admin')
        )}
        allUsers={
          isCurrentSuperAdmin
            ? registeredUsers
            : registeredUsers.filter(
                (u) =>
                  !superAdminEmails.has((u.email || '').toLowerCase().trim()) &&
                  u.role !== 'super_admin'
              )
        }
        orders={orders}
      />
    </div>
  );
};
