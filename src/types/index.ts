export type PlantLight = string;
export type PlantWater = string;
export type PlantDifficulty = 'Beginner Friendly' | 'Easy' | 'Moderate' | 'Advanced' | string;
export type PlantPlacement = 'Living Room' | 'Bedroom' | 'Balcony' | 'Office Desk' | 'Bathroom' | 'Outdoor Garden' | string;

export interface ProductAttribute {
  light: PlantLight;
  water: PlantWater;
  difficulty: PlantDifficulty;
  placement?: PlantPlacement;
  plantHeight?: string;
  potSize?: string;
  potIncluded?: boolean;
  airPurifying: boolean;
  petFriendly: boolean;
  flowering?: boolean;
  growthRate?: 'Slow' | 'Moderate' | 'Fast' | string;
  location?: string;
  fertilizer?: string;
}

export type CareInstructions = string | {
  overview?: string;
  light?: string;
  water?: string;
  soil?: string;
  fertilizer?: string;
  temperature?: string;
  humidity?: string;
  commonProblems?: Array<{
    problem: string;
    solution: string;
  }>;
};

export interface Product {
  id: string;
  name: string;
  slug: string;
  botanicalName?: string;
  shortDescription: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  stock: number;
  weight?: number;
  sku: string;
  images: string[];
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  isDealOfTheDay?: boolean;
  potIncluded?: boolean;
  status?: 'published' | 'draft' | 'scheduled' | string;
  tags: string[];
  sellableStates?: string[];
  attributes: ProductAttribute;
  careInstructions: CareInstructions;
  createdAt: string;
}

export interface ComboItem {
  productId: string;
  productName: string;
  productSlug?: string;
  quantity: number;
  image: string;
  itemType: 'plant' | 'pot' | 'guide' | 'accessory' | 'fertilizer';
  priceShare?: number;
  itemPrice?: number;
  notes?: string;
}

export interface PlantCombo {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  price: number;
  originalPrice: number;
  savings: number;
  discountPercentage: number;
  stock: number;
  weight?: number;
  sku: string;
  images: string[];
  maxImages?: number;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  tags: string[];
  items: ComboItem[];
  sellableStates?: string[];
  careSummary: string;
  benefits: string[];
  deliveryInfo?: string;
  maxQuantityPerOrder?: number;
  status: 'published' | 'draft' | 'scheduled';
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
  isFeatured?: boolean;
  displayOrder: number;
  type: 'plant' | 'combo' | 'both';
}

export interface DailyDeal {
  id: string;
  title: string;
  subtitle: string;
  targetType: 'product' | 'combo';
  targetId: string;
  dealPrice: number;
  originalPrice: number;
  discountPercentage: number;
  savings: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isActive: boolean;
  badge: string;
  bannerImage?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
  applicableCategories?: string[];
  applicableCombosOnly?: boolean;
}

export interface CartItem {
  id: string; // product/combo ID
  type: 'product' | 'combo';
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  stock: number;
  weight?: number;
  comboItems?: ComboItem[];
  selectedPotColor?: string;
}

export interface CustomerAddress {
  id: string;
  fullName: string;
  phoneNumber: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  street?: string;
  landmark?: string;
  nearbyLandmark?: string;
  city: string;
  district: string;
  state: 'Kerala' | 'Tamil Nadu' | 'Karnataka' | string;
  pincode: string;
  isDefault?: boolean;
}

export interface OrderItem {
  id: string;
  type: 'product' | 'combo';
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
  comboContentsSummary?: string;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Payment Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Payment Failed';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    shippingAddress: CustomerAddress;
  };
  shippingAddress?: CustomerAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  total: number;
  totalAmount?: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'razorpay' | 'razorpay_test' | 'UPI QR' | 'UPI ID' | 'Net Banking' | 'offline';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  source?: 'online' | 'offline';
  orderStatus: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  trackingNumber?: string;
  courierPartner?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CourierServiceOption {
  id: string;
  name: string;
  displayName: string;
  badge?: string;
  deliveryTime: string;
  description: string;
  trackingUrlPattern?: string;
}

