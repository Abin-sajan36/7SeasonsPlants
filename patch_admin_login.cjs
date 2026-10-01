const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminLoginGate.tsx', 'utf8');

const target = `          {/* Quick Select Admin Account */}
          <div className="pt-2 border-t border-gray-100 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>Nursery Admin Account</span>
              </span>
              <span className="text-[10px] text-gray-400 font-normal">Click to fill</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelectAdmin('abinsajan36@gmail.com')}
                className={\`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer \${
                  email.toLowerCase() === 'abinsajan36@gmail.com'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                    : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                }\`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-black text-xs flex items-center justify-center shrink-0">
                    7S
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-emerald-950 leading-tight truncate">7Seasons Nursery Admin</p>
                    <p className="text-[10px] text-gray-500 truncate">abinsajan36@gmail.com</p>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                  Super Admin
                </span>
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-gray-600 flex items-start gap-2">
              <KeyRound className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                <strong>Login Credentials:</strong> <span className="font-semibold text-emerald-950">abinsajan36@gmail.com</span> / Password: <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-950 font-mono font-bold">Admin@123</code>
              </span>
            </div>
          </div>`;

content = content.replace(target, '');
fs.writeFileSync('src/components/admin/AdminLoginGate.tsx', content);
