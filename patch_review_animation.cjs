const fs = require('fs');
let code = fs.readFileSync('src/components/product/ReviewSection.tsx', 'utf8');

// Add PartyPopper to lucide-react imports
code = code.replace(/import \{ Star, MessageCircle, AlertCircle, CheckCircle2, User as UserIcon \} from 'lucide-react';/, `import { Star, MessageCircle, AlertCircle, CheckCircle2, User as UserIcon, PartyPopper, Loader2 } from 'lucide-react';`);

// Add isSubmitted state
code = code.replace(/const \[showForm, setShowForm\] = useState\(false\);/, `const [showForm, setShowForm] = useState(false);\n  const [isSubmitted, setIsSubmitted] = useState(false);\n  const [isSubmitting, setIsSubmitting] = useState(false);`);

const handleSubmitStr = `  const handleSubmit = async (e: React.FormEvent) => {
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
    };
    
    if (addReview) {
      await addReview(newReview);
    }
    
    setShowForm(false);
    setTitle('');
    setComment('');
    setRating(5);
  };`;

const newHandleSubmitStr = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
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
    };
    
    if (addReview) {
      await addReview(newReview);
    }
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    setTimeout(() => {
      setShowForm(false);
      setIsSubmitted(false);
      setTitle('');
      setComment('');
      setRating(5);
      if (!currentUser) {
        setGuestName('');
        setGuestEmail('');
      }
    }, 3000);
  };`;

code = code.replace(handleSubmitStr, newHandleSubmitStr);

// Render success state inside the form
const renderFormStr = `{showForm && (
        <form onSubmit={handleSubmit} className="mb-10 bg-[#F4FAF5] p-6 rounded-3xl border border-emerald-900/10">`;

const newRenderFormStr = `{showForm && (
        <div className="mb-10 bg-[#F4FAF5] p-6 rounded-3xl border border-emerald-900/10 overflow-hidden relative">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <PartyPopper className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-emerald-950 mb-2">Review Submitted!</h3>
              <p className="text-emerald-700 max-w-md">
                Thank you for your feedback! Your review will be visible once approved by our team.
              </p>
            </div>
          ) : (
        <form onSubmit={handleSubmit}>`;

code = code.replace(renderFormStr, newRenderFormStr);

// Change "Submit Review" button to show loading
const submitButtonStr = `<button
            type="submit"
            className="mt-6 w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Submit Review
          </button>
        </form>
      )}`;

const newSubmitButtonStr = `<button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
        )}
        </div>
      )}`;

code = code.replace(submitButtonStr, newSubmitButtonStr);

fs.writeFileSync('src/components/product/ReviewSection.tsx', code);