export const COURIER_SERVICES: CourierServiceOption[] = [
  {
    id: 'speed-post',
    name: 'Speed Post',
    displayName: 'Speed Post (India Post)',
    badge: 'Pan-India Fast Postal',
    deliveryTime: '2 - 4 Business Days',
    description: 'High-speed express postal delivery of India Post reaching every pin code, rural town & metro city.',
    trackingUrlPattern: 'https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx',
  },
  {
    id: 'india-post',
    name: 'India Post',
    displayName: 'India Post (Standard Parcel)',
    badge: 'Pan-India & Deep Rural',
    deliveryTime: '3 - 6 Business Days',
    description: 'National postal service delivering safely to every pincode across Kerala, South India & pan-India.',
    trackingUrlPattern: 'https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx',
  },
  {
    id: 'dtdc',
    name: 'DTDC',
    displayName: 'DTDC Express Courier',
    badge: 'Fast Express Tracking',
    deliveryTime: '2 - 3 Business Days',
    description: 'Nationwide express courier partner with doorstep delivery and prompt SMS / online tracking.',
    trackingUrlPattern: 'https://www.dtdc.in/tracking.asp',
  },
  {
    id: 'professional-courier',
    name: 'Professional Courier',
    displayName: 'The Professional Couriers (TPC)',
    badge: 'Reliable Regional Network',
    deliveryTime: '2 - 4 Business Days',
    description: 'Extensive regional network with careful handling for delicate nursery plant packages.',
    trackingUrlPattern: 'https://www.tpcindia.com',
  },
];

export type AdminRole = 'super_admin' | 'admin' | 'nursery_manager' | 'inventory_staff';
export type UserRole = 'customer' | 'admin' | 'super_admin';

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  phone?: string;
  lastLogin?: string;
  createdAt: string;
  sourceUserAccountId?: string;
  promotedBy?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  profileImage?: string;
  role: UserRole;
  emailVerified?: boolean;
  addresses: CustomerAddress[];
  wishlist: string[]; // item IDs
  cart?: CartItem[];
  orderIds?: string[];
  pastOrders?: Order[];
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
  promotedToAdminAt?: string;
  promotedBy?: string;
}

export interface Review {
  id: string;
  targetId: string;
  targetType: 'product' | 'combo';
  targetName: string;
  customerName: string;
  userName?: string;
  customerEmail: string;
  customerLocation?: string;
  location?: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  isVerifiedBuyer?: boolean;
  status: 'approved' | 'pending' | 'hidden';
  isApproved?: boolean;
  createdAt: string;
}

