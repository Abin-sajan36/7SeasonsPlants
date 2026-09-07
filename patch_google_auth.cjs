const fs = require('fs');
let code = fs.readFileSync('src/context/StoreContext.tsx', 'utf-8');

// 1. Add GoogleAuthProvider and signInWithPopup to imports
code = code.replace(
  /import \{\s*createUserWithEmailAndPassword,\s*signInWithEmailAndPassword,\s*signOut,\s*onAuthStateChanged,\s*sendPasswordResetEmail\s*\} from 'firebase\/auth';/,
  `import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';`
);

// 2. Add loginWithGoogle to context interface
code = code.replace(
  'loginCustomer: (email: string, password?: string) => Promise<boolean>;',
  'loginCustomer: (email: string, password?: string) => Promise<boolean>;\n  loginWithGoogle: () => Promise<boolean>;'
);

// 3. Add loginWithGoogle implementation before loginCustomer
const loginCustomerStart = '  const loginCustomer = async (email: string, _password?: string): Promise<boolean> => {';
const googleAuthImpl = `  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let userData: User;
      
      if (userDoc.exists()) {
        userData = userDoc.data() as User;
      } else {
        // Register new user
        userData = {
          id: user.uid,
          name: user.displayName || 'Plant Lover',
          email: user.email || '',
          phone: user.phoneNumber || '',
          role: 'customer',
          addresses: [],
          wishlist: [],
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', user.uid), userData);
      }
      
      setIsAdminAuthenticated(userData.role === 'admin');
      setCurrentAdmin(userData.role === 'admin' ? (userData as any) : null);
      
      setCurrentUser({ ...userData, id: user.uid });
      localStorage.setItem(\`\${STORAGE_KEY}_user\`, JSON.stringify({ ...userData, id: user.uid }));
      
      addToast({
        type: 'success',
        title: 'Welcome! 🌿',
        message: \`Signed in as \${userData.name}\`,
      });
      return true;
    } catch (error: any) {
      addToast({ type: 'error', title: 'Authentication Failed', message: error.message });
      return false;
    }
  };

`;

code = code.replace(loginCustomerStart, googleAuthImpl + loginCustomerStart);

// 4. Add to context provider value
code = code.replace(
  'loginCustomer,\n        sendRegistrationOtp,',
  'loginCustomer,\n        loginWithGoogle,\n        sendRegistrationOtp,'
);

fs.writeFileSync('src/context/StoreContext.tsx', code);
console.log("Successfully patched Google Auth in StoreContext");
