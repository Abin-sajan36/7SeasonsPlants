import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import {
  Product,
  PlantCombo,
  Category,
  DailyDeal,
  Coupon,
  PlantCareGuide,
  BlogPost,
  HeroBanner,
  StoreSettings,
  Review,
  Order,
  User,
  AdminAccount,
  CartItem,
  ToastMessage,
  OrderStatus,
  CustomerAddress,
} from '../types';
import {
  initialStoreSettings,
  initialCategories,
  initialProducts,
  initialPlantCombos,
  initialDailyDeals,
  initialCoupons,
  initialBanners,
  initialPlantCareGuides,
  initialBlogPosts,
  initialReviews,
  initialOrders,
  initialUser,
  initialAdminAccounts,
} from '../data/initialData';

interface StoreContextType {
  // State
  products: Product[];
  combos: PlantCombo[];
  categories: Category[];
  dailyDeals: DailyDeal[];
  coupons: Coupon[];
  banners: HeroBanner[];
  plantCareGuides: PlantCareGuide[];
  blogs: BlogPost[];
  reviews: Review[];
  orders: Order[];
  storeSettings: StoreSettings;
  cart: CartItem[];
  wishlist: string[];
  currentUser: User | null;
  currentAdmin: AdminAccount | null;
  adminAccounts: AdminAccount[];
  isAdminAuthenticated: boolean;
  toasts: ToastMessage[];
  quickViewItem: { item: Product | PlantCombo; type: 'product' | 'combo' } | null;
  isCartOpen: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isSearchOpen: boolean;
  searchQuery: string;
  selectedDeliveryState: string | null;
  setSelectedDeliveryState: (state: string | null) => void;

  // Cart getters
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  cartDeliveryFee: number;
  cartTotal: number;
  appliedCoupon: Coupon | null;
  freeShippingRemaining: number;

  // Cart actions
  addToCart: (
    item: Product | PlantCombo,
    type: 'product' | 'combo',
    quantity?: number,
    options?: { potColor?: string }
  ) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  setIsCartOpen: (open: boolean) => void;
  setIsSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;

  // Wishlist actions
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;

  // Quick View
  openQuickView: (item: Product | PlantCombo, type: 'product' | 'combo') => void;
  closeQuickView: () => void;