export interface PlantCareGuide {
  id: string;
  plantName: string;
  slug: string;
  botanicalName: string;
  heroImage: string;
  category: string;
  difficulty: PlantDifficulty;
  lightGuidance: string;
  waterGuidance: string;
  soilGuidance: string;
  fertilizerGuidance: string;
  temperatureGuidance: string;
  humidityGuidance: string;
  commonProblems: Array<{
    problem: string;
    solution: string;
  }>;
  beginnerTips: string[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  coverImage: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  readTimeMinutes: number;
  publishedAt: string;
  isPublished: boolean;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface InstagramReel {
  id: string;
  title: string;
  reelUrl: string;
  embedUrl?: string;
  videoUrl?: string;
  thumbnailUrl: string;
  caption: string;
  likesCount?: number;
  viewsCount?: string;
  date?: string;
  displayOrder?: number;
  isActive: boolean;
  featuredOnBlog?: boolean;
  createdAt: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl: string;
  bgColor?: string;
  textColor?: string;
  displayOrder: number;
  isActive: boolean;
}

export type CourierRatesByState = Record<string, Record<string, number>>;

export function getCourierRatePerKg(
  courierRates: CourierRatesByState | undefined,
  courierId: string,
  state: string,
  fallbackRate: number = 80
): number {
  if (!courierRates) return fallbackRate;
  const courierData = courierRates[courierId];
  if (!courierData) return fallbackRate;
  if (typeof courierData[state] === 'number' && !isNaN(courierData[state]) && courierData[state] >= 0) {
    return courierData[state];
  }
  if (typeof courierData['Kerala'] === 'number' && !isNaN(courierData['Kerala']) && courierData['Kerala'] >= 0) {
    return courierData['Kerala'];
  }
  return fallbackRate;
}

export function isCourierEnabledForState(
  enabledCouriersByState: Record<string, Record<string, boolean>> | undefined,
  courierId: string,
  state: string
): boolean {
  if (!enabledCouriersByState || !state || !courierId) return true;
  const targetState = state.trim().toLowerCase();
  const targetCourier = courierId.trim().toLowerCase();

  const matchedStateKey = Object.keys(enabledCouriersByState).find(
    (k) => k.trim().toLowerCase() === targetState
  );
  if (!matchedStateKey) return true;

  const stateConfig = enabledCouriersByState[matchedStateKey];
  if (!stateConfig) return true;

  const matchedCourierKey = Object.keys(stateConfig).find(
    (c) => c.trim().toLowerCase() === targetCourier
  );
  if (matchedCourierKey && typeof stateConfig[matchedCourierKey] === 'boolean') {
    return stateConfig[matchedCourierKey];
  }

  return true;
}

export function getCourierRatePer100g(
  courierRates: CourierRatesByState | undefined,
  courierId: string,
  state: string,
  fallbackRate: number = 80
): number {
  const perKg = getCourierRatePerKg(courierRates, courierId, state, fallbackRate);
  return Math.round((perKg / 10) * 10) / 10;
}

/**
 * Calculates delivery fee for order weight based on configurable weight rounding slabs (in grams):
 * - Rounds the package weight to the next set value (slab in grams, e.g. 1000g, 500g, 250g, 100g)
 * - Minimum billable weight tier is enforced (defaults to 1000g / 1kg base tier)
 */
export function calculateOrderDeliveryCharge(
  weightKg: number,
  ratePerKg: number,
  slabGrams: number = 500,
  minWeightGrams: number = 1000
): number {
  if (weightKg <= 0) return 0;
  const rawGrams = Math.round(weightKg * 1000);
  const effectiveSlab = Math.max(10, Math.round(slabGrams || 500));
  const effectiveMin = Math.max(effectiveSlab, Math.round(minWeightGrams || 1000));

  // Round weight up to the next set slab value
  const roundedGrams = Math.ceil(rawGrams / effectiveSlab) * effectiveSlab;
  const billableGrams = Math.max(effectiveMin, roundedGrams);

  const fee = (billableGrams / 1000) * ratePerKg;
  return Math.round(fee);
}

/**
 * Returns the billable weight in kg after applying the rounding slab and minimum base weight
 */
export function getRoundedBillableWeightKg(
  weightKg: number,
  slabGrams: number = 500,
  minWeightGrams: number = 1000
): number {
  if (weightKg <= 0) return 0;
  const rawGrams = Math.round(weightKg * 1000);
  const effectiveSlab = Math.max(10, Math.round(slabGrams || 500));
  const effectiveMin = Math.max(effectiveSlab, Math.round(minWeightGrams || 1000));
  const roundedGrams = Math.ceil(rawGrams / effectiveSlab) * effectiveSlab;
  const billableGrams = Math.max(effectiveMin, roundedGrams);
  return Number((billableGrams / 1000).toFixed(2));
}

export interface StoreSettings {
  businessName: string;
  tagline: string;
  parentNursery: string;
  phone: string;
  email: string;
  whatsapp: string;
  whatsappNumber?: string;
  instagram: string;
  facebook?: string;
  address: string;
  supportedStates: string[];
  deliveryCharge: number;
  courierRates?: CourierRatesByState;
  enabledCouriersByState?: Record<string, Record<string, boolean>>; // state -> courierId -> boolean (active toggle)
  courierWeightSlabs?: Record<string, number>; // Courier ID -> weight slab in grams (e.g. 1000 for 1kg, 500, 250, 100)
  defaultWeightSlabGrams?: number; // Default slab in grams (e.g. 500 or 1000)
  minBillableWeightGrams?: number; // Minimum base weight in grams (defaults to 1000)
  couriersWithPer100gRate?: string[]; // Backwards compatibility alias
  freeDeliveryEnabled?: boolean;
  freeShippingThreshold: number;
  freeDeliveryThreshold?: number;
  announcementBarText: string;
  announcementText?: string;
  announcementBarActive: boolean;
  announcementLink?: string;
  razorpayKeyId: string;
  razorpayEnabled: boolean;
  menuVisibility?: Record<string, boolean>;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}
