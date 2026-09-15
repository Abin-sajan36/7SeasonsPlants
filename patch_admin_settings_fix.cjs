const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

// I will extract the menu settings block and move it to the end of the settings
const menuSettingsRegex = /<div className="pt-6 mt-6 border-t border-gray-100">\s*<h4 className="text-sm font-bold text-emerald-950 mb-4">Menu Visibility Configuration<\/h4>[\s\S]*?<\/div>\s*<\/div>/;

const match = code.match(menuSettingsRegex);
if (match) {
  code = code.replace(menuSettingsRegex, '');
  code = code.replace(/<\/div>\s*<\/div>\s*\}\)\s*<\/div>/, (m) => match[0] + '\n            ' + m);
}

// Remove that extra `</div>` we added by accident
code = code.replace(/<\/div>\s*<\/div>\s*<div>\s*<label className="font-bold text-emerald-950 block mb-1">\s*Free Delivery/m, 
  '</div>\n\n              <div>\n                <label className="font-bold text-emerald-950 block mb-1">\n                  Free Delivery');

fs.writeFileSync('src/pages/AdminPage.tsx', code);
