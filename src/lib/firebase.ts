import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// In AI Studio, firebase-applet-config.json is auto-injected at the root during Firebase setup.
// We import it to initialize the app.
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Set local persistence for auth
setPersistence(auth, browserLocalPersistence).catch(console.error);

export { app, auth, db };
