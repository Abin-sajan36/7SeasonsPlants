import React, { useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, DollarSign, Package } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export const AnalyticsDashboard = () => {
  const { orders, products, combos } = useStore();

  const analytics = useMemo(() => {
    let totalRevenue = 0;
    let completedOrders = 0;
    const revenueByMonth: Record<string, number> = {};
    const salesByCategory: Record<string, number> = {};
    const topProducts: Record<string, { name: string; sales: number; revenue: number }> = {};

    orders.forEach((order) => {
      // Basic metrics
      if (order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Payment Failed') {
        completedOrders++;
        const total = order.total || (order as any).totalAmount || 0;
        totalRevenue += total;

        // Revenue over time (monthly)
        const date = new Date(order.createdAt || (order as any).orderDate);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        revenueByMonth[monthYear] = (revenueByMonth[monthYear] || 0) + total;

        // Sales by product/category
        order.items.forEach((item) => {
          // Top products
          if (!topProducts[item.id]) {
            topProducts[item.id] = { name: item.name, sales: 0, revenue: 0 };
          }
          topProducts[item.id].sales += item.quantity;
          topProducts[item.id].revenue += item.price * item.quantity;

          // Category (we have to look it up, assuming products is available, else we just use a generic 'Plant')
          const product = products.find(p => p.id === item.id);
          const category = product?.category || (item.type === 'combo' ? 'Combos' : 'Other');
          salesByCategory[category] = (salesByCategory[category] || 0) + item.quantity;
        });
      }
    });

    const monthlyData = Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue }));
    
    // ensure chronological sorting for monthly data, this is simplified
    monthlyData.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    const categoryData = Object.entries(salesByCategory).map(([name, value]) => ({ name, value }));
    
    const topProductsData = Object.values(topProducts)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    return {
      totalRevenue,
      completedOrders,
      averageOrderValue: completedOrders > 0 ? totalRevenue / completedOrders : 0,
      monthlyData,
      categoryData,
      topProductsData,
      totalProducts: products.length + combos.length
    };
  }, [orders, products, combos]);

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">Total Revenue</p>
            <h3 className="text-2xl font-black text-emerald-950">₹{analytics.totalRevenue.toLocaleString('en-IN')}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">Completed Orders</p>
            <h3 className="text-2xl font-black text-emerald-950">{analytics.completedOrders}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">Avg. Order Value</p>
            <h3 className="text-2xl font-black text-emerald-950">₹{Math.round(analytics.averageOrderValue).toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">Total Catalog</p>
            <h3 className="text-2xl font-black text-emerald-950">{analytics.totalProducts} Items</h3>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Line Chart */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs">
          <h3 className="text-base font-bold text-emerald-950 mb-6">Revenue Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₹${value}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs">
          <h3 className="text-base font-bold text-emerald-950 mb-6">Sales by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs">
          <h3 className="text-base font-bold text-emerald-950 mb-6">Top Selling Items</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.topProductsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 11, fontWeight: 'bold' }} width={120} />
                <RechartsTooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
