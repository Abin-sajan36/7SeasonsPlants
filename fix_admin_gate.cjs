const fs = require('fs');

let code = fs.readFileSync('src/components/admin/AdminLoginGate.tsx', 'utf8');

const targetForm = `          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-bold text-emerald-950 block mb-1.5">
                Administrator Email
              </label>`;

const replacementForm = `          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {!otpStep ? (
              <>
            <div>
              <label className="text-sm font-bold text-emerald-950 block mb-1.5">
                Administrator Email
              </label>`;
if (code.includes(targetForm)) {
  code = code.replace(targetForm, replacementForm);
}

fs.writeFileSync('src/components/admin/AdminLoginGate.tsx', code);
console.log('Fixed AdminLoginGate form open');
