import React, { useState } from 'react';
import {
  Package,
  Sparkles,
  ShoppingBag,
  Truck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  DollarSign,
  Layers,
  Settings,
  RefreshCw,
  Search,
  Eye,
  Lock,
  Copy,
  Leaf,
  ExternalLink,
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  LogOut,
  KeyRound,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  User as UserIcon,
  X,
  Clock,
  MapPin,
  Check,
  Filter,
  Download,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ComboItem, PlantCombo, AdminAccount, Order, OrderStatus } from '../types';
import { ComboCustomizerModal } from '../components/admin/ComboCustomizerModal';
import { ImageUploadPicker } from '../components/admin/ImageUploadPicker';
import { AdminLoginGate } from '../components/admin/AdminLoginGate';

interface AdminPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const {
    products,
    combos,
    orders,
    storeSettings,
    currentAdmin,
    adminAccounts,
    isAdminAuthenticated,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteProducts,
    addCombo,
    updateCombo,
    deleteCombo,
    deleteCombos,
    duplicateCombo,
    updateOrderStatus,
    updateStoreSettings,
    addToast,
    logoutAdmin,
    addAdminAccount,
    removeAdminAccount,
    updateAdminPassword,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'products' | 'combos' | 'orders' | 'accounts' | 'ai-tools' | 'settings'>('products');
  const [productSearch, setProductSearch] = useState('');
  const [comboSearch, setComboSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Bulk selection state
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedComboIds, setSelectedComboIds] = useState<string[]>([]);

