const fs = require('fs');
let code = fs.readFileSync('src/components/common/Header.tsx', 'utf8');

const replacement = `
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onNavigate('account');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-emerald-50 dark:bg-[#0a1f18]/70 flex items-center gap-2.5 text-emerald-950 dark:text-emerald-50 cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-emerald-700" />
                      <span>My Profile</span>
                    </button>
                    {currentUser && (
                      <button
                        onClick={() => {
                          setAccountMenuOpen(false);
                          onNavigate('account', 'orders');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-emerald-50 dark:bg-[#0a1f18]/70 flex items-center gap-2.5 text-emerald-950 dark:text-emerald-50 cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-emerald-700" />
                        <span>Order History</span>
                      </button>
                    )}
                    {currentUser && (
`;

code = code.replace(
  /<button\s+onClick=\{\(\) => \{\s+setAccountMenuOpen\(false\);\s+onNavigate\('account'\);\s+\}\}\s+className="[^"]+"\s*>\s*<UserIcon className="w-4 h-4 text-emerald-700" \/>\s*<span>My Profile & Orders<\/span>\s*<\/button>\s*\{currentUser && \(/g,
  replacement
);

fs.writeFileSync('src/components/common/Header.tsx', code);
