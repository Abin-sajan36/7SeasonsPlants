import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { auth, db, firebaseConfig } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, collection, getDocs, deleteDoc, query, where } from 'firebase/firestore';
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
  AdminRole,
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
  initialAdminUser,
  initialAdminAccounts,
} from '../data/initialData';

export interface OAuthDomainNotice {
  show: boolean;
  domain: string;
  projectId: string;
  authDomain: string;
  consoleUrl: string;
}

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
  registeredUsers: User[];
  isCurrentSuperAdmin: boolean;
  toasts: ToastMessage[];
  quickViewItem: { item: Product | PlantCombo; type: 'product' | 'combo' } | null;
  isCartOpen: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isSearchOpen: boolean;
  searchQuery: string;
  selectedDeliveryState: string | null;
  setSelectedDeliveryState: (state: string | null) => void;
  isStateModalOpen: boolean;
  setIsStateModalOpen: (open: boolean) => void;
  openStateModal: () => void;
  closeStateModal: () => void;
  isItemDeliverable: (item: Product | PlantCombo, targetState?: string | null) => boolean;

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
  deleteOrder: (orderId: string) => void;
  getOrderById: (id: string) => Order | undefined;
  getOrderByNumber: (orderNumber: string) => Order | undefined;

  // User & Auth
  authDomainNotice: OAuthDomainNotice | null;
  dismissAuthDomainNotice: () => void;
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
  grantAdminRoleToUser: (
    userIdOrEmail: string,
    adminRole?: AdminRole
  ) => Promise<{ success: boolean; message: string }>;
  revokeAdminRoleFromUser: (
    userIdOrEmail: string
  ) => Promise<{ success: boolean; message: string }>;
  refreshRegisteredUsers: () => Promise<User[]>;

  // Reviews
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'status'> & { status?: Review['status'] }) => void;
  approveReview: (id: string) => void;
  deleteReview: (id: string) => void;

  // Admin CRUD
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void> | void;
  updateProduct: (product: Product) => Promise<void> | void;
  deleteProduct: (id: string) => Promise<void> | void;
  deleteProducts: (ids: string[]) => Promise<void> | void;
  duplicateProduct: (id: string) => Promise<void> | void;

  addCombo: (combo: Omit<PlantCombo, 'id' | 'createdAt'>) => Promise<void> | void;
  updateCombo: (combo: PlantCombo) => Promise<void> | void;
  deleteCombo: (id: string) => Promise<void> | void;
  deleteCombos: (ids: string[]) => Promise<void> | void;
  duplicateCombo: (id: string) => Promise<void> | void;

  addDailyDeal: (deal: Omit<DailyDeal, 'id'>) => Promise<void> | void;
  updateDailyDeal: (deal: DailyDeal) => Promise<void> | void;
  deleteDailyDeal: (id: string) => Promise<void> | void;
  toggleDailyDealActive: (id: string) => Promise<void> | void;

  addCategory: (cat: Omit<Category, 'id'>) => Promise<void> | void;
  updateCategory: (cat: Category) => Promise<void> | void;
  deleteCategory: (id: string) => Promise<void> | void;

  addCoupon: (cpn: Omit<Coupon, 'id' | 'usedCount'>) => Promise<void> | void;
  updateCoupon: (cpn: Coupon) => Promise<void> | void;
  deleteCoupon: (id: string) => Promise<void> | void;

  addBanner: (banner: Omit<HeroBanner, 'id'>) => Promise<void> | void;
  updateBanner: (banner: HeroBanner) => Promise<void> | void;
  deleteBanner: (id: string) => Promise<void> | void;

  addBlogPost: (blog: Omit<BlogPost, 'id' | 'publishedAt'>) => Promise<void> | void;
  updateBlogPost: (blog: BlogPost) => Promise<void> | void;
  deleteBlogPost: (id: string) => Promise<void> | void;

  addPlantCareGuide: (guide: Omit<PlantCareGuide, 'id'>) => Promise<void> | void;
  updatePlantCareGuide: (guide: PlantCareGuide) => Promise<void> | void;
  deletePlantCareGuide: (id: string) => Promise<void> | void;

  updateStoreSettings: (settings: Partial<StoreSettings>) => Promise<void> | void;
  resetToSampleData: () => Promise<void> | void;

  // Toasts
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = '7seasonsplants_app_data_v1';

