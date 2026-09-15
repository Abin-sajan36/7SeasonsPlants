const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('find src -name "*.tsx"').toString().split('\n').filter(Boolean);

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (code.includes('.images[0]')) {
    code = code.replace(/\.images\[0\]/g, '.images?.[0]');
    changed = true;
  }
  
  if (code.includes('images[selectedImageIdx]')) {
    code = code.replace(/\.images\[selectedImageIdx\]/g, '.images?.[selectedImageIdx]');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, code);
    console.log(`Updated ${file}`);
  }
}
