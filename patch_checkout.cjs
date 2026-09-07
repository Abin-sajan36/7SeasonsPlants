const fs = require('fs');

let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

const modalCode = `
// --- PAYMENT MODAL COMPONENT ---
const PaymentModal = ({ isOpen, onClose, total, onConfirm }) => {
  const [method, setMethod] = useState('qr');
  const [upiId, setUpiId] = useState('');
  
  if (!isOpen) return null;
  
  const qrData = encodeURIComponent(\`upi://pay?pa=7seasonsplants@ybl&pn=7Seasonsplants&am=\${total}&cu=INR\`);
  const qrUrl = \`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=\${qrData}\`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-emerald-900/10 flex justify-between items-center bg-emerald-50/50">
          <h3 className="font-bold text-emerald-950 text-lg">Select Payment Method</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-emerald-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        
        <div className="flex border-b border-emerald-900/10 text-xs font-semibold overflow-x-auto hide-scrollbar">
          <button onClick={() => setMethod('qr')} className={\`flex-1 py-3 px-4 min-w-max text-center \${method === 'qr' ? 'text-emerald-700 border-b-2 border-emerald-700 bg-emerald-50/30' : 'text-gray-500 hover:text-emerald-700'}\`}>Scan QR (UPI)</button>
          <button onClick={() => setMethod('upi')} className={\`flex-1 py-3 px-4 min-w-max text-center \${method === 'upi' ? 'text-emerald-700 border-b-2 border-emerald-700 bg-emerald-50/30' : 'text-gray-500 hover:text-emerald-700'}\`}>UPI ID</button>
          <button onClick={() => setMethod('net')} className={\`flex-1 py-3 px-4 min-w-max text-center \${method === 'net' ? 'text-emerald-700 border-b-2 border-emerald-700 bg-emerald-50/30' : 'text-gray-500 hover:text-emerald-700'}\`}>Net Banking</button>
        </div>
        
        <div className="p-6">
          {method === 'qr' && (
            <div className="text-center space-y-4">
              <p className="text-xs text-gray-500">Scan with GPay, PhonePe, Paytm or any UPI app</p>
              <div className="inline-block p-2 border-2 border-emerald-100 rounded-2xl bg-white shadow-xs">
                <img src={qrUrl} alt="UPI QR Code" className="w-48 h-48" />
              </div>
              <p className="font-black text-xl text-emerald-950">₹{total}</p>
            </div>
          )}
          
          {method === 'upi' && (
            <div className="space-y-4 py-4">
              <label className="text-xs font-bold text-emerald-950">Enter your UPI ID</label>
              <input 
                type="text" 
                placeholder="e.g. 9876543210@ybl" 
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-4 py-3 bg-[#F4FAF5] border border-emerald-900/15 rounded-xl text-sm outline-hidden focus:border-emerald-600 focus:bg-white"
              />
              <p className="text-[10px] text-gray-500">A payment request will be sent to your UPI app.</p>
            </div>
          )}
          
          {method === 'net' && (
            <div className="py-8 text-center text-gray-500 text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-emerald-200"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              Select your bank on the next secure page.
            </div>
          )}
        </div>
        
        <div className="p-5 border-t border-emerald-900/10 bg-emerald-50/30">
          <button 
            onClick={() => onConfirm(method)} 
            className="w-full py-3.5 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {method === 'qr' ? 'I have completed the payment' : \`Proceed to Pay ₹\${total}\`}
          </button>
        </div>
      </div>
    </div>
  );
};
// --- END PAYMENT MODAL ---
`;

// Insert modal component before CheckoutPage
code = code.replace(
  'interface CheckoutPageProps {',
  modalCode + '\ninterface CheckoutPageProps {'
);

// Add state for payment modal
const stateReplacement = `
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
`;
code = code.replace(
  `  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');`,
  stateReplacement
);

// Change form submit to open modal instead of directly placing order
code = code.replace(
  /const handlePaymentSubmit = async \(e: React.FormEvent\) => {[\s\S]*?setIsProcessing\(true\);/,
  `const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Form Validations
    if (!formData.fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number for dispatch updates.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Please enter a valid email address for your order invoice.');
      return;
    }
    if (!formData.street.trim()) {
      setFormError('Please enter your delivery street address / house name.');
      return;
    }
    if (!formData.pincode.trim() || formData.pincode.length !== 6) {
      setFormError('Please enter a valid 6-digit postal PIN code.');
      return;
    }

    setShowPaymentModal(true);
  };

  const processOrder = async (method: string) => {
    setShowPaymentModal(false);
    setIsProcessing(true);`
);

// We need to fix the end of processOrder (formerly handlePaymentSubmit)
// Search for "onNavigate('order-success', createdOrder.id);"
// It was inside the try block.

code = code.replace(
  /onNavigate\('order-success', createdOrder\.id\);\n    } catch \(err: any\) {[\s\S]*?setIsProcessing\(false\);\n      setFormError\('An error occurred while processing your order. Please try again.'\);\n    }\n  };/,
  `onNavigate('order-success', createdOrder.id);
    } catch (err: any) {
      setIsProcessing(false);
      setFormError('An error occurred while processing your order. Please try again.');
    }
  };`
);

// Now update the button text
code = code.replace(
  /\{\s*isProcessing\s*\?\s*'Connecting to Razorpay\.\.\.'\s*:\s*\`Pay ₹\$\{Math\.round\(cartTotal\)\} with Razorpay\`\s*\}/,
  `{isProcessing ? 'Processing Order...' : \`Proceed to Payment (₹\${Math.round(cartTotal)})\`}`
);

// Remove "with Razorpay" from the button if it's there
// Above regex does this.

// Add the modal to the render
code = code.replace(
  /<\/div>\n    <\/div>\n  \);\n};\n/,
  `      </div>
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        total={Math.round(cartTotal)} 
        onConfirm={processOrder} 
      />
    </div>
  );
};
`
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
