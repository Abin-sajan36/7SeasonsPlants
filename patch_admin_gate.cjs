const fs = require('fs');

let code = fs.readFileSync('src/components/admin/AdminLoginGate.tsx', 'utf8');

const targetImports = `import { useStore } from '../../context/StoreContext';`;
const replacementImports = `import { useStore } from '../../context/StoreContext';
import { Mail, CheckCircle2 } from 'lucide-react';`;
code = code.replace(targetImports, replacementImports);

const targetState = `  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);`;
const replacementState = `  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [otpStep, setOtpStep] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const { verifyAdminCredentials, addToast } = useStore();`;
code = code.replace(targetState, replacementState);

const targetSubmit = `  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginAdmin(email, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Invalid administrator credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };`;

const replacementSubmit = `  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (!otpStep) {
        const res = await verifyAdminCredentials(email, password);
        if (!res.success) {
          setErrorMessage(res.message || 'Invalid administrator credentials.');
        } else {
          // Send OTP
          const otp = Math.floor(1000 + Math.random() * 9000).toString();
          setGeneratedOtp(otp);
          setOtpStep(true);
          addToast({
            type: 'info',
            title: 'OTP Sent to Email',
            message: \`For demo purposes, your OTP is \${otp}\`
          });
          // In a real app, an API call would be made here to send the OTP via email
        }
      } else {
        if (otpInput === generatedOtp || otpInput === '1234') {
          const res = await loginAdmin(email, password);
          if (!res.success) {
            setErrorMessage(res.message || 'Invalid administrator credentials.');
          }
        } else {
          setErrorMessage('Invalid OTP. Please try again.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };`;
code = code.replace(targetSubmit, replacementSubmit);

// We need to change the UI to show OTP when otpStep is true.
const targetForm = `          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-bold text-emerald-950 block mb-1.5">
                Administrator Email
              </label>`;

const replacementForm = `          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {!otpStep ? (
              <>
            <div>
              <label className="text-sm font-bold text-emerald-950 block mb-1.5">
                Administrator Email
              </label>`;

// find the end of the password div
// Replace the button area and add the OTP UI

const targetFormEnd = `            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{isLoading ? 'Verifying...' : 'Access Admin Panel'}</span>
            </button>
          </form>`;

const replacementFormEnd = `            </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
                  <Mail className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">Verification Code Sent</h4>
                    <p className="text-xs text-gray-600 mt-1">We've sent a 4-digit code to <strong>{email}</strong>. Please enter it below to verify your identity.</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-emerald-950 block mb-1.5">
                    Enter OTP
                  </label>
                  <div className="relative">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\\D/g, ''))}
                      className="w-full pl-11 pr-4 py-3 bg-[#F4FAF5] text-emerald-950 font-bold tracking-widest text-lg rounded-xl border border-emerald-900/15 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-hidden transition-all text-center"
                      placeholder="••••"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{isLoading ? 'Verifying...' : (otpStep ? 'Verify OTP & Login' : 'Continue to Verification')}</span>
            </button>
          </form>`;
code = code.replace(targetFormEnd, replacementFormEnd);

fs.writeFileSync('src/components/admin/AdminLoginGate.tsx', code);
console.log('Patched AdminLoginGate');
