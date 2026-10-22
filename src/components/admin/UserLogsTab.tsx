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
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { UserLoginLog, AuthEventType } from '../../types';

export const UserLogsTab: React.FC = () => {
  const { userLogs, isCurrentSuperAdmin, clearUserLogs, addToast } = useStore();

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

  // If not super admin, block access
  if (!isCurrentSuperAdmin) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-red-100 shadow-sm space-y-4 max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Restricted to Super Administrators</h2>
        <p className="text-sm text-gray-500">
          User login and authentication audit logs contain sensitive operational tracking data and can only be accessed by the primary store super administrator.
        </p>
      </div>
    );
  }

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return userLogs.filter((log) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesEmail = log.email?.toLowerCase().includes(q);
        const matchesName = log.name?.toLowerCase().includes(q);
        const matchesDevice = log.device?.toLowerCase().includes(q) || log.browser?.toLowerCase().includes(q);
        const matchesReason = log.failureReason?.toLowerCase().includes(q) || log.details?.toLowerCase().includes(q);
        if (!matchesEmail && !matchesName && !matchesDevice && !matchesReason) {
          return false;
        }
      }

      // Role filter
      if (roleFilter !== 'all' && log.role !== roleFilter) {
        return false;
      }

      // Event filter
      if (eventFilter !== 'all' && log.eventType !== eventFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && log.status !== statusFilter) {
        return false;
      }

      // Date Range filter
      if (dateRange !== 'all') {
        const logTime = new Date(log.timestamp).getTime();
        const now = Date.now();
        if (dateRange === 'today') {
          const oneDayAgo = now - 24 * 60 * 60 * 1000;
          if (logTime < oneDayAgo) return false;
        } else if (dateRange === '7days') {
          const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
          if (logTime < sevenDaysAgo) return false;
        } else if (dateRange === '30days') {
          const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
          if (logTime < thirtyDaysAgo) return false;
        }
      }

      return true;
    });
  }, [userLogs, searchQuery, roleFilter, eventFilter, statusFilter, dateRange]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = userLogs.length;
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const todayLogins = userLogs.filter(
      (l) => new Date(l.timestamp).getTime() >= oneDayAgo && l.eventType === 'login_success'
    ).length;

    const failedLogins = userLogs.filter((l) => l.status === 'failed').length;
    const adminEvents = userLogs.filter((l) => l.role === 'admin' || l.role === 'super_admin').length;
    const customerLogins = userLogs.filter((l) => l.role === 'customer' && l.eventType === 'login_success').length;

    return { total, todayLogins, failedLogins, adminEvents, customerLogins };
  }, [userLogs]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      addToast({
        type: 'warning',
        title: 'No Data to Export',
        message: 'No log records match the current filter selection.',
      });
      return;
    }

    const headers = [
      'Log ID',
      'Timestamp',
      'Email',
      'Name',
      'Role',
      'Event Type',
      'Status',
      'Auth Method',
      'Device',
      'Browser',
      'Failure Reason',
      'Details',
    ];

    const rows = filteredLogs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.email || ''}"`,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${l.role}"`,
      `"${l.eventType}"`,
      `"${l.status}"`,
      `"${l.authMethod}"`,
      `"${l.device || ''}"`,
      `"${l.browser || ''}"`,
      `"${(l.failureReason || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `7seasons_user_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Audit Logs Exported',
      message: `Exported ${filteredLogs.length} activity records to CSV.`,
    });
  };

  const handleConfirmClear = async () => {
    setIsClearing(true);
    try {
      await clearUserLogs();
      setIsClearModalOpen(false);
    } finally {
      setIsClearing(false);
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      const datePart = d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const timePart = d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      return `${datePart} at ${timePart}`;
    } catch {
      return iso;
    }
  };

  const formatRelativeTime = (iso: string) => {
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

  const getEventBadge = (eventType: AuthEventType, status: 'success' | 'failed') => {
    if (status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-500" />
          Failed Attempt
        </span>
      );
    }

    switch (eventType) {
      case 'login_success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Login Success
          </span>
        );
      case 'logout':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <LogOut className="w-3.5 h-3.5 text-gray-500" />
            Signed Out
          </span>
        );
      case 'signup':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <UserPlus className="w-3.5 h-3.5 text-blue-600" />
            Registered
          </span>
        );
      case 'password_reset':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            Password Reset
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-800">
            {eventType}
          </span>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'super_admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
          <Crown className="w-3 h-3 text-purple-600" />
          Super Admin
        </span>
      );
    }
    if (role === 'admin' || role === 'nursery_manager' || role === 'catalog_manager') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          {role.replace('_', ' ').toUpperCase()}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
        Customer
      </span>
    );
  };

  const getDeviceIcon = (device?: string) => {
    if (device === 'Mobile') return <Smartphone className="w-3.5 h-3.5 text-gray-500" />;
    if (device === 'Tablet') return <Tablet className="w-3.5 h-3.5 text-gray-500" />;
    return <Laptop className="w-3.5 h-3.5 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-200 border border-purple-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            Super Administrator Exclusive Audit
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            User Authentication & Login Audit Trail
          </h1>
          <p className="text-sm text-purple-200/80 max-w-2xl leading-relaxed">
            Real-time tracking of administrator sign-ins, customer account logins, authentication failures, and session events across all devices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/15 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-purple-300" />
            Export CSV
          </button>
          <button
            onClick={() => setIsClearModalOpen(true)}
            className="inline-flex items-center gap-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-rose-500/30 cursor-pointer shadow-xs"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            Prune Logs
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Recorded Events</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{stats.total}</div>
          <span className="text-[11px] text-gray-400 mt-1 block">Live Firestore audit entries</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Logins (Past 24h)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-950 mt-2">{stats.todayLogins}</div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Successful logins today</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Failed Attempts</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">{stats.failedLogins}</div>
          <span className="text-[11px] text-gray-400 mt-1 block">Blocked or invalid logins</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Admin Logins</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-950 mt-2">{stats.adminEvents}</div>
          <span className="text-[11px] text-purple-600 font-medium mt-1 block">Staff & Super Admin events</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by email, user name, device, browser or failure reason..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 bg-gray-50/50"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600/20 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admins Only</option>
              <option value="admin">Staff Admins</option>
              <option value="customer">Customers</option>
            </select>

            {/* Event Filter */}
            <select
              value={eventFilter}
              onChange={(e) => {
                setEventFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600/20 cursor-pointer"
            >
              <option value="all">All Event Types</option>
              <option value="login_success">Logins (Success)</option>
              <option value="login_failed">Logins (Failed)</option>
              <option value="logout">Sign Outs</option>
              <option value="signup">New Registrations</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600/20 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>

            {/* Time Filter */}
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600/20 cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Past 24 Hours</option>
              <option value="7days">Past 7 Days</option>
              <option value="30days">Past 30 Days</option>
            </select>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100">
          <div>
            Showing <strong className="text-gray-900">{filteredLogs.length}</strong> matching events
            {filteredLogs.length !== userLogs.length && ` (filtered from ${userLogs.length} total)`}
          </div>
          <div className="flex items-center gap-2">
            <span>Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold cursor-pointer"
            >
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {paginatedLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">No User Activity Logs Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery || roleFilter !== 'all' || eventFilter !== 'all'
                ? 'No events match your current filter settings. Try clearing some filters.'
                : 'Login events will automatically begin appearing here as administrators and customers authenticate.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Event & Status</th>
                  <th className="py-3 px-4">User Account</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Auth Method</th>
                  <th className="py-3 px-4">Device & Browser</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-normal">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getEventBadge(log.eventType, log.status)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">
                          {log.name || log.email || 'Anonymous'}
                        </span>
                        <span className="text-[11px] text-gray-500 font-mono">
                          {log.email}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getRoleBadge(log.role)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-gray-700 font-medium capitalize text-[11px]">
                        {log.authMethod ? log.authMethod.replace('_', ' ') : 'Standard'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-gray-700 text-[11px]">
                        {getDeviceIcon(log.device)}
                        <span>{log.device || 'Desktop'}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500">{log.browser || 'Browser'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-semibold text-[11px]">
                          {formatRelativeTime(log.timestamp)}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div>
              Page <strong className="text-gray-900">{currentPage}</strong> of{' '}
              <strong className="text-gray-900">{totalPages}</strong>
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-purple-900 text-white shadow-xs'
                        : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">Audit Record Detail</h3>
                  <span className="text-[10px] text-gray-400 font-mono">{selectedLog.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-2xl">
                <div>
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Status & Event</span>
                  <div className="mt-1">{getEventBadge(selectedLog.eventType, selectedLog.status)}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Account Role</span>
                  <div className="mt-1">{getRoleBadge(selectedLog.role)}</div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl space-y-2">
                <div>
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">User Identity</span>
                  <span className="font-bold text-gray-900 block">{selectedLog.name || 'Not provided'}</span>
                  <span className="text-gray-500 font-mono text-[11px]">{selectedLog.email}</span>
                </div>
                {selectedLog.userId && (
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold block">User ID</span>
                    <span className="font-mono text-[11px] text-gray-600">{selectedLog.userId}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-2xl">
                <div>
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Device / Browser</span>
                  <div className="flex items-center gap-1.5 mt-1 text-gray-700">
                    {getDeviceIcon(selectedLog.device)}
                    <span className="font-medium">{selectedLog.device || 'Desktop'}</span>
                    <span>•</span>
                    <span>{selectedLog.browser || 'Browser'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Auth Method</span>
                  <span className="font-medium text-gray-800 capitalize mt-1 block">
                    {selectedLog.authMethod ? selectedLog.authMethod.replace('_', ' ') : 'Standard'}
                  </span>
                </div>
              </div>

              {selectedLog.failureReason && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 space-y-1">
                  <span className="text-[10px] uppercase text-rose-500 font-bold block">Failure Reason</span>
                  <p className="font-medium">{selectedLog.failureReason}</p>
                </div>
              )}

              {selectedLog.details && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-800 space-y-1">
                  <span className="text-[10px] uppercase text-blue-500 font-bold block">Additional Details</span>
                  <p className="font-medium">{selectedLog.details}</p>
                </div>
              )}

              <div className="p-3 bg-gray-50 rounded-2xl">
                <span className="text-[10px] uppercase text-gray-400 font-bold block">Timestamp</span>
                <span className="text-gray-700 font-mono">{formatTimestamp(selectedLog.timestamp)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-black transition-colors cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Logs Confirmation Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-gray-200 shadow-2xl">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-gray-900">Purge User Activity Logs?</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                This will permanently delete all {userLogs.length} authentication and login history records from Cloud Firestore. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isClearing}
                onClick={handleConfirmClear}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isClearing ? 'Purging...' : 'Yes, Purge Logs'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
