import React, { useState, useEffect } from 'react';
import {
  BarChart3,
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
  EyeOff,
  CreditCard,
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
  AlertTriangle,
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
  Upload,
  Crown,
  Save,
  Undo2,
  Zap,
  Store,
  Megaphone,
  Tag,
  FolderTree,
  Ticket,
  MessageSquare,
  Database,
} from 'lucide-react';
import { AnalyticsDashboard } from '../components/admin/AnalyticsDashboard';
import { useStore } from '../context/StoreContext';
import { auth } from '../lib/firebase';
import { UserManagementTab } from '../components/admin/UserManagementTab';
import { CouponsManagementTab } from '../components/admin/CouponsManagementTab';
import { ReviewsManagementTab } from '../components/admin/ReviewsManagementTab';
import { Product, ComboItem, PlantCombo, AdminAccount, Order, OrderStatus, StoreSettings } from '../types';
import { ComboCustomizerModal } from '../components/admin/ComboCustomizerModal';
import { ComboCategoryManagerModal } from '../components/admin/ComboCategoryManagerModal';
import { ImageUploadPicker } from '../components/admin/ImageUploadPicker';
import { AdminLoginGate } from '../components/admin/AdminLoginGate';
import { BackupManagementCard } from '../components/admin/BackupManagementCard';
import { uploadImage } from '../lib/imageUploader';

interface AdminPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const {
    products,
    combos,
    categories,
    coupons,
    reviews,
    orders,
    storeSettings,
    currentAdmin,
    adminAccounts,
    isAdminAuthenticated,
    isCurrentSuperAdmin,
    addCategory,
    updateCategory,
    deleteCategory,
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
    deleteOrder,
    updateStoreSettings,
    addToast,
    logoutAdmin,
    addAdminAccount,
    removeAdminAccount,
    updateAdminPassword,
    importOrders,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'combos' | 'categories' | 'coupons' | 'reviews' | 'orders' | 'offline-orders' | 'accounts' | 'users' | 'complaints' | 'settings' | 'ai-tools' | 'backup-restore'>('analytics');
  
  const [complaintsList, setComplaintsList] = useState<any[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoadingComplaints(true);
      const res = await fetch('/api/complaints');
      const data = await res.json();
      if (data.success && Array.isArray(data.complaints)) {
        setComplaintsList(data.complaints);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoadingComplaints(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Razorpay Gateway Admin State
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [razorpayStatus, setRazorpayStatus] = useState<{ testing: boolean; message: string; valid?: boolean } | null>(null);
  const [savingRazorpay, setSavingRazorpay] = useState(false);

  // Load current Razorpay config from backend
  useEffect(() => {
    fetch('/api/razorpay/config')
      .then((res) => res.json())
      .then((cfg) => {
        if (cfg.keyId) {
          setRazorpayKeyId(cfg.keyId);
        } else if (storeSettings?.razorpayKeyId) {
          setRazorpayKeyId(storeSettings.razorpayKeyId);
        }
      })
      .catch(() => {
        if (storeSettings?.razorpayKeyId) {
          setRazorpayKeyId(storeSettings.razorpayKeyId);
        }
      });
  }, [storeSettings?.razorpayKeyId]);

  const testRazorpayConnection = async (keyIdToTest?: string, secretToTest?: string) => {
    try {
      setRazorpayStatus({ testing: true, message: 'Verifying credentials with Razorpay API...' });
      const res = await fetch('/api/razorpay/test-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: (keyIdToTest || razorpayKeyId).trim(),
          keySecret: (secretToTest || razorpayKeySecret).trim(),
        }),
      });
      const data = await res.json();
      setRazorpayStatus({ testing: false, message: data.message, valid: data.valid });
    } catch (e: any) {
      setRazorpayStatus({ testing: false, message: 'Connection test failed: ' + e.message, valid: false });
    }
  };

