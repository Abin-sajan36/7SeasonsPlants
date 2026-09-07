const fs = require('fs');
let code = fs.readFileSync('src/context/StoreContext.tsx', 'utf-8');

// 1. Remove the global wishlist state
code = code.replace(/  const \[wishlist, setWishlist\] = useState<string\[\]>\(\(\) => \{[\s\S]*?  \}\);\n/g, '');

// 2. Remove the global wishlist useEffect
code = code.replace(/  useEffect\(\(\) => \{\n    localStorage\.setItem\(`\$\{STORAGE_KEY\}_wishlist`, JSON\.stringify\(wishlist\)\);\n  \}, \[wishlist\]\);\n/g, '');

// 3. Add derived wishlist and update toggleWishlist, isInWishlist, clearWishlist
const toggleWishlistOriginal = `  // Wishlist Actions
  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(id);
      let updated: string[];
      if (exists) {
        updated = prev.filter((item) => item !== id);
        addToast({
          type: 'info',
          title: 'Removed from Wishlist',
          message: 'Plant removed from your saved list.',
        });
      } else {
        updated = [...prev, id];
        addToast({
          type: 'success',
          title: 'Saved to Wishlist ❤️',
          message: 'Plant added to your botanical wishlist.',
        });
      }
      return updated;
    });
  };

  const isInWishlist = (id: string) => {
    return wishlist.includes(id);
  };

  const clearWishlist = () => {
    setWishlist([]);
    addToast({
      type: 'info',`;

const toggleWishlistReplacement = `  // Wishlist Actions
  const wishlist = currentUser?.wishlist || [];

  const toggleWishlist = (id: string) => {
    if (!currentUser) {
      addToast({ type: 'error', title: 'Login Required', message: 'Please sign in to add items to your wishlist.' });
      return;
    }
    
    const exists = currentUser.wishlist?.includes(id);
    let updated: string[];
    if (exists) {
      updated = currentUser.wishlist.filter((item) => item !== id);
      addToast({ type: 'info', title: 'Removed from Wishlist', message: 'Plant removed from your saved list.' });
    } else {
      updated = [...(currentUser.wishlist || []), id];
      addToast({ type: 'success', title: 'Saved to Wishlist ❤️', message: 'Plant added to your botanical wishlist.' });
    }
    
    updateUserProfile({ wishlist: updated });
  };

  const isInWishlist = (id: string) => {
    return (currentUser?.wishlist || []).includes(id);
  };

  const clearWishlist = () => {
    if (!currentUser) return;
    updateUserProfile({ wishlist: [] });
    addToast({
      type: 'info',`;

code = code.replace(toggleWishlistOriginal, toggleWishlistReplacement);

// 4. Update initialUser in replace-data.cjs (if it was setting wishlist) to be empty array, but we can do that directly via code replace
code = code.replace(/    setWishlist\(initialUser\.wishlist\);/g, '    // Wishlist belongs to users now');

fs.writeFileSync('src/context/StoreContext.tsx', code);
console.log("Patched wishlist to be user-specific");