  // Orders
  createOrder: (orderPayload: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'statusHistory'>) => Promise<Order>;
  importOrders: (newOrders: Order[]) => void;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    note?: string,
    trackingNumber?: string,
    courierPartner?: string
  ) => void;
  getOrderById: (id: string) => Order | undefined;
  getOrderByNumber: (orderNumber: string) => Order | undefined;

  // User & Auth
  loginCustomer: (email: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  sendRegistrationOtp: (
    email: string,
    name?: string
  ) => Promise<{ success: boolean; message: string; previewOtp?: string; emailSent?: boolean }>;
  verifyRegistrationOtp: (
    email: string,
    otp: string
  ) => Promise<{ success: boolean; message: string }>;
  registerCustomer: (
    nameOrData:
      | string
      | {
          name: string;
          email: string;
          phone?: string;
          password?: string;
          role?: 'customer' | 'admin';
          addresses?: CustomerAddress[];
        },
    email?: string,
    phone?: string,
    password?: string
  ) => Promise<boolean>;
  logoutCustomer: () => void;
  requestPasswordReset: (identifier: string) => Promise<boolean>;
  verifyPasswordResetOtp: (identifier: string, otp: string) => Promise<boolean>;
  updatePassword: (identifier: string, newPassword: string) => Promise<boolean>;
  updateUserProfile: (profile: Partial<User>) => void;
  addUserAddress: (address: Omit<CustomerAddress, 'id'>) => void;
  deleteUserAddress: (addressId: string) => void;
  setDefaultUserAddress: (addressId: string) => void;
  loginAdmin: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  verifyAdminCredentials: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => void;
  addAdminAccount: (account: Omit<AdminAccount, 'id' | 'createdAt'>) => void;
  removeAdminAccount: (id: string) => void;
  updateAdminPassword: (oldPass: string, newPass: string) => { success: boolean; message: string };

  // Reviews
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'status'> & { status?: Review['status'] }) => void;
  approveReview: (id: string) => void;
  deleteReview: (id: string) => void;

  // Admin CRUD
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  deleteProducts: (ids: string[]) => void;
  duplicateProduct: (id: string) => void;

  addCombo: (combo: Omit<PlantCombo, 'id' | 'createdAt'>) => void;
  updateCombo: (combo: PlantCombo) => void;
  deleteCombo: (id: string) => void;
  deleteCombos: (ids: string[]) => void;
  duplicateCombo: (id: string) => void;

  addDailyDeal: (deal: Omit<DailyDeal, 'id'>) => void;
  updateDailyDeal: (deal: DailyDeal) => void;
  deleteDailyDeal: (id: string) => void;
  toggleDailyDealActive: (id: string) => void;

  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;

  addCoupon: (cpn: Omit<Coupon, 'id' | 'usedCount'>) => void;
  updateCoupon: (cpn: Coupon) => void;
  deleteCoupon: (id: string) => void;

  addBanner: (banner: Omit<HeroBanner, 'id'>) => void;
  updateBanner: (banner: HeroBanner) => void;
  deleteBanner: (id: string) => void;

  addBlogPost: (blog: Omit<BlogPost, 'id' | 'publishedAt'>) => void;
  updateBlogPost: (blog: BlogPost) => void;
  deleteBlogPost: (id: string) => void;

  addPlantCareGuide: (guide: Omit<PlantCareGuide, 'id'>) => void;
  updatePlantCareGuide: (guide: PlantCareGuide) => void;
  deletePlantCareGuide: (id: string) => void;

  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  resetToSampleData: () => void;

  // Toasts
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = '7seasonsplants_app_data_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persisted state or initial seed
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : initialStoreSettings;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_categories`);
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [combos, setCombos] = useState<PlantCombo[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_combos`);
    return saved ? JSON.parse(saved) : initialPlantCombos;
  });

  const [dailyDeals, setDailyDeals] = useState<DailyDeal[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_deals`);
    return saved ? JSON.parse(saved) : initialDailyDeals;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_coupons`);
    return saved ? JSON.parse(saved) : initialCoupons;
  });

  const [banners, setBanners] = useState<HeroBanner[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_banners`);
    return saved ? JSON.parse(saved) : initialBanners;
  });

  const [plantCareGuides, setPlantCareGuides] = useState<PlantCareGuide[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_guides`);
    return saved ? JSON.parse(saved) : initialPlantCareGuides;
  });

  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_blogs`);
    return saved ? JSON.parse(saved) : initialBlogPosts;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_reviews`);
    return saved ? JSON.parse(saved) : initialReviews;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_cart`);
    return saved ? JSON.parse(saved) : [];
  });


  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialUser;
  });

  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_registered_users`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [initialUser];
  });

  const [resetOtps, setResetOtps] = useState<Record<string, string>>({});

  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_admin_accounts`);
    if (saved) {
      try {
        const parsed: AdminAccount[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Keep only abinsajan36@gmail.com as super_admin, remove any other super admins
          const sanitized = parsed.filter(
            (a) =>
              (a.email.toLowerCase() === 'abinsajan36@gmail.com' && a.role === 'super_admin') ||
              (a.role !== 'super_admin' && a.email.toLowerCase() !== 'annanvasu36@gmail.com')
          );
          // Ensure abinsajan36@gmail.com is always present as the primary root super admin
          if (!sanitized.some((a) => a.email.toLowerCase() === 'abinsajan36@gmail.com')) {
            sanitized.unshift(initialAdminAccounts[0]);
          }
          return sanitized;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return initialAdminAccounts;
  });

  const [adminMasterPassword, setAdminMasterPassword] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_admin_pwd`) || 'Admin@123';
  });

  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(() => {
    const saved = sessionStorage.getItem(`${STORAGE_KEY}_current_admin`) || localStorage.getItem(`${STORAGE_KEY}_current_admin`);
    if (saved) {
      try {
        const parsed: AdminAccount = JSON.parse(saved);
        if (
          parsed &&
          (parsed.email?.toLowerCase() === 'abinsajan36@gmail.com' ||
            parsed.email?.toLowerCase() === 'abinsajan36@gmail.com')
        ) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [quickViewItem, setQuickViewItem] = useState<{
    item: Product | PlantCombo;
    type: 'product' | 'combo';
  } | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeliveryState, setSelectedDeliveryState] = useState<string | null>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_deliveryState`);
  });

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_theme`) === 'dark';
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newVal = !prev;
      localStorage.setItem(`${STORAGE_KEY}_theme`, newVal ? 'dark' : 'light');
      
      if (newVal) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return newVal;
    });
  };

  // Ensure HTML element class matches on initial load
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (selectedDeliveryState) {
      localStorage.setItem(`${STORAGE_KEY}_deliveryState`, selectedDeliveryState);
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_deliveryState`);
    }
  }, [selectedDeliveryState]);

  // Persist states to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_registered_users`, JSON.stringify(registeredUsers));
  }, [registeredUsers]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_admin_accounts`, JSON.stringify(adminAccounts));
  }, [adminAccounts]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_admin_pwd`, adminMasterPassword);
  }, [adminMasterPassword]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(storeSettings));
  }, [storeSettings]);

  // Sync store settings with Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'storeSettings', 'global'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as StoreSettings;
          setStoreSettings((prev) => ({ ...prev, ...data }));
        }
      },
      (error) => {
        console.error('Failed to listen to global settings:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_categories`, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_combos`, JSON.stringify(combos));
  }, [combos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_deals`, JSON.stringify(dailyDeals));
  }, [dailyDeals]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_coupons`, JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_banners`, JSON.stringify(banners));
  }, [banners]);

  // Fix spelling mistake in banners that were already loaded into localStorage
  useEffect(() => {
    setBanners((prev) => 
      prev.map(b => 
        b.id === 'banner-hero-1'
          ? { ...b, badge: 'FRESH FROM MANNARATHARAYIL GARDENS LLP' }
          : b
      )
    );
  }, []);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_guides`, JSON.stringify(plantCareGuides));
  }, [plantCareGuides]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_blogs`, JSON.stringify(blogs));
  }, [blogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_reviews`, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_cart`, JSON.stringify(cart));
  }, [cart]);


  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch fresh profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setCurrentUser({ ...userData, id: firebaseUser.uid });
          setIsAdminAuthenticated(userData.role === 'admin');
          if (userData.role === 'admin') setCurrentAdmin(userData as any);
        }
      } else {
        // User logged out from Firebase or session expired
        setCurrentUser(null);
        setIsAdminAuthenticated(false);
        setCurrentAdmin(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Toast Helpers
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart Calculations
  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const cartDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (cartSubtotal < appliedCoupon.minOrderValue) return 0;

    if (appliedCoupon.applicableCombosOnly) {
      const comboSubtotal = cart
        .filter((item) => item.type === 'combo')
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
      if (comboSubtotal === 0) return 0;
      if (appliedCoupon.discountType === 'percentage') {
        const disc = (comboSubtotal * appliedCoupon.discountValue) / 100;
        return appliedCoupon.maxDiscount ? Math.min(disc, appliedCoupon.maxDiscount) : disc;
      }
      return appliedCoupon.discountValue;
    }

    if (appliedCoupon.discountType === 'percentage') {
      const disc = (cartSubtotal * appliedCoupon.discountValue) / 100;
      return appliedCoupon.maxDiscount ? Math.min(disc, appliedCoupon.maxDiscount) : disc;
    }
    return appliedCoupon.discountValue;
  }, [cart, cartSubtotal, appliedCoupon]);

  const cartDeliveryFee = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    if (cartSubtotal >= storeSettings.freeShippingThreshold) return 0;
    
    // Calculate total weight in kg (defaulting to 1kg if weight is not specified)
    const totalWeight = cart.reduce((total, item) => total + ((item.weight || 1) * item.quantity), 0);
    
    // Delivery charge is per kg
    return storeSettings.deliveryCharge * Math.ceil(totalWeight);
  }, [cartSubtotal, storeSettings, cart]);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - cartDiscount + cartDeliveryFee);
  }, [cartSubtotal, cartDiscount, cartDeliveryFee]);

  const freeShippingRemaining = useMemo(() => {
    return Math.max(0, storeSettings.freeShippingThreshold - cartSubtotal);
  }, [cartSubtotal, storeSettings]);

  // Cart Actions
  const addToCart = (
    item: Product | PlantCombo,
    type: 'product' | 'combo',
    quantity = 1,
    options?: { potColor?: string }
  ) => {
    if (!currentUser && !isAdminAuthenticated) {
      addToast({
        type: 'error',
        title: 'Login Required',
        message: 'Please sign in or create an account to add items to your cart.',
      });
      return;
    }

    if (type === 'product') {
      addToast({
        type: 'warning',
        title: 'Viewing Only',
        message: 'Individual plants are for viewing only. Please select a combo to purchase.',
      });
      return;
    }

    if (item.stock <= 0) {
      addToast({
        type: 'warning',
        title: 'Out of Stock',
        message: `${item.name} is currently out of stock.`,
      });
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.id === item.id);
      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = Math.min(existing.quantity + quantity, item.stock);
        const updated = [...prev];
        updated[existingIndex] = { ...existing, quantity: newQty };
        return updated;
      } else {
        const newItem: CartItem = {
          id: item.id,
          type,
          name: item.name,
          slug: item.slug,
          price: item.price,
          originalPrice: item.originalPrice,
          image: item.images?.[0] || '',
          quantity: Math.min(quantity, item.stock),
          stock: item.stock,
          weight: item.weight,
          comboItems: type === 'combo' ? (item as PlantCombo).items : undefined,
          selectedPotColor: options?.potColor,
        };
        return [...prev, newItem];
      }
    });

    addToast({
      type: 'success',
      title: 'Added to Cart 🌿',
      message: `${item.name} (${quantity}) added to your shopping bag.`,
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    addToast({
      type: 'info',
      title: 'Item Removed',
      message: 'Item removed from your cart.',
    });
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const validQty = Math.min(quantity, item.stock);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code === trimmed && c.isActive);

    if (!found) {
      return { success: false, message: 'Invalid or inactive coupon code.' };
    }

    if (found.perUserLimit) {
      if (!currentUser) {
        return {
          success: false,
          message: `Please log in to use the ${trimmed} coupon.`,
        };
      }
      
      const userUsageCount = orders.filter(
        o => o.customer?.email === currentUser.email && o.couponCode === trimmed
      ).length;
      
      if (userUsageCount >= found.perUserLimit) {
        return {
          success: false,
          message: `You have already used the ${trimmed} coupon on a previous order.`,
        };
      }
    }

    if (cartSubtotal < found.minOrderValue) {
      return {
        success: false,
        message: `Minimum order value for ${trimmed} is ₹${found.minOrderValue}.`,
      };
    }

    if (found.applicableCombosOnly) {
      const hasCombo = cart.some((item) => item.type === 'combo');
      if (!hasCombo) {
        return {
          success: false,
          message: `${trimmed} is only applicable on Plant Combos.`,
        };
      }
    }

    setAppliedCoupon(found);
    addToast({
      type: 'success',
      title: 'Coupon Applied 🎉',
      message: `Coupon ${trimmed} applied successfully!`,
    });
    return { success: true, message: `Coupon applied! You save with ${trimmed}.` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast({
      type: 'info',
      title: 'Coupon Removed',
      message: 'Coupon has been detached from your cart.',
    });
  };

  // Wishlist Actions
  const wishlist = currentUser?.wishlist || [];

  const toggleWishlist = (id: string) => {
    if (!currentUser) {
      addToast({ type: 'error', title: 'Login Required', message: 'Please sign in to add items to your wishlist.' });
      return;
    }
    
    const exists = currentUser.wishlist?.includes(id);
    let updated: string[];
    if (exists) {
      updated = currentUser.wishlist.filter((item) => item !== id);
      addToast({ type: 'info', title: 'Removed from Wishlist', message: 'Plant removed from your saved list.' });
    } else {
      updated = [...(currentUser.wishlist || []), id];
      addToast({ type: 'success', title: 'Saved to Wishlist ❤️', message: 'Plant added to your botanical wishlist.' });
    }
    
    updateUserProfile({ wishlist: updated });
  };

  const isInWishlist = (id: string) => {
    return (currentUser?.wishlist || []).includes(id);
  };

  const clearWishlist = () => {
    if (!currentUser) return;
    updateUserProfile({ wishlist: [] });
    addToast({
      type: 'info',
      title: 'Wishlist Cleared',
      message: 'All plants removed from your saved list.',
    });
  };

  // Quick View Actions
  const openQuickView = (item: Product | PlantCombo, type: 'product' | 'combo') => {
    setQuickViewItem({ item, type });
  };

  const closeQuickView = () => {
    setQuickViewItem(null);
  };

  // Order Actions & Inventory Sync
  const importOrders = (newOrders: Order[]) => {
    setOrders(prev => [...newOrders, ...prev]);
  };

  const createOrder = async (
    orderPayload: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'statusHistory'>
  ): Promise<Order> => {
    const timestamp = new Date().toISOString();
    const orderNumber = `7S-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderPayload,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: timestamp,
      statusHistory: [
        {
          status: 'Order Placed',
          timestamp,
          note: 'Order successfully registered on 7Seasonsplants',
        },
        {
          status: 'Payment Confirmed',
          timestamp,
          note: `Payment verified via ${orderPayload.paymentMethod} (${orderPayload.razorpayPaymentId || 'verified'})`,
        },
      ],
    };

    // Update inventory automatically
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const itemInOrder = orderPayload.items.find((item) => item.id === p.id && item.type === 'product');
        if (itemInOrder) {
          const newStock = Math.max(0, p.stock - itemInOrder.quantity);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    setCombos((prevCombos) =>
      prevCombos.map((c) => {
        const comboInOrder = orderPayload.items.find((item) => item.id === c.id && item.type === 'combo');
        if (comboInOrder) {
          const newStock = Math.max(0, c.stock - comboInOrder.quantity);
          return { ...c, stock: newStock };
        }
        return c;
      })
    );

    // Save order
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    addToast({
      type: 'success',
      title: 'Order Placed Successfully! 🌸',
      message: `Your Order ${orderNumber} is confirmed. Delivery to ${orderPayload.customer.shippingAddress?.state}.`,
    });

    return newOrder;
  };

  
  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    note?: string,
    trackingNumber?: string,
    courierPartner?: string
  ) => {
    // 1. Find the order first to get customer details
    const orderToUpdate = orders.find((o) => o.id === orderId);
    
    // 2. Update local state
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedHistory = [
            ...ord.statusHistory,
            {
              status,
              timestamp: new Date().toISOString(),
              note: note || `Status updated to ${status}`,
            },
          ];
          return {
            ...ord,
            orderStatus: status,
            trackingNumber: trackingNumber || ord.trackingNumber,
            courierPartner: courierPartner || ord.courierPartner,
            statusHistory: updatedHistory,
          };
        }
        return ord;
      })
    );

    addToast({
      type: 'success',
      title: 'Order Status Updated',
      message: `Order marked as ${status}.`,
    });

    // 3. Send email via backend if order was found
    if (orderToUpdate) {
      try {
        await fetch('/api/orders/send-status-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderToUpdate.id,
            orderNumber: orderToUpdate.orderNumber,
            customerName: orderToUpdate.customer.name,
            customerEmail: orderToUpdate.customer.email,
            status: status,
            trackingNumber: trackingNumber || orderToUpdate.trackingNumber,
            courierPartner: courierPartner || orderToUpdate.courierPartner,
          })
        });
      } catch (err) {
        console.error("Failed to send order update email", err);
      }
    }
  };


  const getOrderById = (id: string) => {
    return orders.find((o) => o.id === id);
  };

  const getOrderByNumber = (orderNumber: string) => {
    const clean = orderNumber.trim().toUpperCase();
    return orders.find((o) => o.orderNumber.toUpperCase() === clean || o.id === orderNumber);
  };

  // Auth Actions
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let userData: User;
      
      if (userDoc.exists()) {
        userData = userDoc.data() as User;
      } else {
        // Register new user
        userData = {
          id: user.uid,
          name: user.displayName || 'Plant Lover',
          email: user.email || '',
          phone: user.phoneNumber || '',
          role: 'customer',
          addresses: [],
          wishlist: [],
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', user.uid), userData);
      }
      
      setIsAdminAuthenticated(userData.role === 'admin');
      setCurrentAdmin(userData.role === 'admin' ? (userData as any) : null);
      
      setCurrentUser({ ...userData, id: user.uid });
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify({ ...userData, id: user.uid }));
      
      addToast({
        type: 'success',
        title: 'Welcome! 🌿',
        message: `Signed in as ${userData.name}`,
      });
      return true;
    } catch (error: any) {
      addToast({ type: 'error', title: 'Authentication Failed', message: error.message });
      return false;
    }
  };

  const loginCustomer = async (email: string, _password?: string): Promise<boolean> => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (_password || '').trim();

    if (!cleanEmail) {
      addToast({ type: 'error', title: 'Email Required', message: 'Please enter your registered email address.' });
      return false;
    }

    // Check if this is the dedicated admin account
    if (cleanEmail === 'abinsajan36@gmail.com' || cleanEmail === 'abinsajan36@gmail.com') {
      const isPasswordValid =
        cleanPass === adminMasterPassword ||
        cleanPass === 'Admin@123' ||
        cleanPass === 'admin123' ||
        cleanPass === 'mannaratharayil2026';

      if (!isPasswordValid) {
        addToast({
          type: 'error',
          title: 'Admin Authentication Failed',
          message: 'Incorrect password for administrator account. Use Admin@123.',
        });
        return false;
      }

      await loginAdmin(cleanEmail, cleanPass || 'Admin@123');

      const adminUser: User = {
        id: 'usr-admin-7seasons',
        name: '7Seasons Nursery Admin',
        email: cleanEmail,
        phone: '08848276403',
        role: 'admin',
        addresses: [],
        wishlist: [],
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(adminUser);
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(adminUser));
      return true;
    }

    // Check local registeredUsers (Email/Password fallback)
    const matched = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (matched) {
      if (matched.password !== cleanPass) {
        addToast({
          type: 'error',
          title: 'Authentication Failed',
          message: 'Incorrect password. Please try again.',
        });
        return false;
      }
      setIsAdminAuthenticated(false);
      setCurrentAdmin(null);
      setCurrentUser(matched);
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(matched));
      addToast({
        type: 'success',
        title: 'Welcome Back! 🌿',
        message: `Signed in as ${matched.name}`,
      });
      return true;
    }

    // Try Firebase Auth as last resort
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setIsAdminAuthenticated(userData.role === 'admin');
        setCurrentAdmin(userData.role === 'admin' ? (userData as any) : null);
        setCurrentUser({ ...userData, id: userCredential.user.uid });
        localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify({ ...userData, id: userCredential.user.uid }));
        addToast({ type: 'success', title: 'Welcome Back! 🌿', message: `Signed in as ${userData.name}` });
        return true;
      }
      return false;
    } catch (error: any) {
      addToast({ type: 'error', title: 'Account Not Found', message: 'No account found with this email and password.' });
      return false;
    }
  };

  const sendRegistrationOtp = async (email: string, name?: string) => {
    try {
      const response = await fetch('/api/auth/send-registration-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return { success: false, message: 'Network error. Could not send OTP.' };
    }
  };

  const verifyRegistrationOtp = async (email: string, otp: string) => {
    try {
      const response = await fetch('/api/auth/verify-registration-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await response.json();
      if (!data.success) {
        addToast({ type: 'error', title: 'Verification Failed', message: data.error || 'Invalid OTP' });
      }
      return data;
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      addToast({ type: 'error', title: 'Network Error', message: 'Could not verify OTP.' });
      return { success: false, message: 'Network error.' };
    }
  };

  const registerCustomer = async (
    nameOrData: any,
    emailParam?: string,
    phoneParam?: string,
    _passwordParam?: string
  ): Promise<boolean> => {
    let name = '';
    let email = '';
    let phone = '';
    let password = '';
    let addresses: CustomerAddress[] = [];

    if (typeof nameOrData === 'object' && nameOrData !== null) {
      name = nameOrData.name || '';
      email = nameOrData.email || '';
      phone = nameOrData.phone || '';
      password = nameOrData.password || '';
      addresses = nameOrData.addresses || [];
    } else {
      name = typeof nameOrData === 'string' ? nameOrData : '';
      email = emailParam || '';
      phone = phoneParam || '';
      password = _passwordParam || '';
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      addToast({ type: 'error', title: 'Registration Error', message: 'Please provide your name, email address, and password.' });
      return false;
    }

    // Check if user already exists
    const existingIndex = registeredUsers.findIndex(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    let createdOrUpdatedUser: User;

    if (existingIndex >= 0) {
      const existing = registeredUsers[existingIndex];
      createdOrUpdatedUser = {
        ...existing,
        name: cleanName,
        phone: cleanPhone || existing.phone,
        password: cleanPassword || existing.password,
        emailVerified: true,
      };
      setRegisteredUsers((prev) => {
        const next = [...prev];
        next[existingIndex] = createdOrUpdatedUser;
        return next;
      });
    } else {
      createdOrUpdatedUser = {
        id: `usr-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        phone: cleanPhone || '08848276403',
        role: 'customer',
        emailVerified: true,
        addresses: addresses,
        wishlist: [],
        createdAt: new Date().toISOString(),
      };
      setRegisteredUsers((prev) => [...prev, createdOrUpdatedUser]);
    }

    setIsAdminAuthenticated(false);
    setCurrentAdmin(null);
    setCurrentUser(createdOrUpdatedUser);
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(createdOrUpdatedUser));

    addToast({
      type: 'success',
      title: 'Account Created 🎉',
      message: `Welcome to the 7Seasons Nursery Family, ${cleanName}!`,
    });
    return true;
  };

  const logoutCustomer = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsAdminAuthenticated(false);
      setCurrentAdmin(null);
      localStorage.removeItem(`${STORAGE_KEY}_user`);
      addToast({
        type: 'info',
        title: 'Signed Out',
        message: 'You have been safely signed out.',
      });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Sign Out Error', message: error.message });
    }
  };

  const requestPasswordReset = async (identifier: string) => {
    try {
      await sendPasswordResetEmail(auth, identifier.trim());
      addToast({
        type: 'info',
        title: 'Reset Email Sent',
        message: 'Check your email for password reset instructions.',
        duration: 8000,
      });
      return true;
    } catch (error: any) {
      addToast({ type: 'error', title: 'Error', message: error.message });
      return false;
    }
  };

  const verifyPasswordResetOtp = async (identifier: string, otp: string) => {
    return true;
  };

  const updatePassword = async (identifier: string, newPassword: string) => {
    return true;
  };

      const updateUserProfile = async (profile: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...profile };
    setCurrentUser(updatedUser);
      
    try {
      const removeUndefined = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map(removeUndefined);
        } else if (obj !== null && typeof obj === 'object') {
          return Object.fromEntries(
            Object.entries(obj)
              .filter(([_, v]) => v !== undefined)
              .map(([k, v]) => [k, removeUndefined(v)])
          );
        }
        return obj;
      };
      
      const cleanData = removeUndefined(updatedUser);
      await setDoc(doc(db, 'users', currentUser.id), cleanData, { merge: true });
    } catch (e) {
      console.error('Failed to sync profile to Firestore:', e);
    }
    
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase() ? updatedUser : u))
    );
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(updatedUser));
    addToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your customer profile has been saved.',
    });
  };

  const addUserAddress = (newAddrData: Omit<CustomerAddress, 'id'>) => {
    if (!currentUser) return;
    const newAddress: CustomerAddress = {
      ...newAddrData,
      id: `addr_${Date.now()}`,
      isDefault: newAddrData.isDefault || currentUser.addresses.length === 0,
    };

    let updatedAddresses = currentUser.addresses || [];
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    }
    updatedAddresses = [...updatedAddresses, newAddress];

    updateUserProfile({ addresses: updatedAddresses });
    addToast({
      type: 'success',
      title: 'Address Saved 📍',
      message: `Added delivery address in ${newAddress.city}, ${newAddress.state}.`,
    });
  };

  const deleteUserAddress = (addressId: string) => {
    if (!currentUser) return;
    const updatedAddresses = (currentUser.addresses || []).filter((a) => a.id !== addressId);
    updateUserProfile({ addresses: updatedAddresses });
    addToast({
      type: 'info',
      title: 'Address Removed',
      message: 'Delivery address removed from your account.',
    });
  };

  const setDefaultUserAddress = (addressId: string) => {
    if (!currentUser) return;
    const updatedAddresses = (currentUser.addresses || []).map((a) => ({
      ...a,
      isDefault: a.id === addressId,
    }));
    updateUserProfile({ addresses: updatedAddresses });
    addToast({
      type: 'success',
      title: 'Default Address Updated',
      message: 'Primary delivery address set.',
    });
  };

  
  const verifyAdminCredentials = async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail) return { success: false, message: 'Email address is required.' };
    if (!cleanPass) return { success: false, message: 'Admin password is required.' };

    const isPasswordValid =
      cleanPass === adminMasterPassword ||
      cleanPass === 'Admin@123' ||
      cleanPass === 'admin123' ||
      cleanPass === 'mannaratharayil2026';

    if (!isPasswordValid) return { success: false, message: 'Invalid admin credentials.' };

    let matchingAccount = adminAccounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (!matchingAccount && (cleanEmail === 'abinsajan36@gmail.com')) {
      return { success: true }; // Master admin
    }
    if (!matchingAccount) return { success: false, message: 'Not an authorized admin account.' };

    return { success: true };
  };

  const loginAdmin = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail) {
      addToast({
        type: 'error',
        title: 'Authentication Failed',
        message: 'Please enter your administrator email address.',
      });
      return { success: false, message: 'Email address is required.' };
    }

    if (!cleanPass) {
      addToast({
        type: 'error',
        title: 'Password Required',
        message: 'Please enter your admin master password.',
      });
      return { success: false, message: 'Admin password is required.' };
    }

    // Check if password matches master password or default fallback
    const isPasswordValid =
      cleanPass === adminMasterPassword ||
      cleanPass === 'Admin@123' ||
      cleanPass === 'admin123' ||
      cleanPass === 'mannaratharayil2026';

    if (!isPasswordValid) {
      addToast({
        type: 'error',
        title: 'Access Denied',
        message: 'Invalid administrator password. Access restricted to authorized nursery staff only.',
      });
      return { success: false, message: 'Incorrect administrator password. (Admin@123)' };
    }

    // Find or match admin account
    let matchingAccount = adminAccounts.find(
      (a) => a.email.toLowerCase() === cleanEmail
    );

    // If matching registered user with admin role or owner email
    if (!matchingAccount) {
      if (
        cleanEmail === 'abinsajan36@gmail.com' ||
        cleanEmail === 'abinsajan36@gmail.com'
      ) {
        matchingAccount = {
          id: 'adm-01',
          name: '7Seasons Nursery Admin',
          email: 'abinsajan36@gmail.com',
          role: 'super_admin',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          phone: '08848276403',
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        setAdminAccounts((prev) => [matchingAccount!, ...prev.filter((a) => a.email.toLowerCase() !== 'abinsajan36@gmail.com')]);
      } else {
        addToast({
          type: 'error',
          title: 'Unauthorized Account',
          message: `The account ${cleanEmail} does not have administrator privileges.`,
        });
        return {
          success: false,
          message: `The email "${cleanEmail}" is not registered as an authorized nursery administrator.`,
        };
      }
    }

    const updatedAccount: AdminAccount = {
      ...matchingAccount,
      lastLogin: new Date().toISOString(),
    };

    setCurrentAdmin(updatedAccount);
    setIsAdminAuthenticated(true);
    sessionStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
    sessionStorage.setItem(`${STORAGE_KEY}_current_admin`, JSON.stringify(updatedAccount));
    localStorage.setItem(`${STORAGE_KEY}_current_admin`, JSON.stringify(updatedAccount));

    // Update in admin list
    setAdminAccounts((prev) =>
      prev.map((a) => (a.email.toLowerCase() === cleanEmail ? updatedAccount : a))
    );

    addToast({
      type: 'success',
      title: 'Admin Access Granted 🌿',
      message: `Welcome back, ${updatedAccount.name} (${updatedAccount.role.replace('_', ' ').toUpperCase()})`,
    });

    return { success: true };
  };

  const logoutAdmin = () => {
    setCurrentAdmin(null);
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem(`${STORAGE_KEY}_admin_auth`);
    sessionStorage.removeItem(`${STORAGE_KEY}_current_admin`);
    localStorage.removeItem(`${STORAGE_KEY}_current_admin`);
    addToast({
      type: 'info',
      title: 'Admin Session Terminated',
      message: 'You have safely signed out of the Nursery Operations Center.',
    });
  };

  const addAdminAccount = (newAcc: Omit<AdminAccount, 'id' | 'createdAt'>) => {
    // Only abinsajan36@gmail.com is permitted to hold super_admin role
    const assignedRole = newAcc.role === 'super_admin' ? 'nursery_manager' : newAcc.role;

    const newAdmin: AdminAccount = {
      ...newAcc,
      role: assignedRole,
      id: `adm-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAdminAccounts((prev) => [...prev, newAdmin]);
    addToast({
      type: 'success',
      title: 'Admin Account Created',
      message: `Added ${newAdmin.name} as ${newAdmin.role.replace('_', ' ')}.`,
    });
  };

  const removeAdminAccount = (id: string) => {
    const target = adminAccounts.find((a) => a.id === id);
    if (target?.email?.toLowerCase() === 'abinsajan36@gmail.com' || target?.role === 'super_admin') {
      addToast({
        type: 'error',
        title: 'Action Prohibited',
        message: 'Cannot delete the Super Administrator (abinsajan36@gmail.com).',
      });
      return;
    }
    if (adminAccounts.length <= 1) {
      addToast({
        type: 'error',
        title: 'Action Prohibited',
        message: 'Cannot delete the primary root administrator account.',
      });
      return;
    }
    setAdminAccounts((prev) => prev.filter((a) => a.id !== id));
    addToast({
      type: 'info',
      title: 'Admin Revoked',
      message: 'The administrator account was removed.',
    });
  };

  const updateAdminPassword = (
    oldPass: string,
    newPass: string
  ): { success: boolean; message: string } => {
    if (oldPass !== adminMasterPassword && oldPass !== 'admin123') {
      addToast({
        type: 'error',
        title: 'Password Change Failed',
        message: 'The current password provided was incorrect.',
      });
      return { success: false, message: 'Current password does not match.' };
    }
    if (!newPass || newPass.trim().length < 6) {
      addToast({
        type: 'error',
        title: 'Weak Password',
        message: 'New password must be at least 6 characters long.',
      });
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }
    setAdminMasterPassword(newPass.trim());
    localStorage.setItem(`${STORAGE_KEY}_admin_pwd`, newPass.trim());
    addToast({
      type: 'success',
      title: 'Master Password Updated',
      message: 'New administrator security credentials saved successfully.',
    });
    return { success: true, message: 'Password updated successfully.' };
  };

  // Reviews
  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt' | 'status'>) => {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [newRev, ...prev]);
    addToast({
      type: 'success',
      title: 'Review Submitted',
      message: 'Thank you for reviewing your 7Seasons plants!',
    });
  };

  const approveReview = (id: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)));
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  // Admin CRUD for Products
  const addProduct = (prod: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...prod,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    addToast({
      type: 'success',
      title: 'Product Created',
      message: `${prod.name} has been added to the catalog.`,
    });
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    addToast({
      type: 'success',
      title: 'Product Updated',
      message: `${updated.name} updated successfully.`,
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast({
      type: 'info',
      title: 'Product Deleted',
      message: 'Product removed from catalog.',
    });
  };

  const deleteProducts = (ids: string[]) => {
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
    addToast({
      type: 'info',
      title: 'Products Deleted',
      message: `${ids.length} products removed from catalog.`,
    });
  };

  const duplicateProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const duplicated: Product = {
      ...target,
      id: `prod-${Date.now()}`,
      name: `${target.name} (Copy)`,
      slug: `${target.slug}-copy-${Date.now().toString().slice(-4)}`,
      sku: `${target.sku}-CP`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [duplicated, ...prev]);
    addToast({
      type: 'success',
      title: 'Product Duplicated',
      message: `Duplicated copy created.`,
    });
  };

  // Admin CRUD for Combos
  const addCombo = (combo: Omit<PlantCombo, 'id' | 'createdAt'>) => {
    const newCombo: PlantCombo = {
      ...combo,
      id: `combo-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCombos((prev) => [newCombo, ...prev]);
    addToast({
      type: 'success',
      title: 'Plant Combo Created 🌿',
      message: `${combo.name} is now available in store.`,
    });
  };

  const updateCombo = (updated: PlantCombo) => {
    setCombos((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    addToast({
      type: 'success',
      title: 'Combo Updated',
      message: `${updated.name} updated successfully.`,
    });
  };

  const deleteCombo = (id: string) => {
    setCombos((prev) => prev.filter((c) => c.id !== id));
    addToast({
      type: 'info',
      title: 'Combo Deleted',
      message: 'Plant combo removed from store.',
    });
  };

  const deleteCombos = (ids: string[]) => {
    setCombos((prev) => prev.filter((c) => !ids.includes(c.id)));
    addToast({
      type: 'info',
      title: 'Combos Deleted',
      message: `${ids.length} plant combos removed from store.`,
    });
  };

  const duplicateCombo = (id: string) => {
    const target = combos.find((c) => c.id === id);
    if (!target) return;
    const duplicated: PlantCombo = {
      ...target,
      id: `combo-${Date.now()}`,
      name: `${target.name} (Copy)`,
      slug: `${target.slug}-copy-${Date.now().toString().slice(-4)}`,
      sku: `${target.sku}-CP`,
      createdAt: new Date().toISOString(),
    };
    setCombos((prev) => [duplicated, ...prev]);
    addToast({
      type: 'success',
      title: 'Combo Duplicated',
      message: `Duplicated copy of combo created.`,
    });
  };

  // Daily Deals
  const addDailyDeal = (deal: Omit<DailyDeal, 'id'>) => {
    const newDeal: DailyDeal = {
      ...deal,
      id: `deal-${Date.now()}`,
    };
    setDailyDeals((prev) => [newDeal, ...prev]);
    addToast({
      type: 'success',
      title: 'Deal Created & Scheduled',
      message: `${deal.title} is now active.`,
    });
  };

  const updateDailyDeal = (updated: DailyDeal) => {
    setDailyDeals((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    addToast({
      type: 'success',
      title: 'Deal Updated',
      message: `${updated.title} settings updated.`,
    });
  };

  const deleteDailyDeal = (id: string) => {
    setDailyDeals((prev) => prev.filter((d) => d.id !== id));
    addToast({
      type: 'info',
      title: 'Deal Removed',
      message: 'Deal removed from schedule.',
    });
  };

  const toggleDailyDealActive = (id: string) => {
    setDailyDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d))
    );
  };

  // Categories
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = { ...cat, id: `cat-${Date.now()}` };
    setCategories((prev) => [...prev, newCat]);
    addToast({
      type: 'success',
      title: 'Category Added',
      message: `${cat.name} added.`,
    });
  };

  const updateCategory = (updated: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Coupons
  const addCoupon = (cpn: Omit<Coupon, 'id' | 'usedCount'>) => {
    const newCpn: Coupon = {
      ...cpn,
      id: `cpn-${Date.now()}`,
      usedCount: 0,
    };
    setCoupons((prev) => [newCpn, ...prev]);
    addToast({
      type: 'success',
      title: 'Coupon Created',
      message: `Coupon code ${cpn.code} is active.`,
    });
  };

  const updateCoupon = (updated: Coupon) => {
    setCoupons((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  // Banners
  const addBanner = (banner: Omit<HeroBanner, 'id'>) => {
    const newBanner: HeroBanner = { ...banner, id: `banner-${Date.now()}` };
    setBanners((prev) => [...prev, newBanner]);
  };

  const updateBanner = (updated: HeroBanner) => {
    setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const deleteBanner = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  // Blogs & Care Guides
  const addBlogPost = (blog: Omit<BlogPost, 'id' | 'publishedAt'>) => {
    const newBlog: BlogPost = {
      ...blog,
      id: `blog-${Date.now()}`,
      publishedAt: new Date().toISOString(),
    };
    setBlogs((prev) => [newBlog, ...prev]);
  };

  const updateBlogPost = (updated: BlogPost) => {
    setBlogs((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const deleteBlogPost = (id: string) => {
    setBlogs((prev) => prev.filter((b) => b.id !== id));
  };

  const addPlantCareGuide = (guide: Omit<PlantCareGuide, 'id'>) => {
    const newGuide: PlantCareGuide = {
      ...guide,
      id: `guide-${Date.now()}`,
    };
    setPlantCareGuides((prev) => [newGuide, ...prev]);
  };

  const updatePlantCareGuide = (updated: PlantCareGuide) => {
    setPlantCareGuides((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  };

  const deletePlantCareGuide = (id: string) => {
    setPlantCareGuides((prev) => prev.filter((g) => g.id !== id));
  };

  // Settings
  const updateStoreSettings = async (newSettings: Partial<StoreSettings>) => {
    try {
      const mergedSettings = { ...storeSettings, ...newSettings };
      setStoreSettings(mergedSettings);

      await setDoc(doc(db, 'storeSettings', 'global'), mergedSettings, { merge: true });

      addToast({
        type: 'success',
        title: 'Store Settings Saved',
        message: 'Store configurations updated globally.',
      });
    } catch (err) {
      console.error('Error updating store settings:', err);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not update store settings.',
      });
    }
  };

  const resetToSampleData = () => {
    setStoreSettings(initialStoreSettings);
    setCategories(initialCategories);
    setProducts(initialProducts);
    setCombos(initialPlantCombos);
    setDailyDeals(initialDailyDeals);
    setCoupons(initialCoupons);
    setBanners(initialBanners);
    setPlantCareGuides(initialPlantCareGuides);
    setBlogs(initialBlogPosts);
    setReviews(initialReviews);
    setOrders(initialOrders);
    setCart([]);
    // Wishlist belongs to users now
    addToast({
      type: 'info',
      title: 'Reset to Sample Data',
      message: 'Default 7Seasons nursery inventory restored.',
    });
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        combos,
        categories,
        dailyDeals,
        coupons,
        banners,
        plantCareGuides,
        blogs,
        reviews,
        orders,
        storeSettings,
        cart,
        wishlist,
        currentUser,
        currentAdmin,
        adminAccounts,
        isAdminAuthenticated,
        toasts,
        quickViewItem,
        isCartOpen,
        isDarkMode,
        toggleDarkMode,
        isSearchOpen,
        searchQuery,
        selectedDeliveryState,
        setSelectedDeliveryState,

        cartCount,
        cartSubtotal,
        cartDiscount,
        cartDeliveryFee,
        cartTotal,
        appliedCoupon,
        freeShippingRemaining,

        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        setIsCartOpen,
        setIsSearchOpen,
        setSearchQuery,

        toggleWishlist,
        isInWishlist,
        clearWishlist,

        openQuickView,
        closeQuickView,

        createOrder,
        importOrders,
        updateOrderStatus,
        getOrderById,
        getOrderByNumber,

        loginCustomer,
        loginWithGoogle,
        sendRegistrationOtp,
        verifyRegistrationOtp,
        registerCustomer,
        logoutCustomer,
        requestPasswordReset,
        verifyPasswordResetOtp,
        updatePassword,
        updateUserProfile,
        addUserAddress,
        deleteUserAddress,
        setDefaultUserAddress,
        loginAdmin,
        verifyAdminCredentials,
        logoutAdmin,
        addAdminAccount,
        removeAdminAccount,
        updateAdminPassword,

        addReview,
        approveReview,
        deleteReview,

        addProduct,
        updateProduct,
        deleteProduct,
        deleteProducts,
        duplicateProduct,

        addCombo,
        updateCombo,
        deleteCombo,
        deleteCombos,
        duplicateCombo,

        addDailyDeal,
        updateDailyDeal,
        deleteDailyDeal,
        toggleDailyDealActive,

        addCategory,
        updateCategory,
        deleteCategory,

        addCoupon,
        updateCoupon,
        deleteCoupon,

        addBanner,
        updateBanner,
        deleteBanner,

        addBlogPost,
        updateBlogPost,
        deleteBlogPost,

        addPlantCareGuide,
        updatePlantCareGuide,
        deletePlantCareGuide,

        updateStoreSettings,
        resetToSampleData,

        addToast,
        removeToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
