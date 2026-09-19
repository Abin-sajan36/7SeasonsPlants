import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';

// In AI Studio, firebase-applet-config.json is auto-injected at the root during Firebase setup.
// We import it to initialize the app.
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Use initializeFirestore with experimentalForceLongPolling to eliminate the 10-second backend connection timeout
// in browser iframes and sandboxed proxy environments
const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);

// Set local persistence for auth
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Firebase auth persistence notice:', err);
  });

  // Validate connection to Firestore
  getDocFromServer(doc(db, 'storeSettings', 'global')).catch((error) => {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore running in offline mode. Cached data will be used.');
    }
  });
}

export { app, auth, db, GoogleAuthProvider };
