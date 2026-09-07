const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'initialData.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// The replacement was messed up and the file doesn't have the original properties anymore.
// I can fix this by adding missing fields exactly.

// Replace the specific products that I added with proper ones that match the type exactly.

const newProducts = `export const initialProducts: Product[] = [
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
    attributes: {
      light: 'Full Sun',
      water: 'Moderate',
      petFriendly: false,
      difficulty: 'Moderate',
      size: 'Small'
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
    attributes: {
      light: 'Full Sun to Partial Shade',
      water: 'High',
      petFriendly: true,
      difficulty: 'Moderate',
      size: 'Medium'
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
    attributes: {
      light: 'Full Sun',
      water: 'Moderate',
      petFriendly: true,
      difficulty: 'Easy',
      size: 'Small'
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
    attributes: {
      light: 'Bright Indirect Light',
      water: 'Moderate',
      petFriendly: false,
      difficulty: 'Hard',
      size: 'Large'
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
    attributes: {
      light: 'Bright Indirect Light',
      water: 'Moderate',
      petFriendly: false,
      difficulty: 'Easy',
      size: 'Small'
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
    attributes: {
      light: 'Bright Indirect Light',
      water: 'Moderate',
      petFriendly: false,
      difficulty: 'Moderate',
      size: 'Small'
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
    attributes: {
      light: 'Partial Shade',
      water: 'High',
      petFriendly: false,
      difficulty: 'Moderate',
      size: 'Small'
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
    attributes: {
      light: 'Low to Bright Indirect Light',
      water: 'Moderate',
      petFriendly: false,
      difficulty: 'Easy',
      size: 'Small'
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
    attributes: {
      light: 'Full Sun',
      water: 'High',
      petFriendly: true,
      difficulty: 'Moderate',
      size: 'Medium'
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
];`;

const newCombos = `export const initialPlantCombos: PlantCombo[] = [
  {
    id: 'combo-jiffy-bundle',
    name: 'Jiffy Plant Bundle',
    slug: 'jiffy-plant-bundle',
    shortDescription: 'The ultimate Jiffy Plant collection featuring 4 stunning varieties.',
    description: 'Get all the popular Jiffy plants featured in our recent reel! Includes a Philodendron, Alocasia, Caladium, and Syngonium. Perfect for kickstarting an indoor jungle.',
    category: 'Indoor Combos',
    price: 999,
    originalPrice: 1096,
    savings: 97,
    discountPercentage: 9,
    stock: 20,
    sku: '7S-CMB-JIF-01',
    images: ['https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=900&q=80'],
    rating: 4.9,
    reviewCount: 15,
    status: 'published',
    items: [
      { productId: 'prod-philodendron-jiffy', productName: 'Philodendron (Jiffy Plant)', image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=150&q=80', itemType: 'plant', quantity: 1 },
      { productId: 'prod-alocasia-jiffy', productName: 'Alocasia (Jiffy Plant)', image: 'https://images.unsplash.com/photo-1620127394144-8848416d86fb?auto=format&fit=crop&w=150&q=80', itemType: 'plant', quantity: 1 },
      { productId: 'prod-caladium-jiffy', productName: 'Caladium (Jiffy Plant)', image: 'https://images.unsplash.com/photo-1601370690183-1c7796ecec61?auto=format&fit=crop&w=150&q=80', itemType: 'plant', quantity: 1 },
      { productId: 'prod-syngonium-jiffy', productName: 'Syngonium (Jiffy Plant)', image: 'https://images.unsplash.com/photo-1611211232932-da3113c5b960?auto=format&fit=crop&w=150&q=80', itemType: 'plant', quantity: 1 }
    ],
    tags: ['combo'],
    careSummary: 'Water when dry, give bright light.',
    benefits: ['Looks great', 'Cleans air'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'combo-balcony-bloomers',
    name: 'Balcony Bloomers Combo',
    slug: 'balcony-bloomers-combo',
    shortDescription: 'A fragrant, colorful combo perfect for sunny balconies.',
    description: 'Transform your balcony into a vibrant garden! This combo features the fragrant Sweet Alyssum, vibrant Chrysanthemum seedlings, and the stunning purple Melastoma.',
    category: 'Balcony Combos',
    price: 500,
    originalPrice: 550,
    savings: 50,
    discountPercentage: 9,
    stock: 25,
    sku: '7S-CMB-BAL-01',
    images: ['https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=900&q=80'],
    rating: 4.8,
    reviewCount: 22,
    status: 'published',
    items: [
      { productId: 'prod-sweet-alyssum', productName: 'Sweet Alyssum', image: 'https://images.unsplash.com/photo-1621272036047-bf0ebfd40f1a?auto=format&fit=crop&w=150&q=80', itemType: 'plant', quantity: 2 },
      { productId: 'prod-chrysanthemum-seedling', productName: 'Chrysanthemum Seedling', image: 'https://images.unsplash.com/photo-1603507022069-450f3b06325f?auto=format&fit=crop&w=150&q=80', itemType: 'plant', quantity: 1 },
      { productId: 'prod-melastoma', productName: 'Melastoma', image: 'https://images.unsplash.com/photo-1681283626245-779836a0fbac?auto=format&fit=crop&w=150&q=80', itemType: 'plant', quantity: 1 }
    ],
    tags: ['combo'],
    careSummary: 'Water when dry, give bright light.',
    benefits: ['Looks great', 'Cleans air'],
    createdAt: new Date().toISOString(),
  }
];`;

content = content.replace(/export const initialProducts: Product\[\] = \[([\s\S]*?)\];/g, newProducts);
content = content.replace(/export const initialPlantCombos: PlantCombo\[\] = \[([\s\S]*?)\];/g, newCombos);

// Just in case I messed up BlogPosts and Reviews
content = content.replace(/    isPublished: true,\s*tags: \['plants'\],/g, "    isPublished: true,");
content = content.replace(/    status: 'approved',\s*createdAt: new Date\(\)\.toISOString\(\),/g, "    status: 'approved',");

content = content.replace(/    isPublished: true,/g, "    isPublished: true,\n    tags: ['plants'],");
content = content.replace(/    status: 'approved',/g, "    status: 'approved',\n    createdAt: new Date().toISOString(),");

// Check if createdAt is missing in orders
if (!content.includes('createdAt: ') && content.includes('date:')) {
    content = content.replace(/    date: /g, '    createdAt: ');
} else if (!content.includes('createdAt:') && content.includes('orderStatus:')) {
    content = content.replace(/    orderStatus:/g, "    createdAt: new Date().toISOString(),\n    orderStatus:");
} else if (content.includes('orderStatus:')) {
    // maybe there's a different way
    content = content.replace(/    orderStatus: (.*),\n    statusHistory:/g, "    orderStatus: $1,\n    createdAt: new Date().toISOString(),\n    statusHistory:");
}

// Make sure AdminAccount has createdAt
content = content.replace(/    lastLogin: (.*),\n    createdAt: new Date\(\)\.toISOString\(\),/g, "    lastLogin: $1,");
content = content.replace(/    lastLogin: (.*),/g, "    lastLogin: $1,\n    createdAt: new Date().toISOString(),");


fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed exactly!');
