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
  InstagramReel,
  CourierRatesByState,
  TrustBenefitItem,
} from '../types';

export const initialCourierRates: CourierRatesByState = {
  'speed-post': {
    'Kerala': 60,
    'Tamil Nadu': 75,
    'Karnataka': 85,
  },
  'india-post': {
    'Kerala': 50,
    'Tamil Nadu': 65,
    'Karnataka': 75,
  },
  'dtdc': {
    'Kerala': 70,
    'Tamil Nadu': 85,
    'Karnataka': 95,
  },
  'professional-courier': {
    'Kerala': 65,
    'Tamil Nadu': 80,
    'Karnataka': 90,
  },
};

export const initialEnabledCouriersByState: Record<string, Record<string, boolean>> = {
  'Kerala': {
    'speed-post': true,
    'india-post': true,
    'dtdc': true,
    'professional-courier': true,
  },
  'Tamil Nadu': {
    'speed-post': true,
    'india-post': true,
    'dtdc': true,
    'professional-courier': true,
  },
  'Karnataka': {
    'speed-post': true,
    'india-post': true,
    'dtdc': true,
    'professional-courier': true,
  },
};

export const initialTrustBenefits: TrustBenefitItem[] = [
  {
    id: 'benefit-1',
    iconName: 'ShieldCheck',
    title: 'Carefully Selected Plants',
    description: 'Healthy, acclimated specimens nurtured at Mannaratharayil Gardens LLP with robust root systems.',
    color: 'emerald',
  },
  {
    id: 'benefit-2',
    iconName: 'Sparkles',
    title: 'Curated Plant Combos',
    description: 'Expertly paired plant bundles with matching care rhythms and up to 35% bundled savings.',
    color: 'amber',
  },
  {
    id: 'benefit-3',
    iconName: 'Box',
    title: 'Safe 5-Ply Packaging',
    description: 'Ventilated root pods and shock-resistant cartons protect foliage safely during transit.',
    color: 'green',
  },
  {
    id: 'benefit-4',
    iconName: 'Truck',
    title: 'Kerala, Tamil Nadu & Karnataka Shipping',
    description: 'Direct dispatch to all PIN codes across Kerala, Tamil Nadu, and Karnataka in 2-4 business days.',
    color: 'cyan',
  },
  {
    id: 'benefit-5',
    iconName: 'BookOpen',
    title: 'Expert Care Guidance',
    description: 'Free WhatsApp support and our 7Seasons Plant Doctor AI tool.',
    color: 'rose',
  },
];

