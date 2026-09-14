const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

const newRule = `
    match /newsletter_subscribers/{subscriberId} {
      allow read, create: if true;
      allow update, delete: if isAdmin();
    }
`;

code = code.replace(
  /match \/storeSettings\/\{settingId\} \{/,
  `${newRule}\n    match /storeSettings/{settingId} {`
);

fs.writeFileSync('firestore.rules', code);
