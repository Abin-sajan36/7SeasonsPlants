const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

const target = `                    <select
                      value={formData.state}
                      onChange={(e) => handleStateChange(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-[#F4FAF5] text-xs font-semibold text-emerald-950 rounded-full border border-emerald-900/15 focus:bg-white outline-hidden"
                    >
                      <option value="Kerala">Kerala</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                    </select>`;

const replacement = `                    <select
                      value={formData.state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F4FAF5] text-xs font-semibold text-emerald-950 rounded-full border border-emerald-900/15 focus:bg-white outline-hidden"
                    >
                      {storeSettings.supportedStates?.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>`;

code = code.replace(target, replacement);

const target2 = `  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: currentUser?.email || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    state: 'Kerala' as 'Kerala' | 'Tamil Nadu',
    pincode: '',
    landmark: '',
  });`;

const replacement2 = `  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: currentUser?.email || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    state: storeSettings.supportedStates?.[0] || 'Kerala',
    pincode: '',
    landmark: '',
  });`;

code = code.replace(target2, replacement2);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
