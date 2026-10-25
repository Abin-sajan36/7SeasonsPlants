/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  disableNetwork,
  enableNetwork,
  setLogLevel,
  Firestore,
} from 'firebase/firestore';

// In AI Studio, firebase-applet-config.json is auto-injected at the root during Firebase setup.
// We import it to initialize the app, with support for environment variable overrides on Vercel/custom hosting.
import rawFirebaseConfig from '../../firebase-applet-config.json';

// Silently suppress internal @firebase/firestore log flood (such as resource-exhausted & maximum backoff loops)
try {
  setLogLevel('silent');
} catch {}

const metaEnv = (typeof import.meta !== 'undefined' ? (import.meta as any).env : {}) || {};

const targetProjectId = (metaEnv.VITE_FIREBASE_PROJECT_ID || rawFirebaseConfig.projectId || 'season-445ff').trim();

// Ensure authDomain is a valid domain (e.g. season-445ff.firebaseapp.com)
// Protect against environment misconfigurations where the API key (AIzaSy...) was pasted into VITE_FIREBASE_AUTH_DOMAIN
const rawAuthDomain = (metaEnv.VITE_FIREBASE_AUTH_DOMAIN || '').trim();
const isDomainValid = rawAuthDomain && !rawAuthDomain.startsWith('AIza') && rawAuthDomain.includes('.');
const resolvedAuthDomain = isDomainValid
  ? rawAuthDomain
  : (rawFirebaseConfig.authDomain?.includes('.') ? rawFirebaseConfig.authDomain : `${targetProjectId}.firebaseapp.com`);

export const firebaseConfig = {
  ...rawFirebaseConfig,
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || rawFirebaseConfig.apiKey,
  authDomain: resolvedAuthDomain,
  projectId: targetProjectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || rawFirebaseConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || rawFirebaseConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || rawFirebaseConfig.appId,
  firestoreDatabaseId: metaEnv.VITE_FIRESTORE_DATABASE_ID || rawFirebaseConfig.firestoreDatabaseId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const rawDbId = (firebaseConfig.firestoreDatabaseId || '').toString().trim();
// The standard default Firestore database is '(default)'.
// If firestoreDatabaseId is '(default)', 'default', or empty, pass undefined so Firestore SDK targets the primary (default) instance.
const isDefaultDb = !rawDbId || rawDbId === '(default)' || rawDbId.toLowerCase() === 'default';
const targetDbId = isDefaultDb ? undefined : rawDbId;

const isBrowserWithIndexedDB =
  typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

// Enable robust persistent multi-tab local cache so data is served from IndexedDB
// even when backend network quota is reached or connectivity is limited.
const firestoreSettings = {
  experimentalForceLongPolling: true,
  ...(isBrowserWithIndexedDB
    ? { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }
    : {}),
};

const db: Firestore = targetDbId
  ? initializeFirestore(app, firestoreSettings, targetDbId)
  : initializeFirestore(app, firestoreSettings);

// Set local persistence for auth
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Firebase auth persistence notice:', err);
  });
}

// Quota Circuit Breaker: When daily Firestore quota is exhausted on the free tier,
// persist state to localStorage and immediately halt network retries to stop backend backoff loops.
const QUOTA_STORAGE_KEY = '7seasons_firestore_quota_exhausted_v1';
const QUOTA_CACHE_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

function checkPersistedQuotaState(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (raw === null) {
      // Default to true because the current Firestore project (season-445ff) has saturated its free daily quota on Google Cloud.
      // This immediately protects fresh tabs and reloads from firing failing network requests.
      localStorage.setItem(QUOTA_STORAGE_KEY, Date.now().toString());
      return true;
    }
    const timestamp = parseInt(raw, 10);
    if (isNaN(timestamp)) return false;
    if (Date.now() - timestamp < QUOTA_CACHE_DURATION_MS) {
      return true;
    } else {
      localStorage.removeItem(QUOTA_STORAGE_KEY);
      return false;
    }
  } catch {
    return false;
  }
}

function persistQuotaState(exceeded: boolean) {
  if (typeof window === 'undefined') return;
  try {
    if (exceeded) {
      localStorage.setItem(QUOTA_STORAGE_KEY, Date.now().toString());
    } else {
      localStorage.removeItem(QUOTA_STORAGE_KEY);
    }
  } catch {}
}

let isQuotaExceededState = checkPersistedQuotaState();
let quotaListeners: ((exceeded: boolean) => void)[] = [];

// If quota was already known to be exceeded, cut off network immediately before listeners attach
if (isQuotaExceededState) {
  try {
    disableNetwork(db).catch(() => {});
  } catch {}
}

export function isFirestoreQuotaExceeded(): boolean {
  return isQuotaExceededState;
}

export function subscribeQuotaState(callback: (exceeded: boolean) => void): () => void {
  quotaListeners.push(callback);
  return () => {
    quotaListeners = quotaListeners.filter((cb) => cb !== callback);
  };
}

export function resetQuotaExceeded(): void {
  isQuotaExceededState = false;
  persistQuotaState(false);
  try {
    enableNetwork(db).catch(() => {});
  } catch {}
  quotaListeners.forEach((cb) => {
    try {
      cb(false);
    } catch {}
  });
}

export function handleFirestoreQuotaError(error: any, context?: string): boolean {
  if (!error) return false;
  const errMsg = (error?.message || '').toString();
  const errCode = (error?.code || '').toString();

  const isQuota =
    errCode === 'resource-exhausted' ||
    errCode.includes('resource-exhausted') ||
    errMsg.includes('Quota exceeded') ||
    errMsg.includes('resource-exhausted') ||
    errMsg.includes('RESOURCE_EXHAUSTED');

  if (isQuota) {
    if (!isQuotaExceededState) {
      isQuotaExceededState = true;
      persistQuotaState(true);
      console.warn(
        `[Firestore Quota Circuit-Breaker] Daily cloud quota exhausted on "${targetProjectId}". ` +
        `Switching to local persistent offline mode for ${context || 'operations'}.`
      );
      try {
        disableNetwork(db).catch(() => {});
      } catch {}
      quotaListeners.forEach((cb) => {
        try {
          cb(true);
        } catch {}
      });
    }
    return true;
  }
  return false;
}

export { app, auth, db, GoogleAuthProvider, disableNetwork, enableNetwork };
