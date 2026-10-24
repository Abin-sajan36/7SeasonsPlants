import React, { useState, useMemo } from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Minus,
  Download,
  Package,
  Layers,
  ArrowUpDown,
  SlidersHorizontal,
  Check,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, PlantCombo } from '../../types';

interface InventoryItem {
  id: string;
  name: string;
  subtitle?: string;
  type: 'plant' | 'combo';
  category?: string;
  sku: string;
  price: number;
  stock: number;
  image?: string;
}

export const InventoryManagement: React.FC = () => {
  const {
    products,
    combos,
    updateProductStock,
    updateComboStock,
    batchUpdateStock,
    addToast,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'plant' | 'combo'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'low' | 'out' | 'healthy'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [sortBy, setSortBy] = useState<'stock-asc' | 'stock-desc' | 'name-asc' | 'price-desc'>('stock-asc');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Direct editing input state: Record<itemId, stringValue>
  const [editingStocks, setEditingStocks] = useState<Record<string, string>>({});

  // Bulk edit modal/drawer state
  const [bulkAction, setBulkAction] = useState<'add' | 'deduct' | 'set' | null>(null);
  const [bulkValue, setBulkValue] = useState<string>('5');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Normalize all products and combos into a unified InventoryItem list
  const allInventoryItems: InventoryItem[] = useMemo(() => {
    const plantItems: InventoryItem[] = products.map((p) => ({
      id: p.id,
      name: p.name,
      subtitle: p.botanicalName,
      type: 'plant',
      category: p.category,
      sku: p.sku || `PLT-${p.id.slice(-4).toUpperCase()}`,
      price: p.price,
      stock: p.stock ?? 0,
      image: p.images?.[0],
    }));

    const comboItems: InventoryItem[] = combos.map((c) => ({
      id: c.id,
      name: c.name,
      subtitle: `${c.items?.length || 0} plants bundled`,
      type: 'combo',
      category: c.category,
      sku: c.sku || `CMB-${c.id.slice(-4).toUpperCase()}`,
      price: c.price,
      stock: c.stock ?? 0,
      image: c.images?.[0],
    }));

    return [...plantItems, ...comboItems];
  }, [products, combos]);

  // Aggregate Category Options
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    allInventoryItems.forEach((item) => {
      if (item.category?.trim()) set.add(item.category.trim());
    });
    return Array.from(set).sort();
  }, [allInventoryItems]);

  // Inventory Health Metrics
  const metrics = useMemo(() => {
    let totalUnits = 0;
    let healthyCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    allInventoryItems.forEach((item) => {
      totalUnits += Math.max(0, item.stock);
      if (item.stock <= 0) {
        outOfStockCount++;
      } else if (item.stock <= lowStockThreshold) {
        lowStockCount++;
      } else {
        healthyCount++;
      }
    });

    return {
      totalUnits,
      healthyCount,
      lowStockCount,
      outOfStockCount,
      totalSKUs: allInventoryItems.length,
    };
  }, [allInventoryItems, lowStockThreshold]);

  // Filtered and Sorted Items
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allInventoryItems
      .filter((item) => {
        // Search filter
        if (q) {
          const matchName = item.name.toLowerCase().includes(q);
          const matchSub = item.subtitle?.toLowerCase().includes(q);
          const matchCat = item.category?.toLowerCase().includes(q);
          const matchSku = item.sku.toLowerCase().includes(q);
          if (!matchName && !matchSub && !matchCat && !matchSku) return false;
        }

        // Type filter
        if (selectedType !== 'all' && item.type !== selectedType) return false;

        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

        // Stock status filter
        if (selectedStatus === 'out' && item.stock > 0) return false;
        if (selectedStatus === 'low' && (item.stock <= 0 || item.stock > lowStockThreshold)) return false;
        if (selectedStatus === 'healthy' && item.stock <= lowStockThreshold) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'stock-asc') return a.stock - b.stock;
        if (sortBy === 'stock-desc') return b.stock - a.stock;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [allInventoryItems, searchQuery, selectedType, selectedCategory, selectedStatus, lowStockThreshold, sortBy]);

  // Quick Inline Adjuster (-5, -1, +1, +5)
  const handleQuickAdjust = async (item: InventoryItem, delta: number) => {
    const targetStock = Math.max(0, item.stock + delta);
    if (item.type === 'plant') {
      await updateProductStock(item.id, targetStock);
    } else {
      await updateComboStock(item.id, targetStock);
    }
    addToast({
      type: 'info',
      title: 'Stock Updated',
      message: `${item.name}: ${item.stock} → ${targetStock} units.`,
      duration: 3000,
    });
  };

  // Direct Number Input Save
  const handleDirectInputSave = async (item: InventoryItem) => {
    const rawVal = editingStocks[item.id];
    if (rawVal === undefined || rawVal === '') return;

    const parsed = parseInt(rawVal, 10);
    if (isNaN(parsed) || parsed < 0) {
      addToast({
        type: 'error',
        title: 'Invalid Stock Value',
        message: 'Please enter a valid non-negative integer.',
      });
      return;
    }

    if (item.type === 'plant') {
      await updateProductStock(item.id, parsed);
    } else {
      await updateComboStock(item.id, parsed);
    }

    // Clear local edit tracking for this item
    setEditingStocks((prev) => {
      const copy = { ...prev };
      delete copy[item.id];
      return copy;
    });

    addToast({
      type: 'success',
      title: 'Stock Saved',
      message: `Set ${item.name} stock to ${parsed} units.`,
    });
  };

  // Toggle selection for item
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Select all or deselect all
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  // Execute Bulk Stock Operation
  const handleExecuteBulk = async () => {
    if (selectedIds.size === 0 || !bulkAction) return;

    const val = parseInt(bulkValue, 10);
    if (isNaN(val) || val < 0) {
      addToast({
        type: 'error',
        title: 'Invalid Number',
        message: 'Please enter a valid non-negative quantity.',
      });
      return;
    }

    setIsBulkProcessing(true);

    const itemsToUpdate: { id: string; type: 'plant' | 'combo'; stock: number }[] = [];

    allInventoryItems.forEach((item) => {
      if (selectedIds.has(item.id)) {
        let newStock = item.stock;
        if (bulkAction === 'add') {
          newStock = item.stock + val;
        } else if (bulkAction === 'deduct') {
          newStock = Math.max(0, item.stock - val);
        } else if (bulkAction === 'set') {
          newStock = val;
        }
        itemsToUpdate.push({ id: item.id, type: item.type, stock: newStock });
      }
    });

    await batchUpdateStock(itemsToUpdate);

    setIsBulkProcessing(false);
    setBulkAction(null);
    setSelectedIds(new Set());
  };

  // Export CSV of Current Filtered Inventory
  const handleExportCSV = () => {
    const headers = ['Type', 'SKU', 'Name', 'Category', 'Price (INR)', 'Current Stock', 'Status'];
    const rows = filteredItems.map((item) => {
      const statusText =
        item.stock <= 0 ? 'Sold Out' : item.stock <= lowStockThreshold ? 'Low Stock' : 'Healthy';
      return [
        item.type === 'plant' ? 'Individual Plant' : 'Combo Bundle',
        `"${item.sku}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${(item.category || '').replace(/"/g, '""')}"`,
        item.price,
        item.stock,
        statusText,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `7seasons_inventory_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'info',
      title: 'CSV Exported',
      message: `Exported ${filteredItems.length} inventory records.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-emerald-900/10 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
            <Boxes className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-xl font-black text-emerald-950">Inventory Management Hub</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Live physical greenhouse stock control across {metrics.totalSKUs} plant and bundle SKUs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Low Stock Threshold Adjuster */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4FAF5] rounded-full border border-emerald-900/15 text-xs text-emerald-950">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-semibold text-[11px]">Alert Threshold:</span>
            <input
              type="number"
              min={1}
              max={50}
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-11 text-center font-bold bg-white rounded-md border border-emerald-200 py-0.5 text-xs outline-hidden"
              title="Items at or below this number are flagged as Low Stock"
            />
            <span className="text-[10px] text-gray-400">units</span>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold transition-colors flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Health Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Stock */}
        <button
          onClick={() => setSelectedStatus('all')}
          className={`p-4 rounded-3xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
            selectedStatus === 'all'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-600/30'
              : 'bg-white hover:bg-emerald-50/50 border-emerald-900/10 text-emerald-950'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className={selectedStatus === 'all' ? 'text-emerald-100' : 'text-gray-500'}>
              Total Catalog Stock
            </span>
            <Boxes className={`w-4 h-4 ${selectedStatus === 'all' ? 'text-emerald-200' : 'text-emerald-700'}`} />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums">
              {metrics.totalUnits}
            </div>
            <div className={`text-[10px] mt-0.5 font-medium ${selectedStatus === 'all' ? 'text-emerald-200' : 'text-gray-400'}`}>
              across {metrics.totalSKUs} unique catalog items
            </div>
          </div>
        </button>

        {/* Healthy Stock */}
        <button
          onClick={() => setSelectedStatus(selectedStatus === 'healthy' ? 'all' : 'healthy')}
          className={`p-4 rounded-3xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
            selectedStatus === 'healthy'
              ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-500/30'
              : 'bg-white hover:bg-emerald-50/50 border-emerald-900/10 text-emerald-950'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className={selectedStatus === 'healthy' ? 'text-emerald-100' : 'text-emerald-700'}>
              Healthy In-Stock
            </span>
            <CheckCircle2 className={`w-4 h-4 ${selectedStatus === 'healthy' ? 'text-emerald-200' : 'text-emerald-600'}`} />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums">
              {metrics.healthyCount}
            </div>
            <div className={`text-[10px] mt-0.5 font-medium ${selectedStatus === 'healthy' ? 'text-emerald-200' : 'text-gray-400'}`}>
              &gt; {lowStockThreshold} units available
            </div>
          </div>
        </button>

        {/* Low Stock Warning */}
        <button
          onClick={() => setSelectedStatus(selectedStatus === 'low' ? 'all' : 'low')}
          className={`p-4 rounded-3xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
            selectedStatus === 'low'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-400/40'
              : 'bg-amber-50/60 hover:bg-amber-50 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className={selectedStatus === 'low' ? 'text-amber-100' : 'text-amber-800'}>
              Low Stock Warning
            </span>
            <AlertTriangle className={`w-4 h-4 ${selectedStatus === 'low' ? 'text-amber-100' : 'text-amber-600'}`} />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums">
              {metrics.lowStockCount}
            </div>
            <div className={`text-[10px] mt-0.5 font-medium ${selectedStatus === 'low' ? 'text-amber-100' : 'text-amber-700'}`}>
              1 to {lowStockThreshold} units remaining (restock soon)
            </div>
          </div>
        </button>

        {/* Sold Out / Depleted */}
        <button
          onClick={() => setSelectedStatus(selectedStatus === 'out' ? 'all' : 'out')}
          className={`p-4 rounded-3xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
            selectedStatus === 'out'
              ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-500/40'
              : 'bg-rose-50/60 hover:bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className={selectedStatus === 'out' ? 'text-rose-100' : 'text-rose-800'}>
              Sold Out (0 Units)
            </span>
            <XCircle className={`w-4 h-4 ${selectedStatus === 'out' ? 'text-rose-100' : 'text-rose-600'}`} />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums">
              {metrics.outOfStockCount}
            </div>
            <div className={`text-[10px] mt-0.5 font-medium ${selectedStatus === 'out' ? 'text-rose-100' : 'text-rose-700'}`}>
              pushed to list bottom on storefront
            </div>
          </div>
        </button>
      </div>

      {/* 3. Search and Segmented Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-900/10 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by plant name, botanical, SKU or category..."
              className="w-full pl-10 pr-4 py-2 bg-[#F4FAF5] text-xs font-semibold rounded-full border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Controls: Type & Category & Sort */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type Segmented Buttons */}
            <div className="flex items-center p-1 bg-gray-100 rounded-full text-xs font-bold">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  selectedType === 'all' ? 'bg-white text-emerald-950 shadow-2xs' : 'text-gray-600 hover:text-emerald-950'
                }`}
              >
                All ({allInventoryItems.length})
              </button>
              <button
                onClick={() => setSelectedType('plant')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedType === 'plant' ? 'bg-white text-emerald-950 shadow-2xs' : 'text-gray-600 hover:text-emerald-950'
                }`}
              >
                <Package className="w-3 h-3 text-emerald-700" />
                <span>Plants ({products.length})</span>
              </button>
              <button
                onClick={() => setSelectedType('combo')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedType === 'combo' ? 'bg-white text-emerald-950 shadow-2xs' : 'text-gray-600 hover:text-emerald-950'
                }`}
              >
                <Layers className="w-3 h-3 text-rose-600" />
                <span>Combos ({combos.length})</span>
              </button>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-[#F4FAF5] text-xs font-bold text-emerald-950 rounded-full border border-emerald-900/15 focus:bg-white outline-hidden cursor-pointer"
            >
              <option value="all">All Categories ({categoriesList.length})</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-[#F4FAF5] px-3 py-1.5 rounded-full border border-emerald-900/15 text-xs">
              <ArrowUpDown className="w-3 h-3 text-emerald-700" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-emerald-950 font-bold outline-hidden cursor-pointer"
              >
                <option value="stock-asc">Stock: Lowest First</option>
                <option value="stock-desc">Stock: Highest First</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="price-desc">Price: Highest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {(selectedStatus !== 'all' || selectedType !== 'all' || selectedCategory !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-xs flex-wrap">
            <span className="text-[11px] text-gray-500 font-medium">Active filters:</span>
            {selectedStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                Status: {selectedStatus === 'low' ? 'Low Stock' : selectedStatus === 'out' ? 'Sold Out' : 'Healthy'}
                <button onClick={() => setSelectedStatus('all')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                Type: {selectedType === 'plant' ? 'Plants' : 'Combos'}
                <button onClick={() => setSelectedType('all')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('all')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedStatus('all');
                setSelectedType('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-[11px] text-rose-600 font-bold hover:underline ml-1 cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* 4. High-Density Inventory Data Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-[#F4FAF5] text-emerald-950 font-black uppercase text-[10px] tracking-wider border-b border-emerald-900/10">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Catalog Item & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-center">1-Click Steppers</th>
                <th className="py-3 px-4 text-center">Direct Input</th>
                <th className="py-3 px-4 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-gray-500">
                    <Boxes className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-gray-700">No inventory items matching this filter</p>
                    <p className="text-xs text-gray-400 mt-0.5">Try clearing your filters or search keywords.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const isOut = item.stock <= 0;
                  const isLow = item.stock > 0 && item.stock <= lowStockThreshold;
                  const currentEditVal = editingStocks[item.id] ?? '';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-emerald-50/40 transition-colors ${
                        isSelected ? 'bg-emerald-50/70' : isOut ? 'bg-rose-50/20' : isLow ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* Item Image, Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=150&q=80'}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover bg-emerald-50 border border-emerald-900/10 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-emerald-950 truncate max-w-xs">{item.name}</span>
                              {item.type === 'combo' ? (
                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                                  Combo
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                                  Plant
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-gray-400 text-[10px]">{item.sku}</span>
                              {item.subtitle && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="italic truncate max-w-[150px]">{item.subtitle}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-gray-600 font-medium">
                        {item.category || 'Standard'}
                      </td>

                      {/* Current Stock Health Badge */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black font-mono tabular-nums ${
                            isOut
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : isLow
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {isOut ? (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>0 (Sold Out)</span>
                            </>
                          ) : isLow ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>{item.stock} (Low Stock)</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{item.stock} in stock</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* 1-Click Steppers (-5, -1, +1, +5) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item, -5)}
                            disabled={item.stock <= 0}
                            className="px-2 py-1 bg-gray-100 hover:bg-rose-100 hover:text-rose-700 text-gray-700 text-[11px] font-bold rounded-md transition-colors disabled:opacity-30 cursor-pointer"
                            title="Deduct 5 units"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item, -1)}
                            disabled={item.stock <= 0}
                            className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-rose-100 hover:text-rose-700 text-gray-700 text-xs font-bold rounded-md transition-colors disabled:opacity-30 cursor-pointer"
                            title="Deduct 1 unit"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item, 1)}
                            className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-emerald-100 hover:text-emerald-800 text-gray-700 text-xs font-bold rounded-md transition-colors cursor-pointer"
                            title="Add 1 unit"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item, 5)}
                            className="px-2 py-1 bg-gray-100 hover:bg-emerald-100 hover:text-emerald-800 text-gray-700 text-[11px] font-bold rounded-md transition-colors cursor-pointer"
                            title="Add 5 units"
                          >
                            +5
                          </button>
                        </div>
                      </td>

                      {/* Direct Numeric Input with Save button */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            value={currentEditVal !== '' ? currentEditVal : item.stock}
                            onChange={(e) =>
                              setEditingStocks((prev) => ({ ...prev, [item.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleDirectInputSave(item);
                              }
                            }}
                            className="w-16 px-2 py-1 bg-white text-center font-mono font-bold text-xs text-emerald-950 rounded-lg border border-gray-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden tabular-nums"
                          />
                          {currentEditVal !== '' && (
                            <button
                              type="button"
                              onClick={() => handleDirectInputSave(item)}
                              className="p-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md shadow-2xs transition-colors cursor-pointer"
                              title="Confirm stock change"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 text-right font-black text-emerald-950 font-mono tabular-nums">
                        ₹{item.price}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Floating Bottom Multi-Select Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky bottom-6 z-40 bg-emerald-950 text-white p-4 rounded-3xl shadow-2xl border border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-black font-mono">
              {selectedIds.size}
            </span>
            <div>
              <p className="text-xs font-bold text-white">
                {selectedIds.size} {selectedIds.size === 1 ? 'item' : 'items'} selected across inventory
              </p>
              <p className="text-[10px] text-emerald-300">
                Execute batch adjustments to physical greenhouse counts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {bulkAction ? (
              <div className="flex items-center gap-2 bg-emerald-900/90 p-1.5 rounded-2xl border border-emerald-700">
                <span className="text-xs font-bold text-emerald-200 pl-2">
                  {bulkAction === 'add'
                    ? 'Add Quantity:'
                    : bulkAction === 'deduct'
                    ? 'Deduct Quantity:'
                    : 'Set Exact Stock:'}
                </span>
                <input
                  type="number"
                  min={0}
                  value={bulkValue}
                  onChange={(e) => setBulkValue(e.target.value)}
                  className="w-16 px-2 py-1 bg-white text-emerald-950 text-center font-bold font-mono text-xs rounded-lg outline-hidden"
                />
                <button
                  onClick={handleExecuteBulk}
                  disabled={isBulkProcessing}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-black rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isBulkProcessing ? 'Applying...' : 'Apply'}
                </button>
                <button
                  onClick={() => setBulkAction(null)}
                  className="p-1 hover:bg-emerald-800 text-gray-300 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    setBulkAction('add');
                    setBulkValue('10');
                  }}
                  className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add to Selected</span>
                </button>
                <button
                  onClick={() => {
                    setBulkAction('deduct');
                    setBulkValue('5');
                  }}
                  className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>- Deduct from Selected</span>
                </button>
                <button
                  onClick={() => {
                    setBulkAction('set');
                    setBulkValue('20');
                  }}
                  className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Set Exact Stock
                </button>
                <button
                  onClick={async () => {
                    const items: { id: string; type: 'plant' | 'combo'; stock: number }[] = [];
                    allInventoryItems.forEach((i) => {
                      if (selectedIds.has(i.id)) items.push({ id: i.id, type: i.type, stock: 0 });
                    });
                    await batchUpdateStock(items);
                    setSelectedIds(new Set());
                  }}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Mark Sold Out (0)
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="p-2 text-gray-400 hover:text-white rounded-xl"
                  title="Deselect all"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
