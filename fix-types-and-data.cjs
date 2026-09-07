const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'initialData.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// The new products have properties that aren't in the Product type.
// Let's remove them from the strings in initialData.ts

// First let's remove the extra fields from products
content = content.replace(/    careLevel: .*,\n/g, '');
content = content.replace(/    lightRequirement: .*,\n/g, '');
content = content.replace(/    waterRequirement: .*,\n/g, '');
content = content.replace(/    petFriendly: .*,\n/g, '');
content = content.replace(/    growthRate: .*,\n/g, '');
content = content.replace(/    tags: .*,\n/g, '');
content = content.replace(/    createdAt: .*,\n/g, '');
content = content.replace(/    updatedAt: .*,\n/g, '');

// Now fix the PlantCombo items to match the required type
const combo1Items = `    items: [
      { productId: 'prod-philodendron-jiffy', productName: 'Philodendron (Jiffy Plant)', image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=150&q=80', itemType: 'plant', quantity: 1 },
      { productId: 'prod-alocasia-jiffy', productName: 'Alocasia (Jiffy Plant)', image: 'https://images.unsplash.com/photo-1620127394144-8848416d86fb?auto=format&fit=crop&w=150&q=80', itemType: 'plant', quantity: 1 },
      { productId: 'prod-caladium-jiffy', productName: 'Caladium (Jiffy Plant)', image: 'https://images.unsplash.com/photo-1601370690183-1c7796ecec61?auto=format&fit=crop&w=150&q=80', itemType: 'plant', quantity: 1 },
      { productId: 'prod-syngonium-jiffy', productName: 'Syngonium (Jiffy Plant)', image: 'https://images.unsplash.com/photo-1611211232932-da3113c5b960?auto=format&fit=crop&w=150&q=80', itemType: 'plant', quantity: 1 }
    ],`;

const combo2Items = `    items: [
      { productId: 'prod-sweet-alyssum', productName: 'Sweet Alyssum', image: 'https://images.unsplash.com/photo-1621272036047-bf0ebfd40f1a?auto=format&fit=crop&w=150&q=80', itemType: 'plant', quantity: 2 },
      { productId: 'prod-chrysanthemum-seedling', productName: 'Chrysanthemum Seedling', image: 'https://images.unsplash.com/photo-1603507022069-450f3b06325f?auto=format&fit=crop&w=150&q=80', itemType: 'plant', quantity: 1 },
      { productId: 'prod-melastoma', productName: 'Melastoma', image: 'https://images.unsplash.com/photo-1681283626245-779836a0fbac?auto=format&fit=crop&w=150&q=80', itemType: 'plant', quantity: 1 }
    ],`;

// The old replace regex
content = content.replace(/    items: \[\n      \{ productId: 'prod-philodendron-jiffy'[\s\S]*?\],\n/m, combo1Items + '\n');
content = content.replace(/    items: \[\n      \{ productId: 'prod-sweet-alyssum'[\s\S]*?\],\n/m, combo2Items + '\n');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed types and fields!');