  // Admin Account & Password Management State
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState<{
    name: string;
    email: string;
    role: 'super_admin' | 'nursery_manager' | 'inventory_staff';
    phone: string;
    avatar: string;
  }>({
    name: '',
    email: '',
    role: 'nursery_manager',
    phone: '',
    avatar: '',
  });

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);

  // AI Description Generator state
  const [aiPlantName, setAiPlantName] = useState('');
  const [aiCategory, setAiCategory] = useState('Air Purifying');
  const [aiKeywords, setAiKeywords] = useState('glossy foliage, low light, bedroom safe');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGeneratedOutput, setAiGeneratedOutput] = useState<any | null>(null);

  // New Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    botanicalName: '',
    category: 'Air Purifying',
    price: 399,
    originalPrice: 499,
    stock: 25,
    images: ['https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80'],
    description: '',
    careInstructions: 'Water once every 4-5 days when topsoil feels dry.',
    attributes: {
      light: 'Medium Indirect Light',
      water: 'Moderate (every 4-5 days)',
      difficulty: 'Easy',
      petFriendly: true,
      airPurifying: true,
      location: 'Indoor & Bedroom',
    },
    status: 'published',
    isBestseller: false,
    isDealOfTheDay: false,
  });

  // Combo Customizer Modal State
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<PlantCombo | null>(null);

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Orders Tab State
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [editingTrackingOrderId, setEditingTrackingOrderId] = useState<string | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [courierPartnerInput, setCourierPartnerInput] = useState('ST Courier / Kerala Express');

  // Export Modal States
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportStatus, setExportStatus] = useState('all');

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportProductsCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Price', 'Original Price', 'Stock', 'Status', 'Deal of the Day'];
    const csvContent = [
      headers.join(','),
      ...products.map(p => [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        p.price,
        p.originalPrice || '',
        p.stock,
        p.status || 'published',
        p.isDealOfTheDay ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');
    downloadCSV(csvContent, `7seasons_inventory_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportOrdersCSV = () => {
    let filteredExportOrders = orders;

    if (exportStatus !== 'all') {
      filteredExportOrders = filteredExportOrders.filter(o => o.orderStatus === exportStatus);
    }

    if (exportStartDate) {
      filteredExportOrders = filteredExportOrders.filter(o => new Date(o.createdAt) >= new Date(exportStartDate));
    }

    if (exportEndDate) {
      filteredExportOrders = filteredExportOrders.filter(o => new Date(o.createdAt) <= new Date(exportEndDate + 'T23:59:59'));
    }

    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Email', 'Total Amount', 'Payment Status', 'Order Status', 'Items Count'];
    const csvContent = [
      headers.join(','),
      ...filteredExportOrders.map(o => [
        o.id,
        `"${new Date(o.createdAt).toLocaleString()}"`,
        `"${o.customer.name.replace(/"/g, '""')}"`,
        `"${o.customer.phone || ''}"`,
        `"${o.customer.email || ''}"`,
        o.totalAmount || o.total || 0,
        o.paymentStatus,
        o.orderStatus,
        o.items.length
      ].join(','))
    ].join('\n');
    downloadCSV(csvContent, `7seasons_orders_${new Date().toISOString().split('T')[0]}.csv`);
    setIsExportModalOpen(false);
  };

  // Filtered lists
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredCombos = combos.filter(
    (c) =>
      c.name.toLowerCase().includes(comboSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(comboSearch.toLowerCase()) ||
      c.items.some((it) => it.productName.toLowerCase().includes(comboSearch.toLowerCase()))
  );

  const filteredOrders = orders.filter((o) => {
    // Status filter
    if (orderStatusFilter !== 'all' && o.orderStatus !== orderStatusFilter) {
      return false;
    }

    const q = orderSearch.toLowerCase().trim();
    if (!q) return true;
    const orderIdMatch = (o.id || '').toLowerCase().includes(q) || (o.orderNumber || '').toLowerCase().includes(q);
    const customerNameMatch = (o.customer?.name || o.customer?.shippingAddress?.fullName || '').toLowerCase().includes(q);
    const phoneMatch = (o.customer?.phone || o.customer?.shippingAddress?.phoneNumber || '').includes(q);
    const trackingMatch = (o.trackingNumber || '').toLowerCase().includes(q);
    const stateMatch = (o.customer?.shippingAddress?.state || '').toLowerCase().includes(q);
    const districtMatch = (o.customer?.shippingAddress?.district || o.customer?.shippingAddress?.city || '').toLowerCase().includes(q);
    return orderIdMatch || customerNameMatch || phoneMatch || trackingMatch || stateMatch || districtMatch;
  });

  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      botanicalName: '',
      category: 'Air Purifying',
      price: 399,
      originalPrice: 499,
      stock: 25,
      images: ['https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80'],
      description: '',
      careInstructions: 'Water once every 4-5 days when topsoil feels dry.',
      attributes: {
        light: 'Medium Indirect Light',
        water: 'Moderate (every 4-5 days)',
        difficulty: 'Easy',
        petFriendly: true,
        airPurifying: true,
        location: 'Indoor & Bedroom',
      },
      status: 'published',
      isBestseller: false,
      isDealOfTheDay: false,
    });
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm(prod);
    setIsProductModalOpen(true);
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const toggleAllProducts = () => {
    if (selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const handleBulkDeleteProducts = () => {
    if (selectedProductIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      title: 'Delete Selected Products',
      message: `Are you sure you want to delete ${selectedProductIds.length} products? This action cannot be undone.`,
      onConfirm: () => {
        deleteProducts(selectedProductIds);
        setSelectedProductIds([]);
        setDeleteModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const toggleComboSelection = (id: string) => {
    setSelectedComboIds(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const toggleAllCombos = () => {
    if (selectedComboIds.length === filteredCombos.length && filteredCombos.length > 0) {
      setSelectedComboIds([]);
    } else {
      setSelectedComboIds(filteredCombos.map(c => c.id));
    }
  };

  const handleBulkDeleteCombos = () => {
    if (selectedComboIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      title: 'Delete Selected Combos',
      message: `Are you sure you want to delete ${selectedComboIds.length} combos? This action cannot be undone.`,
      onConfirm: () => {
        deleteCombos(selectedComboIds);
        setSelectedComboIds([]);
        setDeleteModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name) return;

    if (editingProduct) {
      updateProduct({ ...editingProduct, ...(productForm as Product) });
      addToast({
        title: 'Product Updated',
        message: `${productForm.name} updated successfully.`,
        type: 'success',
      });
    } else {
      const discount =
        productForm.originalPrice && productForm.originalPrice > productForm.price!
          ? Math.round(((productForm.originalPrice - productForm.price!) / productForm.originalPrice) * 100)
          : 0;

      const newProd: Product = {
        id: `prod_${Date.now()}`,
        slug: productForm.name!.toLowerCase().replace(/\s+/g, '-'),
        name: productForm.name!,
        botanicalName: productForm.botanicalName || '',
        shortDescription: productForm.shortDescription || 'Fresh tropical nursery specimen.',
        description: productForm.description || 'Grown at Mannarathayil Nursery.',
        category: productForm.category || 'Air Purifying',
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice || productForm.price),
        discountPercentage: discount,
        stock: Number(productForm.stock || 20),
        sku: `7SP-${Math.floor(1000 + Math.random() * 9000)}`,
        images: productForm.images?.length ? productForm.images : ['https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80'],
        rating: 4.9,
        reviewCount: 12,
        isBestseller: Boolean(productForm.isBestseller),
        tags: ['Indoor', 'Mannarathayil'],
        attributes: (productForm.attributes as any) || {
          light: 'Bright Indirect',
          water: 'Moderate (Twice a week)',
          difficulty: 'Easy',
          placement: 'Living Room',
          potIncluded: true,
          airPurifying: true,
          petFriendly: true,
          flowering: false,
        },
        careInstructions: (productForm.careInstructions as any) || {
          overview: 'Water moderately.',
          light: 'Bright indirect light',
          water: 'Twice a week',
          soil: 'Coco-peat nutrient mix',
          fertilizer: 'Monthly organic compost',
          temperature: '20°C - 32°C',
          commonProblems: [],
        },
        createdAt: new Date().toISOString(),
      };

      addProduct(newProd);
      addToast({
        title: 'Plant Added',
        message: `${newProd.name} added to catalog.`,
        type: 'success',
      });
    }
    setIsProductModalOpen(false);
  };

  // Combo Customizer Handlers
  const handleOpenNewCombo = () => {
    setEditingCombo(null);
    setIsComboModalOpen(true);
  };

  const handleEditCombo = (combo: PlantCombo) => {
    setEditingCombo(combo);
    setIsComboModalOpen(true);
  };

  const handleSaveCombo = (savedCombo: PlantCombo) => {
    if (editingCombo) {
      updateCombo(savedCombo);
    } else {
      addCombo(savedCombo);
    }
  };

  const handleCreateNewAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminForm.name || !newAdminForm.email) {
      addToast({
        type: 'error',
        title: 'Missing Fields',
        message: 'Name and Email are required to register an admin account.',
      });
      return;
    }

    addAdminAccount({
      name: newAdminForm.name,
      email: newAdminForm.email.toLowerCase().trim(),
      role: newAdminForm.role,
      phone: newAdminForm.phone || '08848276403',
      avatar:
        newAdminForm.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    });

    setNewAdminForm({
      name: '',
      email: '',
      role: 'nursery_manager',
      phone: '',
      avatar: '',
    });
    setIsAddAdminModalOpen(false);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordChangeError('New password and confirmation password do not match.');
      return;
    }

    const res = updateAdminPassword(oldPassword, newPassword);
    if (res.success) {
      setPasswordChangeSuccess('Master password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordChangeError(res.message);
    }
  };

  // If user is not authenticated as admin, render Login Gate Wall
  if (!isAdminAuthenticated || !currentAdmin) {
    return <AdminLoginGate onNavigate={onNavigate} />;
  }

  const handleDeleteCombo = (combo: PlantCombo) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Combo Bundle',
      message: `Are you sure you want to delete the combo bundle "${combo.name}"? This action cannot be undone.`,
      onConfirm: () => {
        deleteCombo(combo.id);
        setDeleteModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDuplicateCombo = (combo: PlantCombo) => {
    duplicateCombo(combo.id);
  };

  const handleGenerateAiDescription = async () => {
    if (!aiPlantName.trim()) {
      addToast({
        title: 'Missing Name',
        message: 'Please enter a plant name to generate copy.',
        type: 'warning',
      });
      return;
    }

    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/gemini/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantName: aiPlantName,
          category: aiCategory,
          keywords: aiKeywords,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiGeneratedOutput(data);
        addToast({
          title: 'AI Description Ready 🌿',
          message: 'Botanical copy generated via Gemini.',
          type: 'success',
        });
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      // Offline fallback
      setAiGeneratedOutput({
        title: `${aiPlantName} (Nursery Specimen)`,
        shortDescription: `A resilient tropical specimen from Mannarathayil Nursery. Features lush foliage and effortless indoor care routines.`,
        longDescription: `Carefully cultivated in Kerala soil mix, this ${aiPlantName} is naturally adapted to high humidity and warm temperatures. Shipped in a sturdy 5-ply carton directly to your doorstep.`,
        careSchedule: `Place in bright indirect light. Water thoroughly when the top 2 inches of soil are dry. Feed organic fertilizer monthly.`,
        tags: ['Indoor', 'KeralaNursery', 'TropicalPlants', 'Mannarathayil'],
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // RESTRICTED ACCESS GATE: Only authenticated administrators can view and manage this portal
  if (!isAdminAuthenticated || !currentAdmin) {
    return <AdminLoginGate onNavigate={onNavigate} />;
  }

  return (
    <div className="bg-[#F4FAF5] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#062416] via-[#0A2618] to-emerald-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl border border-emerald-800/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Mannarathayil Nursery Operations Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">7Seasons Admin Portal</h1>
            <p className="text-xs text-[#D1FAE5]/80 max-w-xl">
              Secure console for catalog management, combo bundle composition, dispatch logs, and account security.
            </p>
          </div>

          {/* Current Admin Account Badge & Actions */}
          <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15 shrink-0">
            <img
              src={
                currentAdmin.avatar ||
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
              }
              alt={currentAdmin.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400/60 shrink-0"
            />
            <div className="text-left pr-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">{currentAdmin.name}</span>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                  {currentAdmin.role === 'super_admin' ? 'Super Admin' : 'Manager'}
                </span>
              </div>
              <p className="text-[11px] text-[#A7F3D0]/80">{currentAdmin.email}</p>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-white/20">
              <button
                onClick={() => onNavigate('home')}
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="View customer-facing storefront"
              >
                Storefront
              </button>
              <button
                onClick={logoutAdmin}
                className="px-3.5 py-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Sign out of admin session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-emerald-900/10 pb-2 overflow-x-auto">
          {[
            { id: 'products', label: `Plant Catalog (${products.length})`, icon: Package },
            { id: 'combos', label: `Combo Bundles (${combos.length})`, icon: Layers },
            { id: 'orders', label: `Orders & Dispatch (${orders.length})`, icon: Truck },
            { id: 'accounts', label: `Admin Accounts & Security (${adminAccounts.length})`, icon: Users },
            { id: 'ai-tools', label: 'Gemini AI Assistant', icon: Sparkles },
            { id: 'settings', label: 'Nursery Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: PRODUCTS INVENTORY */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-2xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search plant by name or category..."
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 text-gray-900 text-xs font-semibold rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden"
                />
              </div>

              <div className="flex items-center gap-3">
                {selectedProductIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteProducts}
                    className="px-5 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-full text-xs font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Selected ({selectedProductIds.length})</span>
                  </button>
                )}
                <button
                  onClick={handleExportProductsCSV}
                  className="px-5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handleOpenNewProduct}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Plant</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-emerald-50/80 text-emerald-950 font-black uppercase text-[10px] tracking-wider border-b border-emerald-100">
                    <tr>
                      <th className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                          onChange={toggleAllProducts}
                          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-4">Plant Specimen</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Badges</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className={`hover:bg-emerald-50/40 transition-colors ${selectedProductIds.includes(p.id) ? 'bg-emerald-50/30' : ''}`}>
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(p.id)}
                            onChange={() => toggleProductSelection(p.id)}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover bg-emerald-50 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-emerald-950 text-xs">{p.name}</p>
                            <p className="text-[10px] text-gray-500 italic">{p.botanicalName}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{p.category}</td>
                        <td className="py-3 px-4 font-bold text-emerald-950">
                          ₹{p.price}{' '}
                          {p.originalPrice > p.price && (
                            <span className="text-gray-400 line-through font-normal text-[11px]">
                              ₹{p.originalPrice}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                              p.stock === 0
                                ? 'bg-gray-100 text-gray-500'
                                : p.stock < 5
                                ? 'bg-rose-600 text-white shadow-sm animate-pulse'
                                : p.stock <= 10
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {p.stock === 0 ? 'Out of stock' : `${p.stock} units`}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1 flex-wrap">
                            {p.isBestseller && (
                              <span className="bg-emerald-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                Bestseller
                              </span>
                            )}
                            {p.isDealOfTheDay && (
                              <span className="bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                Deal
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditProduct(p)}
                              className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteModal({
                                  isOpen: true,
                                  title: 'Delete Product',
                                  message: `Are you sure you want to delete ${p.name}? This action cannot be undone.`,
                                  onConfirm: () => {
                                    deleteProduct(p.id);
                                    setDeleteModal(prev => ({ ...prev, isOpen: false }));
                                  }
                                });
                              }}
                              className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMBOS MANAGEMENT */}
        {activeTab === 'combos' && (
          <div className="space-y-6">
            {/* Header / Search & Create Actions */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={comboSearch}
                  onChange={(e) => setComboSearch(e.target.value)}
                  placeholder="Search combos by name, category, or plant items..."
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 text-gray-900 text-xs font-semibold rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {filteredCombos.length > 0 && (
                  <div className="flex items-center gap-2 mr-2">
                    <input
                      type="checkbox"
                      id="selectAllCombos"
                      checked={selectedComboIds.length === filteredCombos.length}
                      onChange={toggleAllCombos}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="selectAllCombos" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                      Select All
                    </label>
                  </div>
                )}
                <div className="text-xs text-gray-500 hidden md:block">
                  <span>Total Combos: </span>
                  <strong className="text-emerald-950 font-bold">{combos.length}</strong>
                </div>
                {selectedComboIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteCombos}
                    className="px-5 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Selected ({selectedComboIds.length})</span>
                  </button>
                )}
                <button
                  onClick={handleOpenNewCombo}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Plant Combo Bundle</span>
                </button>
              </div>
            </div>

            {/* Combos Grid */}
            {filteredCombos.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-300 text-center space-y-3">
                <Layers className="w-10 h-10 text-gray-300 mx-auto" />
                <h3 className="font-bold text-sm text-emerald-950">No combo bundles found</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  {comboSearch ? `No combos matching "${comboSearch}". Try adjusting your search query.` : 'Start offering curated plant packs, pairs with planters, and care bundles.'}
                </p>
                <button
                  onClick={handleOpenNewCombo}
                  className="mt-2 px-5 py-2 bg-emerald-800 text-white rounded-full text-xs font-bold hover:bg-emerald-900 cursor-pointer"
                >
                  + Create First Combo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCombos.map((combo) => (
                  <div
                    key={combo.id}
                    className={`bg-white rounded-3xl p-5 border ${selectedComboIds.includes(combo.id) ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20' : 'border-gray-200 shadow-2xs hover:border-emerald-400 hover:shadow-md'} space-y-4 flex flex-col justify-between transition-all relative`}
                  >
                    <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-sm">
                      <input
                        type="checkbox"
                        checked={selectedComboIds.includes(combo.id)}
                        onChange={() => toggleComboSelection(combo.id)}
                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      {/* Combo Cover Image with Badges */}
                      <div className="relative mb-3">
                        <img
                          src={combo.images[0]}
                          alt={combo.name}
                          className="w-full h-44 object-cover rounded-2xl bg-emerald-50 border border-gray-100"
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                          <span className="text-[10px] font-black uppercase text-emerald-900 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-2xs">
                            {combo.category}
                          </span>
                          {combo.isFeatured && (
                            <span className="text-[9px] font-black uppercase text-amber-900 bg-amber-200/95 px-1.5 py-0.5 rounded-md shadow-2xs">
                              ★ Featured
                            </span>
                          )}
                        </div>

                        {combo.discountPercentage > 0 && (
                          <div className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                            {combo.discountPercentage}% OFF
                          </div>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-bold text-emerald-950 leading-snug">{combo.name}</h3>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                        {combo.shortDescription}
                      </p>

                      {/* Pricing & Savings */}
                      <div className="mt-3 p-3 bg-emerald-50/50 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-950 border border-emerald-100">
                        <div>
                          <span className="text-sm font-black text-emerald-950">₹{combo.price}</span>
                          <span className="line-through text-gray-400 font-normal text-xs ml-2">
                            ₹{combo.originalPrice}
                          </span>
                        </div>
                        <span className="text-rose-600 font-black bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200/60">
                          Save ₹{combo.savings}
                        </span>
                      </div>

                      {/* Included Items Breakdown (What is in the combo) */}
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950">
                          <span className="flex items-center gap-1">
                            <Package className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Included in Pack ({combo.items.length} items):</span>
                          </span>
                          <span className="text-[10px] text-gray-500 font-normal">
                            Stock: {combo.stock}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {combo.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md text-gray-800 font-medium flex items-center gap-1"
                              title={`${item.productName} (${item.itemType})`}
                            >
                              <span className="font-bold text-emerald-700">{item.quantity}x</span>
                              <span className="truncate max-w-[120px]">{item.productName}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditCombo(combo)}
                          className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit Combo</span>
                        </button>

                        <button
                          onClick={() => handleDuplicateCombo(combo)}
                          className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 transition-colors cursor-pointer"
                          title="Duplicate Combo"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onNavigate('combo-detail', combo.slug)}
                          className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 transition-colors cursor-pointer"
                          title="Preview in Store"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteCombo(combo)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Combo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORDERS & DISPATCH */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Top Toolbar: Search & Status Filters */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
              <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl w-full">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Search by Order #, Customer Name, Phone, City, Tracking AWB..."
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 text-gray-900 text-xs font-semibold rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden"
                    />
                    {orderSearch && (
                      <button
                        onClick={() => setOrderSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="px-5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-[11px] font-bold text-gray-500 shrink-0 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Status:
                  </span>
                  {(
                    [
                      { id: 'all', label: `All (${orders.length})` },
                      { id: 'Order Placed', label: `Placed (${orders.filter((o) => o.orderStatus === 'Order Placed').length})` },
                      { id: 'Processing', label: `Packing (${orders.filter((o) => o.orderStatus === 'Processing').length})` },
                      { id: 'Shipped', label: `Shipped (${orders.filter((o) => o.orderStatus === 'Shipped').length})` },
                      { id: 'Delivered', label: `Delivered (${orders.filter((o) => o.orderStatus === 'Delivered').length})` },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setOrderStatusFilter(st.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        orderStatusFilter === st.id
                          ? 'bg-emerald-800 text-white shadow-2xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-2xs space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Package className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-emerald-950">No matching orders found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try adjusting your search keywords or switching status filters to view all orders.
                </p>
                <button
                  onClick={() => {
                    setOrderSearch('');
                    setOrderStatusFilter('all');
                  }}
                  className="px-4 py-2 bg-emerald-800 text-white rounded-full text-xs font-bold hover:bg-emerald-900 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((ord) => {
                  const customerName =
                    ord.customer?.name ||
                    ord.customer?.shippingAddress?.fullName ||
                    'Customer';
                  const customerPhone =
                    ord.customer?.phone ||
                    ord.customer?.shippingAddress?.phoneNumber ||
                    'N/A';
                  const shippingAddr = ord.customer?.shippingAddress;
                  const formattedDate = ord.createdAt
                    ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recent';

                  const getStatusBadgeClass = (st: string) => {
                    switch (st) {
                      case 'Delivered':
                        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
                      case 'Shipped':
                        return 'bg-blue-100 text-blue-800 border-blue-300';
                      case 'Processing':
                        return 'bg-amber-100 text-amber-900 border-amber-300';
                      case 'Cancelled':
                        return 'bg-rose-100 text-rose-800 border-rose-300';
                      default:
                        return 'bg-purple-100 text-purple-900 border-purple-300';
                    }
                  };

                  return (
                    <div
                      key={ord.id}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4 hover:border-emerald-200 transition-colors"
                    >
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-emerald-950">
                              Order #{ord.orderNumber || ord.id}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                                ord.orderStatus
                              )}`}
                            >
                              {ord.orderStatus}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Placed on {formattedDate} • Customer:{' '}
                            <strong className="text-gray-800">{customerName}</strong> ({customerPhone})
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                            ₹{ord.total} ({ord.paymentMethod})
                          </span>
                          <button
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="p-1.5 text-gray-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                            title="View Full Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Middle Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        {/* Shipping Destination */}
                        <div>
                          <strong className="text-emerald-950 block font-bold mb-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                            Delivery Destination:
                          </strong>
                          {shippingAddr ? (
                            <p className="text-gray-600 leading-relaxed">
                              {shippingAddr.street}, {shippingAddr.district || shippingAddr.city},{' '}
                              {shippingAddr.state} – {shippingAddr.pincode}
                              {shippingAddr.nearbyLandmark && (
                                <span className="block text-[11px] text-gray-400">
                                  Near: {shippingAddr.nearbyLandmark}
                                </span>
                              )}
                            </p>
                          ) : (
                            <p className="text-gray-400 italic">No address provided</p>
                          )}
                        </div>

                        {/* Items Ordered preview */}
                        <div>
                          <strong className="text-emerald-950 block font-bold mb-1 flex items-center gap-1">
                            <Package className="w-3.5 h-3.5 text-emerald-700" />
                            Items Packed ({ord.items.length}):
                          </strong>
                          <ul className="space-y-1 text-gray-600 max-h-24 overflow-y-auto pr-1">
                            {ord.items.map((it, i) => (
                              <li key={i} className="truncate flex items-center justify-between gap-1">
                                <span className="truncate">• {it.name}</span>
                                <span className="text-gray-400 font-semibold shrink-0">x{it.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Dispatch & Courier Tracking */}
                        <div>
                          <strong className="text-emerald-950 block font-bold mb-1 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-emerald-700" />
                            Courier & Tracking:
                          </strong>
                          {ord.trackingNumber ? (
                            <div className="space-y-1">
                              <p className="text-emerald-800 font-mono font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 inline-block">
                                AWB: {ord.trackingNumber}
                              </p>
                              <p className="text-gray-500 text-[11px]">
                                Partner: {ord.courierPartner || 'Kerala Express'}
                              </p>
                            </div>
                          ) : (
                            <p className="text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 inline-block text-[11px] font-semibold">
                              Pending Courier Dispatch
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status Dispatch Control Bar */}
                      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-emerald-950">Update Status:</span>
                          <select
                            value={ord.orderStatus}
                            onChange={(e) =>
                              updateOrderStatus(ord.id, e.target.value as OrderStatus)
                            }
                            className="px-3 py-1.5 bg-gray-50 text-emerald-950 text-xs font-bold rounded-full border border-gray-200 focus:border-emerald-600 outline-hidden cursor-pointer"
                          >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Processing">Processing & Packing</option>
                            <option value="Shipped">Dispatched (Shipped)</option>
                            <option value="Delivered">Delivered Safely</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>

                          {/* Quick Add Tracking Modal Trigger */}
                          <button
                            onClick={() => {
                              setEditingTrackingOrderId(ord.id);
                              setTrackingNumberInput(ord.trackingNumber || '');
                              setCourierPartnerInput(
                                ord.courierPartner || 'ST Courier / Kerala Express'
                              );
                            }}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold transition-colors cursor-pointer"
                          >
                            {ord.trackingNumber ? 'Edit AWB' : '+ Add AWB / Courier'}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            Full Invoice
                          </button>
                          <button
                            onClick={() => onNavigate('track-order', ord.orderNumber || ord.id)}
                            className="px-4 py-1.5 bg-emerald-50 text-emerald-800 rounded-full font-bold hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200 flex items-center gap-1"
                          >
                            Live Tracking Page →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ADMIN ACCOUNTS & SECURITY */}
        {activeTab === 'accounts' && (
          <div className="space-y-8">
            {/* Active Session & Privilege Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Active Session Profile
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Authenticated
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <img
                    src={
                      currentAdmin.avatar ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
                    }
                    alt={currentAdmin.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-emerald-200 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm leading-tight">{currentAdmin.name}</h4>
                    <p className="text-xs text-gray-500">{currentAdmin.email}</p>
                    <span className="inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-800 text-white mt-1">
                      {currentAdmin.role === 'super_admin' ? 'Super Admin' : 'Nursery Manager'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Security & Access Level
                </span>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Full Administrative Privileges</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Direct access to customer order details, stock inventory, combo recipe builder, and discount codes.
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Authorized Admin Accounts
                </span>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-2xl font-black text-emerald-950">{adminAccounts.length}</span>
                  <button
                    onClick={() => setIsAddAdminModalOpen(true)}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Admin</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-600">
                  Only verified staff can access the Mannarathayil Nursery control room.
                </p>
              </div>
            </div>

            {/* Admin Roster Table */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-emerald-950">Authorized Nursery Administrators</h3>
                  <p className="text-xs text-gray-500">
                    Team members with verified credentials to edit plant stock, create combos, and manage dispatches.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddAdminModalOpen(true)}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register New Admin</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-emerald-50/80 text-emerald-950 font-black uppercase text-[10px] tracking-wider border-b border-emerald-100">
                    <tr>
                      <th className="py-3.5 px-4">Administrator</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Helpline / Phone</th>
                      <th className="py-3.5 px-4">Last Login</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {adminAccounts.map((adm) => {
                      const isCurrent = currentAdmin.id === adm.id || currentAdmin.email.toLowerCase() === adm.email.toLowerCase();
                      return (
                        <tr key={adm.id} className="hover:bg-emerald-50/40 transition-colors">
                          <td className="py-3.5 px-4 flex items-center gap-3">
                            <img
                              src={
                                adm.avatar ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                              }
                              alt={adm.name}
                              className="w-10 h-10 rounded-full object-cover border border-emerald-200 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-emerald-950 text-xs">{adm.name}</span>
                                {isCurrent && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-emerald-700" />
                                {adm.email}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`font-bold px-2.5 py-1 rounded-full text-[10px] ${
                                adm.role === 'super_admin'
                                  ? 'bg-emerald-800 text-white'
                                  : adm.role === 'nursery_manager'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-stone-100 text-stone-800'
                              }`}
                            >
                              {adm.role === 'super_admin'
                                ? 'Super Admin'
                                : adm.role === 'nursery_manager'
                                ? 'Nursery Manager'
                                : 'Inventory Staff'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-950 font-bold">
                              <Phone className="w-3 h-3 text-emerald-700" />
                              {adm.phone || '08848276403'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-[11px] text-gray-500">
                            {adm.lastLogin
                              ? new Date(adm.lastLogin).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Active now'}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {adminAccounts.length > 1 && adm.role !== 'super_admin' && (
                              <button
                                onClick={() => {
                                  setDeleteModal({
                                    isOpen: true,
                                    title: 'Revoke Admin Access',
                                    message: `Are you sure you want to revoke admin access for ${adm.name} (${adm.email})?`,
                                    onConfirm: () => {
                                      removeAdminAccount(adm.id);
                                      setDeleteModal(prev => ({ ...prev, isOpen: false }));
                                    }
                                  });
                                }}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                title="Remove Admin"
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Master Admin Passcode Security Update */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-bold text-sm text-emerald-950">Change Master Administrator Password</h3>
                </div>
                <p className="text-xs text-gray-500">
                  Update the master passcode required for all administrator accounts to log into the nursery control room.
                </p>

                {passwordChangeError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passwordChangeError}</span>
                  </div>
                )}

                {passwordChangeSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{passwordChangeSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">Current Password *</label>
                    <input
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password (default: Admin@123)"
                      className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">New Master Password *</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">Confirm New Password *</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-full transition-colors cursor-pointer shadow-xs"
                  >
                    Update Security Password
                  </button>
                </form>
              </div>

              {/* Security Best Practices */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-bold text-sm text-emerald-950">Nursery Operations Security Rules</h3>
                </div>

                <ul className="space-y-3 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Role Isolation:</strong> Only registered emails listed in the roster can log in. Unknown or guest users are instantly blocked.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Combo Protection:</strong> Custom plant recipes and custom uploaded photos require admin session authentication.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Customer Privacy:</strong> Dispatch addresses and customer phone numbers are encrypted in local storage.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Session Guard:</strong> Remember to tap "Sign Out" when managing the nursery on shared devices.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GEMINI AI BOTANICAL GENERATOR */}
        {activeTab === 'ai-tools' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-emerald-950">
                  Gemini Botanical Copy Generator
                </h3>
              </div>
              <p className="text-xs text-gray-600">
                Generate high-converting product descriptions, care schedules, and SEO tags tailored
                for Mannarathayil Nursery plants.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-emerald-950 block mb-1">Plant Variety Name</label>
                  <input
                    type="text"
                    value={aiPlantName}
                    onChange={(e) => setAiPlantName(e.target.value)}
                    placeholder="e.g. Anthurium Red Champion"
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-emerald-950 block mb-1">Category</label>
                  <select
                    value={aiCategory}
                    onChange={(e) => setAiCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 text-emerald-950 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-semibold"
                  >
                    <option value="Air Purifying">Air Purifying</option>
                    <option value="Flowering Plants">Flowering Plants</option>
                    <option value="Indoor & Low Light">Indoor & Low Light</option>
                    <option value="Succulents & Cacti">Succulents & Cacti</option>
                    <option value="Foliage & Balcony">Foliage & Balcony</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-emerald-950 block mb-1">Keywords / Features</label>
                  <input
                    type="text"
                    value={aiKeywords}
                    onChange={(e) => setAiKeywords(e.target.value)}
                    placeholder="e.g. vibrant red bracts, bedroom safe, weekly watering"
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGenerateAiDescription}
                  disabled={isGeneratingAi}
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isGeneratingAi ? 'Generating Copy...' : 'Generate Botanical Content'}</span>
                </button>
              </div>
            </div>

            {/* AI Generated Output */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-emerald-950">Generated Content Output</h3>
              {aiGeneratedOutput ? (
                <div className="space-y-4 text-xs text-gray-600 animate-in fade-in">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <strong className="text-emerald-950 block font-bold mb-1">Title:</strong>
                    <p>{aiGeneratedOutput.title}</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
                    <strong className="text-emerald-950 block font-bold mb-1">Short Description:</strong>
                    <p>{aiGeneratedOutput.shortDescription}</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
                    <strong className="text-emerald-950 block font-bold mb-1">Long Description:</strong>
                    <p>{aiGeneratedOutput.longDescription}</p>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <strong className="text-emerald-950 block font-bold mb-1">Care Schedule:</strong>
                    <p>{aiGeneratedOutput.careSchedule}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-8 text-center">
                  Fill in plant details on the left and tap Generate to create custom descriptions.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: NURSERY SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs max-w-2xl space-y-6">
            <h3 className="text-base font-bold text-emerald-950">Store Operational Settings</h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-emerald-950 block mb-1">
                  Nursery WhatsApp Helpline Number
                </label>
                <input
                  type="text"
                  value={storeSettings.whatsappNumber}
                  onChange={(e) => updateStoreSettings({ whatsappNumber: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-emerald-950 block mb-1">
                  Free Delivery Threshold (₹)
                </label>
                <input
                  type="number"
                  value={storeSettings.freeDeliveryThreshold}
                  onChange={(e) =>
                    updateStoreSettings({ freeDeliveryThreshold: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-emerald-950 block mb-1">Top Announcement Bar Text</label>
                <input
                  type="text"
                  value={storeSettings.announcementText}
                  onChange={(e) => updateStoreSettings({ announcementText: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-semibold"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NEW/EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-black text-emerald-950">
                {editingProduct ? 'Edit Plant' : 'Add New Plant to Catalog'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-emerald-950 block mb-1">Plant Common Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Money Plant Golden"
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-emerald-950 block mb-1">Botanical Name</label>
                  <input
                    type="text"
                    value={productForm.botanicalName}
                    onChange={(e) =>
                      setProductForm({ ...productForm, botanicalName: e.target.value })
                    }
                    placeholder="e.g. Epipremnum aureum"
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-emerald-950 block mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 text-emerald-950 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-semibold"
                  >
                    <option value="Air Purifying">Air Purifying</option>
                    <option value="Indoor Plants">Indoor Plants</option>
                    <option value="Balcony & Flowering">Balcony & Flowering</option>
                    <option value="Low Light Plants">Low Light Plants</option>
                    <option value="Succulents & Cacti">Succulents & Cacti</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-emerald-950 block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-emerald-950 block mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) =>
                      setProductForm({ ...productForm, originalPrice: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <ImageUploadPicker
                  images={productForm.images || []}
                  onChange={(imgs) => setProductForm({ ...productForm, images: imgs })}
                  label="Plant Photos (Add from Device Files or URL)"
                  helpText="Upload plant photos directly from your computer or paste image links."
                />
              </div>

              <div>
                <label className="font-bold text-emerald-950 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value })
                  }
                  className="w-full p-3 bg-gray-50 text-gray-900 rounded-2xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-950">
                  <input
                    type="checkbox"
                    checked={Boolean(productForm.isBestseller)}
                    onChange={(e) =>
                      setProductForm({ ...productForm, isBestseller: e.target.checked })
                    }
                  />
                  <span>Mark as Bestseller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-950">
                  <input
                    type="checkbox"
                    checked={Boolean(productForm.isDealOfTheDay)}
                    onChange={(e) =>
                      setProductForm({ ...productForm, isDealOfTheDay: e.target.checked })
                    }
                  />
                  <span>Feature in Deal of the Day</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full font-bold cursor-pointer hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-800 text-white rounded-full font-bold cursor-pointer hover:bg-emerald-900"
                >
                  Save Plant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Combo Customizer Modal */}
      <ComboCustomizerModal
        isOpen={isComboModalOpen}
        onClose={() => setIsComboModalOpen(false)}
        comboToEdit={editingCombo}
        products={products}
        onSaveCombo={handleSaveCombo}
      />

      {/* Export Orders Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 space-y-6 border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-black text-emerald-950">Export Orders</h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Order Status</label>
                <select
                  value={exportStatus}
                  onChange={(e) => setExportStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 text-emerald-950 font-semibold rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-hidden transition-all text-sm appearance-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Order Placed">Order Placed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Start Date (Optional)</label>
                <input
                  type="date"
                  value={exportStartDate}
                  onChange={(e) => setExportStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 text-emerald-950 font-semibold rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-hidden transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">End Date (Optional)</label>
                <input
                  type="date"
                  value={exportEndDate}
                  onChange={(e) => setExportEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 text-emerald-950 font-semibold rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-hidden transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="flex-1 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleExportOrdersCSV}
                className="flex-1 py-3 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 transition-colors shadow-sm text-sm"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW ADMIN ACCOUNT MODAL */}
      {isAddAdminModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-black text-emerald-950">Register New Admin Account</h3>
              </div>
              <button
                onClick={() => setIsAddAdminModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewAdmin} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-emerald-950 block mb-1">Full Staff / Admin Name *</label>
                <input
                  type="text"
                  required
                  value={newAdminForm.name}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-emerald-950 block mb-1">Admin Email Address (Login Username) *</label>
                <input
                  type="email"
                  required
                  value={newAdminForm.email}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                  placeholder="e.g. ramesh@7seasonsplants.com"
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-emerald-950 block mb-1">Assigned Role</label>
                  <select
                    value={newAdminForm.role}
                    onChange={(e) =>
                      setNewAdminForm({
                        ...newAdminForm,
                        role: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2.5 bg-gray-50 text-emerald-950 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-semibold"
                  >
                    <option value="nursery_manager">Nursery Operations Manager</option>
                    <option value="inventory_staff">Inventory & Dispatch Staff</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-emerald-950 block mb-1">Phone / Helpline</label>
                  <input
                    type="tel"
                    value={newAdminForm.phone}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, phone: e.target.value })}
                    placeholder="e.g. 08848276403"
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <ImageUploadPicker
                  images={newAdminForm.avatar ? [newAdminForm.avatar] : []}
                  onChange={(imgs) => setNewAdminForm({ ...newAdminForm, avatar: imgs[0] || '' })}
                  maxImages={1}
                  label="Staff Profile Photo (Optional)"
                  helpText="Upload a photo from your device or use a URL."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddAdminModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full font-bold cursor-pointer hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-800 text-white rounded-full font-bold cursor-pointer hover:bg-emerald-900 shadow-xs"
                >
                  Grant Admin Privileges
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ORDER DETAILS & INVOICE BREAKDOWN */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Order Invoice Details
                </span>
                <h3 className="text-xl font-black text-emerald-950 mt-1">
                  Order #{selectedOrderDetails.orderNumber || selectedOrderDetails.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl space-y-1.5 border border-gray-100">
                <span className="font-bold text-gray-400 uppercase text-[10px]">Customer Info</span>
                <p className="font-bold text-gray-900 text-sm">
                  {selectedOrderDetails.customer?.name || selectedOrderDetails.customer?.shippingAddress?.fullName}
                </p>
                <p className="text-gray-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  {selectedOrderDetails.customer?.phone || selectedOrderDetails.customer?.shippingAddress?.phoneNumber}
                </p>
                {selectedOrderDetails.customer?.email && (
                  <p className="text-gray-600 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-700" />
                    {selectedOrderDetails.customer.email}
                  </p>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl space-y-1.5 border border-gray-100">
                <span className="font-bold text-gray-400 uppercase text-[10px]">Delivery Address</span>
                {selectedOrderDetails.customer?.shippingAddress ? (
                  <p className="text-gray-700 leading-relaxed">
                    {selectedOrderDetails.customer.shippingAddress.street},{' '}
                    {selectedOrderDetails.customer.shippingAddress.district ||
                      selectedOrderDetails.customer.shippingAddress.city}
                    , {selectedOrderDetails.customer.shippingAddress.state} –{' '}
                    {selectedOrderDetails.customer.shippingAddress.pincode}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">No delivery address saved</p>
                )}
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-3">
                Ordered Plants ({selectedOrderDetails.items.length})
              </h4>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                {selectedOrderDetails.items.map((item, idx) => (
                  <div key={idx} className="p-3 sm:p-4 flex items-center gap-3 text-xs">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-emerald-50 shrink-0 border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-gray-900 truncate">{item.name}</h5>
                      <p className="text-gray-500 text-[11px]">
                        Qty: {item.quantity} • ₹{item.price} each
                      </p>
                    </div>
                    <span className="font-bold text-emerald-950 text-sm">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Price Summary */}
            <div className="p-4 bg-[#F4FAF5] rounded-2xl border border-emerald-900/10 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{selectedOrderDetails.subtotal}</span>
              </div>
              {selectedOrderDetails.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon / Discount</span>
                  <span>-₹{selectedOrderDetails.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery & Care Packaging</span>
                <span>{selectedOrderDetails.deliveryFee === 0 ? 'FREE' : `₹${selectedOrderDetails.deliveryFee}`}</span>
              </div>
              <div className="pt-2 border-t border-emerald-900/10 flex justify-between text-sm font-black text-emerald-950">
                <span>Total Paid ({selectedOrderDetails.paymentMethod})</span>
                <span className="text-emerald-800">₹{selectedOrderDetails.total}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  onNavigate('track-order', selectedOrderDetails.orderNumber || selectedOrderDetails.id);
                  setSelectedOrderDetails(null);
                }}
                className="px-4 py-2 bg-emerald-50 text-emerald-800 rounded-full font-bold text-xs hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200"
              >
                Open Live Tracking View →
              </button>

              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-6 py-2 bg-emerald-800 text-white rounded-full font-bold text-xs hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN COURIER & AWB TRACKING NUMBER */}
      {editingTrackingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-emerald-950 text-base">Assign Dispatch Details</h3>
              </div>
              <button
                onClick={() => setEditingTrackingOrderId(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingTrackingOrderId) {
                  const targetOrd = orders.find((o) => o.id === editingTrackingOrderId);
                  const currentSt = targetOrd?.orderStatus === 'Order Placed' ? 'Shipped' : targetOrd?.orderStatus || 'Shipped';
                  updateOrderStatus(
                    editingTrackingOrderId,
                    currentSt,
                    'Tracking updated by nursery admin',
                    trackingNumberInput.trim(),
                    courierPartnerInput.trim()
                  );
                  setEditingTrackingOrderId(null);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-emerald-950 block mb-1">
                  Air Waybill (AWB) / Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="e.g. STC-KL-882910"
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-mono uppercase font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-emerald-950 block mb-1">Courier Logistics Partner</label>
                <select
                  value={courierPartnerInput}
                  onChange={(e) => setCourierPartnerInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                >
                  <option value="ST Courier / Kerala Express">ST Courier (Kerala & Tamil Nadu Express)</option>
                  <option value="Professional Courier Express">The Professional Couriers</option>
                  <option value="Delhivery Express">Delhivery Express Plant Logistics</option>
                  <option value="Blue Dart Nursery Care">Blue Dart Safe Express</option>
                  <option value="7Seasons Direct Nursery Van">7Seasons Direct Nursery Van (Local)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingTrackingOrderId(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-bold cursor-pointer hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 text-white rounded-full font-bold cursor-pointer hover:bg-emerald-900 shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save & Update Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 space-y-6 border border-gray-200 shadow-2xl">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100 text-rose-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-lg font-black text-rose-600">
                {deleteModal.title}
              </h3>
            </div>
            
            <p className="text-sm text-gray-700 leading-relaxed">
              {deleteModal.message}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-bold cursor-pointer hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteModal.onConfirm}
                className="px-5 py-2 bg-rose-600 text-white rounded-full font-bold cursor-pointer hover:bg-rose-700 transition-colors shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
