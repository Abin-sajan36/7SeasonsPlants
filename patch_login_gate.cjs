const fs = require('fs');
const filePath = 'src/components/admin/AdminLoginGate.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace handleLoginSubmit
const handleLoginSubmitMatch = /const handleLoginSubmit = async.*?finally {\n      setIsLoading\(false\);\n    }\n  };/s;

const newHandleLoginSubmit = `const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginAdmin(email, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };`;

content = content.replace(handleLoginSubmitMatch, newHandleLoginSubmit);

// Remove otpStep logic from form
const formMatch = /{!\s*otpStep \? \(\s*<>\s*(.*?)<\/>\s*\)\s*:\s*\(\s*<div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">.*?<\/div>\s*\)\s*}/s;
const formExtract = content.match(formMatch);
if (formExtract) {
  content = content.replace(formMatch, formExtract[1]);
}

// Update submit button text
content = content.replace(/{otpStep \? 'Verify OTP & Login' : 'Continue to Verification'}/, "'Login to Control Center'");

fs.writeFileSync(filePath, content);
console.log("Patched login gate successfully.");