export const initialStoreSettings: StoreSettings = {
  businessName: '7Seasonsplants',
  tagline: 'Vibrant Plants & Curated Green Combos',
  parentNursery: '7Seasons By Mannaratharayil Gardens LLP',
  phone: '08848276403',
  email: 'mannaratharayil@gmail.com',
  whatsapp: '+91 88482 76403',
  instagram: '@7seasonsplants',
  facebook: 'https://www.facebook.com/7seasonsplants',
  address: 'Mannaratharayil Gardens LLP, Calicut-Palakkad Highway, Kerala, India',
  supportedStates: ['Kerala', 'Tamil Nadu', 'Karnataka'],
  deliveryCharge: 80,
  courierRates: initialCourierRates,
  enabledCouriersByState: initialEnabledCouriersByState,
  defaultWeightSlabGrams: 1000,
  minBillableWeightGrams: 1000,
  courierWeightSlabs: {
    'speed-post': 1000,
    'india-post': 1000,
    'dtdc': 1000,
    'professional-courier': 1000,
  },
  couriersWithPer100gRate: ['india-post'],
  useParcelTariffTable: false,
  freeDeliveryEnabled: false,
  freeShippingThreshold: 899,
  announcementBarText: 'For home delivery choose Speed Post or India Post.',
  announcementText: 'For home delivery choose Speed Post or India Post.',
  announcementBarActive: true,
  announcementLink: '/combos',
  razorpayKeyId: (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || '',
  razorpayEnabled: true,
  menuVisibility: {
    home: true,
    plants: true,
    combos: true,
    plantCare: true,
    blog: true,
    trackOrder: true,
    wishlist: true,
    contact: true,
  },
  trustBenefits: initialTrustBenefits,
};

export const initialCategories: Category[] = [
  {
    id: 'cat-combos',
    name: 'Plant Combos',
    slug: 'plant-combos',
    description: 'Thoughtfully paired botanical bundles with guaranteed savings & complimentary care guides.',
    image: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=800&q=80',
    itemCount: 3,
    isFeatured: true,
    displayOrder: 1,
    type: 'combo',
  },
  {
    id: 'cat-balcony-combos',
    name: 'Balcony Combos',
    slug: 'balcony-combos',
    description: 'Sun-hardy duos and trios designed for tropical Kerala & South Indian balconies.',
    image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=800&q=80',
    itemCount: 2,
    isFeatured: true,
    displayOrder: 2,
    type: 'combo',
  },
  {
    id: 'cat-indoor-combos',
    name: 'Indoor Combos',
    slug: 'indoor-combos',
    description: 'Lush tabletop and bedroom collections curated to purify indoor airspace and uplift corners.',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
    itemCount: 1,
    isFeatured: true,
    displayOrder: 3,
    type: 'combo',
  },
  {
    id: 'cat-flowering',
    name: 'Flowering Plants',
    slug: 'flowering-plants',
    description: 'Vibrant tropical blooms, traditional favorites, and exotic color for gardens and sunny balconies.',
    image: 'https://images.unsplash.com/photo-1603507022069-450f3b06325f?auto=format&fit=crop&w=800&q=80',
    itemCount: 4,
    isFeatured: true,
    displayOrder: 4,
    type: 'plant',
  },
  {
    id: 'cat-indoor',
    name: 'Indoor Plants',
    slug: 'indoor-plants',
    description: 'Lush, shade-tolerant greens tailored for living rooms, bedrooms, and workspace desks.',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
    itemCount: 4,
    isFeatured: true,
    displayOrder: 5,
    type: 'plant',
  },
  {
    id: 'cat-bonsai',
    name: 'Bonsai',
    slug: 'bonsai',
    description: 'Architectural miniature trees sculpted with patience, bringing zen harmony and grandeur.',
    image: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=800&q=80',
    itemCount: 1,
    isFeatured: false,
    displayOrder: 6,
    type: 'plant',
  },
  {
    id: 'cat-indoor-foliage',
    name: 'Indoor Foliage',
    slug: 'indoor-foliage',
    description: 'Exotic textured leaves and tropical statement plants with lush architectural beauty.',
    image: 'https://images.unsplash.com/photo-1620127394144-8848416d86fb?auto=format&fit=crop&w=800&q=80',
    itemCount: 1,
    isFeatured: false,
    displayOrder: 7,
    type: 'plant',
  },
  {
    id: 'cat-trailing-vines',
    name: 'Trailing Vines',
    slug: 'trailing-vines',
    description: 'Cascading vines and trailing foliage that turn walls and verandahs into vertical green sanctuaries.',
    image: 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=800&q=80',
    itemCount: 1,
    isFeatured: false,
    displayOrder: 8,
    type: 'plant',
  },
  {
    id: 'cat-flowering-succulents',
    name: 'Flowering Succulents',
    slug: 'flowering-succulents',
    description: 'Hardy fleshy succulents with vibrant flower clusters that thrive in sunny spots.',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=800&q=80',
    itemCount: 1,
    isFeatured: false,
    displayOrder: 9,
    type: 'plant',
  },
];

export const initialProducts: Product[] = [
  {
    id: 'prod-chrysanthemum-seedling',
    name: 'Chrysanthemum Seedling',
    slug: 'chrysanthemum-seedling',
    shortDescription: 'Vibrant and resilient chrysanthemum seedlings ready to bloom.',
    description: 'Fresh from 7Seasons recent stock, these chrysanthemum seedlings are perfect for your garden, offering a variety of vibrant colors during their blooming season.',
    category: 'Flowering Plants',
    price: 150,
    originalPrice: 200,
    discountPercentage: 25,
    stock: 50,
    sku: '7S-CHRY-01',
    images: ['https://images.unsplash.com/photo-1603507022069-450f3b06325f?auto=format&fit=crop&w=900&q=80'],
    rating: 4.8,
    reviewCount: 12,
    status: 'published',
    tags: ['seasonal', 'flowers', 'outdoor', 'seedling'],
    sellableStates: ['Kerala', 'Tamil Nadu', 'Karnataka'],
    attributes: {
      light: 'Full Sun',
      water: 'Moderate',
      petFriendly: false,
      difficulty: 'Moderate',
      airPurifying: false,
    },
    careInstructions: {
      light: 'Place in full sun.',
      water: 'Water when top soil is dry.',
      soil: 'Well draining.',
      temperature: '15-25°C',
      humidity: 'Medium'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-imported-hibiscus',
    name: 'Imported Hibiscus Sapling',
    slug: 'imported-hibiscus-sapling',
    shortDescription: 'Exotic imported hibiscus sapling with large, stunning blooms.',
    description: 'Featured in our recent reels, these imported hibiscus saplings bring an exotic, tropical flair to your garden with massive, colorful flowers.',
    category: 'Flowering Plants',
    price: 350,
    originalPrice: 450,
    discountPercentage: 22,
    stock: 30,
    sku: '7S-HIBI-01',
    images: ['https://images.unsplash.com/photo-1550073255-a0c4f346b9a2?auto=format&fit=crop&w=900&q=80'],
    rating: 4.9,
    reviewCount: 25,
    status: 'published',
    tags: ['imported', 'tropical', 'flowers'],
    sellableStates: ['Kerala', 'Tamil Nadu', 'Karnataka'],
    attributes: {
      light: 'Full Sun to Partial Shade',
      water: 'High',
      petFriendly: true,
      difficulty: 'Moderate',
      airPurifying: false,
    },
    careInstructions: {
      light: 'Bright indirect to full sun.',
      water: 'Keep soil consistently moist.',
      soil: 'Rich, well draining.',
      temperature: '20-30°C',
      humidity: 'High'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-sweet-alyssum',
    name: 'Sweet Alyssum',
    slug: 'sweet-alyssum',
    shortDescription: 'Low maintenance, long flowering, and sweet fragrance. Perfect for pots and balconies.',
    description: 'A highlight from 7seasonsplants, Sweet Alyssum offers a honey-like fragrance. Very low maintenance and blooms for a long time, making it ideal for balconies.',
    category: 'Flowering Plants',
    price: 120,
    originalPrice: 150,
    discountPercentage: 20,
    stock: 100,
    sku: '7S-ALYS-01',
    images: ['https://images.unsplash.com/photo-1621272036047-bf0ebfd40f1a?auto=format&fit=crop&w=900&q=80'],
    rating: 5.0,
    reviewCount: 40,
    status: 'published',
    tags: ['fragrant', 'balcony', 'low-maintenance'],
    sellableStates: ['Kerala', 'Tamil Nadu', 'Karnataka', 'All India'],
    attributes: {
      light: 'Full Sun',
      water: 'Moderate',
      petFriendly: true,
      difficulty: 'Easy',
      airPurifying: false,
    },
    careInstructions: {
      light: 'Full sun for best blooms.',
      water: 'Water moderately.',
      soil: 'Well draining.',
      temperature: '15-25°C',
      humidity: 'Medium'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-bonsai-ficus',
    name: 'Massive Bonsai Ficus',
    slug: 'massive-bonsai-ficus',
    shortDescription: 'A premium, massive Bonsai Ficus carefully shaped for years.',
    description: 'As seen in our fresh stock update, this massive Bonsai Ficus is a true masterpiece, adding instant elegance and a Zen atmosphere to your space.',
    category: 'Bonsai',
    price: 4500,
    originalPrice: 5000,
    discountPercentage: 10,
    stock: 5,
    sku: '7S-BONS-01',
    images: ['https://images.unsplash.com/photo-1599598425947-330026296906?auto=format&fit=crop&w=900&q=80'],
    rating: 4.9,
    reviewCount: 8,
    status: 'published',
    tags: ['premium', 'bonsai', 'indoor'],
    sellableStates: ['Kerala', 'Tamil Nadu', 'Karnataka', 'All India'],
    attributes: {
      light: 'Bright Indirect Light',
      water: 'Moderate',
      petFriendly: false,
      difficulty: 'Hard',
      airPurifying: false,
    },
    careInstructions: {
      light: 'Bright indirect light indoors.',
      water: 'Water when topsoil feels dry.',
      soil: 'Bonsai mix.',
      temperature: '18-25°C',
      humidity: 'High'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-philodendron-jiffy',
    name: 'Philodendron (Jiffy Plant)',
    slug: 'philodendron-jiffy',
    shortDescription: 'Beautiful new Philodendron variety grown in jiffy peat pellets.',
    description: 'Part of our fresh Jiffy Plants stock! These healthy Philodendrons come rooted in jiffy pellets for zero transplant shock.',
    category: 'Indoor Plants',
    price: 299,
    originalPrice: 399,
    discountPercentage: 25,
    stock: 60,
    sku: '7S-PHIL-01',
    images: ['https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80'],
    rating: 4.7,
    reviewCount: 15,
    status: 'published',
    tags: ['jiffy', 'indoor', 'foliage'],
    sellableStates: ['Kerala', 'Tamil Nadu', 'Karnataka', 'All India'],
    attributes: {
      light: 'Bright Indirect Light',
      water: 'Moderate',
      petFriendly: false,
      difficulty: 'Easy',
      airPurifying: false,
    },
    careInstructions: {
      light: 'Bright indirect light.',
      water: 'Water when top 1 inch is dry.',
      soil: 'Peat based mix.',
      temperature: '18-27°C',
      humidity: 'Medium to High'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-alocasia-jiffy',
    name: 'Alocasia (Jiffy Plant)',
    slug: 'alocasia-jiffy',
    shortDescription: 'Stunning Elephant Ear Alocasia started in jiffy pellets.',
    description: 'One of the new additions to our Jiffy Plant collection. Known for its striking, large leaves and unique vein patterns.',
    category: 'Indoor Plants',
    price: 349,
    originalPrice: 450,
    discountPercentage: 22,
    stock: 45,
    sku: '7S-ALOC-01',
    images: ['https://images.unsplash.com/photo-1620127394144-8848416d86fb?auto=format&fit=crop&w=900&q=80'],
    rating: 4.8,
    reviewCount: 18,
    status: 'published',
    tags: ['jiffy', 'indoor', 'rare'],
    sellableStates: ['Kerala', 'Tamil Nadu', 'Karnataka', 'All India'],
    attributes: {
      light: 'Bright Indirect Light',
      water: 'Moderate',
      petFriendly: false,
      difficulty: 'Moderate',
      airPurifying: false,
    },
    careInstructions: {
      light: 'Bright indirect light.',
      water: 'Keep evenly moist.',
      soil: 'Rich, well draining.',
      temperature: '18-25°C',
      humidity: 'High'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-caladium-jiffy',
    name: 'Caladium (Jiffy Plant)',
    slug: 'caladium-jiffy',
    shortDescription: 'Colorful Caladium with vibrant pink and green foliage.',
    description: 'Fresh stock Caladium grown in Jiffy pellets for the best root development. Their papery, colorful leaves are a showstopper.',
    category: 'Indoor Plants',
    price: 249,
    originalPrice: 300,
    discountPercentage: 17,
    stock: 80,
    sku: '7S-CALA-01',
    images: ['https://images.unsplash.com/photo-1601370690183-1c7796ecec61?auto=format&fit=crop&w=900&q=80'],
    rating: 4.5,
    reviewCount: 30,
    status: 'published',
    tags: ['jiffy', 'colorful', 'foliage'],
    sellableStates: ['Kerala', 'Tamil Nadu', 'Karnataka', 'All India'],
    attributes: {
      light: 'Partial Shade',
      water: 'High',
      petFriendly: false,
      difficulty: 'Moderate',
      airPurifying: false,
    },
    careInstructions: {
      light: 'Bright indirect to partial shade.',
      water: 'Keep soil moist.',
      soil: 'Rich, well draining.',
      temperature: '20-25°C',
      humidity: 'High'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-syngonium-jiffy',
    name: 'Syngonium (Jiffy Plant)',
    slug: 'syngonium-jiffy',
    shortDescription: 'Arrowhead vine Syngonium perfect for desktops and shelves.',
    description: 'The Syngonium is a versatile and fast-growing plant. Available now in our new Jiffy Plant lineup featured on Instagram.',
    category: 'Indoor Plants',
    price: 199,
    originalPrice: 250,
    discountPercentage: 20,
    stock: 90,
    sku: '7S-SYNG-01',
    images: ['https://images.unsplash.com/photo-1611211232932-da3113c5b960?auto=format&fit=crop&w=900&q=80'],
    rating: 4.6,
    reviewCount: 42,
    status: 'published',
    tags: ['jiffy', 'indoor', 'easy-care'],
    sellableStates: ['Kerala', 'Tamil Nadu', 'Karnataka', 'All India'],
    attributes: {
      light: 'Low to Bright Indirect Light',
      water: 'Moderate',
      petFriendly: false,
      difficulty: 'Easy',
      airPurifying: false,
    },
    careInstructions: {
      light: 'Low to bright indirect.',
      water: 'Water when top soil is dry.',
      soil: 'Well draining potting mix.',
      temperature: '15-30°C',
      humidity: 'Medium'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-melastoma',
    name: 'Melastoma',
    slug: 'melastoma-plant',
    shortDescription: 'Beautiful Melastoma with distinct purple flowers.',
    description: 'A gorgeous flowering shrub featured in our recent reels. Melastoma adds a burst of vibrant purple to any garden setting.',
    category: 'Flowering Plants',
    price: 280,
    originalPrice: 350,
    discountPercentage: 20,
    stock: 40,
    sku: '7S-MELA-01',
    images: ['https://images.unsplash.com/photo-1681283626245-779836a0fbac?auto=format&fit=crop&w=900&q=80'],
    rating: 4.8,
    reviewCount: 9,
    status: 'published',
    tags: ['shrub', 'purple', 'outdoor'],
    sellableStates: ['Kerala', 'Tamil Nadu', 'Karnataka'],
    attributes: {
      light: 'Full Sun',
      water: 'High',
      petFriendly: true,
      difficulty: 'Moderate',
      airPurifying: false,
    },
    careInstructions: {
      light: 'Full sun for best blooms.',
      water: 'Water regularly.',
      soil: 'Well draining.',
      temperature: '20-30°C',
      humidity: 'Medium'
    },
    createdAt: new Date().toISOString()
  }
];

export const initialPlantCombos: PlantCombo[] = [
  {
    "id": "combo-1791291549025",
    "maxImages": 5,
    "slug": "hibiscus-dwarf-10",
    "images": [
      "/uploads/combo-hibiscus-dwarf-10-1-549025.webp",
      "/uploads/combo-hibiscus-dwarf-10-2-549025.webp",
      "/uploads/combo-hibiscus-dwarf-10-3-549025.webp",
      "/uploads/combo-hibiscus-dwarf-10-4-549025.webp",
      "/uploads/combo-hibiscus-dwarf-10-5-549025.webp"
    ],
    "tags": [
      "combo",
      "bundle",
      "nursery",
      "kerala"
    ],
    "price": 279,
    "sellableStates": [
      "Kerala",
      "Tamil Nadu",
      "Karnataka"
    ],
    "discountPercentage": 7,
    "sku": "7S-CMB-2932",
    "createdAt": "2026-10-06T12:59:09.025Z",
    "items": [
      {
        "priceShare": 30,
        "productId": "item-1791291528930",
        "productName": "Hibiscus Dwarf",
        "image": "/uploads/combo-item-hibiscus-dwarf-10-1.jpg",
        "itemType": "plant",
        "quantity": 10
      }
    ],
    "shortDescription": "Compact hybrid hibiscus with stunning blooms in 7–8 vibrant colours.",
    "rating": 4.9,
    "name": "Hibiscus Dwarf (10)",
    "reviewCount": 18,
    "status": "published",
    "category": "Flowering & Ornamental",
    "isFeatured": true,
    "careSummary": "",
    "benefits": [
      "High air purification",
      "Specialized safe packing"
    ],
    "originalPrice": 299,
    "deliveryInfo": "Shipped in reinforced 5-ply ventilated nursery crates with 100% damage protection across Kerala, Tamil Nadu & Karnataka.",
    "savings": 20,
    "description": "Dwarf Hybrid Hibiscus is a compact-growing hibiscus variety known for its large, vibrant flowers and beautiful range of colours. These plants are grown and cared for in our own nursery and supplied as healthy young plants in net pots.\n\nThe combo includes a colourful mix of approximately 7–8 shades. Its naturally dwarf and bushy growth makes it a great choice for pots, balconies, terraces and home gardens.\n\nCare Tips:\n• Keep in a bright location with good sunlight.\n• Water regularly, but avoid waterlogging.\n• Transplant from the net pot into a larger pot or grow bag as the plant develops.\n• Use well-draining, nutrient-rich potting media.\n• Regular feeding and light pruning encourage healthy, bushy growth and flowering.",
    "weight": 0.8,
    "stock": 100
  },
  {
    "id": "combo-1791809785485",
    "items": [
      {
        "itemType": "plant",
        "productId": "item-1791809369586",
        "priceShare": 100,
        "quantity": 4,
        "notes": "Golden Machera",
        "image": "/uploads/combo-item-golden-china-doll-4-1.jpg",
        "productName": "Golden China Doll"
      }
    ],
    "createdAt": "2026-10-12T12:56:25.485Z",
    "rating": 4.9,
    "deliveryInfo": "Shipped in reinforced 5-ply ventilated nursery crates with 100% damage protection across Kerala, Tamil Nadu & Karnataka.",
    "sellableStates": [
      "Kerala",
      "Tamil Nadu",
      "Karnataka"
    ],
    "price": 259,
    "maxImages": 5,
    "shortDescription": "Golden China Doll is an attractive foliage plant with delicate, golden-green leaves that add a bright, fresh touch to balconies, patios, and gardens. It grows best in bright light with gentle morning sunlight and well-drained soil.",
    "originalPrice": 349,
    "isFeatured": true,
    "images": [
      "/uploads/combo-golden-china-doll-4-1-785485.webp",
      "/uploads/combo-golden-china-doll-4-2-785485.webp",
      "/uploads/combo-golden-china-doll-4-3-785485.webp"
    ],
    "savings": 90,
    "stock": 100,
    "name": "Golden China Doll (4)",
    "description": "",
    "sku": "7S-CMB-1423",
    "weight": 0.4,
    "discountPercentage": 26,
    "reviewCount": 18,
    "status": "published",
    "tags": [
      "combo",
      "bundle",
      "nursery",
      "kerala"
    ],
    "slug": "golden-china-doll-4",
    "category": "Foilage",
    "careSummary": "Keep in bright light with gentle morning sun; avoid harsh afternoon sunlight. Water when the top layer of soil feels dry, and use a well-draining potting mix. Feed lightly once a month and trim occasionally for bushier growth.",
    "benefits": [
      "Packed in specialized 5-ply ventilated protective carton"
    ]
  },
  {
    "id": "combo-1791810177823",
    "originalPrice": 299,
    "weight": 0.8,
    "description": "",
    "createdAt": "2026-10-12T13:02:57.823Z",
    "stock": 100,
    "savings": 50,
    "isFeatured": true,
    "reviewCount": 18,
    "benefits": [
      "Packed in specialized 5-ply ventilated protective carton"
    ],
    "deliveryInfo": "Shipped in reinforced 5-ply ventilated nursery crates with 100% damage protection across Kerala, Tamil Nadu & Karnataka.",
    "category": "Foilage",
    "status": "published",
    "maxImages": 5,
    "shortDescription": "Green China Doll is a beautiful foliage plant with delicate, glossy green leaves and a lush, bushy appearance—perfect for adding a fresh touch to bright indoor spaces, balconies, and patios.",
    "discountPercentage": 17,
    "careSummary": "Green China Doll care: Place in bright, indirect light or gentle morning sun. Water when the top layer of soil feels dry, avoiding waterlogging. Use well-draining soil, feed lightly monthly during active growth, and trim for a bushy shape.",
    "slug": "green-chinadoll-10",
    "rating": 4.9,
    "tags": [
      "combo",
      "bundle",
      "nursery",
      "kerala"
    ],
    "sku": "7S-CMB-3358",
    "items": [
      {
        "notes": "Green Machera",
        "image": "/uploads/combo-item-green-chinadoll-10-1.jpg",
        "productName": "China Doll Green",
        "quantity": 10,
        "priceShare": 30,
        "productId": "item-1791810173117",
        "itemType": "plant"
      }
    ],
    "images": [
      "/uploads/combo-green-chinadoll-10-1-177823.webp",
      "/uploads/combo-green-chinadoll-10-2-177823.webp",
      "/uploads/combo-green-chinadoll-10-3-177823.webp"
    ],
    "sellableStates": [
      "Kerala",
      "Tamil Nadu",
      "Karnataka"
    ],
    "price": 249,
    "name": "Green Chinadoll (10)"
  },
  {
    "id": "combo-1791810576909",
    "items": [
      {
        "priceShare": 30,
        "image": "/uploads/combo-item-chinese-balsam-10-1.jpg",
        "notes": "New Guinea Impatience",
        "productId": "item-1791810276728",
        "itemType": "plant",
        "productName": "Chinese Balsam",
        "quantity": 10
      }
    ],
    "benefits": [
      "Packed in specialized 5-ply ventilated protective carton"
    ],
    "originalPrice": 299,
    "tags": [
      "combo",
      "bundle",
      "nursery",
      "kerala"
    ],
    "category": "Flowering & Ornamental",
    "slug": "chinese-balsam-10",
    "status": "published",
    "name": "Chinese Balsam (10)",
    "weight": 0.8,
    "discountPercentage": 7,
    "price": 279,
    "sellableStates": [
      "Kerala",
      "Tamil Nadu",
      "Karnataka"
    ],
    "isFeatured": true,
    "savings": 20,
    "stock": 100,
    "careSummary": "Chinese Balsam (Impatiens) care: Keep in bright shade or gentle morning sunlight, avoiding harsh afternoon sun. Water regularly to keep the soil moist without waterlogging. Use well-draining soil, feed lightly during active growth, and pinch the tips for bushier growth.",
    "images": [
      "/uploads/combo-chinese-balsam-10-1-576909.webp",
      "/uploads/combo-chinese-balsam-10-2-576909.webp",
      "/uploads/combo-chinese-balsam-10-3-576909.webp",
      "/uploads/combo-chinese-balsam-10-4-576909.webp",
      "/uploads/combo-chinese-balsam-10-5-576909.webp"
    ],
    "maxImages": 5,
    "deliveryInfo": "Shipped in reinforced 5-ply ventilated nursery crates with 100% damage protection across Kerala, Tamil Nadu & Karnataka.",
    "shortDescription": "Chinese Balsam (Impatiens) adds vibrant colour to shaded balconies and gardens. Each combo includes 7–8 colours, selected from our collection of around 15 colours. The colour mix varies depending on availability at the time of dispatch.",
    "reviewCount": 18,
    "rating": 4.9,
    "sku": "7S-CMB-3359",
    "createdAt": "2026-10-12T13:09:36.909Z",
    "description": ""
  },
  {
    "id": "combo-1791811081714",
    "description": "",
    "maxImages": 5,
    "slug": "calathea-red-10",
    "weight": 3.5,
    "tags": [
      "combo",
      "bundle",
      "nursery",
      "kerala"
    ],
    "price": 550,
    "originalPrice": 699,
    "deliveryInfo": "Shipped in reinforced 5-ply ventilated nursery crates with 100% damage protection across Kerala, Tamil Nadu & Karnataka.",
    "shortDescription": "Calathea Red/Copper is an attractive foliage plant that adds rich colour and a lush tropical feel to landscaping. Ideal for shaded borders, garden beds, and grouped planting.",
    "reviewCount": 18,
    "discountPercentage": 21,
    "status": "published",
    "careSummary": "Calathea Red/Copper care: Grow in partial shade or bright, indirect light, avoiding harsh afternoon sun. Keep the soil evenly moist without waterlogging. Use well-draining soil, feed lightly during active growth, and remove dry or damaged leaves.",
    "isFeatured": true,
    "name": "Calathea Red (10)",
    "createdAt": "2026-10-12T13:18:01.714Z",
    "items": [
      {
        "productId": "item-1791811078201",
        "productName": "Calathea Red/ Copper",
        "itemType": "plant",
        "priceShare": 100,
        "image": "/uploads/combo-item-calathea-red-10-1.jpg",
        "quantity": 10
      }
    ],
    "benefits": [
      "Filters household toxins & boosts indoor oxygen",
      "Packed in specialized 5-ply ventilated protective carton"
    ],
    "category": "Landscape",
    "rating": 4.9,
    "sku": "7S-CMB-7742",
    "savings": 149,
    "images": [
      "/uploads/combo-calathea-red-10-1-081714.webp",
      "/uploads/combo-calathea-red-10-2-081714.webp",
      "/uploads/combo-calathea-red-10-3-081714.webp",
      "/uploads/combo-calathea-red-10-4-081714.webp",
      "/uploads/combo-calathea-red-10-5-081714.webp"
    ],
    "sellableStates": [
      "Kerala",
      "Tamil Nadu",
      "Karnataka"
    ],
    "stock": 100
  },
  {
    "id": "combo-1791811502417",
    "discountPercentage": 17,
    "items": [
      {
        "productId": "item-1791811164988",
        "priceShare": 30,
        "productName": "Hydrangea",
        "itemType": "plant",
        "quantity": 6,
        "image": "/uploads/combo-item-hydrangea-6-1.jpg"
      }
    ],
    "sellableStates": [
      "Kerala",
      "Tamil Nadu",
      "Karnataka"
    ],
    "savings": 50,
    "category": "Flowering & Ornamental",
    "benefits": [
      "High air purification",
      "Specialized safe packing"
    ],
    "status": "published",
    "isFeatured": true,
    "weight": 0.8,
    "price": 249,
    "originalPrice": 299,
    "stock": 100,
    "shortDescription": "Hydrangea plug plants in 3 varieties, ready to grow into beautiful shrubs with large, showy blooms—perfect for pots, garden borders, and landscaping.",
    "images": [
      "/uploads/combo-hydrangea-6-1-502417.webp",
      "/uploads/combo-hydrangea-6-2-502417.webp",
      "/uploads/combo-hydrangea-6-3-502417.webp"
    ],
    "careSummary": "Position in bright to moderate indirect sunlight. Water individually when topsoil feels dry.",
    "name": "Hydrangea (6)",
    "sku": "7S-CMB-2785",
    "reviewCount": 18,
    "maxImages": 5,
    "tags": [
      "combo",
      "bundle",
      "nursery",
      "kerala"
    ],
    "rating": 4.9,
    "createdAt": "2026-10-12T13:25:02.417Z",
    "deliveryInfo": "Shipped in reinforced 5-ply ventilated nursery crates with 100% damage protection across Kerala, Tamil Nadu & Karnataka.",
    "description": "",
    "slug": "hydrangea-6"
  },
  {
    "id": "combo-1792150238289",
    "items": [
      {
        "priceShare": 20,
        "productId": "item-1792149961035",
        "productName": "6 INCH POT",
        "quantity": 10,
        "image": "/uploads/combo-item-6-inch-pot-pack-of-10-1.jpg",
        "itemType": "pot"
      }
    ],
    "tags": [
      "combo",
      "bundle",
      "nursery",
      "kerala"
    ],
    "reviewCount": 18,
    "images": [
      "/uploads/combo-6-inch-pot-pack-of-10-1-238289.webp",
      "/uploads/combo-6-inch-pot-pack-of-10-2-238289.webp",
      "/uploads/combo-6-inch-pot-pack-of-10-3-238289.webp",
      "/uploads/combo-6-inch-pot-pack-of-10-4-238289.webp"
    ],
    "careSummary": "",
    "slug": "6-inch-pot-pack-of-10",
    "rating": 4.9,
    "isFeatured": true,
    "name": "6 INCH POT ( PACK OF 10 )",
    "description": "",
    "price": 149,
    "deliveryInfo": "Shipped in reinforced 5-ply ventilated nursery crates with 100% damage protection across Kerala, Tamil Nadu & Karnataka.",
    "stock": 50,
    "discountPercentage": 26,
    "createdAt": "2026-10-16T11:30:38.289Z",
    "savings": 51,
    "status": "published",
    "shortDescription": "Premium virgin plastic pots sourced directly from manufacturers—the same quality we use in our own nursery. Strong, durable, and designed with drainage holes for healthy plant growth, these pots are ideal for nursery and home gardening.",
    "sku": "7S-CMB-3039",
    "weight": 0.9,
    "maxImages": 5,
    "benefits": [
      "High air purification",
      "Specialized safe packing"
    ],
    "originalPrice": 200,
    "sellableStates": [
      "Kerala",
      "Tamil Nadu",
      "Karnataka"
    ],
    "category": "POTS"
  },
  {
    "id": "combo-1792150493881",
    "stock": 50,
    "originalPrice": 150,
    "shortDescription": "Premium virgin plastic pots sourced directly from manufacturers—the same quality we use in our own nursery. Strong, durable, and designed with drainage holes for healthy plant growth, these pots are ideal for nursery and home gardening.",
    "discountPercentage": 14,
    "images": [
      "/uploads/combo-8-inch-pot-pack-of-5-1-493881.webp",
      "/uploads/combo-8-inch-pot-pack-of-5-2-493881.webp",
      "/uploads/combo-8-inch-pot-pack-of-5-3-493881.webp",
      "/uploads/combo-8-inch-pot-pack-of-5-4-493881.webp"
    ],
    "sku": "7S-CMB-6143",
    "rating": 4.9,
    "sellableStates": [
      "Kerala",
      "Tamil Nadu",
      "Karnataka"
    ],
    "items": [
      {
        "image": "/uploads/combo-item-8-inch-pot-pack-of-5-1.jpg",
        "itemType": "pot",
        "quantity": 5,
        "productName": "8 INCH POT",
        "priceShare": 30,
        "productId": "item-1792150360267"
      }
    ],
    "name": "8 INCH POT ( PACK OF 5 )",
    "status": "published",
    "deliveryInfo": "",
    "savings": 21,
    "isFeatured": true,
    "createdAt": "2026-10-16T11:34:53.881Z",
    "description": "",
    "price": 129,
    "careSummary": "",
    "maxImages": 5,
    "tags": [
      "combo",
      "bundle",
      "nursery",
      "kerala"
    ],
    "slug": "8-inch-pot-pack-of-5",
    "benefits": [
      "High air purification",
      "Specialized safe packing"
    ],
    "reviewCount": 18,
    "weight": 0.9,
    "category": "POTS"
  },
  {
    "id": "combo-1792233984552",
    "savings": 150,
    "careSummary": "",
    "sellableStates": [
      "Kerala",
      "Tamil Nadu",
      "Karnataka"
    ],
    "rating": 4.9,
    "name": "Chrysanthemum (15)",
    "reviewCount": 18,
    "shortDescription": "Brighten your garden with our Puja Special Chrysanthemum Combo! Featuring six beautiful colours, these freely flowering varieties bring a cheerful festive touch to pots, balconies, and garden beds.",
    "category": "Flowering & Ornamental",
    "slug": "chrysanthemum-15",
    "benefits": [
      "High air purification",
      "Specialized safe packing"
    ],
    "stock": 100,
    "description": "",
    "tags": [
      "combo",
      "bundle",
      "nursery",
      "kerala"
    ],
    "images": [
      "/uploads/combo-chrysanthemum-15-1-984552.webp",
      "/uploads/combo-chrysanthemum-15-2-984552.webp",
      "/uploads/combo-chrysanthemum-15-3-984552.webp",
      "/uploads/combo-chrysanthemum-15-4-984552.webp"
    ],
    "discountPercentage": 43,
    "price": 199,
    "maxImages": 5,
    "deliveryInfo": "Shipped in reinforced 5-ply ventilated nursery crates with 100% damage protection across Kerala, Tamil Nadu & Karnataka.",
    "weight": 0.5,
    "sku": "7S-CMB-3654",
    "items": [
      {
        "productId": "item-1792233949420",
        "priceShare": 15,
        "image": "/uploads/combo-item-chrysanthemum-15-1.jpg",
        "productName": "CHRYSANTHEMUM",
        "quantity": 15,
        "itemType": "plant"
      }
    ],
    "originalPrice": 349,
    "status": "published",
    "isFeatured": true,
    "createdAt": "2026-10-17T10:46:24.552Z"
  },
  {
    "id": "combo-1792661064097",
    "discountPercentage": 31,
    "maxImages": 5,
    "sellableStates": [
      "Kerala",
      "Tamil Nadu",
      "Karnataka"
    ],
    "images": [
      "/uploads/combo-calathea-wheat-5-1-064097.webp",
      "/uploads/combo-calathea-wheat-5-2-064097.webp",
      "/uploads/combo-calathea-wheat-5-3-064097.webp",
      "/uploads/combo-calathea-wheat-5-4-064097.webp"
    ],
    "sku": "7S-CMB-5661",
    "rating": 4.9,
    "category": "Landscape",
    "stock": 100,
    "benefits": [
      "High air purification",
      "Specialized safe packing"
    ],
    "isFeatured": true,
    "createdAt": "2026-10-22T09:24:24.097Z",
    "deliveryInfo": "Shipped in reinforced 5-ply ventilated nursery crates with 100% damage protection across Kerala, Tamil Nadu & Karnataka.",
    "reviewCount": 18,
    "tags": [
      "combo",
      "bundle",
      "nursery",
      "kerala"
    ],
    "price": 275,
    "shortDescription": "",
    "slug": "calathea-wheat-5",
    "careSummary": "",
    "status": "published",
    "weight": 1.8,
    "items": [
      {
        "productId": "item-1792661060620",
        "productName": "Calathea Wheat",
        "image": "/uploads/combo-item-calathea-wheat-5-1.jpg",
        "priceShare": 80,
        "itemType": "plant",
        "quantity": 5
      }
    ],
    "savings": 125,
    "name": "Calathea Wheat (5)",
    "description": "",
    "originalPrice": 400
  },
  {
    "id": "combo-1792725989397",
    "category": "Flowering & Ornamental",
    "benefits": [
      "High air purification",
      "Specialized safe packing"
    ],
    "items": [
      {
        "priceShare": 15,
        "itemType": "plant",
        "productName": "Chrysanthemum",
        "quantity": 1,
        "productId": "item-1792725865447",
        "image": "/uploads/combo-item-chrysanthemum-10-1.jpg"
      }
    ],
    "slug": "chrysanthemum-10",
    "isFeatured": true,
    "tags": [
      "combo",
      "bundle",
      "nursery",
      "kerala"
    ],
    "status": "published",
    "weight": 0.5,
    "price": 10,
    "deliveryInfo": "Shipped in reinforced 5-ply ventilated nursery crates with 100% damage protection across Kerala, Tamil Nadu & Karnataka.",
    "name": "Chrysanthemum (10)",
    "images": [
      "/uploads/combo-chrysanthemum-10-1-989397.webp",
      "/uploads/combo-chrysanthemum-10-2-989397.webp",
      "/uploads/combo-chrysanthemum-10-3-989397.webp",
      "/uploads/combo-chrysanthemum-10-4-989397.webp"
    ],
    "discountPercentage": 95,
    "savings": 189,
    "stock": 0,
    "description": "Carefully paired at Mannaratharayil Gardens LLP for synchronized care rhythms, lush greenery, and effortless indoor styling. Shipped in sturdy 5-ply cartons directly across Kerala, Tamil Nadu & Karnataka.",
    "maxImages": 5,
    "sku": "7S-CMB-9772",
    "reviewCount": 18,
    "originalPrice": 199,
    "rating": 4.9,
    "createdAt": "2026-10-23T03:26:29.397Z",
    "sellableStates": [
      "Kerala",
      "Tamil Nadu",
      "Karnataka"
    ],
    "shortDescription": "",
    "careSummary": ""
  }
];

// Calculate dynamic deal dates so countdown timers are active and accurate relative to current time
const now = new Date();
const todayStr = now.toISOString().split('T')[0];
const futureEnd = new Date(now.getTime() + 1000 * 60 * 60 * 18);
const tomorrowStr = futureEnd.toISOString().split('T')[0];
const endTimeStr = `${String(futureEnd.getHours()).padStart(2, '0')}:${String(futureEnd.getMinutes()).padStart(2, '0')}`;

export const initialDailyDeals: DailyDeal[] = [
  {
    id: 'deal-today-monsoon-combo',
    title: 'Monsoon Plant Combo Deal',
    subtitle: 'Triple Outdoor & Balcony Bloom Collection with Free Fertilizer Pack',
    targetType: 'combo',
    targetId: 'combo-monsoon-balcony-garden',
    dealPrice: 499,
    originalPrice: 699,
    discountPercentage: 29,
    savings: 200,
    startDate: todayStr,
    endDate: tomorrowStr,
    startTime: '00:00',
    endTime: endTimeStr,
    isActive: true,
    badge: 'TODAY’S FLASH DEAL',
    bannerImage: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'deal-today-snake-plant',
    title: 'Sansevieria Futura Superba Special',
    subtitle: 'Our top-rated air-purifying bedroom plant at lowest price',
    targetType: 'product',
    targetId: 'prod-chrysanthemum-seedling',
    dealPrice: 279,
    originalPrice: 349,
    discountPercentage: 20,
    savings: 70,
    startDate: todayStr,
    endDate: tomorrowStr,
    startTime: '00:00',
    endTime: endTimeStr,
    isActive: true,
    badge: 'DAILY PLANT SPECIAL',
    bannerImage: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&w=1200&q=80',
  },
];

export const initialCoupons: Coupon[] = [
  {
    id: 'cpn-welcome10',
    code: 'WELCOME10',
    description: '10% OFF on your first plant order above ₹499',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 499,
    maxDiscount: 150,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: 1000,
    usedCount: 142,
    perUserLimit: 1,
    isActive: true,
  },
  {
    id: 'cpn-combo50',
    code: 'COMBO50',
    description: 'Flat ₹50 Instant Discount on any Plant Combo',
    discountType: 'fixed',
    discountValue: 50,
    minOrderValue: 599,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: 500,
    usedCount: 88,
    perUserLimit: 2,
    isActive: true,
    applicableCombosOnly: true,
  },
  {
    id: 'cpn-seasons200',
    code: 'SEASONS200',
    description: 'Flat ₹200 OFF on bulk plant & garden orders over ₹1499',
    discountType: 'fixed',
    discountValue: 200,
    minOrderValue: 1499,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: 300,
    usedCount: 65,
    perUserLimit: 1,
    isActive: true,
  },
  {
    id: 'cpn-kerala-green',
    code: 'KERALAGREEN',
    description: '15% OFF on all flowering and outdoor garden plants',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 699,
    maxDiscount: 250,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: 400,
    usedCount: 93,
    perUserLimit: 2,
    isActive: true,
  },
];

export const initialBanners: HeroBanner[] = [
  {
    id: 'banner-hero-1',
    title: 'Bring Nature Home with 7Seasons',
    subtitle: 'Thoughtfully curated tropical plant combos and botanical collections, delivered to your doorstep across Kerala, Tamil Nadu & Karnataka.',
    badge: 'FRESH FROM MANNARATHARAYIL GARDENS LLP',
    ctaText: 'Explore Plant Combos',
    ctaLink: '/combos',
    secondaryCtaText: 'Today’s Flash Deals',
    secondaryCtaLink: '/#deals',
    imageUrl: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=1600&q=80',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'banner-hero-2',
    title: 'Curated Plant Combos for Every Living Space',
    subtitle: 'Hand-paired botanical bundles with free planters, organic fertilizer, and savings up to 35%.',
    badge: 'POPULAR CHOICE',
    ctaText: 'View All Combos',
    ctaLink: '/combos',
    secondaryCtaText: 'Plant Care Guides',
    secondaryCtaLink: '/plant-care',
    imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1600&q=80',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'banner-hero-3',
    title: 'Safe 5-Ply Packaging & Guaranteed Arrival',
    subtitle: 'Root-sealed and aerated packaging ensures curated combos arrive fresh, hydrated, and ready to thrive.',
    badge: '100% HEALTHY PLANT PROMISE',
    ctaText: 'Best Selling Combos',
    ctaLink: '/combos',
    secondaryCtaText: 'Plant Doctor AI',
    secondaryCtaLink: '/plant-care',
    imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1600&q=80',
    displayOrder: 3,
    isActive: true,
  },
];

export const initialPlantCareGuides: PlantCareGuide[] = [
  {
    id: 'guide-snake-plant',
    plantName: 'Sansevieria Snake Plant',
    slug: 'snake-plant-care-guide',
    botanicalName: 'Dracaena trifasciata',
    heroImage: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&w=900&q=80',
    category: 'Indoor Foliage',
    difficulty: 'Beginner Friendly',
    lightGuidance: 'Tolerates low light up to direct morning sunlight. Adapts effortlessly to dim bedroom corners and office cubicles.',
    waterGuidance: 'Allow the soil to dry out completely between waterings. Typically once every 10-14 days. When in doubt, hold off on watering.',
    soilGuidance: 'Fast-draining potting mixture composed of 40% coarse sand/perlite, 30% red soil, and 30% organic compost.',
    fertilizerGuidance: 'Light dose of organic liquid fertilizer once every 2-3 months during spring and monsoon.',
    temperatureGuidance: 'Thrives between 18°C and 36°C. Keep away from direct blast of air conditioning vents.',
    humidityGuidance: 'Adapts to normal indoor humidity without any special misting requirements.',
    commonProblems: [
      {
        problem: 'Soggy, mushy leaves at the base',
        solution: 'Overwatering. Stop watering immediately, remove mushy leaves, and repot in dry porous soil.',
      },
      {
        problem: 'Wrinkled leaf blades',
        solution: 'Severe underwatering. Give the plant a thorough soak until water flows from drainage hole.',
      },
    ],
    beginnerTips: [
      'Always use a pot with a working drainage hole to prevent water stagnation.',
      'Wipe dust from the upright leaves monthly with a damp cloth to maximize photosynthesis.',
      'Great plant for bedrooms because it produces oxygen during nighttime.',
    ],
    faqs: [
      {
        question: 'Can I keep the snake plant inside an AC bedroom?',
        answer: 'Yes, snake plants adapt well to AC rooms as long as they are not positioned directly under the cold air vent draft.',
      },
      {
        question: 'How often should I repot my snake plant?',
        answer: 'Snake plants actually enjoy being slightly root-bound. Repotting once every 2 years into a pot 1-2 inches larger is ideal.',
      },
    ],
  },
  {
    id: 'guide-money-plant',
    plantName: 'Golden Pothos (Money Plant)',
    slug: 'money-plant-care-guide',
    botanicalName: 'Epipremnum aureum',
    heroImage: 'https://images.unsplash.com/photo-1596724855577-62a225a07c06?auto=format&fit=crop&w=900&q=80',
    category: 'Trailing Vines',
    difficulty: 'Beginner Friendly',
    lightGuidance: 'Bright indirect sunlight produces the most vibrant golden streaks. Also grows well in water bottles on desks.',
    waterGuidance: 'Water when top 1-2 inches of soil feels dry. Drooping leaves indicate it is thirsty and will bounce back within hours.',
    soilGuidance: 'Cocopeat, vermicompost, and garden soil in equal parts for aerated moisture retention.',
    fertilizerGuidance: 'Feed monthly with seaweed liquid extract or compost tea.',
    temperatureGuidance: '18°C to 34°C.',
    humidityGuidance: 'Medium to high humidity. Appreciates weekly foliage misting in hot summer months.',
    commonProblems: [
      {
        problem: 'Leaves turning solid dark green without golden streaks',
        solution: 'Plant needs brighter indirect light to produce golden variegation.',
      },
      {
        problem: 'Stems getting leggy with few leaves',
        solution: 'Prune the tips to encourage bushier multi-stem growth and give more sunlight.',
      },
    ],
    beginnerTips: [
      'You can train it to climb upward using a coir moss stick for larger leaf size.',
      'Cuttings with a single leaf node root effortlessly in a glass jar of clean water.',
    ],
    faqs: [
      {
        question: 'Can money plant grow in plain water?',
        answer: 'Yes! Money plants grow happily in water jars. Change the water once a week and keep in bright indirect light.',
      },
    ],
  },
  {
    id: 'guide-adenium-desert-rose',
    plantName: 'Adenium Desert Rose',
    slug: 'adenium-desert-rose-care-guide',
    botanicalName: 'Adenium obesum',
    heroImage: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=900&q=80',
    category: 'Flowering Succulents',
    difficulty: 'Easy',
    lightGuidance: 'Requires 6+ hours of full direct sunlight daily. The more sun it gets, the heavier it flowers.',
    waterGuidance: 'Water deeply only when the caudex and soil are dry. Protect from non-stop heavy monsoon rains.',
    soilGuidance: 'Porous potting mix of coarse brick pieces, red cinder, perlite, and river sand with minimal cocopeat.',
    fertilizerGuidance: 'High phosphorus and potassium organic bloom fertilizer once a month.',
    temperatureGuidance: '20°C to 40°C. Loves tropical heat.',
    humidityGuidance: 'Tolerates heat well; needs good air circulation around the pot.',
    commonProblems: [
      {
        problem: 'Soft squishy caudex',
        solution: 'Rot from overwatering or poorly draining soil. Prune away soft parts and dust with fungicide.',
      },
    ],
    beginnerTips: [
      'Plant in shallow terracotta or clay pots which breathe and dry faster than plastic pots.',
      'Prune the branches lightly at the start of spring to promote multiple flowering stems.',
    ],
    faqs: [
      {
        question: 'Why are my Adenium flower buds falling before opening?',
        answer: 'Bud drop usually happens if watering is erratic or if the plant was moved from full sun to heavy shade.',
      },
    ],
  },
];

export const initialBlogPosts: BlogPost[] = [
  {
    id: 'blog-monsoon-plant-care',
    title: 'Essential Monsoon Plant Care Guide for Kerala, Tamil Nadu & Karnataka Homes',
    slug: 'monsoon-plant-care-kerala-tamil-nadu-karnataka',
    category: 'Seasonal Gardening',
    coverImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=80',
    excerpt: 'How to safeguard your indoor and balcony plants from waterlogging, root rot, and fungal issues during the South Indian monsoon.',
    content: `The South Indian monsoon brings refreshing rains and a burst of natural growth across Kerala, Tamil Nadu, and Karnataka. However, prolonged rain and high humidity also introduce specific gardening challenges like waterlogged pots, slow soil drying, and fungal leaf spots.

Here are the top practical steps recommended by our senior horticulturists at Mannaratharayil Gardens LLP:

### 1. Check Pot Drainage Holes
Ensure that drainage holes at the bottom of all outdoor and balcony planters are completely clear. Clear out accumulated mud or roots so excess rainwater drains out in seconds.

### 2. Move Succulents & Adeniums Under Covered Balconies
Plants like Adeniums, Snake Plants, and Jade cannot tolerate waterlogged roots for days. Move them under roof overhangs or covered balcony ledges where they receive bright light without direct downpours.

### 3. Space Plants for Good Airflow
Grouped plants look beautiful, but stagnant wet air invites fungal spores. Space your pots at least 6-8 inches apart so monsoon breezes can naturally circulate around the stems.

### 4. Reduce Indoor Plant Watering by Half
Because ambient air humidity is naturally 80-90% during monsoons, indoor potting soil takes twice as long to dry. Check the soil 2 inches deep before adding any water.`,
    author: {
      name: 'Vipin Mannaratharayil',
      role: 'Head Nurseryman & Botanist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    readTimeMinutes: 4,
    publishedAt: '2026-02-14T00:00:00.000Z',
    isPublished: true,
    tags: ['plants'],
  },
  {
    id: 'blog-plant-combos-guide',
    title: 'Why Curated Plant Combos are the Smartest Way to Green Your Apartment',
    slug: 'why-plant-combos-are-smartest-choice',
    category: 'Gardening Tips',
    coverImage: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=900&q=80',
    excerpt: 'Discover why pairing complementary plants saves you money, simplifies care routines, and creates harmonious interior aesthetics.',
    content: `When designing an indoor garden, buying individual plants haphazardly often leads to mismatched care requirements—one plant craves direct sun while its neighbor burns in it.

At 7Seasons, our core specialty is **Curated Plant Combos**. Here is why bundles are transforming home gardening across Kerala, Tamil Nadu & Karnataka:

### 1. Synchronized Watering & Light Requirements
Our combos pair plants that share matching care rhythms. For example, our *Hard-to-Kill Trio* contains Snake Plant, ZZ Plant, and Golden Pothos—all of which thrive under the exact same watering schedule.

### 2. Built-in Cost Savings (25% to 35% OFF)
Because we package complementary plants together from Mannaratharayil Gardens LLP with customized pots and organic fertilizers, we pass substantial savings directly to customers compared to buying individual items.

### 3. Balanced Aesthetic Heights and Textures
A great combo features contrasting leaf shapes—the broad upright blades of Sansevieria, the cascading vines of Pothos, and the delicate blossoms of Peace Lily—creating instant professional interior styling.`,
    author: {
      name: 'Ananya S.',
      role: 'Landscape & Plant Stylist',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    },
    readTimeMinutes: 5,
    publishedAt: '2026-02-10T00:00:00.000Z',
    isPublished: true,
    tags: ['plants'],
  },
  {
    id: 'blog-air-purifier-plants',
    title: 'Top 5 NASA Air-Purifying Plants for Clean Indoor Living',
    slug: 'top-5-nasa-air-purifying-plants',
    category: 'Plant Care',
    coverImage: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=900&q=80',
    excerpt: 'Science-backed indoor foliage that filters household toxins, dust, and VOCs while boosting bedroom oxygen levels.',
    content: `NASA’s landmark Clean Air Study demonstrated that specific common houseplants can eliminate up to 87% of indoor air pollutants within 24 hours.

If you are looking to purify your living room or bedroom naturally, these are the top 5 performers:

1. **Sansevieria Snake Plant**: Absorbs benzene, formaldehyde, and emits oxygen at night.
2. **Peace Lily (Spathiphyllum)**: Highly effective against mold spores and airborne solvents.
3. **Golden Pothos (Money Plant)**: Fast-growing champion for removing carbon monoxide and formaldehyde.
4. **ZZ Plant (Zamioculcas)**: Exceptional tolerance to low-light indoor environments while purifying air.
5. **Variegated Spider Plant**: Safe for pets, non-toxic, and filters xylene and carbon monoxide.`,
    author: {
      name: 'Vipin Mannaratharayil',
      role: 'Head Nurseryman & Botanist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    readTimeMinutes: 4,
    publishedAt: '2026-02-05T00:00:00.000Z',
    isPublished: true,
    tags: ['plants'],
  },
];

export const initialReviews: Review[] = [
  {
    id: 'rev-01',
    targetId: 'combo-jiffy-bundle',
    targetType: 'combo',
    targetName: 'Beginner Indoor Plant Starter Combo',
    customerName: 'Meera Nambiar',
    customerEmail: 'meera.nambiar@gmail.com',
    customerLocation: 'Kochi, Kerala',
    rating: 5,
    title: 'Outstanding quality and packaging!',
    comment: 'I ordered this combo to Kochi. The plants arrived in pristine condition without a single broken stem or spilled soil. The matching pots look gorgeous in my living room. Highly recommend 7Seasonsplants!',
    verifiedPurchase: true,
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev-02',
    targetId: 'combo-jiffy-bundle',
    targetType: 'combo',
    targetName: 'Beginner Indoor Plant Starter Combo',
    customerName: 'Karthik Subramanian',
    customerEmail: 'karthik.subbu@yahoo.com',
    customerLocation: 'Coimbatore, Tamil Nadu',
    rating: 5,
    title: 'Healthy plants and huge savings',
    comment: 'The individual plants would have cost much more locally. The care guide booklet is very helpful for beginners like me. Will be ordering the Balcony Combo next.',
    verifiedPurchase: true,
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev-03',
    targetId: 'prod-imported-hibiscus',
    targetType: 'product',
    targetName: 'Golden Pothos (Money Plant)',
    customerName: 'Deepa Rajan',
    customerEmail: 'deepa.rajan@outlook.com',
    customerLocation: 'Calicut, Kerala',
    rating: 5,
    title: 'Lush golden leaves and fast growth',
    comment: 'Came fresh from Mannaratharayil Gardens LLP with moist soil. Already has 3 new leaves sprouting after 2 weeks on my study table.',
    verifiedPurchase: true,
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev-04',
    targetId: 'combo-monsoon-balcony-garden',
    targetType: 'combo',
    targetName: 'Monsoon Balcony Garden Combo',
    customerName: 'Senthil Kumar',
    customerEmail: 'senthil.k@gmail.com',
    customerLocation: 'Chennai, Tamil Nadu',
    rating: 5,
    title: 'Adenium and Hibiscus are blooming non-stop',
    comment: 'Delivered to Chennai in 2 days. The Hibiscus had flower buds ready to bloom, and the Adenium caudex is thick and healthy. Excellent nursery quality.',
    verifiedPurchase: true,
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev-05',
    targetId: 'prod-chrysanthemum-seedling',
    targetType: 'product',
    targetName: 'Sansevieria Snake Plant (Futura Superba)',
    customerName: 'Roshni Kurian',
    customerEmail: 'roshni.k@gmail.com',
    customerLocation: 'Trivandrum, Kerala',
    rating: 5,
    title: 'Sturdy, vibrant yellow borders',
    comment: 'Placed on my bedroom nightstand. Looks very modern and requires virtually zero maintenance.',
    verifiedPurchase: true,
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
];

export const initialOrders: Order[] = [];

export const initialUser: User = {
  id: 'usr-customer-demo',
  name: 'Meera Nambiar',
  email: 'meera.nambiar@gmail.com',
  password: 'password123',
  phone: '08848276403',
  role: 'customer',
  addresses: [
    {
      id: 'addr-01',
      fullName: 'Meera Nambiar',
      phoneNumber: '08848276403',
      addressLine1: 'Villa 12, Palm Meadows, Kakkanad',
      addressLine2: 'Near Infopark Phase 2',
      city: 'Kochi',
      district: 'Ernakulam',
      state: 'Kerala',
      pincode: '682030',
      isDefault: true,
    },
  ],
  wishlist: [],
  createdAt: '2026-01-10T00:00:00.000Z',
};

export const initialAdminUser: User = {
  id: 'usr-admin-7seasons',
  name: '7Seasons Nursery Admin',
  email: 'admin@7seasons.com',
  password: 'Admin@123',
  phone: '08848276403',
  role: 'admin',
  addresses: [
    {
      id: 'addr-admin-hq',
      fullName: '7Seasons Nursery Operations',
      phoneNumber: '08848276403',
      addressLine1: 'Mannaratharayil Gardens LLP, Nursery Operations HQ',
      addressLine2: 'Infopark Expressway, Kakkanad',
      city: 'Kochi',
      district: 'Ernakulam',
      state: 'Kerala',
      pincode: '682030',
      isDefault: true,
    },
  ],
  wishlist: [],
  createdAt: '2026-09-19T00:00:00.000Z',
};

export const initialAdminAccounts: AdminAccount[] = [
  {
    id: 'adm-01',
    name: '7Seasons Nursery Admin',
    email: 'abinsajan36@gmail.com',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    phone: '08848276403',
    lastLogin: '2026-08-24T02:00:00.000Z',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'adm-02',
    name: 'Super Administrator',
    email: 'annanvasu36@gmail.com',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '08848276403',
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'adm-03',
    name: '7Seasons Operations Admin',
    email: 'admin@7seasons.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    phone: '08848276403',
    lastLogin: '2026-09-19T00:00:00.000Z',
    createdAt: '2026-09-19T00:00:00.000Z',
  },
];

export const sampleInstagramPosts = [
  {
    id: 'ig-1',
    image: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=600&q=80',
    caption: 'Freshly packed Beginner Combos leaving Mannaratharayil Gardens LLP for Ernakulam & Coimbatore! 🌿📦 #7Seasonsplants',
    likes: 248,
    comments: 19,
    url: 'https://instagram.com/7seasonsplants',
  },
  {
    id: 'ig-2',
    image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=600&q=80',
    caption: 'Morning blooms on our Double Red Tropical Hibiscus! Bring this vibrant color to your balcony 🌺☀️ #7SeasonsGarden',
    likes: 312,
    comments: 24,
    url: 'https://instagram.com/7seasonsplants',
  },
  {
    id: 'ig-3',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
    caption: 'Living room jungle goals with our Air-Purifying Bedroom Sanctuary Combo 🍃💚 #UrbanJungleKerala',
    likes: 419,
    comments: 31,
    url: 'https://instagram.com/7seasonsplants',
  },
  {
    id: 'ig-4',
    image: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&w=600&q=80',
    caption: 'Sansevieria Futura Superba looking sleek in our matte Scandinavian pots ✨ #SnakePlant #PlantDecor',
    likes: 185,
    comments: 14,
    url: 'https://instagram.com/7seasonsplants',
  },
  {
    id: 'ig-5',
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=600&q=80',
    caption: 'Workdesk Zen combo: Jade Plant + Syngonium for calm, focused work days 🪴💻 #GreenWorkplace',
    likes: 276,
    comments: 18,
    url: 'https://instagram.com/7seasonsplants',
  },
  {
    id: 'ig-6',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
    caption: 'Mannaratharayil Gardens LLP greenhouses at golden hour! Acclimating hardy plants for South Indian homes 🌿🏡',
    likes: 534,
    comments: 42,
    url: 'https://instagram.com/7seasonsplants',
  },
];

export const initialInstagramReels: InstagramReel[] = [
  {
    id: 'reel-1',
    title: 'How We Pack Live Plants for Safe Transit Across India 📦🌿',
    reelUrl: 'https://www.instagram.com/7seasonsplants/',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
    caption: 'From root-ball moisture lock to 5-ply ventilated nursery crates — here is our signature dispatch packaging routine ensuring lush, damage-free arrival!',
    likesCount: 1240,
    viewsCount: '18.5K',
    date: '3 days ago',
    displayOrder: 1,
    isActive: true,
    featuredOnBlog: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reel-2',
    title: 'Monsoon Plant Care & Root Rot Prevention Tips 🌧️🪴',
    reelUrl: 'https://www.instagram.com/7seasonsplants/',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=600&q=80',
    caption: 'High monsoon humidity can cause root suffocation. Watch our nursery horticulturist demonstrate proper soil aeration and drainage checks.',
    likesCount: 890,
    viewsCount: '12.2K',
    date: '1 week ago',
    displayOrder: 2,
    isActive: true,
    featuredOnBlog: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reel-3',
    title: 'Exotic Variegated Hibiscus Blooming in Kerala Beds 🌺✨',
    reelUrl: 'https://www.instagram.com/7seasonsplants/',
    thumbnailUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
    caption: 'Fresh morning walkthrough of our blooming mother beds at Mannaratharayil Gardens LLP. Look at these vibrant sunset color gradients!',
    likesCount: 2150,
    viewsCount: '34.1K',
    date: '2 weeks ago',
    displayOrder: 3,
    isActive: true,
    featuredOnBlog: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reel-4',
    title: 'Air Purifying Combo Unboxing & Potting Guide 🍃🏡',
    reelUrl: 'https://www.instagram.com/7seasonsplants/',
    thumbnailUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80',
    caption: 'Unboxing our bestselling 3-in-1 Bedroom Oxygen Trio! Simple steps to position them and keep their foliage glossy indoors.',
    likesCount: 1670,
    viewsCount: '22.8K',
    date: '3 weeks ago',
    displayOrder: 4,
    isActive: true,
    featuredOnBlog: true,
    createdAt: new Date().toISOString(),
  },
];

