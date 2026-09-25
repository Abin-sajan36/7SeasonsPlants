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
  'newsletter_subscribers',
  'complaints',
  'reviews',
  'storeSettings',
  'siteSettings',
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
      const docs = snap.docs.map((d) => ({
        _id: d.id,
        ...d.data(),
      }));
      fullDump[colName] = docs;
      stats[colName] = docs.length;

      fs.writeFileSync(
        path.join(outDir, `${colName}.json`),
        JSON.stringify(docs, null, 2),
        'utf8'
      );
      console.log(`Saved ${docs.length} records for ${colName}`);
    } catch (err: any) {
      console.warn(`Could not export ${colName}:`, err.message || err);
      fullDump[colName] = [];
      stats[colName] = 0;
    }
  }

  // Save the master consolidated JSON
  const backupSummary = {
    exportedAt: new Date().toISOString(),
    projectId: rawConfig.projectId,
    stats,
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
