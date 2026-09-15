const fs = require('fs');

let code = fs.readFileSync('src/components/admin/AdminLoginGate.tsx', 'utf8');

const targetFormStart = `<form onSubmit={handleLoginSubmit} className="space-y-4">`;
const targetFormEnd = `</form>`;

const startIndex = code.indexOf(targetFormStart);
const endIndex = code.indexOf(targetFormEnd, startIndex) + targetFormEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
  const originalForm = code.substring(startIndex, endIndex);

  const replacementForm = `<form onSubmit={handleLoginSubmit} className="space-y-4">
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
                      className="w-full pl-11 pr-4 py-3 bg-[#F4FAF5] text-emerald-950 font-bold tracking-widest text-lg rounded-xl border border-emerald-900/15 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all text-center"
                      placeholder="••••"
                    />
                  </div>
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

  code = code.replace(originalForm, replacementForm);
  fs.writeFileSync('src/components/admin/AdminLoginGate.tsx', code);
  console.log('Successfully patched AdminLoginGate form');
} else {
  console.error('Could not find form block');
}
