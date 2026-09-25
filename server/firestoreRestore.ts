import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  Firestore,
} from 'firebase/firestore';

let firestoreInstance: Firestore | null = null;

function getDb(): Firestore {
  if (firestoreInstance) return firestoreInstance;

  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('firebase-applet-config.json not found');
  }

  const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const app = getApps().length > 0 ? getApp() : initializeApp(rawConfig);
  const rawDbId = (rawConfig.firestoreDatabaseId || '').toString().trim();
  const isDefault = !rawDbId || rawDbId === '(default)' || rawDbId.toLowerCase() === 'default';

  firestoreInstance = isDefault
    ? initializeFirestore(app, { experimentalForceLongPolling: true })
    : initializeFirestore(app, { experimentalForceLongPolling: true }, rawDbId);

  return firestoreInstance;
}

export interface RestoreOptions {
  mode?: 'merge' | 'replace';
  collections?: string[];
  source?: 'server_snapshot' | 'factory_seed' | 'custom_data';
  data?: Record<string, any[] | any>;
}

export interface RestoreResult {
  success: boolean;
  message: string;
  mode: 'merge' | 'replace';
  restoredCollections: string[];
  stats: Record<string, number>;
  totalDocuments: number;
  timeTakenMs: number;
  timestamp: string;
}

/**
 * Returns available backup snapshot info from database_backup directory
 */
export function getBackupSnapshots() {
  const backupDir = path.resolve(process.cwd(), 'database_backup');
  const masterBackupPath = path.join(backupDir, 'full_database_backup.json');

  let masterSnapshot = null;
  if (fs.existsSync(masterBackupPath)) {
    try {
      const stat = fs.statSync(masterBackupPath);
      const parsed = JSON.parse(fs.readFileSync(masterBackupPath, 'utf8'));
      masterSnapshot = {
        name: 'Full Database Snapshot',
        filename: 'full_database_backup.json',
        sizeBytes: stat.size,
        sizeFormatted: `${(stat.size / 1024).toFixed(1)} KB`,
        modifiedAt: stat.mtime.toISOString(),
        exportedAt: parsed.exportedAt || stat.mtime.toISOString(),
        projectId: parsed.projectId,
        stats: parsed.stats || {},
        totalRecords: Object.values(parsed.stats || {}).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0),
        collections: Object.keys(parsed.data || {}),
      };
    } catch (e: any) {
      console.warn('Error reading master backup snapshot:', e.message);
    }
  }

  // Count available seed data files
  const seedFiles = [
    'seed_products.json',
    'seed_combos.json',
    'seed_categories.json',
    'seed_daily_deals.json',
    'seed_coupons.json',
    'seed_banners.json',
    'seed_plant_care_guides.json',
    'seed_blogs.json',
    'seed_store_settings.json',
    'seed_reviews.json',
  ];

  let seedRecordCount = 0;
  const seedCollections: Record<string, number> = {};
  for (const f of seedFiles) {
    const fPath = path.join(backupDir, f);
    if (fs.existsSync(fPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(fPath, 'utf8'));
        const count = Array.isArray(content) ? content.length : 1;
        const col = f.replace(/^seed_/, '').replace(/\.json$/, '');
        seedCollections[col] = count;
        seedRecordCount += count;
      } catch (_) {}
    }
  }

  return {
    masterSnapshot,
    factorySeed: {
      name: 'Factory Default Catalog & Settings',
      totalRecords: seedRecordCount,
      collections: seedCollections,
    },
  };
}

/**
 * Loads data from factory seed files in database_backup/
 */
function loadFactorySeedData(): Record<string, any[]> {
  const backupDir = path.resolve(process.cwd(), 'database_backup');
  const mapping: Record<string, string> = {
    products: 'seed_products.json',
    combos: 'seed_combos.json',
    categories: 'seed_categories.json',
    dailyDeals: 'seed_daily_deals.json',
    coupons: 'seed_coupons.json',
    banners: 'seed_banners.json',
    plantCareGuides: 'seed_plant_care_guides.json',
    blogs: 'seed_blogs.json',
    reviews: 'seed_reviews.json',
    storeSettings: 'seed_store_settings.json',
  };

  const result: Record<string, any[]> = {};
  for (const [colName, fileName] of Object.entries(mapping)) {
    const filePath = path.join(backupDir, fileName);
    if (fs.existsSync(filePath)) {
      try {
        const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (Array.isArray(raw)) {
          result[colName] = raw;
        } else if (typeof raw === 'object' && raw !== null) {
          result[colName] = [{ _id: 'global', ...raw }];
        }
      } catch (err) {
        console.warn(`Could not load seed file ${fileName}:`, err);
      }
    }
  }
  return result;
}

/**
 * Normalizes input backup payload
 */
export function normalizeBackupPayload(payload: any): Record<string, any[]> {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid backup data payload. Must be a valid JSON object.');
  }

  // If payload contains 'data' property (like full_database_backup.json)
  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return normalizeBackupPayload(payload.data);
  }

  const normalized: Record<string, any[]> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (key === 'stats' || key === 'exportedAt' || key === 'projectId') continue;

    if (Array.isArray(value)) {
      normalized[key] = value;
    } else if (value && typeof value === 'object') {
      // Single object (e.g. storeSettings)
      normalized[key] = [(value as any)._id || (value as any).id ? value : { _id: 'global', ...value }];
    }
  }

  return normalized;
}

