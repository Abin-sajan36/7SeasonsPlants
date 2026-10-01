const fs = require('fs');
let code = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

const updatedUpdateUserProfile = `  const updateUserProfile = async (profile: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...profile };
    setCurrentUser(updatedUser);
      
    try {
      const removeUndefined = (obj) => {
        if (Array.isArray(obj)) {
          return obj.map(removeUndefined);
        } else if (obj !== null && typeof obj === 'object') {
          return Object.fromEntries(
            Object.entries(obj)
              .filter(([_, v]) => v !== undefined)
              .map(([k, v]) => [k, removeUndefined(v)])
          );
        }
        return obj;
      };
      
      const cleanData = removeUndefined(updatedUser);
      await setDoc(doc(db, 'users', currentUser.id), cleanData, { merge: true });
    } catch (e) {
      console.error('Failed to sync profile to Firestore:', e);
    }`;

const regex = /const updateUserProfile = async \(profile: Partial<User>\) => \{\s*if \(!currentUser\) return;\s*const updatedUser = \{ \.\.\.currentUser, \.\.\.profile \};\s*setCurrentUser\(updatedUser\);\s*try \{\s*const cleanData = Object\.fromEntries\(\s*Object\.entries\(updatedUser\)\.filter\(\(\[_, v\]\) => v !== undefined\)\s*\);\s*await setDoc\(doc\(db, 'users', currentUser\.id\), cleanData, \{ merge: true \}\);\s*\} catch \(e\) \{\s*console\.error\('Failed to sync profile to Firestore:', e\);\s*\}/m;

if (regex.test(code)) {
  code = code.replace(regex, updatedUpdateUserProfile);
  fs.writeFileSync('src/context/StoreContext.tsx', code);
  console.log("Patched StoreContext successfully.");
} else {
  console.error("Failed to find updateUserProfile in StoreContext.");
}
