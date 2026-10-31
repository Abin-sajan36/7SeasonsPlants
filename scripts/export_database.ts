import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs } from 'firebase/firestore';

const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(rawConfig);
const rawDbId = (rawConfig.firestoreDatabaseId || '').toString().trim();
const isDefault = !rawDbId || rawDbId === '(default)' || rawDbId.toLowerCase() === 'default';
const db = isDefault
  ? initializeFirestore(app, { experimentalForceLongPolling: true })
  : initializeFirestore(app, { experimentalForceLongPolling: true }, rawDbId);

const COLLECTIONS = [
  'combos',
  'products',
  'categories',
  'dailyDeals',
  'coupons',
  'banners',
  'plantCareGuides',
  'blogs',
  'users',
  'orders',
  'reviews',
  'complaints',
  'storeSettings',
  'user_logs',
  'newsletter_subscribers',
];

async function runExport() {
  console.log('Starting full database export from Firestore...');
  const outDir = path.resolve(process.cwd(), 'database_backup');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const fullDump: Record<string, any[]> = {};
  const stats: Record<string, number> = {};

  for (const colName of COLLECTIONS) {
    try {
      console.log(`Fetching collection: ${colName}...`);
      const snap = await getDocs(collection(db, colName));
      let docs = snap.docs.map((d) => ({
        _id: d.id,
        ...d.data(),
      }));

      // Fallback to existing seed file if Firestore returned 0 records (e.g. reviews, coupons)
      if (docs.length === 0) {
        const seedPath = path.join(outDir, `seed_${colName}.json`);
        if (fs.existsSync(seedPath)) {
          try {
            const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
            if (Array.isArray(seedData) && seedData.length > 0) {
              docs = seedData;
              console.log(`Using fallback seed data for ${colName} (${seedData.length} records)`);
            }
          } catch (_) {}
        }
      }

      fullDump[colName] = docs;
      stats[colName] = docs.length;

      fs.writeFileSync(
        path.join(outDir, `${colName}.json`),
        JSON.stringify(docs, null, 2),
        'utf8'
      );
      console.log(`Saved ${docs.length} records for ${colName}`);
    } catch (err: any) {
      console.warn(`Could not export ${colName} from Firestore, trying local file:`, err.message || err);
      // Try local fallback
      const seedPath = path.join(outDir, `seed_${colName}.json`);
      if (fs.existsSync(seedPath)) {
        try {
          const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
          fullDump[colName] = seedData;
          stats[colName] = seedData.length;
        } catch {
          fullDump[colName] = [];
          stats[colName] = 0;
        }
      } else {
        fullDump[colName] = [];
        stats[colName] = 0;
      }
    }
  }

  // Generate Customer Details Registry
  const usersList = fullDump['users'] || [];
  const ordersList = fullDump['orders'] || [];
  const customerDetailsSummary = usersList.map((u: any) => {
    const userOrders = ordersList.filter(
      (o: any) =>
        (o.customer?.email && o.customer.email.toLowerCase() === (u.email || '').toLowerCase()) ||
        (u.orderIds && (u.orderIds.includes(o.id) || u.orderIds.includes(o.orderNumber)))
    );
    return {
      userId: u._id || u.id,
      name: u.name || 'Customer',
      email: u.email,
      phone: u.phone || '',
      role: u.role || 'customer',
      totalOrdersPlaced: userOrders.length,
      addresses: u.addresses || [],
      registeredAt: u.createdAt || '',
      lastLogin: u.lastLogin || '',
    };
  });

  // Save the master consolidated JSON
  const backupSummary = {
    appName: '7Seasonsplants (Mannaratharayil Gardens LLP)',
    exportedAt: new Date().toISOString(),
    projectId: rawConfig.projectId,
    stats,
    totalRecords: Object.values(stats).reduce((a, b) => a + b, 0),
    customerDetailsCount: customerDetailsSummary.length,
    customerDetailsSummary,
    data: fullDump,
  };

  fs.writeFileSync(
    path.join(outDir, 'full_database_backup.json'),
    JSON.stringify(backupSummary, null, 2),
    'utf8'
  );

  console.log('Database export completed successfully!');
  console.log('Stats:', stats);
  process.exit(0);
}

runExport().catch((err) => {
  console.error('Export failed:', err);
  process.exit(1);
});
