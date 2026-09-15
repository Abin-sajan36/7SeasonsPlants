const fs = require('fs');

let code = fs.readFileSync('src/components/common/Footer.tsx', 'utf8');

const checks = [
  { key: 'combos', target: `<button\n                  onClick={() => onNavigate('combos')}` },
  { key: 'plants', target: `<button\n                  onClick={() => onNavigate('plants')}` },
  { key: 'deals', target: `<button\n                  onClick={() => onNavigate('home', 'section:deals')}` },
  { key: 'trackOrder', target: `<button\n                  onClick={() => onNavigate('track-order')}` },
  { key: 'plantCare', target: `<button\n                  onClick={() => onNavigate('plant-care')}` },
  { key: 'plantCare', target: `<button\n                  onClick={() => onNavigate('plant-care', 'tool:doctor')}` },
  { key: 'blog', target: `<button\n                  onClick={() => onNavigate('blog')}` },
];

// First, inject useStore and storeSettings if not present
if (!code.includes('useStore')) {
  code = code.replace(`import {`, `import { useStore } from '../../context/StoreContext';\nimport {`);
  code = code.replace(`export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {`, `export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {\n  const { storeSettings } = useStore();\n  const visibility = storeSettings?.menuVisibility || {};`);
}

for (const check of checks) {
  // Wrap li with visibility check
  const liTarget = `<li>\n                ${check.target}`;
  if (code.includes(liTarget)) {
    // Find the end of this li
    const liEnd = code.indexOf('</li>', code.indexOf(liTarget)) + 5;
    const originalLi = code.substring(code.indexOf(liTarget), liEnd);
    const replacement = `{visibility.${check.key} !== false && (\n              ${originalLi}\n            )}`;
    code = code.replace(originalLi, replacement);
  }
}

fs.writeFileSync('src/components/common/Footer.tsx', code);
console.log('Patched Footer visibility');
