const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

// 1. Move button inside form and add validation scrolling
// Actually, let's just make the validation more robust and add a scroll to top.

const handleTarget = `  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Form Validations
    if (!formData.fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number for dispatch updates.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Please enter a valid email address for your order invoice.');
      return;
    }
    if (!formData.street.trim()) {
      setFormError('Please enter your delivery street address / house name.');
      return;
    }
    if (!formData.pincode.trim() || formData.pincode.length !== 6) {
      setFormError('Please enter a valid 6-digit postal PIN code.');
      return;
    }`;

const handleReplacement = `  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const scrollToError = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Form Validations
    if (!formData.fullName.trim()) {
      setFormError('Please enter your full name.');
      scrollToError();
      return;
    }
    const numericPhone = formData.phone.replace(/\\D/g, '');
    if (!numericPhone || numericPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number for dispatch updates.');
      scrollToError();
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Please enter a valid email address for your order invoice.');
      scrollToError();
      return;
    }
    if (!formData.street.trim() || formData.street.trim().length < 5) {
      setFormError('Please enter your complete delivery street address / house name.');
      scrollToError();
      return;
    }
    if (!formData.apartment.trim()) {
      setFormError('Please enter a landmark or nearby location (mandatory).');
      scrollToError();
      return;
    }
    if (!formData.pincode.trim() || formData.pincode.length !== 6) {
      setFormError('Please enter a valid 6-digit postal PIN code.');
      scrollToError();
      return;
    }`;

code = code.replace(handleTarget, handleReplacement);

const apartmentTarget = `                {/* Landmark / Apartment (Optional) */}
                <div>
                  <label className="font-bold text-emerald-950 block mb-1.5">
                    Landmark / Nearby Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.apartment}
                    onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                    placeholder="e.g. Near Temple / Metro Station"
                    className="w-full px-4 py-2.5 bg-[#F4FAF5] text-xs text-emerald-950 font-medium rounded-full border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>`;

const apartmentReplacement = `                {/* Landmark / Apartment (Mandatory) */}
                <div>
                  <label className="font-bold text-emerald-950 block mb-1.5">
                    Landmark / Nearby Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.apartment}
                    onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                    placeholder="e.g. Near Temple / Metro Station"
                    className="w-full px-4 py-2.5 bg-[#F4FAF5] text-xs text-emerald-950 font-medium rounded-full border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>`;

code = code.replace(apartmentTarget, apartmentReplacement);

const phoneTarget = `                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full px-4 py-2.5 bg-[#F4FAF5] text-xs text-emerald-950 font-medium rounded-full border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                    />`;

const phoneReplacement = `                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\\D/g, '') })}
                      placeholder="10-digit mobile number"
                      className="w-full px-4 py-2.5 bg-[#F4FAF5] text-xs text-emerald-950 font-medium rounded-full border border-emerald-900/15 focus:bg-white focus:border-emerald-600 outline-hidden"
                    />`;

code = code.replace(phoneTarget, phoneReplacement);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
