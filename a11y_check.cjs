const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  
  // 1. Check for onClick without role or tabIndex or onKeyDown in non-interactive elements
  const onClickRegex = /<(div|span|li|img)[^>]*onClick=[^>]*>/g;
  let match;
  while ((match = onClickRegex.exec(content)) !== null) {
    const tag = match[0];
    if (!tag.includes('role=') && !tag.includes('tabIndex') && !tag.includes('onKeyDown')) {
      // Exclude backdrops which are usually full screen fixed divs
      if (!tag.includes('fixed inset-0') && !tag.includes('backdrop') && !tag.includes('flex-1')) {
         issues.push(`Non-interactive element with onClick missing role/tabIndex: ${tag}`);
      }
    }
  }

  // 2. Check buttons with only icons (no text inside) missing aria-label
  // This is a bit tricky with regex, but we can look for <button ...> <Icon /> </button>
  // A rough approximation:
  const buttonRegex = /<button[^>]*>[\s\n]*<[A-Z][A-Za-z0-9]+[^>]*\/>[\s\n]*<\/button>/g;
  while ((match = buttonRegex.exec(content)) !== null) {
    const btn = match[0];
    if (!btn.includes('aria-label') && !btn.includes('aria-labelledby')) {
      issues.push(`Icon-only button missing aria-label: ${btn.trim()}`);
    }
  }

  if (issues.length > 0) {
    console.log(`\nIssues in ${filePath}:`);
    issues.forEach(i => console.log(' - ' + i));
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      checkFile(fullPath);
    }
  }
}

walk('src/components');
walk('src/pages');
