const fs = require('fs');
let code = fs.readFileSync('src/components/product/ReviewSection.tsx', 'utf8');

// We will change currentUser to be optional for showing the form
code = code.replace(
  /\{currentUser \? \([\s\S]*?\) : \([\s\S]*?Sign in to leave a review[\s\S]*?\)\}/m,
  `<button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-emerald-950 hover:bg-emerald-900 text-white font-bold rounded-full transition-colors cursor-pointer"
          >
            {showForm ? 'Cancel Review' : 'Write a Review'}
          </button>`
);

code = code.replace(
  /\{showForm && currentUser && \(/,
  `{showForm && (`
);

// We need to add name and email fields if !currentUser
// Also we need to state for guestName and guestEmail
const stateAdditions = `  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');`;

code = code.replace(/const \[comment, setComment\] = useState\(''\);/, `const [comment, setComment] = useState('');\n${stateAdditions}`);

// Update handleSubmit
const targetSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    // addReview method is not in store context currently, so we need to add it or mock it
    // Wait, let's check StoreContext for addReview
    const newReview = {
      targetId,
      targetType,
      targetName,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      rating,
      title,
      comment,
      verifiedPurchase: true,
      status: 'pending' as const
    };`;

const replacementSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newReview = {
      targetId,
      targetType,
      targetName,
      customerName: currentUser ? currentUser.name : guestName || 'Guest User',
      customerEmail: currentUser ? currentUser.email : guestEmail || 'guest@example.com',
      rating,
      title,
      comment,
      verifiedPurchase: !!currentUser,
      status: 'pending' as const
    };`;

code = code.replace(targetSubmit, replacementSubmit);

// Add fields to form
const formFields = `          <div className="space-y-4">
            {!currentUser && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-emerald-950 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-emerald-900/10 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-emerald-950 mb-1">Your Email *</label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-emerald-900/10 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-emerald-950 mb-1">Headline *</label>`;

code = code.replace(/          <div className="space-y-4">\s*<div>\s*<label className="block text-sm font-bold text-emerald-950 mb-1">Headline \*<\/label>/, formFields);

fs.writeFileSync('src/components/product/ReviewSection.tsx', code);
