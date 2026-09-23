/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';

// In AI Studio, firebase-applet-config.json is auto-injected at the root during Firebase setup.
// We import it to initialize the app, with support for environment variable overrides on Vercel/custom hosting.
import rawFirebaseConfig from '../../firebase-applet-config.json';

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

// Use initializeFirestore with experimentalForceLongPolling to eliminate backend connection timeouts
// in browser iframes and sandboxed proxy environments
const db = targetDbId
  ? initializeFirestore(app, { experimentalForceLongPolling: true }, targetDbId)
  : initializeFirestore(app, { experimentalForceLongPolling: true });

// Set local persistence for auth
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Firebase auth persistence notice:', err);
  });

  // Validate connection to Firestore
  getDocFromServer(doc(db, 'storeSettings', 'global')).catch((error) => {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline')) {
        console.warn('Firestore running in offline mode. Cached data will be used.');
      } else if (error.message.includes('not found') || error.message.includes('Database')) {
        console.error(
          `Firestore Database (${targetDbId || '(default)'}) not found in project "${firebaseConfig.projectId}". ` +
          `Please visit https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore to create the Cloud Firestore database.`
        );
      }
    }
  });
}

export { app, auth, db, GoogleAuthProvider };