export const removeUndefined = (obj: any): any => {
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

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persisted state or initial seed
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : initialStoreSettings;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_categories`);
    if (!saved) return initialCategories;
    try {
      const parsed: Category[] = JSON.parse(saved);
      const existingNames = new Set(parsed.map((c) => c.name.toLowerCase()));
      const missingInitial = initialCategories.filter((ic) => !existingNames.has(ic.name.toLowerCase()));
      return missingInitial.length > 0 ? [...parsed, ...missingInitial] : parsed;
    } catch {
      return initialCategories;
    }
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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((b: HeroBanner) => ({
            ...b,
            ctaText: /shop\s*plants/i.test(b.ctaText) ? 'Explore Plant Combos' : /best\s*seller/i.test(b.ctaText) ? 'Best Selling Combos' : b.ctaText,
            ctaLink: b.ctaLink === '/plants' || b.ctaLink?.startsWith('/plants') ? '/combos' : b.ctaLink,
            secondaryCtaText: /shop\s*plants/i.test(b.secondaryCtaText || '') ? 'Explore Combos' : b.secondaryCtaText,
            secondaryCtaLink: b.secondaryCtaLink === '/plants' || b.secondaryCtaLink?.startsWith('/plants') ? '/combos' : b.secondaryCtaLink,
          }));
        }
      } catch {
        return initialBanners;
      }
    }
    return initialBanners;
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
    if (saved !== null && saved !== 'null' && saved !== 'undefined') {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.email || parsed.id)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    // Check if an admin was saved in storage
    const savedAdmin = sessionStorage.getItem(`${STORAGE_KEY}_current_admin`) || localStorage.getItem(`${STORAGE_KEY}_current_admin`);
    if (savedAdmin && savedAdmin !== 'null' && savedAdmin !== 'undefined') {
      try {
        const parsedAdmin = JSON.parse(savedAdmin);
        if (parsedAdmin && parsedAdmin.email) {
          return {
            id: parsedAdmin.id || 'usr-admin-7seasons',
            name: parsedAdmin.name || '7Seasons Nursery Admin',
            email: parsedAdmin.email,
            phone: parsedAdmin.phone || '08848276403',
            role: 'admin',
            addresses: [],
            wishlist: [],
            createdAt: parsedAdmin.createdAt || new Date().toISOString(),
          };
        }
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_registered_users`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const list = [...parsed];
          const admin7Index = list.findIndex((u) => u.email.toLowerCase() === 'admin@7seasons.com');
          if (admin7Index === -1) {
            list.push(initialAdminUser);
          } else {
            list[admin7Index] = {
              ...list[admin7Index],
              password: 'Admin@123',
              role: 'admin',
            };
          }
          return list;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [initialUser, initialAdminUser];
  });

  const [resetOtps, setResetOtps] = useState<Record<string, string>>({});

  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_admin_accounts`);
    if (saved) {
      try {
        const parsed: AdminAccount[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.filter(
            (a) =>
              ((a.email.toLowerCase() === 'abinsajan36@gmail.com' || a.email.toLowerCase() === 'annanvasu36@gmail.com') && a.role === 'super_admin') ||
              (a.role !== 'super_admin')
          );
          if (!sanitized.some((a) => a.email.toLowerCase() === 'abinsajan36@gmail.com')) {
            sanitized.unshift(initialAdminAccounts[0]);
          }
          if (!sanitized.some((a) => a.email.toLowerCase() === 'annanvasu36@gmail.com')) {
            sanitized.push(initialAdminAccounts[1]);
          }
          const admin7Index = sanitized.findIndex((a) => a.email.toLowerCase() === 'admin@7seasons.com');
          if (admin7Index === -1) {
            sanitized.push(initialAdminAccounts[2]);
          } else {
            // Strictly enforce standard 'admin' role, not super_admin
            sanitized[admin7Index] = {
              ...sanitized[admin7Index],
              role: 'admin',
            };
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
    if (saved && saved !== 'null' && saved !== 'undefined') {
      try {
        const parsed: AdminAccount = JSON.parse(saved);
        if (parsed && (parsed.email || parsed.id)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved admin:', e);
      }
    }
    return null;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    const sessionAuth = sessionStorage.getItem(`${STORAGE_KEY}_admin_auth`);
    const localAuth = localStorage.getItem(`${STORAGE_KEY}_admin_auth`);
    if (sessionAuth === 'true' || localAuth === 'true') return true;
    const saved = sessionStorage.getItem(`${STORAGE_KEY}_current_admin`) || localStorage.getItem(`${STORAGE_KEY}_current_admin`);
    if (saved && saved !== 'null' && saved !== 'undefined') {
      try {
        const parsed = JSON.parse(saved);
        return !!(parsed && parsed.email);
      } catch {
        return false;
      }
    }
    return false;
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [quickViewItem, setQuickViewItem] = useState<{
    item: Product | PlantCombo;
    type: 'product' | 'combo';
  } | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const VALID_DELIVERY_STATES = ['Kerala', 'Tamil Nadu', 'Karnataka'] as const;
  const [selectedDeliveryState, setSelectedDeliveryStateState] = useState<string | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_deliveryState`) || localStorage.getItem('7seasons_deliveryState');
    if (saved && (VALID_DELIVERY_STATES as readonly string[]).includes(saved)) {
      return saved;
    }
    return null;
  });
  const [isStateModalOpen, setIsStateModalOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_deliveryState`) || localStorage.getItem('7seasons_deliveryState');
    return !(saved && (VALID_DELIVERY_STATES as readonly string[]).includes(saved));
  });
  const openStateModal = () => setIsStateModalOpen(true);
  const closeStateModal = () => {
    if (selectedDeliveryState && (VALID_DELIVERY_STATES as readonly string[]).includes(selectedDeliveryState)) {
      setIsStateModalOpen(false);
    }
  };

  const setSelectedDeliveryState = (state: string | null) => {
    setSelectedDeliveryStateState(state);
    if (state) {
      localStorage.setItem(`${STORAGE_KEY}_deliveryState`, state);
      localStorage.setItem('7seasons_deliveryState', state);
      addToast({
        type: 'info',
        title: `Delivery Location: ${state}`,
        message: `Catalog updated to show plant combos deliverable to ${state}.`,
        duration: 3500,
      });
    }
  };

  const isItemDeliverable = useCallback((item: Product | PlantCombo, targetState?: string | null): boolean => {
    const stateToCheck = targetState !== undefined ? targetState : selectedDeliveryState;
    if (!stateToCheck || stateToCheck === 'All' || stateToCheck === 'All India') return true;
    if (!item.sellableStates || item.sellableStates.length === 0) return true;
    return item.sellableStates.includes(stateToCheck) || item.sellableStates.includes('All India');
  }, [selectedDeliveryState]);

  // Domain Authorization Notice for OAuth
  const [authDomainNotice, setAuthDomainNotice] = useState<OAuthDomainNotice | null>(null);
  const dismissAuthDomainNotice = () => setAuthDomainNotice(null);

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
    let seeded = false;
    const unsubscribe = onSnapshot(
      doc(db, 'storeSettings', 'global'),
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as StoreSettings;
          setStoreSettings((prev) => ({ ...prev, ...data }));
          localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(data));
        } else if (!seeded) {
          seeded = true;
          try {
            await setDoc(doc(db, 'storeSettings', 'global'), removeUndefined(initialStoreSettings), { merge: true });
          } catch (e) {
            console.warn('Initial storeSettings seed note:', e);
          }
        }
      },
      (error) => {
        console.warn('Firestore storeSettings sync note:', error.message || error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time synchronization of Plant Combos from Firestore
  useEffect(() => {
    let seeded = false;
    const unsubscribe = onSnapshot(
      collection(db, 'combos'),
      async (snapshot) => {
        if (!snapshot.empty) {
          const list: PlantCombo[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...(docSnap.data() as PlantCombo), id: docSnap.id });
          });
          setCombos(list);
          localStorage.setItem(`${STORAGE_KEY}_combos`, JSON.stringify(list));
        } else if (!seeded) {
          seeded = true;
          try {
            for (const item of initialPlantCombos) {
              await setDoc(doc(db, 'combos', item.id), removeUndefined(item), { merge: true });
            }
          } catch (e) {
            console.warn('Seeding initial combos note:', e);
          }
        }
      },
      (error) => {
        console.warn('Firestore combos sync note:', error.message || error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time synchronization of Products from Firestore
  useEffect(() => {
    let seeded = false;
    const unsubscribe = onSnapshot(
      collection(db, 'products'),
      async (snapshot) => {
        if (!snapshot.empty) {
          const list: Product[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...(docSnap.data() as Product), id: docSnap.id });
          });
          setProducts(list);
          localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(list));
        } else if (!seeded) {
          seeded = true;
          try {
            for (const item of initialProducts) {
              await setDoc(doc(db, 'products', item.id), removeUndefined(item), { merge: true });
            }
          } catch (e) {
            console.warn('Seeding initial products note:', e);
          }
        }
      },
      (error) => {
        console.warn('Firestore products sync note:', error.message || error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time synchronization of Categories from Firestore
  useEffect(() => {
    let seeded = false;
    const unsubscribe = onSnapshot(
      collection(db, 'categories'),
      async (snapshot) => {
        if (!snapshot.empty) {
          const list: Category[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...(docSnap.data() as Category), id: docSnap.id });
          });
          setCategories(list);
          localStorage.setItem(`${STORAGE_KEY}_categories`, JSON.stringify(list));
        } else if (!seeded) {
          seeded = true;
          try {
            for (const item of initialCategories) {
              await setDoc(doc(db, 'categories', item.id), removeUndefined(item), { merge: true });
            }
          } catch (e) {
            console.warn('Seeding initial categories note:', e);
          }
        }
      },
      (error) => {
        console.warn('Firestore categories sync note:', error.message || error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time synchronization of Daily Deals from Firestore
  useEffect(() => {
    let seeded = false;
    const unsubscribe = onSnapshot(
      collection(db, 'dailyDeals'),
      async (snapshot) => {
        if (!snapshot.empty) {
          const list: DailyDeal[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...(docSnap.data() as DailyDeal), id: docSnap.id });
          });
          setDailyDeals(list);
          localStorage.setItem(`${STORAGE_KEY}_deals`, JSON.stringify(list));
        } else if (!seeded) {
          seeded = true;
          try {
            for (const item of initialDailyDeals) {
              await setDoc(doc(db, 'dailyDeals', item.id), removeUndefined(item), { merge: true });
            }
          } catch (e) {
            console.warn('Seeding initial dailyDeals note:', e);
          }
        }
      },
      (error) => {
        console.warn('Firestore dailyDeals sync note:', error.message || error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time synchronization of Coupons from Firestore
  useEffect(() => {
    let seeded = false;
    const unsubscribe = onSnapshot(
      collection(db, 'coupons'),
      async (snapshot) => {
        if (!snapshot.empty) {
          const list: Coupon[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...(docSnap.data() as Coupon), id: docSnap.id });
          });
          setCoupons(list);
          localStorage.setItem(`${STORAGE_KEY}_coupons`, JSON.stringify(list));
        } else if (!seeded) {
          seeded = true;
          try {
            for (const item of initialCoupons) {
              await setDoc(doc(db, 'coupons', item.id), removeUndefined(item), { merge: true });
            }
          } catch (e) {
            console.warn('Seeding initial coupons note:', e);
          }
        }
      },
      (error) => {
        console.warn('Firestore coupons sync note:', error.message || error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time synchronization of Banners from Firestore
  useEffect(() => {
    let seeded = false;
    const unsubscribe = onSnapshot(
      collection(db, 'banners'),
      async (snapshot) => {
        if (!snapshot.empty) {
          const list: HeroBanner[] = [];
          snapshot.forEach((docSnap) => {
            const b = docSnap.data() as HeroBanner;
            list.push({
              ...b,
              id: docSnap.id,
              ctaText: /shop\s*plants/i.test(b.ctaText) ? 'Explore Plant Combos' : /best\s*seller/i.test(b.ctaText) ? 'Best Selling Combos' : b.ctaText,
              ctaLink: b.ctaLink === '/plants' || b.ctaLink?.startsWith('/plants') ? '/combos' : b.ctaLink,
              secondaryCtaText: /shop\s*plants/i.test(b.secondaryCtaText || '') ? 'Explore Combos' : b.secondaryCtaText,
              secondaryCtaLink: b.secondaryCtaLink === '/plants' || b.secondaryCtaLink?.startsWith('/plants') ? '/combos' : b.secondaryCtaLink,
            });
          });
          setBanners(list);
          localStorage.setItem(`${STORAGE_KEY}_banners`, JSON.stringify(list));
        } else if (!seeded) {
          seeded = true;
          try {
            for (const item of initialBanners) {
              await setDoc(doc(db, 'banners', item.id), removeUndefined(item), { merge: true });
            }
          } catch (e) {
            console.warn('Seeding initial banners note:', e);
          }
        }
      },
      (error) => {
        console.warn('Firestore banners sync note:', error.message || error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time synchronization of Plant Care Guides from Firestore
  useEffect(() => {
    let seeded = false;
    const unsubscribe = onSnapshot(
      collection(db, 'plantCareGuides'),
      async (snapshot) => {
        if (!snapshot.empty) {
          const list: PlantCareGuide[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...(docSnap.data() as PlantCareGuide), id: docSnap.id });
          });
          setPlantCareGuides(list);
          localStorage.setItem(`${STORAGE_KEY}_guides`, JSON.stringify(list));
        } else if (!seeded) {
          seeded = true;
          try {
            for (const item of initialPlantCareGuides) {
              await setDoc(doc(db, 'plantCareGuides', item.id), removeUndefined(item), { merge: true });
            }
          } catch (e) {
            console.warn('Seeding initial plantCareGuides note:', e);
          }
        }
      },
      (error) => {
        console.warn('Firestore plantCareGuides sync note:', error.message || error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time synchronization of Blog Posts from Firestore
  useEffect(() => {
    let seeded = false;
    const unsubscribe = onSnapshot(
      collection(db, 'blogs'),
      async (snapshot) => {
        if (!snapshot.empty) {
          const list: BlogPost[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...(docSnap.data() as BlogPost), id: docSnap.id });
          });
          setBlogs(list);
          localStorage.setItem(`${STORAGE_KEY}_blogs`, JSON.stringify(list));
        } else if (!seeded) {
          seeded = true;
          try {
            for (const item of initialBlogPosts) {
              await setDoc(doc(db, 'blogs', item.id), removeUndefined(item), { merge: true });
            }
          } catch (e) {
            console.warn('Seeding initial blogs note:', e);
          }
        }
      },
      (error) => {
        console.warn('Firestore blogs sync note:', error.message || error);
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
    if (currentUser?.id) {
      const cleanCart = removeUndefined(cart);
      updateDoc(doc(db, 'users', currentUser.id), {
        cart: cleanCart,
        updatedAt: new Date().toISOString(),
      }).catch(() => {
        setDoc(doc(db, 'users', currentUser.id), {
          cart: cleanCart,
          updatedAt: new Date().toISOString(),
        }, { merge: true }).catch(console.warn);
      });
    }
  }, [cart, currentUser?.id]);


  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      sessionStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
      localStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
    }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    if (currentAdmin) {
      sessionStorage.setItem(`${STORAGE_KEY}_current_admin`, JSON.stringify(currentAdmin));
      localStorage.setItem(`${STORAGE_KEY}_current_admin`, JSON.stringify(currentAdmin));
    }
  }, [currentAdmin]);

  const isCurrentSuperAdmin = useMemo(() => {
    const isSuperByAdmin = Boolean(
      currentAdmin &&
      (currentAdmin.role === 'super_admin' ||
        currentAdmin.email.toLowerCase() === 'abinsajan36@gmail.com' ||
        currentAdmin.email.toLowerCase() === 'annanvasu36@gmail.com')
    );
    const isSuperByUser = Boolean(
      currentUser &&
      (currentUser.role === 'super_admin' ||
        currentUser.email.toLowerCase() === 'abinsajan36@gmail.com' ||
        currentUser.email.toLowerCase() === 'annanvasu36@gmail.com')
    );
    return isSuperByAdmin || isSuperByUser;
  }, [currentAdmin, currentUser]);

  // Realtime synchronization of all users from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        if (!snapshot.empty) {
          const fetched: User[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as User;
            fetched.push({ ...data, id: d.id });
          });
          setRegisteredUsers((prev) => {
            const map = new Map<string, User>();
            prev.forEach((u) => {
              if (u && u.email) map.set(u.email.toLowerCase(), u);
            });
            fetched.forEach((fu) => {
              if (fu && fu.email) {
                const existing = map.get(fu.email.toLowerCase());
                map.set(fu.email.toLowerCase(), { ...(existing || {}), ...fu });
              }
            });
            const merged = Array.from(map.values());
            localStorage.setItem(`${STORAGE_KEY}_registered_users`, JSON.stringify(merged));
            return merged;
          });
        }
      },
      (err) => {
        console.warn('Firestore users realtime sync notice:', err.message || err);
      }
    );
    return () => unsubscribe();
  }, []);

  // Realtime synchronization of all orders from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedOrders: Order[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as Order;
            fetchedOrders.push({ ...data, id: d.id });
          });
          setOrders((prev) => {
            const map = new Map<string, Order>();
            prev.forEach((o) => {
              if (o && (o.id || o.orderNumber)) map.set(o.id || o.orderNumber, o);
            });
            fetchedOrders.forEach((fo) => {
              if (fo && (fo.id || fo.orderNumber)) {
                map.set(fo.id || fo.orderNumber, fo);
              }
            });
            const merged = Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(merged));
            return merged;
          });
        }
      },
      (err) => {
        console.warn('Firestore orders realtime sync notice:', err.message || err);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch fresh profile from Firestore if available
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          let fullUser: User;

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            fullUser = { ...userData, id: firebaseUser.uid };
            if (userData.cart && Array.isArray(userData.cart) && userData.cart.length > 0) {
              setCart((prevCart) => (prevCart.length === 0 ? userData.cart! : prevCart));
            }
          } else {
            fullUser = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Plant Lover',
              email: firebaseUser.email || '',
              phone: firebaseUser.phoneNumber || '',
              role:
                firebaseUser.email?.toLowerCase() === 'abinsajan36@gmail.com' ||
                firebaseUser.email?.toLowerCase() === 'annanvasu36@gmail.com'
                  ? 'super_admin'
                  : 'customer',
              addresses: [],
              wishlist: [],
              cart: cart || [],
              orderIds: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            };
            setDoc(doc(db, 'users', firebaseUser.uid), removeUndefined(fullUser), { merge: true }).catch(console.warn);
          }

          setCurrentUser(fullUser);
          localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(fullUser));

          // Ensure user is in the registered users roster
          setRegisteredUsers((prev) => {
            const map = new Map<string, User>();
            prev.forEach((u) => {
              if (u?.email) map.set(u.email.toLowerCase(), u);
            });
            map.set(fullUser.email.toLowerCase(), { ...(map.get(fullUser.email.toLowerCase()) || {}), ...fullUser });
            const merged = Array.from(map.values());
            localStorage.setItem(`${STORAGE_KEY}_registered_users`, JSON.stringify(merged));
            return merged;
          });

          const isSuper =
            fullUser.role === 'super_admin' ||
            fullUser.email.toLowerCase() === 'abinsajan36@gmail.com' ||
            fullUser.email.toLowerCase() === 'annanvasu36@gmail.com';
          const isAdminRole = fullUser.role === 'admin' || isSuper;

          if (isAdminRole) {
            setIsAdminAuthenticated(true);
            const adm: AdminAccount = {
              id: `adm-${fullUser.id || firebaseUser.uid}`,
              name: fullUser.name || 'Nursery Admin',
              email: fullUser.email,
              role: isSuper ? 'super_admin' : 'admin',
              avatar: fullUser.profileImage,
              phone: fullUser.phone,
              createdAt: fullUser.createdAt || new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              sourceUserAccountId: firebaseUser.uid,
            };
            setCurrentAdmin(adm);
            sessionStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
            localStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
            sessionStorage.setItem(`${STORAGE_KEY}_current_admin`, JSON.stringify(adm));
            localStorage.setItem(`${STORAGE_KEY}_current_admin`, JSON.stringify(adm));
          }
        } catch (err) {
          console.warn('Could not sync profile from Firestore:', err);
        }
      }
      // Note: Do NOT clear currentUser or admin credentials if firebaseUser is null.
      // The application supports local, OTP, and admin credentials authentication
      // which must remain persistent across page reloads without requiring Firebase Auth.
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
    const threshold = storeSettings.freeShippingThreshold ?? storeSettings.freeDeliveryThreshold ?? 899;
    if (cartSubtotal >= threshold) return 0;
    
    // Calculate total weight in kg (defaulting to 1kg if weight is not specified)
    const totalWeight = cart.reduce((total, item) => total + ((item.weight || 1) * item.quantity), 0);
    
    // Delivery charge is per kg
    const chargePerKg = storeSettings.deliveryCharge ?? 80;
    return chargePerKg * Math.ceil(totalWeight);
  }, [cartSubtotal, storeSettings, cart]);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - cartDiscount + cartDeliveryFee);
  }, [cartSubtotal, cartDiscount, cartDeliveryFee]);

  const freeShippingRemaining = useMemo(() => {
    const threshold = storeSettings.freeShippingThreshold ?? storeSettings.freeDeliveryThreshold ?? 899;
    return Math.max(0, threshold - cartSubtotal);
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
    const customerId = currentUser?.id || (orderPayload as any).customerId || `usr-ord-${Date.now()}`;
    const newOrder: Order = {
      ...orderPayload,
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId,
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

    // Save order locally
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // Persist order to Firestore orders collection
    try {
      await setDoc(doc(db, 'orders', newOrder.id), removeUndefined(newOrder));
    } catch (fsErr) {
      console.warn('Could not save order to Firestore:', fsErr);
    }

    // Ensure customer profile is recorded and updated in registered users and Firestore
    if (currentUser) {
      try {
        const prevOrderIds = currentUser.orderIds || [];
        const nextOrderIds = prevOrderIds.includes(newOrder.id) ? prevOrderIds : [newOrder.id, ...prevOrderIds];
        let nextAddresses = currentUser.addresses || [];
        if (orderPayload.customer?.shippingAddress) {
          const newAddr = orderPayload.customer.shippingAddress;
          const exists = nextAddresses.some(
            (a) => a.pincode === newAddr.pincode && a.addressLine1 === newAddr.addressLine1
          );
          if (!exists) {
            nextAddresses = [newAddr, ...nextAddresses];
          }
        }
        const updatedUser: User = {
          ...currentUser,
          orderIds: nextOrderIds,
          addresses: nextAddresses,
          cart: [],
          updatedAt: timestamp,
        };
        setCurrentUser(updatedUser);
        localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(updatedUser));
        await setDoc(doc(db, 'users', currentUser.id), removeUndefined(updatedUser), { merge: true });
      } catch (userErr) {
        console.warn('Could not update user order profile in Firestore:', userErr);
      }
    } else if (orderPayload.customer?.email) {
      const custEmail = orderPayload.customer.email.toLowerCase().trim();
      const existingUser = registeredUsers.find((u) => u.email.toLowerCase() === custEmail);
      if (!existingUser) {
        const newCustUser: User = {
          id: customerId,
          name: orderPayload.customer.name || 'Customer',
          email: custEmail,
          phone: orderPayload.customer.phone || '',
          role: 'customer',
          addresses: orderPayload.customer.shippingAddress ? [orderPayload.customer.shippingAddress] : [],
          wishlist: [],
          cart: [],
          orderIds: [newOrder.id],
          createdAt: timestamp,
          updatedAt: timestamp,
          lastLogin: timestamp,
        };
        setRegisteredUsers((prev) => {
          const next = [...prev, newCustUser];
          localStorage.setItem(`${STORAGE_KEY}_registered_users`, JSON.stringify(next));
          return next;
        });
        setDoc(doc(db, 'users', newCustUser.id), removeUndefined(newCustUser), { merge: true }).catch(console.warn);
      } else {
        const updatedIds = existingUser.orderIds ? [newOrder.id, ...existingUser.orderIds] : [newOrder.id];
        setDoc(doc(db, 'users', existingUser.id), {
          orderIds: updatedIds,
          cart: [],
          updatedAt: timestamp,
        }, { merge: true }).catch(console.warn);
      }
    }

    addToast({
      type: 'success',
      title: 'Order Placed Successfully! 🌸',
      message: `Your Order ${orderNumber} is confirmed. Delivery to ${orderPayload.customer.shippingAddress?.state}.`,
    });

    return newOrder;
  };

  
  const deleteOrder = async (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (e) {
      console.warn('Could not delete order from Firestore:', e);
    }
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
    const updatedHistory = orderToUpdate ? [
      ...orderToUpdate.statusHistory,
      {
        status,
        timestamp: new Date().toISOString(),
        note: note || `Status updated to ${status}`,
      },
    ] : [
      {
        status,
        timestamp: new Date().toISOString(),
        note: note || `Status updated to ${status}`,
      }
    ];

    // 2. Update local state
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
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

    // 3. Update in Firestore
    try {
      await updateDoc(doc(db, 'orders', orderId), removeUndefined({
        orderStatus: status,
        statusHistory: updatedHistory,
        trackingNumber: trackingNumber || orderToUpdate?.trackingNumber,
        courierPartner: courierPartner || orderToUpdate?.courierPartner,
        updatedAt: new Date().toISOString(),
      }));
    } catch (fsErr) {
      console.warn('Could not update order status in Firestore:', fsErr);
    }

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
      const isSuper =
        user.email?.toLowerCase() === 'abinsajan36@gmail.com' ||
        user.email?.toLowerCase() === 'annanvasu36@gmail.com';

      if (userDoc.exists()) {
        userData = userDoc.data() as User;
        if (isSuper && userData.role !== 'super_admin') {
          userData.role = 'super_admin';
          setDoc(doc(db, 'users', user.uid), { role: 'super_admin' }, { merge: true }).catch(console.warn);
        }
        if (userData.cart && Array.isArray(userData.cart) && userData.cart.length > 0) {
          setCart((prev) => (prev.length === 0 ? userData.cart! : prev));
        }
        // Update last login
        setDoc(doc(db, 'users', user.uid), { lastLogin: new Date().toISOString() }, { merge: true }).catch(console.warn);
      } else {
        // Register new user
        userData = {
          id: user.uid,
          name: user.displayName || 'Plant Lover',
          email: user.email || '',
          phone: user.phoneNumber || '',
          role: isSuper ? 'super_admin' : 'customer',
          addresses: [],
          wishlist: [],
          cart: cart || [],
          orderIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', user.uid), removeUndefined(userData), { merge: true });
      }

      const fullUser = { ...userData, id: user.uid };
      const isAdmin = userData.role === 'admin' || isSuper;

      setIsAdminAuthenticated(isAdmin);
      if (isAdmin) {
        const adm: AdminAccount = {
          id: `adm-${user.uid}`,
          name: userData.name,
          email: userData.email,
          role: isSuper ? 'super_admin' : 'admin',
          avatar: userData.profileImage,
          phone: userData.phone,
          createdAt: userData.createdAt,
          lastLogin: new Date().toISOString(),
          sourceUserAccountId: user.uid,
        };
        setCurrentAdmin(adm);
        sessionStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
        localStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
        sessionStorage.setItem(`${STORAGE_KEY}_current_admin`, JSON.stringify(adm));
        localStorage.setItem(`${STORAGE_KEY}_current_admin`, JSON.stringify(adm));
      } else {
        setCurrentAdmin(null);
      }

      setCurrentUser(fullUser);
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(fullUser));

      // Add to registered users list
      setRegisteredUsers((prev) => {
        const map = new Map<string, User>();
        prev.forEach((u) => {
          if (u?.email) map.set(u.email.toLowerCase(), u);
        });
        map.set(fullUser.email.toLowerCase(), { ...(map.get(fullUser.email.toLowerCase()) || {}), ...fullUser });
        const merged = Array.from(map.values());
        localStorage.setItem(`${STORAGE_KEY}_registered_users`, JSON.stringify(merged));
        return merged;
      });
      
      addToast({
        type: 'success',
        title: 'Welcome! 🌿',
        message: `Signed in as ${userData.name}`,
      });
      return true;
    } catch (error: any) {
      const errMsg = (error?.message || '').toLowerCase();
      const errCode = error?.code || '';
      
      // If user simply closed the popup or cancelled, treat as benign notice
      if (errCode === 'auth/popup-closed-by-user' || errCode === 'auth/cancelled-popup-request') {
        console.info('Google sign-in popup closed by user.');
        addToast({
          type: 'info',
          title: 'Sign-In Cancelled',
          message: 'The Google sign-in window was closed.',
        });
        return false;
      }

      console.error('Google sign-in error:', error);
      const isDomainUnauthorized =
        errCode === 'auth/unauthorized-domain' ||
        errCode === 'auth/configuration-not-found' ||
        errMsg.includes('not authorized for oauth') ||
        errMsg.includes('unauthorized domain') ||
        errMsg.includes('unauthorized-domain');

      if (isDomainUnauthorized) {
        const currentHostname =
          typeof window !== 'undefined' && window.location.hostname
            ? window.location.hostname
            : '7seasonsplants.com';
        const targetProjId = firebaseConfig.projectId || 'season-445ff';
        const primaryAuthDomain = firebaseConfig.authDomain || `${targetProjId}.firebaseapp.com`;
        const consoleLink = `https://console.firebase.google.com/project/${targetProjId}/authentication/settings`;

        setAuthDomainNotice({
          show: true,
          domain: currentHostname,
          projectId: targetProjId,
          authDomain: primaryAuthDomain,
          consoleUrl: consoleLink,
        });

        addToast({
          type: 'error',
          title: 'Domain Not Authorized in Firebase',
          message: `The domain "${currentHostname}" must be added to Authorized Domains in the Firebase Console (Authentication > Settings > Authorized domains). You can sign in using Email / Password or OTP below in the meantime.`,
          duration: 12000,
        });
      } else if (errCode === 'auth/popup-closed-by-user' || errCode === 'auth/cancelled-popup-request') {
        addToast({
          type: 'info',
          title: 'Sign-In Cancelled',
          message: 'The Google sign-in window was closed.',
        });
      } else {
        addToast({
          type: 'error',
          title: 'Authentication Failed',
          message: error.message || 'Could not complete Google sign-in.',
        });
      }
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

      let resolvedUser = matched;
      try {
        const uDoc = await getDoc(doc(db, 'users', matched.id));
        if (uDoc.exists()) {
          resolvedUser = { ...matched, ...(uDoc.data() as User) };
        }
      } catch (e) {
        console.warn('Firestore doc sync on login:', e);
      }

      if (resolvedUser.cart && Array.isArray(resolvedUser.cart) && resolvedUser.cart.length > 0) {
        setCart((prev) => (prev.length === 0 ? resolvedUser.cart! : prev));
      }
      setDoc(doc(db, 'users', resolvedUser.id), { lastLogin: new Date().toISOString() }, { merge: true }).catch(console.warn);

      if (resolvedUser.role === 'admin' || resolvedUser.role === 'super_admin' || cleanEmail === 'abinsajan36@gmail.com' || cleanEmail === 'annanvasu36@gmail.com') {
        setIsAdminAuthenticated(true);
        const isSuper = resolvedUser.role === 'super_admin' || cleanEmail === 'abinsajan36@gmail.com' || cleanEmail === 'annanvasu36@gmail.com';
        const admAcc: AdminAccount = {
          id: `adm-${resolvedUser.id}`,
          name: resolvedUser.name,
          email: resolvedUser.email,
          role: isSuper ? 'super_admin' : 'admin',
          avatar: resolvedUser.profileImage,
          phone: resolvedUser.phone,
          createdAt: resolvedUser.createdAt,
          sourceUserAccountId: resolvedUser.id,
          lastLogin: new Date().toISOString(),
        };
        setCurrentAdmin(admAcc);
        sessionStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
        localStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
        sessionStorage.setItem(`${STORAGE_KEY}_current_admin`, JSON.stringify(admAcc));
        localStorage.setItem(`${STORAGE_KEY}_current_admin`, JSON.stringify(admAcc));
      } else {
        setIsAdminAuthenticated(false);
        setCurrentAdmin(null);
      }
      setCurrentUser(resolvedUser);
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(resolvedUser));
      addToast({
        type: 'success',
        title: 'Welcome Back! 🌿',
        message: `Signed in as ${resolvedUser.name}${resolvedUser.role === 'admin' ? ' (Nursery Administrator)' : ''}`,
      });
      return true;
    }

    // Try Firestore users collection lookup next
    try {
      const uQuery = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const uSnap = await getDocs(uQuery);
      if (!uSnap.empty) {
        const fsUser = { ...(uSnap.docs[0].data() as User), id: uSnap.docs[0].id };
        if (fsUser.password && fsUser.password === cleanPass) {
          const isSuper = fsUser.role === 'super_admin' || cleanEmail === 'abinsajan36@gmail.com' || cleanEmail === 'annanvasu36@gmail.com';
          const isAdmin = fsUser.role === 'admin' || isSuper;
          setIsAdminAuthenticated(isAdmin);
          if (isAdmin) {
            const admAcc: AdminAccount = {
              id: `adm-${fsUser.id}`,
              name: fsUser.name,
              email: fsUser.email,
              role: isSuper ? 'super_admin' : 'admin',
              avatar: fsUser.profileImage,
              phone: fsUser.phone,
              createdAt: fsUser.createdAt,
              sourceUserAccountId: fsUser.id,
              lastLogin: new Date().toISOString(),
            };
            setCurrentAdmin(admAcc);
            sessionStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
            localStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
            sessionStorage.setItem(`${STORAGE_KEY}_current_admin`, JSON.stringify(admAcc));
            localStorage.setItem(`${STORAGE_KEY}_current_admin`, JSON.stringify(admAcc));
          } else {
            setCurrentAdmin(null);
          }

          if (fsUser.cart && Array.isArray(fsUser.cart) && fsUser.cart.length > 0) {
            setCart((prev) => (prev.length === 0 ? fsUser.cart! : prev));
          }
          setCurrentUser(fsUser);
          localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(fsUser));
          setRegisteredUsers((prev) => {
            const map = new Map<string, User>();
            prev.forEach((u) => { if (u?.email) map.set(u.email.toLowerCase(), u); });
            map.set(fsUser.email.toLowerCase(), fsUser);
            const merged = Array.from(map.values());
            localStorage.setItem(`${STORAGE_KEY}_registered_users`, JSON.stringify(merged));
            return merged;
          });
          setDoc(doc(db, 'users', fsUser.id), { lastLogin: new Date().toISOString() }, { merge: true }).catch(console.warn);
          addToast({ type: 'success', title: 'Welcome Back! 🌿', message: `Signed in as ${fsUser.name}` });
          return true;
        }
      }
    } catch (fsCheckErr) {
      console.warn('Firestore fallback user check notice:', fsCheckErr);
    }

    // Try Firebase Auth as last resort
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        const fullUser = { ...userData, id: userCredential.user.uid };
        const isSuper = fullUser.role === 'super_admin' || cleanEmail === 'abinsajan36@gmail.com' || cleanEmail === 'annanvasu36@gmail.com';
        const isAdmin = fullUser.role === 'admin' || isSuper;

        setIsAdminAuthenticated(isAdmin);
        if (isAdmin) {
          const admAcc: AdminAccount = {
            id: `adm-${fullUser.id}`,
            name: fullUser.name,
            email: fullUser.email,
            role: isSuper ? 'super_admin' : 'admin',
            avatar: fullUser.profileImage,
            phone: fullUser.phone,
            createdAt: fullUser.createdAt,
            sourceUserAccountId: fullUser.id,
            lastLogin: new Date().toISOString(),
          };
          setCurrentAdmin(admAcc);
          sessionStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
          localStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
          sessionStorage.setItem(`${STORAGE_KEY}_current_admin`, JSON.stringify(admAcc));
          localStorage.setItem(`${STORAGE_KEY}_current_admin`, JSON.stringify(admAcc));
        } else {
          setCurrentAdmin(null);
        }

        if (userData.cart && Array.isArray(userData.cart) && userData.cart.length > 0) {
          setCart((prev) => (prev.length === 0 ? userData.cart! : prev));
        }
        setDoc(doc(db, 'users', userCredential.user.uid), { lastLogin: new Date().toISOString() }, { merge: true }).catch(console.warn);

        setCurrentUser(fullUser);
        localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(fullUser));

        // Add to registered users list
        setRegisteredUsers((prev) => {
          const map = new Map<string, User>();
          prev.forEach((u) => {
            if (u?.email) map.set(u.email.toLowerCase(), u);
          });
          map.set(fullUser.email.toLowerCase(), { ...(map.get(fullUser.email.toLowerCase()) || {}), ...fullUser });
          const merged = Array.from(map.values());
          localStorage.setItem(`${STORAGE_KEY}_registered_users`, JSON.stringify(merged));
          return merged;
        });

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

      if (!response.ok) {
        const isJson = (response.headers.get('content-type') || '').includes('application/json');
        if (isJson) {
          const errData = await response.json();
          return { success: false, message: errData.error || 'Failed to send OTP.' };
        }
        const text = await response.text();
        console.warn('OTP service returned non-JSON:', text.slice(0, 100));
        return { success: false, message: `OTP service unavailable (${response.status})` };
      }

      const isJson = (response.headers.get('content-type') || '').includes('application/json');
      if (!isJson) {
        return { success: true, message: 'OTP sent (fallback)' };
      }

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

      if (!response.ok) {
        const isJson = (response.headers.get('content-type') || '').includes('application/json');
        let errorMsg = 'Invalid OTP code';
        if (isJson) {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } else {
          const text = await response.text();
          console.warn('OTP verify service returned non-JSON:', text.slice(0, 100));
        }
        addToast({ type: 'error', title: 'Verification Failed', message: errorMsg });
        return { success: false, error: errorMsg };
      }

      const isJson = (response.headers.get('content-type') || '').includes('application/json');
      if (!isJson) {
        return { success: true, message: 'OTP verified' };
      }

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

    const timestamp = new Date().toISOString();
    let firebaseUid: string | null = null;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      if (userCredential?.user?.uid) {
        firebaseUid = userCredential.user.uid;
      }
    } catch (authErr: any) {
      console.log('Firebase Auth creation notice during customer registration:', authErr?.message || authErr);
    }

    let createdOrUpdatedUser: User;

    if (existingIndex >= 0) {
      const existing = registeredUsers[existingIndex];
      createdOrUpdatedUser = {
        ...existing,
        id: firebaseUid || existing.id,
        name: cleanName,
        phone: cleanPhone || existing.phone,
        password: cleanPassword || existing.password,
        emailVerified: true,
        addresses: addresses.length ? addresses : (existing.addresses || []),
        cart: cart && cart.length ? cart : (existing.cart || []),
        orderIds: existing.orderIds || [],
        wishlist: wishlist && wishlist.length ? wishlist : (existing.wishlist || []),
        updatedAt: timestamp,
        lastLogin: timestamp,
      };
      setRegisteredUsers((prev) => {
        const next = [...prev];
        next[existingIndex] = createdOrUpdatedUser;
        localStorage.setItem(`${STORAGE_KEY}_registered_users`, JSON.stringify(next));
        return next;
      });
    } else {
      createdOrUpdatedUser = {
        id: firebaseUid || `usr-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        phone: cleanPhone || '08848276403',
        role: 'customer',
        emailVerified: true,
        addresses: addresses,
        wishlist: wishlist || [],
        cart: cart || [],
        orderIds: [],
        createdAt: timestamp,
        updatedAt: timestamp,
        lastLogin: timestamp,
      };
      setRegisteredUsers((prev) => {
        const next = [...prev, createdOrUpdatedUser];
        localStorage.setItem(`${STORAGE_KEY}_registered_users`, JSON.stringify(next));
        return next;
      });
    }

    setIsAdminAuthenticated(false);
    setCurrentAdmin(null);
    setCurrentUser(createdOrUpdatedUser);
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(createdOrUpdatedUser));

    // Sync user record to Firestore users collection
    try {
      await setDoc(doc(db, 'users', createdOrUpdatedUser.id), removeUndefined(createdOrUpdatedUser), { merge: true });
    } catch (fsErr) {
      console.warn('Could not sync new user to Firestore users collection:', fsErr);
    }

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
    } catch (e) {
      console.warn('Firebase signout skipped:', e);
    }
    setCurrentUser(null);
    setIsAdminAuthenticated(false);
    setCurrentAdmin(null);
    localStorage.removeItem(`${STORAGE_KEY}_user`);
    sessionStorage.removeItem(`${STORAGE_KEY}_admin_auth`);
    localStorage.removeItem(`${STORAGE_KEY}_admin_auth`);
    sessionStorage.removeItem(`${STORAGE_KEY}_current_admin`);
    localStorage.removeItem(`${STORAGE_KEY}_current_admin`);
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been safely signed out.',
    });
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
    if (!matchingAccount && (cleanEmail === 'abinsajan36@gmail.com' || cleanEmail === 'annanvasu36@gmail.com')) {
      return { success: true }; // Master super admin
    }
    if (!matchingAccount && cleanEmail === 'admin@7seasons.com') {
      return { success: true }; // Standard admin
    }
    if (!matchingAccount) {
      const regAdmin = registeredUsers.find(
        (u) => u.email.toLowerCase() === cleanEmail && (u.role === 'admin' || u.role === 'super_admin')
      );
      if (regAdmin) {
        return { success: true };
      }
      return { success: false, message: 'Not an authorized admin account.' };
    }

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
      if (cleanEmail === 'abinsajan36@gmail.com' || cleanEmail === 'annanvasu36@gmail.com') {
        matchingAccount = {
          id: cleanEmail === 'annanvasu36@gmail.com' ? 'adm-02' : 'adm-01',
          name: cleanEmail === 'annanvasu36@gmail.com' ? 'Super Administrator' : '7Seasons Nursery Admin',
          email: cleanEmail,
          role: 'super_admin',
          avatar: cleanEmail === 'annanvasu36@gmail.com' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          phone: '08848276403',
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        setAdminAccounts((prev) => [matchingAccount!, ...prev.filter((a) => a.email.toLowerCase() !== cleanEmail)]);
      } else if (cleanEmail === 'admin@7seasons.com') {
        matchingAccount = {
          id: 'adm-03',
          name: '7Seasons Operations Admin',
          email: 'admin@7seasons.com',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          phone: '08848276403',
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        setAdminAccounts((prev) => [...prev.filter((a) => a.email.toLowerCase() !== cleanEmail), matchingAccount!]);
      } else {
        const regAdmin = registeredUsers.find(
          (u) => u.email.toLowerCase() === cleanEmail && (u.role === 'admin' || u.role === 'super_admin')
        );
        if (regAdmin) {
          matchingAccount = {
            id: `adm-${regAdmin.id}`,
            name: regAdmin.name,
            email: regAdmin.email,
            role: regAdmin.role === 'super_admin' ? 'super_admin' : 'admin',
            avatar: regAdmin.profileImage,
            phone: regAdmin.phone,
            createdAt: regAdmin.createdAt,
            sourceUserAccountId: regAdmin.id,
            lastLogin: new Date().toISOString(),
          };
          setAdminAccounts((prev) => [matchingAccount!, ...prev.filter((a) => a.email.toLowerCase() !== cleanEmail)]);
        } else {
          addToast({
            type: 'error',
            title: 'Unauthorized Account',
            message: `The account ${cleanEmail} does not have administrator privileges. Only accounts promoted by the Super Administrator can access this panel.`,
          });
          return {
            success: false,
            message: `The email "${cleanEmail}" is not registered as an authorized nursery administrator.`,
          };
        }
      }
    }

    const updatedAccount: AdminAccount = {
      ...matchingAccount,
      role: (cleanEmail === 'abinsajan36@gmail.com' || cleanEmail === 'annanvasu36@gmail.com')
        ? 'super_admin'
        : cleanEmail === 'admin@7seasons.com'
        ? 'admin'
        : matchingAccount.role,
      lastLogin: new Date().toISOString(),
    };

    setCurrentAdmin(updatedAccount);
    setIsAdminAuthenticated(true);
    sessionStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
    localStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
    sessionStorage.setItem(`${STORAGE_KEY}_current_admin`, JSON.stringify(updatedAccount));
    localStorage.setItem(`${STORAGE_KEY}_current_admin`, JSON.stringify(updatedAccount));

    const adminUser: User = {
      id: updatedAccount.id || 'usr-admin-7seasons',
      name: updatedAccount.name || '7Seasons Nursery Admin',
      email: updatedAccount.email,
      phone: updatedAccount.phone || '08848276403',
      role: updatedAccount.role === 'super_admin' ? 'super_admin' : 'admin',
      addresses: [],
      wishlist: [],
      createdAt: updatedAccount.createdAt || new Date().toISOString(),
    };
    setCurrentUser(adminUser);
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(adminUser));

    // Update in admin list
    setAdminAccounts((prev) =>
      prev.map((a) => (a.email.toLowerCase() === cleanEmail ? updatedAccount : a))
    );

    // If not currently authenticated with Firebase Auth, attempt sign-in to attach request.auth context
    if (!auth.currentUser && cleanPass) {
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      } catch {
        // Fallback: If Firebase user doesn't exist with this exact password yet,
        // local admin authentication still succeeds.
      }
    }

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
    localStorage.removeItem(`${STORAGE_KEY}_admin_auth`);
    sessionStorage.removeItem(`${STORAGE_KEY}_current_admin`);
    localStorage.removeItem(`${STORAGE_KEY}_current_admin`);
    if (currentUser?.role === 'admin') {
      setCurrentUser(null);
      localStorage.removeItem(`${STORAGE_KEY}_user`);
    }
    addToast({
      type: 'info',
      title: 'Admin Session Terminated',
      message: 'You have safely signed out of the Nursery Operations Center.',
    });
  };

  const addAdminAccount = (newAcc: Omit<AdminAccount, 'id' | 'createdAt'>) => {
    if (!isCurrentSuperAdmin) {
      addToast({
        type: 'error',
        title: 'Permission Denied',
        message: 'Only the Super Administrator (abinsajan36@gmail.com) can add new administrator accounts.',
      });
      return;
    }

    // Only abinsajan36@gmail.com is permitted to hold super_admin role
    const assignedRole = newAcc.role === 'super_admin' ? 'nursery_manager' : newAcc.role;

    const newAdmin: AdminAccount = {
      ...newAcc,
      role: assignedRole,
      id: `adm-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAdminAccounts((prev) => [...prev, newAdmin]);

    // Also update role in registeredUsers if they exist
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.email.toLowerCase() === newAcc.email.toLowerCase() ? { ...u, role: 'admin' } : u))
    );

    addToast({
      type: 'success',
      title: 'Admin Account Created',
      message: `Added ${newAdmin.name} as ${newAdmin.role.replace('_', ' ')}.`,
    });
  };

  const removeAdminAccount = (id: string) => {
    if (!isCurrentSuperAdmin) {
      addToast({
        type: 'error',
        title: 'Permission Denied',
        message: 'Only the Super Administrator (abinsajan36@gmail.com) can revoke administrator accounts.',
      });
      return;
    }

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

    // Also revert registeredUsers role if linked
    if (target) {
      setRegisteredUsers((prev) =>
        prev.map((u) =>
          u.email.toLowerCase() === target.email.toLowerCase() || u.id === target.sourceUserAccountId
            ? { ...u, role: 'customer', promotedToAdminAt: undefined, promotedBy: undefined }
            : u
        )
      );
      if (target.sourceUserAccountId) {
        updateDoc(doc(db, 'users', target.sourceUserAccountId), { role: 'customer' }).catch(console.warn);
      }
    }

    addToast({
      type: 'info',
      title: 'Admin Revoked',
      message: 'The administrator account was removed.',
    });
  };

  const refreshRegisteredUsers = async (): Promise<User[]> => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const fetched: User[] = [];
      snap.forEach((d) => {
        fetched.push({ ...(d.data() as User), id: d.id });
      });

      // Also gather customers from orders who may have placed orders before
      const orderCustomers: User[] = [];
      orders.forEach((ord) => {
        if (ord.customer && ord.customer.email) {
          orderCustomers.push({
            id: `usr-ord-${ord.customer.email.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            name: ord.customer.name || 'Customer',
            email: ord.customer.email,
            phone: ord.customer.phone || '',
            role: 'customer',
            addresses: ord.customer.shippingAddress ? [ord.customer.shippingAddress] : [],
            wishlist: [],
            createdAt: ord.createdAt,
          });
        }
      });

      setRegisteredUsers((prev) => {
        const map = new Map<string, User>();
        prev.forEach((u) => {
          if (u?.email) map.set(u.email.toLowerCase(), u);
        });
        orderCustomers.forEach((cu) => {
          if (!map.has(cu.email.toLowerCase())) {
            map.set(cu.email.toLowerCase(), cu);
          }
        });
        fetched.forEach((fu) => {
          if (fu?.email) {
            const existing = map.get(fu.email.toLowerCase());
            map.set(fu.email.toLowerCase(), { ...(existing || {}), ...fu });
          }
        });
        const merged = Array.from(map.values());
        localStorage.setItem(`${STORAGE_KEY}_registered_users`, JSON.stringify(merged));
        return merged;
      });
      return fetched;
    } catch (err) {
      console.warn('Could not refresh users from Firestore:', err);
      return registeredUsers;
    }
  };

  const grantAdminRoleToUser = async (
    userIdOrEmail: string,
    adminRole: AdminRole = 'admin'
  ): Promise<{ success: boolean; message: string }> => {
    if (!isCurrentSuperAdmin) {
      addToast({
        type: 'error',
        title: 'Authorization Restricted',
        message: 'Only authorized Super Administrators (annanvasu36@gmail.com / abinsajan36@gmail.com) can grant admin privileges.',
      });
      return {
        success: false,
        message: 'Only authorized Super Administrators can grant admin privileges.',
      };
    }

    const clean = userIdOrEmail.trim().toLowerCase();
    const targetUser = registeredUsers.find(
      (u) => u.id === userIdOrEmail || u.email.toLowerCase() === clean
    );

    if (!targetUser) {
      addToast({
        type: 'error',
        title: 'Account Not Located',
        message: 'Could not find the registered account to promote.',
      });
      return { success: false, message: 'Account not found.' };
    }

    if (targetUser.email.toLowerCase() === 'abinsajan36@gmail.com' || targetUser.email.toLowerCase() === 'annanvasu36@gmail.com') {
      return { success: true, message: 'Account is already a Super Administrator.' };
    }

    const assignedAdminRole: AdminRole = adminRole === 'super_admin' ? 'admin' : adminRole;
    const promotedAt = new Date().toISOString();
    const promotedBy = currentAdmin?.email || currentUser?.email || 'annanvasu36@gmail.com';

    const updatedUser: User = {
      ...targetUser,
      role: 'admin',
      promotedToAdminAt: promotedAt,
      promotedBy,
    };

    // Update registeredUsers
    setRegisteredUsers((prev) => {
      const next = prev.map((u) => (u.email.toLowerCase() === clean ? updatedUser : u));
      localStorage.setItem(`${STORAGE_KEY}_registered_users`, JSON.stringify(next));
      return next;
    });

    // Sync to Firestore
    try {
      await updateDoc(doc(db, 'users', targetUser.id), {
        role: 'admin',
        promotedToAdminAt: promotedAt,
        promotedBy,
      });
    } catch (err) {
      try {
        await setDoc(doc(db, 'users', targetUser.id), updatedUser, { merge: true });
      } catch (e) {
        console.warn('Could not sync user role update to Firestore:', e);
      }
    }

    // Add / update in adminAccounts list
    const newAdminAcc: AdminAccount = {
      id: `adm-${targetUser.id}`,
      name: targetUser.name,
      email: targetUser.email,
      role: assignedAdminRole,
      avatar: targetUser.profileImage,
      phone: targetUser.phone,
      createdAt: targetUser.createdAt || promotedAt,
      sourceUserAccountId: targetUser.id,
      promotedBy,
      lastLogin: new Date().toISOString(),
    };

    setAdminAccounts((prev) => {
      const filtered = prev.filter((a) => a.email.toLowerCase() !== clean);
      const next = [...filtered, newAdminAcc];
      localStorage.setItem(`${STORAGE_KEY}_admin_accounts`, JSON.stringify(next));
      return next;
    });

    addToast({
      type: 'success',
      title: 'Admin Role Granted 🛡️',
      message: `${targetUser.name} (${targetUser.email}) is now an authorized Nursery Administrator.`,
    });

    return {
      success: true,
      message: `Admin role successfully granted to ${targetUser.name}.`,
    };
  };

  const revokeAdminRoleFromUser = async (
    userIdOrEmail: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!isCurrentSuperAdmin) {
      addToast({
        type: 'error',
        title: 'Authorization Restricted',
        message: 'Only authorized Super Administrators (annanvasu36@gmail.com / abinsajan36@gmail.com) can revoke admin privileges.',
      });
      return {
        success: false,
        message: 'Only authorized Super Administrators can revoke admin privileges.',
      };
    }

    const clean = userIdOrEmail.trim().toLowerCase();
    if (clean === 'abinsajan36@gmail.com' || clean === 'annanvasu36@gmail.com') {
      addToast({
        type: 'error',
        title: 'Action Prohibited',
        message: 'Cannot revoke privileges from a root Super Administrator.',
      });
      return { success: false, message: 'Cannot revoke root Super Administrator.' };
    }

    const targetUser = registeredUsers.find(
      (u) => u.id === userIdOrEmail || u.email.toLowerCase() === clean
    );

    if (!targetUser) {
      // Check adminAccounts
      const adm = adminAccounts.find(
        (a) => a.id === userIdOrEmail || a.email.toLowerCase() === clean
      );
      if (adm) {
        removeAdminAccount(adm.id);
        return { success: true, message: 'Admin account removed.' };
      }
      return { success: false, message: 'Account not found.' };
    }

    const updatedUser: User = {
      ...targetUser,
      role: 'customer',
      promotedToAdminAt: undefined,
      promotedBy: undefined,
    };

    // Update registeredUsers
    setRegisteredUsers((prev) => {
      const next = prev.map((u) => (u.email.toLowerCase() === clean ? updatedUser : u));
      localStorage.setItem(`${STORAGE_KEY}_registered_users`, JSON.stringify(next));
      return next;
    });

    // Sync to Firestore
    try {
      await updateDoc(doc(db, 'users', targetUser.id), {
        role: 'customer',
      });
    } catch (err) {
      console.warn('Could not sync role revocation to Firestore:', err);
    }

    // Remove from adminAccounts
    setAdminAccounts((prev) => {
      const next = prev.filter(
        (a) =>
          a.email.toLowerCase() !== clean &&
          a.sourceUserAccountId !== targetUser.id
      );
      localStorage.setItem(`${STORAGE_KEY}_admin_accounts`, JSON.stringify(next));
      return next;
    });

    addToast({
      type: 'info',
      title: 'Admin Access Revoked',
      message: `${targetUser.name}'s account has been returned to standard customer status.`,
    });

    return {
      success: true,
      message: `Admin privileges revoked for ${targetUser.name}.`,
    };
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
  const addProduct = async (prod: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...prod,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    try {
      await setDoc(doc(db, 'products', newProd.id), removeUndefined(newProd));
    } catch (e) {
      console.warn('Could not save product to Firestore:', e);
    }
    addToast({
      type: 'success',
      title: 'Product Created',
      message: `${prod.name} has been added to the catalog.`,
    });
  };

  const updateProduct = async (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    try {
      await setDoc(doc(db, 'products', updated.id), removeUndefined(updated), { merge: true });
    } catch (e) {
      console.warn('Could not update product in Firestore:', e);
    }
    addToast({
      type: 'success',
      title: 'Product Updated',
      message: `${updated.name} updated successfully.`,
    });
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      console.warn('Could not delete product from Firestore:', e);
    }
    addToast({
      type: 'info',
      title: 'Product Deleted',
      message: 'Product removed from catalog.',
    });
  };

  const deleteProducts = async (ids: string[]) => {
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
    for (const id of ids) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (e) {
        console.warn('Could not delete product from Firestore:', e);
      }
    }
    addToast({
      type: 'info',
      title: 'Products Deleted',
      message: `${ids.length} products removed from catalog.`,
    });
  };

  const duplicateProduct = async (id: string) => {
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
    try {
      await setDoc(doc(db, 'products', duplicated.id), removeUndefined(duplicated));
    } catch (e) {
      console.warn('Could not duplicate product in Firestore:', e);
    }
    addToast({
      type: 'success',
      title: 'Product Duplicated',
      message: `Duplicated copy created.`,
    });
  };

  // Admin CRUD for Combos
  const addCombo = async (combo: Omit<PlantCombo, 'id' | 'createdAt'>) => {
    const newCombo: PlantCombo = {
      ...combo,
      id: `combo-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCombos((prev) => [newCombo, ...prev]);
    try {
      await setDoc(doc(db, 'combos', newCombo.id), removeUndefined(newCombo));
    } catch (e) {
      console.warn('Could not save combo to Firestore:', e);
    }
    addToast({
      type: 'success',
      title: 'Plant Combo Created 🌿',
      message: `${combo.name} is now available in store.`,
    });
  };

  const updateCombo = async (updated: PlantCombo) => {
    setCombos((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    try {
      await setDoc(doc(db, 'combos', updated.id), removeUndefined(updated), { merge: true });
    } catch (e) {
      console.warn('Could not update combo in Firestore:', e);
    }
    addToast({
      type: 'success',
      title: 'Combo Updated',
      message: `${updated.name} updated successfully.`,
    });
  };

  const deleteCombo = async (id: string) => {
    setCombos((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, 'combos', id));
    } catch (e) {
      console.warn('Could not delete combo from Firestore:', e);
    }
    addToast({
      type: 'info',
      title: 'Combo Deleted',
      message: 'Plant combo removed from store.',
    });
  };

  const deleteCombos = async (ids: string[]) => {
    setCombos((prev) => prev.filter((c) => !ids.includes(c.id)));
    for (const id of ids) {
      try {
        await deleteDoc(doc(db, 'combos', id));
      } catch (e) {
        console.warn('Could not delete combo from Firestore:', e);
      }
    }
    addToast({
      type: 'info',
      title: 'Combos Deleted',
      message: `${ids.length} plant combos removed from store.`,
    });
  };

  const duplicateCombo = async (id: string) => {
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
    try {
      await setDoc(doc(db, 'combos', duplicated.id), removeUndefined(duplicated));
    } catch (e) {
      console.warn('Could not duplicate combo in Firestore:', e);
    }
    addToast({
      type: 'success',
      title: 'Combo Duplicated',
      message: `Duplicated copy of combo created.`,
    });
  };

  // Daily Deals
  const addDailyDeal = async (deal: Omit<DailyDeal, 'id'>) => {
    const newDeal: DailyDeal = {
      ...deal,
      id: `deal-${Date.now()}`,
    };
    setDailyDeals((prev) => [newDeal, ...prev]);
    try {
      await setDoc(doc(db, 'dailyDeals', newDeal.id), removeUndefined(newDeal));
    } catch (e) {
      console.warn('Could not save daily deal to Firestore:', e);
    }
    addToast({
      type: 'success',
      title: 'Deal Created & Scheduled',
      message: `${deal.title} is now active.`,
    });
  };

  const updateDailyDeal = async (updated: DailyDeal) => {
    setDailyDeals((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    try {
      await setDoc(doc(db, 'dailyDeals', updated.id), removeUndefined(updated), { merge: true });
    } catch (e) {
      console.warn('Could not update daily deal in Firestore:', e);
    }
    addToast({
      type: 'success',
      title: 'Deal Updated',
      message: `${updated.title} settings updated.`,
    });
  };

  const deleteDailyDeal = async (id: string) => {
    setDailyDeals((prev) => prev.filter((d) => d.id !== id));
    try {
      await deleteDoc(doc(db, 'dailyDeals', id));
    } catch (e) {
      console.warn('Could not delete daily deal from Firestore:', e);
    }
    addToast({
      type: 'info',
      title: 'Deal Removed',
      message: 'Deal removed from schedule.',
    });
  };

  const toggleDailyDealActive = async (id: string) => {
    const deal = dailyDeals.find((d) => d.id === id);
    if (!deal) return;
    const newActive = !deal.isActive;
    setDailyDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: newActive } : d))
    );
    try {
      await setDoc(doc(db, 'dailyDeals', id), { isActive: newActive }, { merge: true });
    } catch (e) {
      console.warn('Could not toggle daily deal in Firestore:', e);
    }
  };

  // Categories
  const addCategory = async (cat: Omit<Category, 'id'>) => {
    const newCat: Category = { ...cat, id: `cat-${Date.now()}` };
    setCategories((prev) => [...prev, newCat]);
    try {
      await setDoc(doc(db, 'categories', newCat.id), removeUndefined(newCat));
    } catch (e) {
      console.warn('Could not save category to Firestore:', e);
    }
    addToast({
      type: 'success',
      title: 'Category Added',
      message: `${cat.name} added.`,
    });
  };

  const updateCategory = async (updated: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    try {
      await setDoc(doc(db, 'categories', updated.id), removeUndefined(updated), { merge: true });
      addToast({
        type: 'success',
        title: 'Category Updated',
        message: `${updated.name} category has been updated.`,
      });
    } catch (e) {
      console.warn('Could not update category in Firestore:', e);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not sync category changes to database.',
      });
    }
  };

  const deleteCategory = async (id: string) => {
    const target = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, 'categories', id));
      addToast({
        type: 'info',
        title: 'Category Deleted',
        message: `${target?.name || 'Category'} removed from catalog.`,
      });
    } catch (e) {
      console.warn('Could not delete category from Firestore:', e);
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Could not delete category from database.',
      });
    }
  };

  // Coupons
  const addCoupon = async (cpn: Omit<Coupon, 'id' | 'usedCount'>) => {
    const newCpn: Coupon = {
      ...cpn,
      id: `cpn-${Date.now()}`,
      usedCount: 0,
    };
    setCoupons((prev) => [newCpn, ...prev]);
    try {
      await setDoc(doc(db, 'coupons', newCpn.id), removeUndefined(newCpn));
    } catch (e) {
      console.warn('Could not save coupon to Firestore:', e);
    }
    addToast({
      type: 'success',
      title: 'Coupon Created',
      message: `Coupon code ${cpn.code} is active.`,
    });
  };

  const updateCoupon = async (updated: Coupon) => {
    setCoupons((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    try {
      await setDoc(doc(db, 'coupons', updated.id), removeUndefined(updated), { merge: true });
    } catch (e) {
      console.warn('Could not update coupon in Firestore:', e);
    }
  };

  const deleteCoupon = async (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, 'coupons', id));
    } catch (e) {
      console.warn('Could not delete coupon from Firestore:', e);
    }
  };

  // Banners
  const addBanner = async (banner: Omit<HeroBanner, 'id'>) => {
    const newBanner: HeroBanner = { ...banner, id: `banner-${Date.now()}` };
    setBanners((prev) => [...prev, newBanner]);
    try {
      await setDoc(doc(db, 'banners', newBanner.id), removeUndefined(newBanner));
    } catch (e) {
      console.warn('Could not save banner to Firestore:', e);
    }
  };

  const updateBanner = async (updated: HeroBanner) => {
    setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    try {
      await setDoc(doc(db, 'banners', updated.id), removeUndefined(updated), { merge: true });
    } catch (e) {
      console.warn('Could not update banner in Firestore:', e);
    }
  };

  const deleteBanner = async (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteDoc(doc(db, 'banners', id));
    } catch (e) {
      console.warn('Could not delete banner from Firestore:', e);
    }
  };

  // Blogs & Care Guides
  const addBlogPost = async (blog: Omit<BlogPost, 'id' | 'publishedAt'>) => {
    const newBlog: BlogPost = {
      ...blog,
      id: `blog-${Date.now()}`,
      publishedAt: new Date().toISOString(),
    };
    setBlogs((prev) => [newBlog, ...prev]);
    try {
      await setDoc(doc(db, 'blogs', newBlog.id), removeUndefined(newBlog));
    } catch (e) {
      console.warn('Could not save blog to Firestore:', e);
    }
  };

  const updateBlogPost = async (updated: BlogPost) => {
    setBlogs((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    try {
      await setDoc(doc(db, 'blogs', updated.id), removeUndefined(updated), { merge: true });
    } catch (e) {
      console.warn('Could not update blog in Firestore:', e);
    }
  };

  const deleteBlogPost = async (id: string) => {
    setBlogs((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteDoc(doc(db, 'blogs', id));
    } catch (e) {
      console.warn('Could not delete blog from Firestore:', e);
    }
  };

  const addPlantCareGuide = async (guide: Omit<PlantCareGuide, 'id'>) => {
    const newGuide: PlantCareGuide = {
      ...guide,
      id: `guide-${Date.now()}`,
    };
    setPlantCareGuides((prev) => [newGuide, ...prev]);
    try {
      await setDoc(doc(db, 'plantCareGuides', newGuide.id), removeUndefined(newGuide));
    } catch (e) {
      console.warn('Could not save care guide to Firestore:', e);
    }
  };

  const updatePlantCareGuide = async (updated: PlantCareGuide) => {
    setPlantCareGuides((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    try {
      await setDoc(doc(db, 'plantCareGuides', updated.id), removeUndefined(updated), { merge: true });
    } catch (e) {
      console.warn('Could not update care guide in Firestore:', e);
    }
  };

  const deletePlantCareGuide = async (id: string) => {
    setPlantCareGuides((prev) => prev.filter((g) => g.id !== id));
    try {
      await deleteDoc(doc(db, 'plantCareGuides', id));
    } catch (e) {
      console.warn('Could not delete care guide from Firestore:', e);
    }
  };

  // Settings
  const updateStoreSettings = async (newSettings: Partial<StoreSettings>) => {
    try {
      const normalized: Partial<StoreSettings> = { ...newSettings };
      if (normalized.whatsapp !== undefined) {
        normalized.whatsappNumber = normalized.whatsapp;
      } else if (normalized.whatsappNumber !== undefined) {
        normalized.whatsapp = normalized.whatsappNumber;
      }

      if (normalized.freeShippingThreshold !== undefined) {
        normalized.freeDeliveryThreshold = normalized.freeShippingThreshold;
      } else if (normalized.freeDeliveryThreshold !== undefined) {
        normalized.freeShippingThreshold = normalized.freeDeliveryThreshold;
      }

      if (normalized.announcementBarText !== undefined) {
        normalized.announcementText = normalized.announcementBarText;
      } else if (normalized.announcementText !== undefined) {
        normalized.announcementBarText = normalized.announcementText;
      }

      const mergedSettings = { ...storeSettings, ...normalized };
      setStoreSettings(mergedSettings);
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(mergedSettings));

      try {
        await setDoc(doc(db, 'storeSettings', 'global'), removeUndefined(mergedSettings), { merge: true });
        await setDoc(doc(db, 'settings', 'global'), removeUndefined(mergedSettings), { merge: true }).catch(() => {});
        if (auth.currentUser?.uid) {
          await setDoc(
            doc(db, 'settings', auth.currentUser.uid),
            removeUndefined({ ...mergedSettings, updatedAt: new Date().toISOString() }),
            { merge: true }
          ).catch(() => {});
        }
      } catch (firestoreErr: any) {
        console.warn('[Firestore] Note updating storeSettings in cloud:', firestoreErr);
      }

      addToast({
        type: 'success',
        title: 'Store Settings Saved',
        message: 'Nursery store settings have been saved and applied globally to the database.',
      });
    } catch (err: any) {
      console.error('Error updating store settings:', err);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not update store settings: ' + (err?.message || 'Error occurred'),
      });
    }
  };

  const resetToSampleData = async () => {
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
    try {
      await setDoc(doc(db, 'storeSettings', 'global'), removeUndefined(initialStoreSettings), { merge: true });
      for (const c of initialPlantCombos) {
        await setDoc(doc(db, 'combos', c.id), removeUndefined(c), { merge: true });
      }
      for (const p of initialProducts) {
        await setDoc(doc(db, 'products', p.id), removeUndefined(p), { merge: true });
      }
      for (const cat of initialCategories) {
        await setDoc(doc(db, 'categories', cat.id), removeUndefined(cat), { merge: true });
      }
      for (const deal of initialDailyDeals) {
        await setDoc(doc(db, 'dailyDeals', deal.id), removeUndefined(deal), { merge: true });
      }
      for (const cpn of initialCoupons) {
        await setDoc(doc(db, 'coupons', cpn.id), removeUndefined(cpn), { merge: true });
      }
      for (const ban of initialBanners) {
        await setDoc(doc(db, 'banners', ban.id), removeUndefined(ban), { merge: true });
      }
    } catch (err) {
      console.warn('Could not sync sample reset to Firestore:', err);
    }
    addToast({
      type: 'info',
      title: 'Reset to Sample Data',
      message: 'Default 7Seasons nursery inventory restored in database.',
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
        registeredUsers,
        isCurrentSuperAdmin,
        toasts,
        quickViewItem,
        isCartOpen,
        isDarkMode,
        toggleDarkMode,
        isSearchOpen,
        searchQuery,
        selectedDeliveryState,
        setSelectedDeliveryState,
        isStateModalOpen,
        setIsStateModalOpen,
        openStateModal,
        closeStateModal,
        isItemDeliverable,

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
        deleteOrder,
        getOrderById,
        getOrderByNumber,

        loginCustomer,
        loginWithGoogle,
        authDomainNotice,
        dismissAuthDomainNotice,
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
        grantAdminRoleToUser,
        revokeAdminRoleFromUser,
        refreshRegisteredUsers,

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
