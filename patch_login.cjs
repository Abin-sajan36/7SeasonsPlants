const fs = require('fs');
const filePath = 'src/components/admin/AdminLoginGate.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add the state variables back
content = content.replace(
  /  const \[errorMessage, setErrorMessage\] = useState<string \| null>\(null\);/,
  `  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [otpStep, setOtpStep] = useState(false);
  const [otpInput, setOtpInput] = useState('');`
);

// Add verifyAdminCredentials and addToast back
content = content.replace(
  /  const { loginAdmin, storeSettings } = useStore\(\);/,
  `  const { loginAdmin, storeSettings, verifyAdminCredentials, addToast } = useStore();`
);

const handleLoginSubmitNew = `  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (!otpStep) {
        const res = await verifyAdminCredentials(email, password);
        if (!res.success) {
          setErrorMessage(res.message || 'Invalid administrator credentials.');
        } else {
          try {
            const response = await fetch('/api/auth/send-registration-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: email, name: 'Admin User' }),
            });
            const data = await response.json();
            
            if (data.success) {
              setOtpStep(true);
              addToast({
                type: 'info',
                title: 'OTP Sent to Email',
                message: \`Check your inbox at \${email} for the 6-digit code.\`
              });
            } else {
              setErrorMessage(data.error || 'Failed to send OTP.');
            }
          } catch (err) {
            setErrorMessage('Network error while requesting OTP.');
          }
        }
      } else {
        try {
          const response = await fetch('/api/auth/verify-registration-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, otp: otpInput }),
          });
          const data = await response.json();
          
          if (data.success) {
            const res = await loginAdmin(email, password);
            if (!res.success) {
              setErrorMessage(res.message || 'Invalid administrator credentials.');
            }
          } else {
            setErrorMessage(data.error || 'Invalid OTP. Please try again.');
          }
        } catch (err) {
          setErrorMessage('Network error while verifying OTP.');
        }
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };`;

const handleLoginSubmitOldMatch = /  const handleLoginSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?finally \{\n      setIsLoading\(false\);\n    \}\n  \};/;

content = content.replace(handleLoginSubmitOldMatch, handleLoginSubmitNew);

const formMatch = /          <form onSubmit=\{handleLoginSubmit\} className="space-y-4">[\s\S]*?          <\/form>/;

const newForm = `          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {!otpStep ? (
              <>
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center justify-between">
                <span>Admin Email ID</span>
                <span className="text-[10px] text-gray-500 font-normal">Dedicated Admin Account</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="abinsajan36@gmail.com"
                  required
                  className="w-full px-4 py-3 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm rounded-xl border border-gray-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-hidden transition-colors font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center justify-between">
                <span>Admin Password</span>
                <span className="text-[10px] text-gray-500 font-normal">Security Encrypted</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-11 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm rounded-xl border border-gray-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-hidden transition-colors font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
              </>
            ) : (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-3 text-sm text-emerald-900">
                  <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">Verification Code Sent</p>
                    <p className="text-xs text-emerald-700/80 mt-0.5">Please check <strong>{email}</strong> for your 6-digit OTP code.</p>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    6-Digit OTP
                  </label>
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 bg-gray-50 text-center text-gray-900 placeholder-gray-400 text-2xl tracking-[0.5em] rounded-xl border border-gray-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-hidden font-mono font-bold"
                  />
                </div>
              </div>
            )}
              
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{otpStep ? 'Verify OTP & Login' : 'Continue to Verification'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>`;

content = content.replace(formMatch, newForm);

// we also need to import Mail
if (!content.includes('import { Mail')) {
  content = content.replace(/import { useStore } from '\.\.\/\.\.\/context\/StoreContext';/, "import { useStore } from '../../context/StoreContext';\nimport { Mail } from 'lucide-react';");
}

fs.writeFileSync(filePath, content);
console.log('patched');