/**
 * Restores collections to Firestore
 */
export async function restoreDatabaseToFirestore(options: RestoreOptions): Promise<RestoreResult> {
  const startTime = Date.now();
  const db = getDb();
  const mode = options.mode || 'merge';

  let rawData: Record<string, any[]> = {};

  if (options.data && Object.keys(options.data).length > 0) {
    rawData = normalizeBackupPayload(options.data);
  } else if (options.source === 'factory_seed') {
    rawData = loadFactorySeedData();
  } else {
    // Load from database_backup/full_database_backup.json
    const backupDir = path.resolve(process.cwd(), 'database_backup');
    const masterBackupPath = path.join(backupDir, 'full_database_backup.json');
    if (!fs.existsSync(masterBackupPath)) {
      throw new Error('Master database backup file full_database_backup.json does not exist. Please generate a backup first.');
    }
    const parsed = JSON.parse(fs.readFileSync(masterBackupPath, 'utf8'));
    rawData = normalizeBackupPayload(parsed);
  }

  const availableCollections = Object.keys(rawData);
  if (availableCollections.length === 0) {
    throw new Error('No valid collections found in the backup dataset.');
  }

  // Filter requested collections if specified
  const targetCollections = (options.collections && options.collections.length > 0)
    ? options.collections.filter((col) => availableCollections.includes(col))
    : availableCollections;

  if (targetCollections.length === 0) {
    throw new Error(`None of the requested collections (${options.collections?.join(', ')}) were found in the backup.`);
  }

  const stats: Record<string, number> = {};
  let totalDocsRestored = 0;

  for (const colName of targetCollections) {
    const records = rawData[colName] || [];
    if (!Array.isArray(records) || records.length === 0) {
      stats[colName] = 0;
      continue;
    }

    console.log(`[Restore Engine] Restoring collection '${colName}' (${records.length} items) in mode: ${mode}...`);

    // In replace mode, delete existing documents in collection first
    if (mode === 'replace') {
      try {
        const existingSnap = await getDocs(collection(db, colName));
        if (!existingSnap.empty) {
          console.log(`[Restore Engine] Clearing ${existingSnap.size} existing docs from '${colName}' for clean replace...`);
          // Batch deletes
          const deleteBatches: any[] = [];
          let currentBatch = writeBatch(db);
          let opCount = 0;

          for (const d of existingSnap.docs) {
            currentBatch.delete(d.ref);
            opCount++;
            if (opCount >= 400) {
              deleteBatches.push(currentBatch);
              currentBatch = writeBatch(db);
              opCount = 0;
            }
          }
          if (opCount > 0) {
            deleteBatches.push(currentBatch);
          }

          for (const b of deleteBatches) {
            await b.commit();
          }
        }
      } catch (err: any) {
        console.warn(`[Restore Engine] Warning clearing collection '${colName}':`, err.message || err);
      }
    }

    // Now write restored records
    const writeBatches: any[] = [];
    let currentBatch = writeBatch(db);
    let opCount = 0;
    let colRestoredCount = 0;

    for (const record of records) {
      if (!record || typeof record !== 'object') continue;

      // Determine document ID
      let docId: string;
      if (colName === 'storeSettings') {
        docId = 'global';
      } else {
        docId = String(record._id || record.id || record.code || record.slug || `${colName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
      }

      // Clean record: remove undefined values, keep consistent payload
      const cleanedData: Record<string, any> = {};
      for (const [k, v] of Object.entries(record)) {
        if (k === '_id' && colName !== 'storeSettings') continue; // omit _id duplicate
        if (v !== undefined) {
          cleanedData[k] = v;
        }
      }

      // Ensure id field is set if document had _id
      if (!cleanedData.id && record._id) {
        cleanedData.id = record._id;
      }

      const docRef = doc(db, colName, docId);
      currentBatch.set(docRef, cleanedData, { merge: mode === 'merge' });
      opCount++;
      colRestoredCount++;

      if (opCount >= 350) {
        writeBatches.push(currentBatch);
        currentBatch = writeBatch(db);
        opCount = 0;
      }
    }

    if (opCount > 0) {
      writeBatches.push(currentBatch);
    }

    for (const b of writeBatches) {
      await b.commit();
    }

    stats[colName] = colRestoredCount;
    totalDocsRestored += colRestoredCount;
    console.log(`[Restore Engine] Successfully restored ${colRestoredCount} documents in '${colName}'`);
  }

  const timeTakenMs = Date.now() - startTime;
  console.log(`[Restore Engine] Restore completed in ${timeTakenMs}ms. Total documents restored: ${totalDocsRestored}`);

  return {
    success: true,
    message: `Successfully restored ${totalDocsRestored} records across ${targetCollections.length} collections.`,
    mode,
    restoredCollections: targetCollections,
    stats,
    totalDocuments: totalDocsRestored,
    timeTakenMs,
    timestamp: new Date().toISOString(),
  };
}
