const fs = require('fs');

function processFile(path, replacers) {
  let content = fs.readFileSync(path, 'utf-8');
  for (const [from, to] of replacers) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(path, content);
}

// 1. QuickViewModal
processFile('src/components/common/QuickViewModal.tsx', [
  [/bg-white/g, 'bg-white dark:bg-[#06120e]'],
  [/text-emerald-950/g, 'text-emerald-950 dark:text-emerald-50'],
  [/text-gray-500/g, 'text-gray-500 dark:text-gray-400'],
  [/border-emerald-900\/10/g, 'border-emerald-900/10 dark:border-emerald-900/40'],
  [/bg-emerald-50/g, 'bg-emerald-50 dark:bg-[#0a1f18]'],
]);

// 2. BottomNav
processFile('src/components/common/BottomNav.tsx', [
  [/bg-white/g, 'bg-white dark:bg-[#06120e]'],
  [/border-emerald-900\/10/g, 'border-emerald-900/10 dark:border-emerald-900/40'],
  [/text-gray-400/g, 'text-gray-400 dark:text-gray-500'],
  [/text-emerald-950/g, 'text-emerald-950 dark:text-emerald-50'],
]);

// 3. ToastContainer
processFile('src/components/common/ToastContainer.tsx', [
  [/bg-\[\#0F172A\]/g, 'bg-[#0F172A] dark:bg-[#0a1f18]'],
]);

