const fs = require('fs');
const filePath = 'src/components/admin/AdminLoginGate.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Remove unused state
content = content.replace(/  const \[otpStep, setOtpStep\] = useState\(false\);\n/g, '');
content = content.replace(/  const \[generatedOtp, setGeneratedOtp\] = useState\(''\);\n/g, '');
content = content.replace(/  const \[otpInput, setOtpInput\] = useState\(''\);\n/g, '');

// Remove verifyAdminCredentials and addToast since loginAdmin does its own addToast and verifyAdminCredentials is not needed
content = content.replace(/  const { verifyAdminCredentials, addToast } = useStore\(\);\n/g, '');

// Remove handleQuickSelectAdmin
content = content.replace(/  const handleQuickSelectAdmin = \(adminEmail: string\) => {[\s\S]*?};\n/g, '');

fs.writeFileSync(filePath, content);
console.log("Cleaned AdminLoginGate.tsx");
