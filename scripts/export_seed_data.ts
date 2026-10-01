import fs from 'fs';
import path from 'path';
import * as initialData from '../src/data/initialData';

const outDir = path.resolve(process.cwd(), 'database_backup');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Write initial data components to JSON
fs.writeFileSync(
  path.join(outDir, 'seed_reviews.json'),
  JSON.stringify(initialData.initialReviews, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(outDir, 'seed_products.json'),
  JSON.stringify(initialData.initialProducts, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(outDir, 'seed_combos.json'),
  JSON.stringify(initialData.initialPlantCombos, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(outDir, 'seed_categories.json'),
  JSON.stringify(initialData.initialCategories, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(outDir, 'seed_daily_deals.json'),
  JSON.stringify(initialData.initialDailyDeals, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(outDir, 'seed_coupons.json'),
  JSON.stringify(initialData.initialCoupons, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(outDir, 'seed_banners.json'),
  JSON.stringify(initialData.initialBanners, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(outDir, 'seed_plant_care_guides.json'),
  JSON.stringify(initialData.initialPlantCareGuides, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(outDir, 'seed_blogs.json'),
  JSON.stringify(initialData.initialBlogPosts, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(outDir, 'seed_store_settings.json'),
  JSON.stringify(initialData.initialStoreSettings, null, 2),
  'utf8'
);

console.log('Seed data exported to database_backup successfully!');
process.exit(0);
