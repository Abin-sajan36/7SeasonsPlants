const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

const target = `                    <select
                      value={formData.district}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          district: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 bg-[#F4FAF5] text-xs font-semibold text-emerald-950 rounded-full border border-emerald-900/15 focus:bg-white outline-hidden"
                    >
                      {(formData.state === 'Kerala' ? keralaDistricts : tamilNaduDistricts).map(
                        (dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        )
                      )}
                    </select>`;

const replacement = `                    {formData.state === 'Kerala' || formData.state === 'Tamil Nadu' ? (
                      <select
                        value={formData.district}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            district: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2.5 bg-[#F4FAF5] text-xs font-semibold text-emerald-950 rounded-full border border-emerald-900/15 focus:bg-white outline-hidden"
                      >
                        {(formData.state === 'Kerala' ? keralaDistricts : tamilNaduDistricts).map(
                          (dist) => (
                            <option key={dist} value={dist}>
                              {dist}
                            </option>
                          )
                        )}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            district: e.target.value,
                          })
                        }
                        placeholder="e.g. Bangalore Urban"
                        required
                        className="w-full px-3 py-2.5 bg-[#F4FAF5] text-xs font-semibold text-emerald-950 rounded-full border border-emerald-900/15 focus:bg-white outline-hidden"
                      />
                    )}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
