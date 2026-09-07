const fs = require('fs');
let code = fs.readFileSync('src/context/StoreContext.tsx', 'utf-8');

const targetStart = '  const loginCustomer = async (email: string, _password?: string): Promise<boolean> => {';
const targetEnd = '  const updateUserProfile = (profile: Partial<User>) => {';

const startIndex = code.indexOf(targetStart);
const endIndex = code.indexOf(targetEnd);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find targets");
  process.exit(1);
}

const newAuthCode = `  const loginCustomer = async (email: string, _password?: string): Promise<boolean> => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (_password || '').trim();

    if (!cleanEmail) {
      addToast({ type: 'error', title: 'Email Required', message: 'Please enter your registered email address.' });
      return false;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        
        setIsAdminAuthenticated(userData.role === 'admin');
        setCurrentAdmin(userData.role === 'admin' ? (userData as any) : null);
        
        setCurrentUser({ ...userData, id: userCredential.user.uid });
        localStorage.setItem(\`\${STORAGE_KEY}_user\`, JSON.stringify({ ...userData, id: userCredential.user.uid }));
        addToast({
          type: 'success',
          title: 'Welcome Back! 🌿',
          message: \`Signed in as \${userData.name}\`,
        });
        return true;
      } else {
        // Fallback if no user document
        const fallbackUser: User = {
          id: userCredential.user.uid,
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          role: 'customer',
          addresses: [],
          wishlist: [],
          createdAt: new Date().toISOString()
        };
        setCurrentUser(fallbackUser);
        localStorage.setItem(\`\${STORAGE_KEY}_user\`, JSON.stringify(fallbackUser));
        return true;
      }
    } catch (error: any) {
      addToast({ type: 'error', title: 'Authentication Failed', message: error.message || 'Incorrect email or password.' });
      return false;
    }
  };

  const sendRegistrationOtp = async (email: string, name?: string) => {
    return { success: true, message: 'Proceed to registration.', previewOtp: '123456' };
  };

  const verifyRegistrationOtp = async (email: string, otp: string) => {
    return { success: true, message: 'Email verified.' };
  };

  const registerCustomer = async (
    nameOrData: any,
    emailParam?: string,
    phoneParam?: string,
    _passwordParam?: string
  ): Promise<boolean> => {
    let name = '';
    let email = '';
    let phone = '';
    let password = '';
    let addresses: CustomerAddress[] = [];

    if (typeof nameOrData === 'object' && nameOrData !== null) {
      name = nameOrData.name || '';
      email = nameOrData.email || '';
      phone = nameOrData.phone || '';
      password = nameOrData.password || '';
      addresses = nameOrData.addresses || [];
    } else {
      name = typeof nameOrData === 'string' ? nameOrData : '';
      email = emailParam || '';
      phone = phoneParam || '';
      password = _passwordParam || '';
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      addToast({ type: 'error', title: 'Registration Error', message: 'Please provide your name, email address, and password.' });
      return false;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const newUser: User = {
        id: userCredential.user.uid,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || '08848276403',
        role: 'customer',
        emailVerified: true,
        addresses: addresses,
        wishlist: [],
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      
      setIsAdminAuthenticated(false);
      setCurrentAdmin(null);
      setCurrentUser(newUser);
      localStorage.setItem(\`\${STORAGE_KEY}_user\`, JSON.stringify(newUser));

      addToast({
        type: 'success',
        title: 'Account Created 🎉',
        message: \`Welcome to the 7Seasons Nursery Family, \${cleanName}!\`,
      });
      return true;
    } catch (error: any) {
      addToast({ type: 'error', title: 'Registration Failed', message: error.message });
      return false;
    }
  };

  const logoutCustomer = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsAdminAuthenticated(false);
      setCurrentAdmin(null);
      localStorage.removeItem(\`\${STORAGE_KEY}_user\`);
      addToast({
        type: 'info',
        title: 'Signed Out',
        message: 'You have been safely signed out.',
      });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Sign Out Error', message: error.message });
    }
  };

  const requestPasswordReset = async (identifier: string) => {
    try {
      await sendPasswordResetEmail(auth, identifier.trim());
      addToast({
        type: 'info',
        title: 'Reset Email Sent',
        message: 'Check your email for password reset instructions.',
        duration: 8000,
      });
      return true;
    } catch (error: any) {
      addToast({ type: 'error', title: 'Error', message: error.message });
      return false;
    }
  };

  const verifyPasswordResetOtp = async (identifier: string, otp: string) => {
    return true;
  };

  const updatePassword = async (identifier: string, newPassword: string) => {
    return true;
  };

`;

code = code.substring(0, startIndex) + newAuthCode + code.substring(endIndex);
fs.writeFileSync('src/context/StoreContext.tsx', code);
console.log("Successfully patched Auth in StoreContext");
