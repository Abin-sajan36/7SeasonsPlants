const fs = require('fs');
let content = fs.readFileSync('src/components/common/CartDrawer.tsx', 'utf-8');
content = content.replace(/bg-white dark:bg-\[\#06120e\]/g, 'bg-white');
content = content.replace(/dark:bg-\[\#06120e\]/g, '');
content = content.replace(/dark:bg-\[\#0a1f18\]/g, '');
content = content.replace(/dark:text-emerald-50/g, '');
content = content.replace(/dark:text-gray-400/g, '');
content = content.replace(/dark:text-gray-500/g, '');
content = content.replace(/dark:text-gray-300/g, '');
content = content.replace(/dark:bg-\[\#010a07\]/g, '');
content = content.replace(/dark:border-emerald-900\/40/g, '');
content = content.replace(/dark:border-gray-800/g, '');
content = content.replace(/\s+/g, ' '); // normalize spaces if any double

// Now manually patch
content = content.replace('w-full max-w-md bg-white h-full', 'w-full max-w-md bg-white dark:bg-[#06120e] h-full');
content = content.replace('bg-[#F4FAF5]', 'bg-[#F4FAF5] dark:bg-[#010a07]');
content = content.replace(/text-emerald-950/g, 'text-emerald-950 dark:text-emerald-50');
content = content.replace(/text-gray-500/g, 'text-gray-500 dark:text-gray-400');
content = content.replace(/border-emerald-900\/10/g, 'border-emerald-900/10 dark:border-emerald-900/40');
content = content.replace(/border-emerald-900\/15/g, 'border-emerald-900/15 dark:border-emerald-900/40');
content = content.replace(/border-emerald-100/g, 'border-emerald-100 dark:border-emerald-900/40');
content = content.replace('className="p-5 border-t border-emerald-900/10 dark:border-emerald-900/40 bg-white space-y-3.5"', 'className="p-5 border-t border-emerald-900/10 dark:border-emerald-900/40 bg-white dark:bg-[#06120e] space-y-3.5"');
content = content.replace('className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-emerald-900/10 dark:border-emerald-900/40 shadow-2xs hover:border-emerald-500/40 transition-colors"', 'className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-[#0a1f18] border border-emerald-900/10 dark:border-emerald-900/40 shadow-2xs hover:border-emerald-500/40 transition-colors"');
content = content.replace('className="flex items-center border border-emerald-900/15 dark:border-emerald-900/40 rounded-lg overflow-hidden bg-white"', 'className="flex items-center border border-emerald-900/15 dark:border-emerald-900/40 rounded-lg overflow-hidden bg-white dark:bg-[#06120e]"');
content = content.replace('className="w-full py-2.5 bg-white hover:bg-emerald-50 text-emerald-950 dark:text-emerald-50 rounded-full text-xs font-bold transition-colors cursor-pointer border border-emerald-900/10 dark:border-emerald-900/40"', 'className="w-full py-2.5 bg-white dark:bg-[#0a1f18] hover:bg-emerald-50 dark:hover:bg-[#123126] text-emerald-950 dark:text-emerald-50 rounded-full text-xs font-bold transition-colors cursor-pointer border border-emerald-900/10 dark:border-emerald-900/40"');

fs.writeFileSync('src/components/common/CartDrawer.tsx', content);