  const saveRazorpayCredentials = async () => {
    try {
      setSavingRazorpay(true);
      const res = await fetch('/api/razorpay/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: razorpayKeyId.trim(),
          keySecret: razorpayKeySecret.trim(),
        }),
      });
      const data = await res.json();
      setRazorpayStatus({ testing: false, message: data.message, valid: data.valid });
      if (data.success) {
        updateStoreSettings({ razorpayKeyId: razorpayKeyId.trim() });
      }
      addToast({
        title: data.valid ? 'Razorpay Connected' : 'Credentials Saved (Sandbox Fallback Active)',
        message: data.message,
        type: data.valid ? 'success' : 'info',
      });
    } catch (e: any) {
      addToast({
        title: 'Error Saving Credentials',
        message: e.message,
        type: 'error',
      });
    } finally {
      setSavingRazorpay(false);
    }
  };

  // Guard restricted tabs: Non-super administrators cannot access accounts or user management tabs
  useEffect(() => {
    if (!isCurrentSuperAdmin && (activeTab === 'accounts' || activeTab === 'users')) {
      setActiveTab('analytics');
    }
  }, [isCurrentSuperAdmin, activeTab]);
  
  const onlineOrders = orders.filter(o => o.source !== 'offline');
  const offlineOrdersList = orders.filter(o => o.source === 'offline');
  const [productSearch, setProductSearch] = useState('');
  const [comboSearch, setComboSearch] = useState('');
  const [selectedComboCategoryFilter, setSelectedComboCategoryFilter] = useState<string>('all');
  const [isComboCategoryModalOpen, setIsComboCategoryModalOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategoryTypeTab, setSelectedCategoryTypeTab] = useState<'all' | 'combo' | 'plant' | 'both'>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Bulk selection state
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedComboIds, setSelectedComboIds] = useState<string[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

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
    weight: 1,
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
    sellableStates: ['Kerala', 'Tamil Nadu', 'Karnataka', 'All India'],
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

  // Nursery Settings Local Form State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(() => ({
    businessName: storeSettings?.businessName || '7Seasonsplants',
    tagline: storeSettings?.tagline || 'Vibrant Plants & Curated Green Combos',
    parentNursery: storeSettings?.parentNursery || '7Seasons By Mannaratharayil Gardens LLP',
    phone: storeSettings?.phone || '08848276403',
    email: storeSettings?.email || 'mannaratharayil@gmail.com',
    whatsapp: storeSettings?.whatsapp || storeSettings?.whatsappNumber || '+91 88482 76403',
    whatsappNumber: storeSettings?.whatsapp || storeSettings?.whatsappNumber || '+91 88482 76403',
    instagram: storeSettings?.instagram || '@7seasonsplants',
    address: storeSettings?.address || 'Mannaratharayil Gardens LLP, Calicut-Palakkad Highway, Kerala, India',
    supportedStates: storeSettings?.supportedStates || ['Kerala', 'Tamil Nadu', 'Karnataka'],
    deliveryCharge: storeSettings?.deliveryCharge ?? 80,
    freeDeliveryEnabled: storeSettings?.freeDeliveryEnabled !== false,
    freeShippingThreshold: storeSettings?.freeShippingThreshold ?? storeSettings?.freeDeliveryThreshold ?? 899,
    freeDeliveryThreshold: storeSettings?.freeShippingThreshold ?? storeSettings?.freeDeliveryThreshold ?? 899,
    announcementBarText: storeSettings?.announcementBarText || storeSettings?.announcementText || '🌿 Fresh Plants • Curated Combos • Delivered Safely Across Kerala & Tamil Nadu • Free Shipping over ₹899!',
    announcementText: storeSettings?.announcementBarText || storeSettings?.announcementText || '🌿 Fresh Plants • Curated Combos • Delivered Safely Across Kerala & Tamil Nadu • Free Shipping over ₹899!',
    announcementBarActive: storeSettings?.announcementBarActive !== false,
    announcementLink: storeSettings?.announcementLink || '/combos',
    razorpayKeyId: storeSettings?.razorpayKeyId || '',
    razorpayEnabled: storeSettings?.razorpayEnabled !== false,
    menuVisibility: {
      home: true,
      plants: true,
      combos: true,
      bestSellers: true,
      newArrivals: true,
      deals: true,
      plantCare: true,
      blog: true,
      trackOrder: true,
      wishlist: true,
      cart: true,
      ...(storeSettings?.menuVisibility || {}),
    },
  }));

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);
  const [isSettingsDirty, setIsSettingsDirty] = useState(false);

  // Sync settingsForm with storeSettings from Firebase when not dirty
  useEffect(() => {
    if (!isSettingsDirty && storeSettings) {
      setSettingsForm({
        businessName: storeSettings.businessName || '7Seasonsplants',
        tagline: storeSettings.tagline || 'Vibrant Plants & Curated Green Combos',
        parentNursery: storeSettings.parentNursery || '7Seasons By Mannaratharayil Gardens LLP',
        phone: storeSettings.phone || '08848276403',
        email: storeSettings.email || 'mannaratharayil@gmail.com',
        whatsapp: storeSettings.whatsapp || storeSettings.whatsappNumber || '+91 88482 76403',
        whatsappNumber: storeSettings.whatsapp || storeSettings.whatsappNumber || '+91 88482 76403',
        instagram: storeSettings.instagram || '@7seasonsplants',
        address: storeSettings.address || 'Mannaratharayil Gardens LLP, Calicut-Palakkad Highway, Kerala, India',
        supportedStates: storeSettings.supportedStates || ['Kerala', 'Tamil Nadu', 'Karnataka'],
        deliveryCharge: storeSettings.deliveryCharge ?? 80,
        freeDeliveryEnabled: storeSettings.freeDeliveryEnabled !== false,
        freeShippingThreshold: storeSettings.freeShippingThreshold ?? storeSettings.freeDeliveryThreshold ?? 899,
        freeDeliveryThreshold: storeSettings.freeShippingThreshold ?? storeSettings.freeDeliveryThreshold ?? 899,
        announcementBarText: storeSettings.announcementBarText || storeSettings.announcementText || '',
        announcementText: storeSettings.announcementBarText || storeSettings.announcementText || '',
        announcementBarActive: storeSettings.announcementBarActive !== false,
        announcementLink: storeSettings.announcementLink || '/combos',
        razorpayKeyId: storeSettings.razorpayKeyId || '',
        razorpayEnabled: storeSettings.razorpayEnabled !== false,
        menuVisibility: {
          home: true,
          plants: true,
          combos: true,
          bestSellers: true,
          newArrivals: true,
          deals: true,
          plantCare: true,
          blog: true,
          trackOrder: true,
          wishlist: true,
          cart: true,
          ...(storeSettings.menuVisibility || {}),
        },
      });
    }
  }, [storeSettings, isSettingsDirty]);

  const handleSaveStoreSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSavedSuccess(false);

    try {
      const payload: Partial<StoreSettings> = {
        ...settingsForm,
        deliveryCharge: Number(settingsForm.deliveryCharge) || 0,
        freeDeliveryEnabled: Boolean(settingsForm.freeDeliveryEnabled),
        freeShippingThreshold: Number(settingsForm.freeShippingThreshold) || 0,
        freeDeliveryThreshold: Number(settingsForm.freeShippingThreshold) || 0,
        whatsapp: settingsForm.whatsapp.trim(),
        whatsappNumber: settingsForm.whatsapp.trim(),
        phone: settingsForm.phone.trim(),
        email: settingsForm.email.trim(),
        announcementBarText: settingsForm.announcementBarText.trim(),
        announcementText: settingsForm.announcementBarText.trim(),
        announcementBarActive: settingsForm.announcementBarActive,
        announcementLink: settingsForm.announcementLink?.trim() || '/combos',
        businessName: settingsForm.businessName.trim(),
        parentNursery: settingsForm.parentNursery.trim(),
        address: settingsForm.address.trim(),
        menuVisibility: settingsForm.menuVisibility,
      };

      await updateStoreSettings(payload);
      setIsSettingsDirty(false);
      setSettingsSavedSuccess(true);
      setTimeout(() => setSettingsSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleResetStoreSettings = () => {
    setSettingsForm({
      businessName: storeSettings.businessName || '7Seasonsplants',
      tagline: storeSettings.tagline || 'Vibrant Plants & Curated Green Combos',
      parentNursery: storeSettings.parentNursery || '7Seasons By Mannaratharayil Gardens LLP',
      phone: storeSettings.phone || '08848276403',
      email: storeSettings.email || 'mannaratharayil@gmail.com',
      whatsapp: storeSettings.whatsapp || storeSettings.whatsappNumber || '+91 88482 76403',
      whatsappNumber: storeSettings.whatsapp || storeSettings.whatsappNumber || '+91 88482 76403',
      instagram: storeSettings.instagram || '@7seasonsplants',
      address: storeSettings.address || 'Mannaratharayil Gardens LLP, Calicut-Palakkad Highway, Kerala, India',
      supportedStates: storeSettings.supportedStates || ['Kerala', 'Tamil Nadu', 'Karnataka'],
      deliveryCharge: storeSettings.deliveryCharge ?? 80,
      freeDeliveryEnabled: storeSettings.freeDeliveryEnabled !== false,
      freeShippingThreshold: storeSettings.freeShippingThreshold ?? storeSettings.freeDeliveryThreshold ?? 899,
      freeDeliveryThreshold: storeSettings.freeShippingThreshold ?? storeSettings.freeDeliveryThreshold ?? 899,
      announcementBarText: storeSettings.announcementBarText || storeSettings.announcementText || '',
      announcementText: storeSettings.announcementBarText || storeSettings.announcementText || '',
      announcementBarActive: storeSettings.announcementBarActive !== false,
      announcementLink: storeSettings.announcementLink || '/combos',
      razorpayKeyId: storeSettings.razorpayKeyId || '',
      razorpayEnabled: storeSettings.razorpayEnabled !== false,
      menuVisibility: {
        home: true,
        plants: true,
        combos: true,
        bestSellers: true,
        newArrivals: true,
        deals: true,
        plantCare: true,
        blog: true,
        trackOrder: true,
        wishlist: true,
        cart: true,
        ...(storeSettings.menuVisibility || {}),
      },
    });
    setIsSettingsDirty(false);
    addToast({
      title: 'Settings Reset',
      message: 'Reverted all unsaved changes to active store settings.',
      type: 'info',
    });
  };

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


  const toggleOrderSelection = (id: string) => {
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(oId => oId !== id) : [...prev, id]
    );
  };

  const toggleAllOrders = () => {
    if (selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    }
  };

  const handleBulkUpdateOrderStatus = (status: OrderStatus) => {
    if (selectedOrderIds.length === 0) return;
    selectedOrderIds.forEach(id => {
      updateOrderStatus(id, status);
    });
    setSelectedOrderIds([]);
    addToast({ title: 'Status Updated', message: `Updated ${selectedOrderIds.length} orders to ${status}.`, type: 'success' });
  };

  const handleExportOrdersCSV = () => {
    let filteredExportOrders = activeTab === 'offline-orders' ? offlineOrdersList : onlineOrders;

    if (exportStatus !== 'all') {
      filteredExportOrders = filteredExportOrders.filter(o => o.orderStatus === exportStatus);
    }

    if (exportStartDate) {
      filteredExportOrders = filteredExportOrders.filter(o => new Date(o.createdAt) >= new Date(exportStartDate));
    }

    if (exportEndDate) {
      filteredExportOrders = filteredExportOrders.filter(o => new Date(o.createdAt) <= new Date(exportEndDate + 'T23:59:59'));
    }

    const headers = ['Timestamp', 'NAME', 'ADDRESS', 'DISTRICT', 'PIN', 'PHONE  NUMBER', 'ITEM', 'ORDER BY', 'COURIER', 'STATE'];
    const csvContent = [
      headers.join(','),
      ...filteredExportOrders.map(o => {
        const address = o.customer.shippingAddress || o.shippingAddress || {} as any;
        const fullAddress = [address.addressLine1, address.addressLine2, address.street, address.landmark, address.nearbyLandmark].filter(Boolean).join(', ').replace(/"/g, '""');
        const itemsList = o.items.map(i => i.name).join(' + ').replace(/"/g, '""');
        
        return [
          `"${new Date(o.createdAt).toLocaleString()}"`,
          `"${o.customer.name.replace(/"/g, '""')}"`,
          `"${fullAddress}"`,
          `"${(address.district || address.city || '').replace(/"/g, '""')}"`,
          `"${address.pincode || ''}"`,
          `"${o.customer.phone || address.phoneNumber || address.phone || ''}"`,
          `"${itemsList}"`,
          `""`,
          `"${o.courierPartner || ''}"`,
          `"${(address.state || '').replace(/"/g, '""')}"`
        ].join(',');
      })
    ].join('\n');
    downloadCSV(csvContent, `7seasons_orders_${new Date().toISOString().split('T')[0]}.csv`);
    setIsExportModalOpen(false);
  };

  const downloadOfflineTemplate = () => {
    const headers = ['Timestamp', 'NAME', 'ADDRESS', 'DISTRICT', 'STATE', 'PIN', 'PHONE NUMBER', 'ITEM', 'ORDER BY', 'COURIER'];
    const sampleRow = [
      '7/3/2026 12:55:28',
      'Peter',
      '"Madathiparabil (House ) Chungathara P O  Kunnath  Malappuram  Kerala "',
      'MALAPPURAM',
      'Kerala',
      '679334',
      '9605356668',
      'KM COMBO',
      'SEBASTINE',
      'D'
    ];
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    downloadCSV(csvContent, 'offline_orders_template.csv');
  };

  // Filtered lists
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const adminComboCategories = React.useMemo(() => {
    const list = [...categories.filter((c) => c.type === 'combo' || c.type === 'both')];
    const existing = new Set(list.map((c) => c.name.toLowerCase()));
    combos.forEach((c) => {
      if (c.category && !existing.has(c.category.toLowerCase())) {
        existing.add(c.category.toLowerCase());
        list.push({
          id: `cat-dynamic-${c.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          name: c.category,
          slug: c.category.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          description: `${c.category} plant combos`,
          image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
          itemCount: 1,
          displayOrder: 99,
          type: 'combo',
        });
      }
    });
    return list;
  }, [categories, combos]);

  const filteredCombos = combos.filter((c) => {
    const q = comboSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.category && c.category.toLowerCase().includes(q)) ||
      (c.items && c.items.some((it) => it.productName.toLowerCase().includes(q)));
    if (!matchesSearch) return false;
    if (selectedComboCategoryFilter !== 'all') {
      return (c.category || '').toLowerCase().trim() === selectedComboCategoryFilter.toLowerCase().trim();
    }
    return true;
  });

  const filteredOrders = onlineOrders.filter((o) => {
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

  const filteredOfflineOrders = offlineOrdersList.filter((o) => {
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
      weight: 1,
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
      sellableStates: ['Kerala', 'Tamil Nadu', 'Karnataka', 'All India'],
    });
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      ...prod,
      sellableStates: prod.sellableStates?.length ? prod.sellableStates : ['Kerala', 'Tamil Nadu', 'Karnataka', 'All India'],
    });
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

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name) return;

    try {
      const sourceImages = productForm.images?.length
        ? productForm.images
        : ['https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80'];
      const sanitizedImages = await Promise.all(
        sourceImages.map((img, idx) => uploadImage(img, `product-${Date.now()}-${idx + 1}`))
      );

      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...(productForm as Product), images: sanitizedImages });
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
          description: productForm.description || 'Grown at Mannaratharayil Gardens LLP.',
          category: productForm.category || 'Air Purifying',
          price: Number(productForm.price),
          originalPrice: Number(productForm.originalPrice || productForm.price),
          discountPercentage: discount,
          stock: Number(productForm.stock || 20),
          weight: Number(productForm.weight || 1),
          sku: `7SP-${Math.floor(1000 + Math.random() * 9000)}`,
          images: sanitizedImages,
          rating: 4.9,
          reviewCount: 12,
          isBestseller: Boolean(productForm.isBestseller),
          tags: ['Indoor', 'Mannaratharayil'],
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
          sellableStates: productForm.sellableStates || ['Kerala', 'Tamil Nadu', 'Karnataka', 'All India'],
          createdAt: new Date().toISOString(),
        };

        await addProduct(newProd);
        addToast({
          title: 'Plant Added',
          message: `${newProd.name} added to catalog.`,
          type: 'success',
        });
      }
    } catch (err: any) {
      console.error('Error saving product:', err);
      addToast({
        title: 'Error Saving Plant',
        message: err.message || 'Please check product data.',
        type: 'error',
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

  const handleSaveCombo = async (savedCombo: PlantCombo) => {
    try {
      if (editingCombo) {
        await updateCombo(savedCombo);
      } else {
        await addCombo(savedCombo);
      }
      // Reset category filter & search so the newly saved combo is immediately visible in the table
      setSelectedComboCategoryFilter('all');
      setComboSearch('');
    } catch (err: any) {
      console.error('Error in handleSaveCombo:', err);
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
        shortDescription: `A resilient tropical specimen from Mannaratharayil Gardens LLP. Features lush foliage and effortless indoor care routines.`,
        longDescription: `Carefully cultivated in Kerala soil mix, this ${aiPlantName} is naturally adapted to high humidity and warm temperatures. Shipped in a sturdy 5-ply carton directly to your doorstep.`,
        careSchedule: `Place in bright indirect light. Water thoroughly when the top 2 inches of soil are dry. Feed organic fertilizer monthly.`,
        tags: ['Indoor', 'KeralaNursery', 'TropicalPlants', 'Mannaratharayil'],
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
              <span>Mannaratharayil Gardens LLP Operations Control Center</span>
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
            { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
            { id: 'products', label: `Plant Catalog (${products.length})`, icon: Package },
            { id: 'combos', label: `Combo Bundles (${combos.length})`, icon: Layers },
            { id: 'categories', label: `Categories (${categories.length})`, icon: Tag },
            { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Ticket },
            { id: 'reviews', label: `Reviews (${reviews.length})`, icon: MessageSquare },
            { id: 'orders', label: `Online Orders (${onlineOrders.length})`, icon: Truck },
            { id: 'offline-orders', label: `Offline Orders (${offlineOrdersList.length})`, icon: Download },
            ...(isCurrentSuperAdmin
              ? [
                  {
                    id: 'accounts',
                    label: `Admin Accounts & Security (${adminAccounts.length})`,
                    icon: ShieldCheck,
                    isSuperAdminOnly: true,
                  },
                  {
                    id: 'users',
                    label: 'User Management',
                    icon: Users,
                    isSuperAdminOnly: true,
                  },
                ]
              : []),
            { id: 'complaints', label: `Grievances (${complaintsList.length})`, icon: AlertTriangle },
            { id: 'ai-tools', label: 'Gemini AI Assistant', icon: Sparkles },
            { id: 'settings', label: 'Nursery Settings', icon: Settings },
            { id: 'backup-restore', label: 'Backup & Restore', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isRestricted = (tab as any).isSuperAdminOnly;
            return (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? isRestricted
                      ? 'bg-gradient-to-r from-emerald-950 via-[#062416] to-emerald-900 text-amber-300 shadow-md ring-2 ring-amber-400/50'
                      : 'bg-emerald-800 text-white shadow-xs'
                    : isRestricted
                      ? 'bg-amber-50/90 text-emerald-950 hover:bg-amber-100 hover:text-emerald-900 border border-amber-300/80 shadow-2xs'
                      : 'bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 border border-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isRestricted ? (activeTab === tab.id ? 'text-amber-400' : 'text-amber-700') : ''}`} />
                <span>{tab.label}</span>
                {isRestricted && (
                  <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider ${
                    activeTab === tab.id
                      ? 'bg-amber-400 text-amber-950 shadow-2xs'
                      : 'bg-amber-200/90 text-amber-950 border border-amber-300/80'
                  }`}>
                    <Crown className="w-2.5 h-2.5" />
                    Super Admin
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 0: ANALYTICS */}
        {activeTab === 'analytics' && <AnalyticsDashboard />}

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
                            src={p.images?.[0]}
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
                  onClick={() => setIsComboCategoryModalOpen(true)}
                  className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-full text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  title="Create and manage categories specifically for combo bundles"
                >
                  <Tag className="w-4 h-4 text-emerald-700" />
                  <span>Manage Categories</span>
                </button>
                <button
                  onClick={handleOpenNewCombo}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Plant Combo Bundle</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills & Create Category Quick Action */}
            <div className="bg-white p-3 sm:p-4 rounded-3xl border border-gray-200 shadow-2xs flex items-center justify-between gap-3 overflow-x-auto">
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <span className="text-xs font-bold text-gray-500 mr-1 flex items-center gap-1 shrink-0">
                  <Tag className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Category:</span>
                </span>
                <button
                  onClick={() => setSelectedComboCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    selectedComboCategoryFilter === 'all'
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({combos.length})
                </button>
                {adminComboCategories.map((cat) => {
                  const count = combos.filter(
                    (c) => c.category?.toLowerCase() === cat.name.toLowerCase()
                  ).length;
                  const isSelected = selectedComboCategoryFilter.toLowerCase() === cat.name.toLowerCase();
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedComboCategoryFilter(cat.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-800 text-white shadow-2xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-emerald-950 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setIsComboCategoryModalOpen(true)}
                className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 shrink-0 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New Category</span>
              </button>
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
                          src={combo.images?.[0]}
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

        {/* TAB: SITE CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Toolbar */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800 mb-1">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Catalog Architecture</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
                    Site Categories Catalog
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
                    Categories created or deleted here automatically update the homepage category grid, plant catalog, and combo bundles in real time.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsComboCategoryModalOpen(true)}
                    className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Create New Category</span>
                  </button>
                </div>
              </div>

              {/* Metrics Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-[#F4FAF5] p-3 rounded-2xl border border-emerald-900/10">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Categories</span>
                  <span className="text-xl font-black text-emerald-950">{categories.length}</span>
                </div>
                <div className="bg-[#F4FAF5] p-3 rounded-2xl border border-emerald-900/10">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Combo Categories</span>
                  <span className="text-xl font-black text-rose-700">{categories.filter(c => c.type === 'combo').length}</span>
                </div>
                <div className="bg-[#F4FAF5] p-3 rounded-2xl border border-emerald-900/10">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Plant Categories</span>
                  <span className="text-xl font-black text-emerald-700">{categories.filter(c => c.type === 'plant').length}</span>
                </div>
                <div className="bg-[#F4FAF5] p-3 rounded-2xl border border-emerald-900/10">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Shared Categories</span>
                  <span className="text-xl font-black text-amber-700">{categories.filter(c => c.type === 'both').length}</span>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search categories by name, slug or description..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 text-xs font-semibold text-emerald-950 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryTypeTab('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      selectedCategoryTypeTab === 'all'
                        ? 'bg-emerald-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All ({categories.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryTypeTab('combo')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      selectedCategoryTypeTab === 'combo'
                        ? 'bg-emerald-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Combos ({categories.filter(c => c.type === 'combo').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryTypeTab('plant')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      selectedCategoryTypeTab === 'plant'
                        ? 'bg-emerald-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Plants ({categories.filter(c => c.type === 'plant').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryTypeTab('both')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      selectedCategoryTypeTab === 'both'
                        ? 'bg-emerald-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Both ({categories.filter(c => c.type === 'both').length})
                  </button>
                </div>
              </div>
            </div>

            {/* Categories Card Grid */}
            {categories
              .filter((c) => {
                if (selectedCategoryTypeTab !== 'all' && c.type !== selectedCategoryTypeTab) return false;
                if (!categorySearch) return true;
                const q = categorySearch.toLowerCase();
                return (
                  c.name.toLowerCase().includes(q) ||
                  c.slug?.toLowerCase().includes(q) ||
                  c.description?.toLowerCase().includes(q)
                );
              })
              .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99)).length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 max-w-lg mx-auto space-y-3">
                <FolderTree className="w-12 h-12 text-gray-400 mx-auto" />
                <h4 className="font-bold text-gray-800">No categories match your criteria</h4>
                <p className="text-xs text-gray-500">
                  {categorySearch ? `No categories found for "${categorySearch}".` : 'Create your first botanical category using the button below.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsComboCategoryModalOpen(true)}
                  className="px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-full hover:bg-emerald-900 transition-colors"
                >
                  + Create New Category
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories
                  .filter((c) => {
                    if (selectedCategoryTypeTab !== 'all' && c.type !== selectedCategoryTypeTab) return false;
                    if (!categorySearch) return true;
                    const q = categorySearch.toLowerCase();
                    return (
                      c.name.toLowerCase().includes(q) ||
                      c.slug?.toLowerCase().includes(q) ||
                      c.description?.toLowerCase().includes(q)
                    );
                  })
                  .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99))
                  .map((cat) => {
                    const comboCount = combos.filter(
                      (c) => c.category?.toLowerCase() === cat.name.toLowerCase()
                    ).length;
                    const prodCount = products.filter(
                      (p) => p.category?.toLowerCase() === cat.name.toLowerCase()
                    ).length;

                    const typeBadgeText = cat.type === 'combo' ? 'Combo Pack' : cat.type === 'plant' ? 'Plant Variety' : 'Plants & Combos';
                    const typeBadgeColor = cat.type === 'combo'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : cat.type === 'plant'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200';

                    return (
                      <div
                        key={cat.id}
                        className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                      >
                        <div className="relative h-40 bg-emerald-950 overflow-hidden">
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover opacity-90"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-xs ${typeBadgeColor}`}>
                              {typeBadgeText}
                            </span>
                            {cat.isFeatured && (
                              <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <span className="text-[10px] font-bold text-emerald-300 block">
                              Order #{cat.displayOrder || 1} • /{cat.slug}
                            </span>
                            <h4 className="font-extrabold text-base text-white leading-tight">
                              {cat.name}
                            </h4>
                          </div>
                        </div>

                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {cat.description || 'Acclimated tropical specimen collection from 7Seasons Nursery.'}
                          </p>

                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-gray-600 font-semibold text-[11px]">
                              {cat.type === 'combo' ? (
                                <span>{comboCount} Active Combos</span>
                              ) : cat.type === 'plant' ? (
                                <span>{prodCount} Active Plants</span>
                              ) : (
                                <span>{comboCount} Combos • {prodCount} Plants</span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setIsComboCategoryModalOpen(true)}
                                className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Category"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteModal({
                                    isOpen: true,
                                    title: `Delete Category: ${cat.name}`,
                                    message: `Are you sure you want to delete category "${cat.name}"? It will be immediately removed from the homepage and category filters.`,
                                    onConfirm: async () => {
                                      await deleteCategory(cat.id);
                                      addToast({
                                        type: 'info',
                                        title: 'Category Deleted',
                                        message: `Category "${cat.name}" was deleted successfully.`,
                                      });
                                      setDeleteModal(prev => ({ ...prev, isOpen: false }));
                                    }
                                  });
                                }}
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORDERS & DISPATCH */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Top Toolbar: Search & Status Filters */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
              {/* Bulk Selection Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="selectAllOrders"
                      checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
                      onChange={toggleAllOrders}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="selectAllOrders" className="ml-2 text-xs font-bold text-gray-700 cursor-pointer">
                      Select All
                    </label>
                  </div>
                  <div className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600">
                    <strong className="text-emerald-950 font-bold">{filteredOrders.length}</strong> matching orders
                  </div>
                </div>

                {selectedOrderIds.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-emerald-950 mr-2">Bulk Update Status:</span>
                    <select
                      onChange={(e) => handleBulkUpdateOrderStatus(e.target.value as any)}
                      className="px-3 py-1.5 bg-gray-50 text-emerald-950 text-xs font-bold rounded-full border border-emerald-500 focus:border-emerald-600 outline-hidden cursor-pointer"
                      defaultValue=""
                    >
                      <option value="" disabled>Select Status</option>
                      <option value="Order Placed">Order Placed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
              </div>

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
                      { id: 'all', label: `All (${onlineOrders.length})` },
                      { id: 'Order Placed', label: `Placed (${onlineOrders.filter((o) => o.orderStatus === 'Order Placed').length})` },
                      { id: 'Processing', label: `Packing (${onlineOrders.filter((o) => o.orderStatus === 'Processing').length})` },
                      { id: 'Shipped', label: `Shipped (${onlineOrders.filter((o) => o.orderStatus === 'Shipped').length})` },
                      { id: 'Delivered', label: `Delivered (${onlineOrders.filter((o) => o.orderStatus === 'Delivered').length})` },
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
                      className={`bg-white rounded-3xl p-5 sm:p-6 border ${selectedOrderIds.includes(ord.id) ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20' : 'border-gray-200 shadow-2xs hover:border-emerald-200'} transition-all space-y-4 relative`}
                    >
                      {/* Bulk selection checkbox */}
                      <div className="absolute top-5 right-5 z-10">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(ord.id)}
                          onChange={() => toggleOrderSelection(ord.id)}
                          className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </div>
                      
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
                                ord.courierPartner || 'DTDC Express Courier'
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

        
        {/* OFFLINE ORDERS TAB */}
        {activeTab === 'offline-orders' && (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-2xs flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-emerald-950">Offline Orders</h3>
                  <p className="text-xs text-gray-500">Import and manage orders placed outside the website.</p>
                </div>
                <div className="flex gap-3">
                  <input
                    type="file"
                    accept=".csv"
                    id="import-offline-csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        try {
                          const text = ev.target?.result;
                          if (typeof text !== 'string') return;
                          
                          // Parse CSV handling quotes
                          const rows = [];
                          let quote = false;
                          let col = 0, row = 0;
                          for (let c = 0; c < text.length; c++) {
                              let cc = text[c], nc = text[c+1];
                              rows[row] = rows[row] || [];
                              rows[row][col] = rows[row][col] || '';
                              if (cc == '"' && quote && nc == '"') { rows[row][col] += cc; ++c; continue; }
                              if (cc == '"') { quote = !quote; continue; }
                              if (cc == ',' && !quote) { ++col; continue; }
                              if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
                              if (cc == '\n' && !quote) { ++row; col = 0; continue; }
                              if (cc == '\r' && !quote) { ++row; col = 0; continue; }
                              rows[row][col] += cc;
                          }
                          
                          if (rows.length < 2) throw new Error('File is empty or has no data rows');
                          
                          const headers = rows[0].map(h => h.trim().toLowerCase());
                          const newOrders = [];
                          
                          for (let i = 1; i < rows.length; i++) {
                            const values = rows[i];
                            if (values.length < 2) continue; // Skip empty rows
                            
                            const getItem = () => {
                              const itemStr = values[headers.indexOf('item')] || values[headers.indexOf('product')] || 'Custom Order';
                              return itemStr;
                            };
                            
                            const order = {
                              id: 'offline-' + Date.now() + '-' + i,
                              orderNumber: 'OFF-' + String(Date.now()).slice(-6) + i,
                              customer: {
                                id: 'offline-customer-' + i,
                                name: values[headers.indexOf('name')] || 'Walk-in Customer',
                                email: 'offline@example.com',
                                phone: values[headers.indexOf('phone number')] || values[headers.indexOf('phone')] || '',
                                isOffline: true,
                                createdAt: new Date().toISOString()
                              },
                              shippingAddress: {
                                addressLine1: values[headers.indexOf('address')] || '',
                                addressLine2: '',
                                city: values[headers.indexOf('district')] || values[headers.indexOf('city')] || '',
                                state: values[headers.indexOf('state')] || '',
                                pincode: values[headers.indexOf('pin')] || values[headers.indexOf('pincode')] || '',
                                fullName: values[headers.indexOf('name')] || '',
                                phoneNumber: values[headers.indexOf('phone number')] || values[headers.indexOf('phone')] || ''
                              },
                              items: [
                                {
                                  id: 'offline-item',
                                  type: 'product',
                                  name: getItem(),
                                  slug: 'offline-product',
                                  price: Number(values[headers.indexOf('price')]) || 0,
                                  quantity: Number(values[headers.indexOf('quantity')]) || 1,
                                  image: ''
                                }
                              ],
                              subtotal: Number(values[headers.indexOf('price')]) || 0,
                              discount: 0,
                              total: (Number(values[headers.indexOf('price')]) || 0) * (Number(values[headers.indexOf('quantity')]) || 1),
                              orderStatus: 'Order Placed',
                              paymentStatus: 'Paid',
                              paymentMethod: 'Offline/Cash',
                              source: 'offline',
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                              orderedBy: values[headers.indexOf('order by')] || '',
                              courierPartner: values[headers.indexOf('courier')] || ''
                            };
                            newOrders.push(order);
                          }
                          
                          importOrders(newOrders);
                          addToast({ title: 'Import Successful', message: `Imported ${newOrders.length} offline orders.`, type: 'success' });
                        } catch (err) {
                          console.error(err);
                          addToast({ title: 'Import Failed', message: 'Could not parse CSV file.', type: 'error' });
                        }
                        e.target.value = ''; // Reset
                      };
                      reader.readAsText(file);
                    }}
                  />
                  <label htmlFor="import-offline-csv" className="px-4 py-2 bg-emerald-800 text-white rounded-full text-xs font-bold hover:bg-emerald-900 transition-colors cursor-pointer flex items-center gap-2 shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>Import CSV</span>
                  </label>
                  
                  <button
                    onClick={downloadOfflineTemplate}
                    className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold hover:bg-emerald-200 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Get Template</span>
                  </button>
                  <button
                    onClick={() => {
                      setExportStatus('all');
                      setIsExportModalOpen(true);
                    }}
                    className="px-4 py-2 bg-white text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold hover:bg-emerald-50 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Bulk Selection Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="selectAllOfflineOrders"
                      checked={selectedOrderIds.length === filteredOfflineOrders.length && filteredOfflineOrders.length > 0}
                      onChange={() => {
                        if (selectedOrderIds.length === filteredOfflineOrders.length && filteredOfflineOrders.length > 0) {
                          setSelectedOrderIds([]);
                        } else {
                          setSelectedOrderIds(filteredOfflineOrders.map(o => o.id));
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="selectAllOfflineOrders" className="ml-2 text-xs font-bold text-gray-700 cursor-pointer">
                      Select All
                    </label>
                  </div>
                  <div className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600">
                    <strong className="text-emerald-950 font-bold">{filteredOfflineOrders.length}</strong> matching orders
                  </div>
                </div>

                {selectedOrderIds.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-emerald-950 mr-2">Bulk Update Status:</span>
                    <select
                      onChange={(e) => handleBulkUpdateOrderStatus(e.target.value as any)}
                      className="px-3 py-1.5 bg-gray-50 text-emerald-950 text-xs font-bold rounded-full border border-emerald-500 focus:border-emerald-600 outline-hidden cursor-pointer"
                      defaultValue=""
                    >
                      <option value="" disabled>Select Status</option>
                      <option value="Order Placed">Order Placed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {filteredOfflineOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-2xs space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Package className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-emerald-950">No offline orders</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Import a CSV file to add offline orders. Required columns: name, phone, address, city, state, pincode, product, price, quantity.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOfflineOrders.map((ord, index) => {
                  if (index === 0) return null;
                  const customerName = ord.customer?.name || ord.customer?.shippingAddress?.fullName || 'Customer';
                  const customerPhone = ord.customer?.phone || ord.customer?.shippingAddress?.phoneNumber || 'N/A';
                  const shippingAddr = ord.customer?.shippingAddress;
                  const formattedDate = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Recent';

                  return (
                    <div key={ord.id} className={`bg-white rounded-3xl p-5 sm:p-6 border ${selectedOrderIds.includes(ord.id) ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20' : 'border-gray-200 shadow-2xs hover:border-emerald-200'} transition-all space-y-4 relative`}>
                      {/* Bulk selection checkbox */}
                      <div className="absolute top-5 right-5 z-10">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(ord.id)}
                          onChange={() => toggleOrderSelection(ord.id)}
                          className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between pb-3 border-b border-gray-100 gap-3 pr-10">
                        <div>
                          <span className="text-xs font-black text-emerald-950">Order #{ord.orderNumber || ord.id}</span>
                          <span className="ml-3 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border bg-purple-100 text-purple-900 border-purple-300">
                            {ord.orderStatus}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-emerald-950">₹{ord.total.toLocaleString('en-IN')}</p>
                          <p className="text-[11px] text-gray-500">{formattedDate} • Offline</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-gray-500 uppercase">Customer Info</p>
                          <p className="text-xs font-bold text-emerald-950">{customerName}</p>
                          <p className="text-xs text-gray-600">{customerPhone}</p>
                        </div>
                        {shippingAddr && (
                          <div className="space-y-1">
                            <p className="text-[11px] font-bold text-gray-500 uppercase">Delivery Address</p>
                            <p className="text-xs text-gray-600">
                              {shippingAddr.addressLine1}, {shippingAddr.city}<br />
                              {shippingAddr.state} {shippingAddr.pincode}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-3 border-t border-gray-100 space-y-2">
                         <p className="text-[11px] font-bold text-gray-500 uppercase">Items</p>
                         {ord.items.map((it, idx) => (
                           <div key={idx} className="flex justify-between text-xs text-gray-700">
                             <span>{it.quantity}x {it.name}</span>
                             <span>₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                           </div>
                         ))}
                      </div>
                      
                      <div className="pt-4 flex flex-wrap gap-2">
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-full focus:ring-emerald-500 focus:border-emerald-500 block px-3 py-1.5 outline-hidden"
                          >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this order?')) {
                                deleteOrder(ord.id);
                              }
                            }}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-full text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}


        {/* TAB: USER MANAGEMENT (Restricted to Super Admin) */}
        {activeTab === 'users' && isCurrentSuperAdmin && (
          <UserManagementTab onNavigateToAccounts={() => setActiveTab('accounts')} />
        )}

        {/* TAB 4: ADMIN ACCOUNTS & SECURITY (Restricted to Super Admin) */}
        {activeTab === 'accounts' && isCurrentSuperAdmin && (
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
                      {currentAdmin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
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
                  <span>{isCurrentSuperAdmin ? 'Full Super Admin Privileges' : 'Standard Admin Privileges'}</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  {isCurrentSuperAdmin
                    ? 'Direct access to customer orders, stock inventory, combo builder, and administrator role assignment.'
                    : 'Access to product catalog, combos, stock inventory, customer orders, and dispatch operations.'}
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Authorized Admin Accounts
                </span>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-2xl font-black text-emerald-950">{adminAccounts.length}</span>
                  {isCurrentSuperAdmin ? (
                    <button
                      onClick={() => setIsAddAdminModalOpen(true)}
                      className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Admin</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-gray-400 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-200">
                      🔒 Super Admin Only
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-600">
                  Only verified staff can access the Mannaratharayil Gardens LLP control room.
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
                {isCurrentSuperAdmin ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('users')}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Users className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Promote Registered User</span>
                    </button>
                    <button
                      onClick={() => setIsAddAdminModalOpen(true)}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Register New Admin</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 font-bold self-start sm:self-auto">
                    🔒 Super Admin Authority Required to Modify Roster
                  </span>
                )}
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
                              isCurrentSuperAdmin ? (
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
                              ) : (
                                <span className="text-[10px] text-gray-400 font-medium">Protected</span>
                              )
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
                      placeholder="Enter current password"
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
                for Mannaratharayil Gardens LLP plants.
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

        {/* TAB: CUSTOMER GRIEVANCES & COMPLAINTS */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-emerald-950">
                      Customer Grievances & Complaints
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      All grievances submitted by customers and forwarded to <strong>mannaratharayil@gmail.com</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchComplaints}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingComplaints ? 'animate-spin' : ''}`} />
                    <span>Refresh Tickets</span>
                  </button>
                </div>
              </div>

              {loadingComplaints ? (
                <div className="py-16 text-center text-xs text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-700" />
                  Loading complaints from grievance desk...
                </div>
              ) : complaintsList.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto opacity-70" />
                  <h4 className="font-bold text-emerald-950 text-sm">No Pending Customer Complaints</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    All transit packages are in good standing. New complaints will appear here and in mannaratharayil@gmail.com.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 mt-4">
                  {complaintsList.map((complaint) => (
                    <div key={complaint.id || complaint.ticketId} className="py-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
                            #{complaint.ticketId}
                          </span>
                          <span className="text-xs font-extrabold text-emerald-950">
                            {complaint.category}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            {complaint.urgency}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(complaint.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-gray-50 p-3 rounded-2xl">
                        <div>
                          <span className="text-gray-400 block text-[10px]">Customer:</span>
                          <strong className="text-emerald-950">{complaint.customerName}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Contact Info:</span>
                          <span className="text-emerald-900 font-medium">{complaint.customerPhone}</span>
                          <span className="text-gray-400 block text-[11px]">{complaint.customerEmail}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Related Order:</span>
                          <strong className="text-emerald-950">{complaint.orderNumber ? `#${complaint.orderNumber}` : 'None'}</strong>
                          <span className="text-emerald-700 block text-[11px]">Resolution: {complaint.desiredResolution || 'Replacement'}</span>
                        </div>
                      </div>

                      <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-900/10 text-xs text-gray-800 space-y-1">
                        <span className="font-bold text-[10px] text-emerald-800 uppercase tracking-wider block">Grievance Statement</span>
                        <p className="whitespace-pre-wrap leading-relaxed">{complaint.description}</p>
                      </div>

                      {complaint.photoAttachment && (
                        <div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Photo Evidence Attached</span>
                          <img
                            src={complaint.photoAttachment}
                            alt="Damage proof"
                            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl border border-gray-200"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`mailto:${complaint.customerEmail}?subject=Regarding%20Your%20Complaint%20Ticket%20%23${complaint.ticketId}&body=Dear%20${encodeURIComponent(complaint.customerName)},%0A%0AWe%20received%20your%20complaint%20ticket%20%23${complaint.ticketId}%20regarding%20${encodeURIComponent(complaint.category)}...`}
                          className="px-3 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-emerald-900 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Reply via Email</span>
                        </a>

                        <a
                          href={`https://wa.me/${complaint.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(complaint.customerName)},%20this%20is%20Mannaratharayil%20Gardens%20LLP%20regarding%20your%20complaint%20ticket%20%23${complaint.ticketId}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-[#25D366] text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-[#20bd5a] transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Contact on WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: NURSERY SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div
              id="nursery-settings-container"
              className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs max-w-3xl space-y-8"
            >
            {/* Header & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-emerald-950">Store Operational Settings</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Configure live announcements, delivery fees, customer helpline numbers, and menu links.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {auth.currentUser ? (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-full"
                    title={`Cloud synced to Firestore as ${auth.currentUser.email || auth.currentUser.uid}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Firestore Cloud Synced
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full"
                    title="Active in local browser cache. Login to sync globally to Firestore."
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Local Storage Active
                  </span>
                )}
                {isSettingsDirty && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold rounded-full animate-pulse">
                    Unsaved Changes
                  </span>
                )}
                {settingsSavedSuccess && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Saved Successfully
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveStoreSettings} className="space-y-8 text-xs">
              {/* SECTION 1: TOP ANNOUNCEMENT BAR */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-emerald-700" />
                      Top Announcement Bar
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Promotional banner displayed at the very top of the website.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="toggle-announcement-bar-active"
                      checked={settingsForm.announcementBarActive}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, announcementBarActive: e.target.checked }));
                        setIsSettingsDirty(true);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div>
                  <label className="font-bold text-emerald-950 block mb-1">
                    Announcement Banner Text
                  </label>
                  <input
                    type="text"
                    id="settings-announcement-text-input"
                    value={settingsForm.announcementBarText}
                    onChange={(e) => {
                      setSettingsForm((prev) => ({ ...prev, announcementBarText: e.target.value }));
                      setIsSettingsDirty(true);
                    }}
                    placeholder="e.g. 🌿 Fresh Plants • Curated Combos • Delivered Safely Across Kerala & Tamil Nadu • Free Shipping over ₹899!"
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-2xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-semibold transition-colors"
                  />
                </div>

                {/* Real-time Preview */}
                {settingsForm.announcementBarActive && (
                  <div className="p-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                      Live Announcement Banner Preview
                    </span>
                    <div className="bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-800 text-white px-4 py-1.5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2 shadow-inner">
                      <span>{settingsForm.announcementBarText || 'No announcement message set.'}</span>
                      <span className="text-amber-200 font-bold underline decoration-amber-300 ml-1">
                        Explore Combos →
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-bold text-emerald-950 block mb-1">
                    Banner Click Destination / Route
                  </label>
                  <input
                    type="text"
                    id="settings-announcement-link-input"
                    value={settingsForm.announcementLink || '/combos'}
                    onChange={(e) => {
                      setSettingsForm((prev) => ({ ...prev, announcementLink: e.target.value }));
                      setIsSettingsDirty(true);
                    }}
                    placeholder="/combos or custom URL"
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-2xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-medium transition-colors"
                  />
                </div>
              </div>

              {/* SECTION 2: SHIPPING & DELIVERY CONFIGURATION */}
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-700" />
                    Shipping & Delivery Pricing
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Controls automatic free shipping thresholds and base weight-based delivery fees.
                  </p>
                </div>

                {/* Free Delivery Master Toggle Card */}
                <div className={`p-4 rounded-2xl border transition-all ${settingsForm.freeDeliveryEnabled !== false ? 'bg-emerald-50/70 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-emerald-950">Free Delivery Option</span>
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${settingsForm.freeDeliveryEnabled !== false ? 'bg-emerald-200 text-emerald-900' : 'bg-gray-200 text-gray-700'}`}>
                          {settingsForm.freeDeliveryEnabled !== false ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {settingsForm.freeDeliveryEnabled !== false
                          ? `Orders reaching ₹${settingsForm.freeShippingThreshold} receive 100% free delivery. Customers see the free delivery progress meter in their cart.`
                          : 'Free delivery is turned off. Standard weight-based delivery charge applies to all orders regardless of cart total.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={settingsForm.freeDeliveryEnabled !== false}
                      onClick={() => {
                        setSettingsForm((prev) => ({
                          ...prev,
                          freeDeliveryEnabled: prev.freeDeliveryEnabled === false ? true : false,
                        }));
                        setIsSettingsDirty(true);
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        settingsForm.freeDeliveryEnabled !== false ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          settingsForm.freeDeliveryEnabled !== false ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={settingsForm.freeDeliveryEnabled === false ? 'opacity-50' : ''}>
                    <label className="font-bold text-emerald-950 block mb-1 flex items-center justify-between">
                      <span>Free Delivery Threshold (₹)</span>
                      {settingsForm.freeDeliveryEnabled === false && (
                        <span className="text-[10px] text-gray-500 font-semibold">(Disabled)</span>
                      )}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                      <input
                        type="number"
                        id="settings-free-delivery-input"
                        min="0"
                        step="1"
                        disabled={settingsForm.freeDeliveryEnabled === false}
                        value={settingsForm.freeShippingThreshold}
                        onChange={(e) => {
                          setSettingsForm((prev) => ({
                            ...prev,
                            freeShippingThreshold: Number(e.target.value),
                            freeDeliveryThreshold: Number(e.target.value),
                          }));
                          setIsSettingsDirty(true);
                        }}
                        className="w-full pl-8 pr-4 py-2.5 bg-gray-50 text-gray-900 rounded-2xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-bold transition-colors disabled:cursor-not-allowed"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {settingsForm.freeDeliveryEnabled !== false
                        ? `Orders with subtotal equal to or above ₹${settingsForm.freeShippingThreshold} get 100% free delivery.`
                        : 'Enable the option above to activate threshold-based free delivery.'}
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">
                      Standard Delivery Charge (₹ per Kg)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                      <input
                        type="number"
                        id="settings-delivery-charge-input"
                        min="0"
                        step="1"
                        value={settingsForm.deliveryCharge}
                        onChange={(e) => {
                          setSettingsForm((prev) => ({
                            ...prev,
                            deliveryCharge: Number(e.target.value),
                          }));
                          setIsSettingsDirty(true);
                        }}
                        className="w-full pl-8 pr-4 py-2.5 bg-gray-50 text-gray-900 rounded-2xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-bold transition-colors"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {settingsForm.freeDeliveryEnabled !== false
                        ? `Charged per kg of total plant shipment weight when subtotal is under ₹${settingsForm.freeShippingThreshold}.`
                        : 'Charged per kg of total plant shipment weight on all orders.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: NURSERY CONTACT & HELPLINE */}
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-700" />
                    Customer Helpline & WhatsApp Support
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Displayed across header support buttons, sticky footer, order tracking, and contact pages.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">
                      Nursery WhatsApp Helpline
                    </label>
                    <input
                      type="text"
                      id="settings-whatsapp-input"
                      value={settingsForm.whatsapp}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({
                          ...prev,
                          whatsapp: e.target.value,
                          whatsappNumber: e.target.value,
                        }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="+91 88482 76403"
                      className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-2xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-semibold transition-colors"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Used for direct chat links (e.g. wa.me/...).
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">
                      Customer Care Calling Phone
                    </label>
                    <input
                      type="text"
                      id="settings-phone-input"
                      value={settingsForm.phone}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, phone: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="08848276403"
                      className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-2xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-semibold transition-colors"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Direct voice call helpline number.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-emerald-950 block mb-1">
                      Customer Support Email Address
                    </label>
                    <input
                      type="email"
                      id="settings-email-input"
                      value={settingsForm.email}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, email: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="mannaratharayil@gmail.com"
                      className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-2xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-semibold transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: BRANDING & FACILITY INFORMATION */}
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    Nursery Branding & Dispatch Facility
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Store name, parent botanical nursery identity, and registered dispatch facility.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">
                      Store Brand Name
                    </label>
                    <input
                      type="text"
                      id="settings-business-name-input"
                      value={settingsForm.businessName}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, businessName: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="7Seasonsplants"
                      className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-2xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-semibold transition-colors"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">
                      Parent Nursery / Legal LLP
                    </label>
                    <input
                      type="text"
                      id="settings-parent-nursery-input"
                      value={settingsForm.parentNursery}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, parentNursery: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="7Seasons By Mannaratharayil Gardens LLP"
                      className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-2xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-semibold transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-emerald-950 block mb-1">
                      Dispatch Hub & Propagation Facility Address
                    </label>
                    <input
                      type="text"
                      id="settings-address-input"
                      value={settingsForm.address}
                      onChange={(e) => {
                        setSettingsForm((prev) => ({ ...prev, address: e.target.value }));
                        setIsSettingsDirty(true);
                      }}
                      placeholder="Mannaratharayil Gardens LLP, Calicut-Palakkad Highway, Kerala, India"
                      className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-2xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-medium transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: MENU VISIBILITY CONFIGURATION */}
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-700" />
                    Website Menu Visibility Configuration
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Toggle which navigation links and sections appear in the header and mobile drawer.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'home', label: 'Home Page' },
                    { id: 'plants', label: 'Plants Catalog' },
                    { id: 'combos', label: 'Plant Combos' },
                    { id: 'bestSellers', label: 'Best Sellers' },
                    { id: 'newArrivals', label: 'New Arrivals' },
                    { id: 'deals', label: 'Daily Deals' },
                    { id: 'plantCare', label: 'Plant Care / Doctor' },
                    { id: 'blog', label: 'Botanical Blog' },
                    { id: 'trackOrder', label: 'Track Order' },
                    { id: 'wishlist', label: 'Saved Wishlist' },
                    { id: 'cart', label: 'Shopping Cart' },
                  ].map((menu) => (
                    <label
                      key={menu.id}
                      className="flex items-center gap-2.5 cursor-pointer p-2.5 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors"
                    >
                      <input
                        type="checkbox"
                        id={`menu-visibility-${menu.id}`}
                        checked={settingsForm.menuVisibility?.[menu.id] !== false}
                        onChange={(e) => {
                          const newVis = { ...(settingsForm.menuVisibility || {}) };
                          newVis[menu.id] = e.target.checked;
                          setSettingsForm((prev) => ({ ...prev, menuVisibility: newVis }));
                          setIsSettingsDirty(true);
                        }}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                      />
                      <span className="text-xs font-semibold text-gray-800">{menu.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SECTION 6: RAZORPAY PAYMENT GATEWAY SETTINGS & LIVE TESTER */}
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-700" />
                        Razorpay Payment Gateway Integration
                      </h4>
                      {razorpayKeyId.startsWith('rzp_live_') ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                          Live Production Mode
                        </span>
                      ) : razorpayKeyId.startsWith('rzp_test_') ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Test / Sandbox Mode
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase bg-gray-100 text-gray-700 border border-gray-200">
                          Keys Required
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Accept live customer payments via UPI (GPay, PhonePe, Paytm), Credit & Debit Cards, Net Banking, and Wallets.
                    </p>
                  </div>

                  <a
                    href="https://dashboard.razorpay.com/#/app/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-bold bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 shrink-0"
                  >
                    <span>Razorpay Dashboard</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Live vs Test Mode Banner */}
                {razorpayKeyId.startsWith('rzp_live_') ? (
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
                    <span className="text-base leading-none">🟢</span>
                    <div className="space-y-0.5">
                      <p className="font-bold text-emerald-900">Live Production Mode Active</p>
                      <p className="text-[11px] text-emerald-800">
                        Checkout will process real transactions through your Razorpay merchant account. Customer payments will be credited directly to your registered bank account.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                    <span className="text-base leading-none">💡</span>
                    <div className="space-y-1">
                      <p className="font-bold text-amber-900">Switching to Live Production Mode:</p>
                      <ol className="text-[11px] text-amber-800 list-decimal list-inside space-y-0.5">
                        <li>Open the <strong>Razorpay Dashboard</strong> and ensure the top-left toggle is set to <strong>Live Mode</strong>.</li>
                        <li>Navigate to <strong>Account & Settings → API Keys → Generate Key</strong>.</li>
                        <li>Paste your <strong>Key ID</strong> (starts with <code className="font-mono font-bold bg-amber-100 px-1 rounded">rzp_live_...</code>) and <strong>Key Secret</strong> below.</li>
                        <li>Click <strong>Save & Update Keys</strong> to activate live checkout across the store.</li>
                      </ol>
                    </div>
                  </div>
                )}

                <div className="bg-emerald-950/5 border border-emerald-900/10 rounded-2xl p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-emerald-950 block mb-1 flex items-center justify-between">
                        <span>Razorpay Live Key ID</span>
                        {razorpayKeyId.startsWith('rzp_live_') && (
                          <span className="text-[10px] text-emerald-700 font-bold uppercase">Live Key</span>
                        )}
                      </label>
                      <input
                        type="text"
                        id="settings-razorpay-key-id"
                        value={razorpayKeyId}
                        onChange={(e) => setRazorpayKeyId(e.target.value)}
                        placeholder="rzp_live_..."
                        className="w-full px-3.5 py-2.5 bg-white text-gray-900 rounded-xl border border-gray-200 focus:border-emerald-600 outline-hidden font-mono text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-emerald-950 block mb-1">
                        Razorpay Live Key Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showRazorpaySecret ? 'text' : 'password'}
                          id="settings-razorpay-key-secret"
                          value={razorpayKeySecret}
                          onChange={(e) => setRazorpayKeySecret(e.target.value)}
                          placeholder="Paste Live Key Secret here"
                          className="w-full pl-3.5 pr-10 py-2.5 bg-white text-gray-900 rounded-xl border border-gray-200 focus:border-emerald-600 outline-hidden font-mono text-xs font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showRazorpaySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {razorpayStatus && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                        razorpayStatus.testing
                          ? 'bg-blue-50 border-blue-200 text-blue-800'
                          : razorpayStatus.valid
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <span className="text-sm">
                        {razorpayStatus.testing ? '⏳' : razorpayStatus.valid ? '✅' : '⚠️'}
                      </span>
                      <p className="font-medium">{razorpayStatus.message}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => testRazorpayConnection()}
                      disabled={razorpayStatus?.testing}
                      className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${razorpayStatus?.testing ? 'animate-spin' : ''}`} />
                      <span>Test Connection</span>
                    </button>

                    <button
                      type="button"
                      onClick={saveRazorpayCredentials}
                      disabled={savingRazorpay}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingRazorpay ? 'Saving...' : 'Save & Update Keys'}</span>
                    </button>

                    <span className="text-[11px] text-gray-500 ml-auto">
                      HMAC-SHA256 Server Signature Verification Active
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BAR: SAVE & RESET BUTTONS */}
              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  {isSettingsDirty ? (
                    <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      You have unsaved changes. Click Save to apply.
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      All settings are synchronized with the live website.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {isSettingsDirty && (
                    <button
                      type="button"
                      id="reset-nursery-settings-btn"
                      onClick={handleResetStoreSettings}
                      disabled={isSavingSettings}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>Discard</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    id="save-nursery-settings-btn"
                    disabled={isSavingSettings}
                    className="flex-1 sm:flex-initial px-7 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSavingSettings ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving Settings...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Store Settings</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* FULL SITE & DATABASE BACKUP */}
          <BackupManagementCard />
        </div>
        )}

        {/* COUPONS & DISCOUNTS MANAGEMENT TAB */}
        {activeTab === 'coupons' && (
          <CouponsManagementTab />
        )}

        {/* REVIEWS MODERATION TAB */}
        {activeTab === 'reviews' && (
          <ReviewsManagementTab />
        )}

        {/* DEDICATED BACKUP & RESTORE TAB */}
        {activeTab === 'backup-restore' && (
          <div className="space-y-6">
            <BackupManagementCard />
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-emerald-950">Category</label>
                    <button
                      type="button"
                      onClick={() => setIsComboCategoryModalOpen(true)}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold"
                    >
                      + Manage
                    </button>
                  </div>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 text-emerald-950 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-semibold"
                  >
                    {Array.from(
                      new Set([
                        ...categories.map((c) => c.name),
                        'Air Purifying',
                        'Indoor Plants',
                        'Flowering Plants',
                        'Bonsai',
                        'Succulents & Cacti',
                        'Trailing & Vines',
                        productForm.category,
                      ].filter(Boolean))
                    ).map((catName) => (
                      <option key={catName} value={catName}>
                        {catName}
                      </option>
                    ))}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-emerald-950 block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stock: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-emerald-950 block mb-1 flex items-center gap-1">
                    Total Weight (Kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={productForm.weight}
                    onChange={(e) =>
                      setProductForm({ ...productForm, weight: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>
              </div>

              {/* Auto-Compression Notice Banner for Product Creation */}
              <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                    <Zap className="w-4 h-4 fill-emerald-600/30 text-emerald-700" />
                  </div>
                  <div>
                    <span className="font-bold text-emerald-950 block">Real-Time Photo Compression Active</span>
                    <span className="text-[11px] text-emerald-800">
                      High-resolution photos (3–15 MB) are automatically compressed in real-time on upload to lightweight WebP/JPEG (~70–120 KB), saving 90%+ storage while preserving vibrant botanical details.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-black tracking-wider uppercase bg-emerald-200/80 text-emerald-900 px-2.5 py-1 rounded-full shrink-0">
                  Always Active
                </span>
              </div>

              <div>
                <ImageUploadPicker
                  images={productForm.images || []}
                  onChange={(imgs) => setProductForm({ ...productForm, images: imgs })}
                  maxImages={8}
                  namePrefix="product-plant"
                  label="Plant Photos (Automatically compressed on upload)"
                  helpText="Upload plant photos directly from your computer or phone. Files are auto-compressed on the fly to maximize store speed."
                  showCompressionNotice={true}
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

              {/* State-Based Plant Shipping Availability */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-900/10 space-y-2">
                <label className="font-bold text-emerald-950 text-xs flex items-center justify-between">
                  <span>Deliverable States for this Variety</span>
                  <span className="text-[11px] text-emerald-700 font-normal">Controls catalog display per customer state</span>
                </label>
                <div className="flex flex-wrap gap-3 pt-1">
                  {['Kerala', 'Tamil Nadu', 'Karnataka', 'All India'].map((stateName) => {
                    const currentStates = productForm.sellableStates || ['Kerala', 'Tamil Nadu', 'Karnataka', 'All India'];
                    const isChecked = currentStates.includes(stateName);
                    return (
                      <label
                        key={stateName}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition-colors ${
                          isChecked
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isChecked}
                          onChange={(e) => {
                            let updated: string[];
                            if (e.target.checked) {
                              updated = [...currentStates, stateName];
                            } else {
                              updated = currentStates.filter((s) => s !== stateName);
                            }
                            setProductForm({ ...productForm, sellableStates: updated });
                          }}
                        />
                        <span>{isChecked ? '✓' : '+'} {stateName}</span>
                      </label>
                    );
                  })}
                </div>
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

      {/* Combo Category Manager Modal */}
      <ComboCategoryManagerModal
        isOpen={isComboCategoryModalOpen}
        onClose={() => setIsComboCategoryModalOpen(false)}
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
                  <option value="India Post (Speed Post / Parcel)">India Post (Speed Post / Parcel)</option>
                  <option value="DTDC Express Courier">DTDC Express Courier</option>
                  <option value="ST Courier / Kerala Express">ST Courier (Kerala & Tamil Nadu Express)</option>
                  <option value="The Professional Couriers (TPC)">The Professional Couriers</option>
                  <option value="7Seasons Nursery Priority Dispatch">7Seasons Nursery Priority Dispatch</option>
                  <option value="Delhivery Express Plant Logistics">Delhivery Express Plant Logistics</option>
                  <option value="Blue Dart Safe Express">Blue Dart Safe Express</option>
                  <option value="7Seasons Direct Nursery Van (Local)">7Seasons Direct Nursery Van (Local)</option>
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
