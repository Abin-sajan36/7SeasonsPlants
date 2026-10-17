import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316'];

type DatePreset = 'today' | '7days' | '30days' | 'lastMonth' | 'allTime' | 'custom';

// Helper to format Date to YYYY-MM-DD in local time
const formatDateToISO = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const AnalyticsDashboard = () => {
  const { orders, products, combos } = useStore();

  // Date Range Filter State
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>('allTime');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Explicit chart view mode (auto, monthly, daily)
  const [chartViewMode, setChartViewMode] = useState<'auto' | 'monthly' | 'daily'>('auto');

  // Handle Preset Selection
  const applyPreset = (preset: DatePreset) => {
    setSelectedPreset(preset);
    setChartViewMode('auto');
    const now = new Date();

    if (preset === 'allTime') {
      setFromDate('');
      setToDate('');
      return;
    }

    if (preset === 'today') {
      const todayStr = formatDateToISO(now);
      setFromDate(todayStr);
      setToDate(todayStr);
      return;
    }

    if (preset === '7days') {
      const past = new Date(now);
      past.setDate(past.getDate() - 6);
      setFromDate(formatDateToISO(past));
      setToDate(formatDateToISO(now));
      return;
    }

    if (preset === '30days') {
      const past = new Date(now);
      past.setDate(past.getDate() - 29);
      setFromDate(formatDateToISO(past));
      setToDate(formatDateToISO(now));
      return;
    }

    if (preset === 'lastMonth') {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      setFromDate(formatDateToISO(firstDayLastMonth));
      setToDate(formatDateToISO(lastDayLastMonth));
      return;
    }
  };

  // When manually typing/picking dates
  const handleCustomDateChange = (type: 'from' | 'to', value: string) => {
    setSelectedPreset('custom');
    setChartViewMode('auto');
    if (type === 'from') {
      setFromDate(value);
    } else {
      setToDate(value);
    }
  };

  // Clear date filters
  const handleClearFilters = () => {
    applyPreset('allTime');
  };

  // Determine span in days to decide adaptive daily vs monthly chart grouping
  const isShortRange = useMemo(() => {
    if (!fromDate || !toDate) return false;
    const start = new Date(fromDate).getTime();
    const end = new Date(toDate).getTime();
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 && diffDays <= 31;
  }, [fromDate, toDate]);

  // Effective chart granularity (daily or monthly)
  const effectiveGranularity: 'daily' | 'monthly' = useMemo(() => {
    if (chartViewMode === 'daily') return 'daily';
    if (chartViewMode === 'monthly') return 'monthly';
    return isShortRange ? 'daily' : 'monthly';
  }, [chartViewMode, isShortRange]);

  const isAllTime = !fromDate && !toDate;

  // Filtered orders & analytics calculation
  const analytics = useMemo(() => {
    let totalRevenue = 0;
    let completedOrders = 0;
    const revenueOverTime: Record<string, { label: string; dateObj: Date; revenue: number }> = {};
    const salesByCategory: Record<string, number> = {};
    const topProducts: Record<string, { name: string; sales: number; revenue: number }> = {};
    const filteredOrdersList: typeof orders = [];

    // Timestamps for comparison
    const fromTime = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
    const toTime = toDate ? new Date(`${toDate}T23:59:59.999`).getTime() : null;

    // 1. PRE-POPULATE TIMELINE
    if (effectiveGranularity === 'daily') {
      // Daily breakdown
      let startDate: Date;
      let endDate: Date;

      if (fromDate && toDate) {
        startDate = new Date(`${fromDate}T00:00:00`);
        endDate = new Date(`${toDate}T00:00:00`);
      } else {
        // If All Time was clicked but user switched to Daily view, show the last 30 days
        const now = new Date();
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
      }

      const current = new Date(startDate);
      while (current <= endDate) {
        const key = formatDateToISO(current);
        const label = current.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        revenueOverTime[key] = { label, dateObj: new Date(current), revenue: 0 };
        current.setDate(current.getDate() + 1);
      }
    } else {
      // Monthly breakdown
      const now = new Date();
      let startYear: number;
      let startMonth: number;
      let endYear: number = now.getFullYear();
      let endMonth: number = now.getMonth();

      if (fromDate && toDate) {
        const f = new Date(fromDate);
        const t = new Date(toDate);
        startYear = f.getFullYear();
        startMonth = f.getMonth();
        endYear = t.getFullYear();
        endMonth = t.getMonth();
      } else {
        // "ALL TIME": Pre-populate the full annual / lifetime timeline!
        // At least the past 12 months, or back to the earliest order date if older
        startYear = now.getFullYear() - 1;
        startMonth = now.getMonth() + 1; // 12-month rolling window (e.g., Nov 2025 to Oct 2026)

        orders.forEach((o) => {
          const dStr = o.createdAt || (o as any).orderDate;
          if (dStr) {
            const d = new Date(dStr);
            if (!isNaN(d.getTime())) {
              const y = d.getFullYear();
              const m = d.getMonth();
              if (y < startYear || (y === startYear && m < startMonth)) {
                startYear = y;
                startMonth = m;
              }
            }
          }
        });
      }

      const iter = new Date(startYear, startMonth, 1);
      const limit = new Date(endYear, endMonth, 1);

      while (iter <= limit) {
        const monthKey = `${iter.getFullYear()}-${String(iter.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = `${iter.toLocaleString('default', { month: 'short' })} ${iter.getFullYear()}`;
        revenueOverTime[monthKey] = {
          label: monthLabel,
          dateObj: new Date(iter),
          revenue: 0,
        };
        iter.setMonth(iter.getMonth() + 1);
      }
    }

    // 2. PROCESS ORDERS AND AGGREGATE REVENUE
    orders.forEach((order) => {
      const orderDateStr = order.createdAt || (order as any).orderDate;
      const orderDate = new Date(orderDateStr);
      const orderTime = orderDate.getTime();

      // Check date bounds
      if (fromTime !== null && orderTime < fromTime) return;
      if (toTime !== null && orderTime > toTime) return;

      filteredOrdersList.push(order);

      // Basic metrics (exclude cancelled or failed payments)
      if (order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Payment Failed') {
        completedOrders++;
        const total = order.total || (order as any).totalAmount || 0;
        totalRevenue += total;

        // Group revenue over time (daily or monthly)
        if (effectiveGranularity === 'daily') {
          const dayKey = formatDateToISO(orderDate);
          const dayLabel = orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
          if (!revenueOverTime[dayKey]) {
            revenueOverTime[dayKey] = { label: dayLabel, dateObj: orderDate, revenue: 0 };
          }
          revenueOverTime[dayKey].revenue += total;
        } else {
          // Monthly grouping
          const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
          const monthLabel = `${orderDate.toLocaleString('default', { month: 'short' })} ${orderDate.getFullYear()}`;
          if (!revenueOverTime[monthKey]) {
            revenueOverTime[monthKey] = { label: monthLabel, dateObj: orderDate, revenue: 0 };
          }
          revenueOverTime[monthKey].revenue += total;
        }

        // Sales by product/category
        if (Array.isArray(order.items)) {
          order.items.forEach((item) => {
            if (!topProducts[item.id]) {
              topProducts[item.id] = { name: item.name, sales: 0, revenue: 0 };
            }
            topProducts[item.id].sales += item.quantity || 1;
            topProducts[item.id].revenue += (item.price || 0) * (item.quantity || 1);

            const product = products.find((p) => p.id === item.id);
            const category = product?.category || (item.type === 'combo' ? 'Combos' : 'Plants');
            salesByCategory[category] = (salesByCategory[category] || 0) + (item.quantity || 1);
          });
        }
      }
    });

    // Sort timeline data chronologically
    const timeData = Object.values(revenueOverTime)
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .map((item) => ({
        label: item.label,
        revenue: item.revenue,
      }));

    const categoryData = Object.entries(salesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const topProductsData = Object.values(topProducts)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    return {
      totalRevenue,
      completedOrders,
      averageOrderValue: completedOrders > 0 ? totalRevenue / completedOrders : 0,
      timeData,
      categoryData,
      topProductsData,
      totalCatalogItems: products.length + combos.length,
      filteredOrdersCount: filteredOrdersList.length,
      filteredOrdersList,
    };
  }, [orders, products, combos, fromDate, toDate, effectiveGranularity]);

  // Export Filtered Report as CSV
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Status', 'Total (INR)', 'Item Count'];
    const rows = analytics.filteredOrdersList.map((o) => {
      const dateStr = new Date(o.createdAt || (o as any).orderDate).toLocaleDateString('en-IN');
      const customer = o.customer?.name || (o as any).shippingAddress?.fullName || 'Customer';
      const itemsCount = (o.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
      const total = o.total || (o as any).totalAmount || 0;
      return [
        `"${o.id}"`,
        `"${dateStr}"`,
        `"${customer.replace(/"/g, '""')}"`,
        `"${o.orderStatus}"`,
        total,
        itemsCount,
      ];
    });

    const summaryBlock = [
      ['7Seasons Nursery Analytics Report'],
      ['Date Filter Range:', fromDate && toDate ? `${fromDate} to ${toDate}` : 'All Time (Lifetime)'],
      ['Total Filtered Revenue (INR):', analytics.totalRevenue],
      ['Total Completed Orders:', analytics.completedOrders],
      ['Average Order Value (INR):', Math.round(analytics.averageOrderValue)],
      ['Total Orders in Period:', analytics.filteredOrdersCount],
      [],
      headers,
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      summaryBlock.map((r) => r.join(',')).join('\n') +
      '\n' +
      rows.map((r) => r.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `7seasons-analytics-${fromDate || 'start'}_to_${toDate || 'today'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* DATE RANGE FILTER TOOLBAR */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-emerald-900/10 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800 mb-1">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Analytics Date Range Filter</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
              Performance & Sales Overview
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Choose custom From and To dates or use quick shortcuts to analyze store revenue, orders, and popular combos.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {(fromDate || toDate || selectedPreset !== 'allTime') && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title="Reset to All Time"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Range</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-2"
              title="Download CSV report of the selected date range"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs & Presets Grid */}
        <div className="pt-3 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'allTime', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' },
              { id: 'lastMonth', label: 'Last Month' },
            ].map((p) => {
              const isSelected = selectedPreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id as DatePreset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100 border border-emerald-200/60'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Custom Date Pickers */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
              <span className="text-[11px] font-bold text-gray-500 uppercase">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => handleCustomDateChange('from', e.target.value)}
                max={toDate || undefined}
                className="bg-transparent text-xs text-gray-900 font-bold outline-hidden cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
              <span className="text-[11px] font-bold text-gray-500 uppercase">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => handleCustomDateChange('to', e.target.value)}
                min={fromDate || undefined}
                className="bg-transparent text-xs text-gray-900 font-bold outline-hidden cursor-pointer"
              />
            </div>
          </div>
        </div>


      </div>

      {/* TOP METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {isAllTime ? 'All-Time Revenue' : 'Filtered Revenue'}
            </p>
            <h3 className="text-2xl font-black text-emerald-950 mt-0.5">
              ₹{analytics.totalRevenue.toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] text-emerald-700 font-medium">
              {isAllTime ? 'Lifetime store earnings' : 'In selected date range'}
            </span>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Completed Orders</p>
            <h3 className="text-2xl font-black text-emerald-950 mt-0.5">{analytics.completedOrders}</h3>
            <span className="text-[11px] text-blue-700 font-medium">
              {isAllTime ? 'Lifetime completed orders' : 'Delivered & confirmed'}
            </span>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg. Order Value</p>
            <h3 className="text-2xl font-black text-emerald-950 mt-0.5">
              ₹{Math.round(analytics.averageOrderValue).toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] text-amber-700 font-medium">
              {isAllTime ? 'Lifetime average per order' : 'Per completed order'}
            </span>
          </div>
        </div>

        {/* Total Catalog */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Catalog</p>
            <h3 className="text-2xl font-black text-emerald-950 mt-0.5">
              {analytics.totalCatalogItems} Items
            </h3>
            <span className="text-[11px] text-purple-700 font-medium">Combos & plant varieties</span>
          </div>
        </div>
      </div>

      {/* NO ORDERS WARNING NOTICE */}
      {analytics.filteredOrdersCount === 0 && (
        <div className="p-8 bg-amber-50 rounded-3xl border border-amber-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h4 className="text-base font-bold text-amber-950">No orders found for the selected dates</h4>
          <p className="text-xs text-amber-800 max-w-md mx-auto">
            There were no customer orders placed between {fromDate || 'the beginning'} and {toDate || 'today'}. Try adjusting your From/To dates or click below to view all-time sales.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-5 py-2 bg-emerald-800 text-white rounded-full text-xs font-bold hover:bg-emerald-900 transition-colors cursor-pointer"
          >
            Show All Time Data
          </button>
        </div>
      )}

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Line Chart */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-emerald-950">Revenue Trend</h3>
              <p className="text-xs text-gray-500">
                {effectiveGranularity === 'daily'
                  ? 'Daily revenue breakdown'
                  : isAllTime
                  ? `All-Time Monthly Revenue History (${analytics.timeData.length} Months)`
                  : 'Monthly revenue progress'}
              </p>
            </div>

            {/* Granularity Switcher: Monthly vs Daily */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setChartViewMode('monthly')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  effectiveGranularity === 'monthly'
                    ? 'bg-white text-emerald-950 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="View monthly revenue breakdown"
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setChartViewMode('daily')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  effectiveGranularity === 'daily'
                    ? 'bg-white text-emerald-950 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="View daily revenue breakdown"
              >
                Daily
              </button>
            </div>
          </div>

          <div className="h-72">
            {analytics.timeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.timeData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No revenue data recorded for this time range.
              </div>
            )}
          </div>
        </div>

        {/* Sales by Category Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-emerald-950">Sales by Category</h3>
            <p className="text-xs text-gray-500">
              {isAllTime
                ? 'All-time volume distribution across plant varieties and combos'
                : 'Volume distribution across plant varieties and combos in selected dates'}
            </p>
          </div>

          <div className="h-72">
            {analytics.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {analytics.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: number) => [`${val} units`, 'Quantity Sold']}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No category sales recorded for this time range.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2: TOP SELLING ITEMS */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-emerald-950">Top Selling Products & Combos</h3>
            <p className="text-xs text-gray-500">
              {isAllTime
                ? 'Ranked by lifetime units ordered across all time'
                : 'Ranked by units ordered during the selected period'}
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
            {isAllTime ? 'All-Time Bestsellers' : 'Top Bestsellers'}
          </span>
        </div>

        <div className="h-72">
          {analytics.topProductsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.topProductsData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#374151', fontSize: 11, fontWeight: 'bold' }}
                  width={140}
                />
                <RechartsTooltip
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number, name: string) => [
                    name === 'sales' ? `${val} Units Sold` : `₹${val.toLocaleString('en-IN')}`,
                    name === 'sales' ? 'Units' : 'Revenue',
                  ]}
                />
                <Bar dataKey="sales" fill="#10b981" radius={[0, 6, 6, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              No product sales data available for this date window.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
