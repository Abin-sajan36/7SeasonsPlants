const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Match <img ... >
  const imgRegex = /<img[^>]*>/g;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    if (!match[0].includes('alt=')) {
      console.log(`Missing alt in ${filePath}: ${match[0]}`);
    }
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
