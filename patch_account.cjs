const fs = require('fs');
let code = fs.readFileSync('src/pages/AccountPage.tsx', 'utf-8');

const toastBlock1 = `        if (result.previewOtp) {
          addToast({
            title: 'Verification Code Sent',
            message: \`[Simulated] Your OTP is: \${result.previewOtp}\`,
            type: 'info',
          });
        }`;

const replacement1 = `        if (result.previewOtp) {
          console.log("OTP logic active via backend");
        }`;

const toastBlock2 = `        if (result.previewOtp) {
          addToast({
            title: 'Code Resent',
            message: \`[Simulated] Your new OTP is: \${result.previewOtp}\`,
            type: 'info',
          });
        }`;
        
const replacement2 = `        if (result.previewOtp) {
          console.log("OTP Resent via backend");
        }`;

code = code.replace(toastBlock1, replacement1);
code = code.replace(toastBlock2, replacement2);

fs.writeFileSync('src/pages/AccountPage.tsx', code);
console.log("Removed simulated toast");
