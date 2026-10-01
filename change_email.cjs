const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('find src -type f -name "*.tsx" -o -name "*.ts"').toString().split('\n').filter(Boolean);

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  let changed = false;

  const emailsToReplace = ['admin@7seasonsplant.com', 'admin@7seasonsplants.com'];

  for (const email of emailsToReplace) {
    if (code.includes(email)) {
      // Create regex to replace globally, case-insensitive
      const regex = new RegExp(email, 'gi');
      code = code.replace(regex, 'abinsajan36@gmail.com');
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, code);
    console.log(`Updated email in ${file}`);
  }
}
